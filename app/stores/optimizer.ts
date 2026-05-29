import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useWalletStore } from "./wallet";
import { chunkUtxos, type UTXO } from "~/utils/transactionBatcher";
import { TxBuilder } from "@hydra-sdk/transaction";

export const useOptimizerStore = defineStore("optimizer", () => {
  const walletStore = useWalletStore();

  // Checklist tracking selected UTXO keys formatted as "txHash#index"
  const selectedKeys = ref<string[]>([]);

  // Batching workflow state
  const isExecuting = ref(false);
  const currentBatchIndex = ref(0);
  const totalBatches = ref(0);
  const batchStatus = ref<"idle" | "signing" | "success" | "error">("idle");
  const transactionHashes = ref<string[]>([]);
  const executionError = ref<string | null>(null);

  // Map selected keys to full UTXO objects
  const selectedUtxos = computed<UTXO[]>(() => {
    return walletStore.utxos.filter((utxo) =>
      selectedKeys.value.includes(`${utxo.txHash}#${utxo.index}`),
    );
  });

  // Aggregate selected balances
  const totalSelectedLovelace = computed(() => {
    return selectedUtxos.value.reduce((sum, utxo) => sum + utxo.lovelace, 0);
  });

  const totalSelectedAda = computed(() => {
    return totalSelectedLovelace.value / 1000000;
  });

  // Simulated Cardano network fee
  // Standard fee formula: base ~0.17 ADA + ~0.003 ADA per input
  const estimatedFeeAda = computed(() => {
    const count = selectedUtxos.value.length;
    if (count === 0) return 0;
    return 0.17 + count * 0.003;
  });

  // Recoverable ADA calculation
  const recoverableAda = computed(() => {
    return Math.max(0, totalSelectedAda.value - estimatedFeeAda.value);
  });

  // Economic warning check: Fee / Total ADA > 30%
  const isInefficient = computed(() => {
    if (recoverableAda.value === 0) return false;
    const ratio = estimatedFeeAda.value / totalSelectedAda.value;
    return ratio > 0.3;
  });

  // Action: Toggle single selection
  const toggleSelection = (utxo: UTXO) => {
    const key = `${utxo.txHash}#${utxo.index}`;
    if (selectedKeys.value.includes(key)) {
      selectedKeys.value = selectedKeys.value.filter((k) => k !== key);
    } else {
      selectedKeys.value.push(key);
    }
  };

  // Action: Select all UTXOs
  const selectAll = () => {
    selectedKeys.value = walletStore.utxos.map((u) => `${u.txHash}#${u.index}`);
  };

  // Action: Deselect all UTXOs
  const deselectAll = () => {
    selectedKeys.value = [];
  };

  // Action: Automatically select all "dust" UTXOs
  // Cardano dust is commonly defined as outputs carrying less than 2.0 ADA
  const selectDust = () => {
    const dustKeys = walletStore.utxos
      .filter((u) => u.lovelace < 2000000)
      .map((u) => `${u.txHash}#${u.index}`);
    selectedKeys.value = [...dustKeys];
  };

  // Action: Build and run the batch transaction flow
  const executeConsolidation = async () => {
    if (selectedUtxos.value.length === 0) return;

    isExecuting.value = true;
    currentBatchIndex.value = 0;
    transactionHashes.value = [];
    executionError.value = null;

    // Split inputs into safe batches under 16KB limit (e.g. max 40 per batch)
    const chunks = chunkUtxos(selectedUtxos.value, 40);
    totalBatches.value = chunks.length;
    batchStatus.value = "signing";

    try {
      for (let i = 0; i < chunks.length; i++) {
        currentBatchIndex.value = i;
        const currentBatchInputs = chunks[i];
        if (!currentBatchInputs) continue;
        let txHash = "";

        if (walletStore.walletApi) {
          // 1. Instantiate TxBuilder
          const txBuilder = new TxBuilder();
          const wasm = await walletStore.loadWasm();

          // 2. Add Inputs manually directly to CSL builder to bypass CIP-2 Coin Selection
          currentBatchInputs.forEach((utxo) => {
            const txInput = wasm.TransactionInput.new(
              wasm.TransactionHash.from_hex(utxo.txHash),
              utxo.index
            );

            // Construct CSL Value object (Lovelace + Native Assets)
            const value = wasm.Value.new(wasm.BigNum.from_str(utxo.lovelace.toString()));
            if (Object.keys(utxo.assets).length > 0) {
              const multiAsset = wasm.MultiAsset.new();
              Object.entries(utxo.assets).forEach(([assetId, qty]) => {
                const parts = assetId.split(".");
                const policyId = parts[0];
                const assetNameHex = parts[1] || "";

                if (policyId) {
                  const policyHash = wasm.ScriptHash.from_hex(policyId);
                  const assets = wasm.Assets.new();
                  assets.insert(
                    wasm.AssetName.new(walletStore.fromHex(assetNameHex)),
                    wasm.BigNum.from_str(qty.toString())
                  );
                  multiAsset.insert(policyHash, assets);
                }
              });
              value.set_multiasset(multiAsset);
            }

            const addressObj = wasm.Address.from_bech32(utxo.address);
            txBuilder.txBuilder.add_regular_input(addressObj, txInput, value);
          });

          // 3. Add Consolidated Output manually to the CSL builder for any native assets in this batch
          const consolidatedAssets: Record<string, number> = {};
          currentBatchInputs.forEach((u) => {
            Object.entries(u.assets).forEach(([assetId, qty]) => {
              consolidatedAssets[assetId] =
                (consolidatedAssets[assetId] || 0) + qty;
            });
          });

          const outputAmount: any[] = [];
          Object.entries(consolidatedAssets).forEach(([assetId, qty]) => {
            const unit = assetId.replace(".", "");
            outputAmount.push({ unit, quantity: qty.toString() });
          });

          const targetAddress = wasm.Address.from_bech32(walletStore.walletAddress);
          const baseLovelace = wasm.BigNum.from_str("2000000"); // 2.0 ADA

          if (outputAmount.length > 0) {
            const txOutputValue = wasm.Value.new(baseLovelace);
            const multiAsset = wasm.MultiAsset.new();

            outputAmount.forEach((asset) => {
              const policyId = asset.unit.substring(0, 56);
              const assetNameHex = asset.unit.substring(56);

              const policyHash = wasm.ScriptHash.from_hex(policyId);
              const assets = wasm.Assets.new();
              assets.insert(
                wasm.AssetName.new(walletStore.fromHex(assetNameHex)),
                wasm.BigNum.from_str(asset.quantity)
              );
              multiAsset.insert(policyHash, assets);
            });

            txOutputValue.set_multiasset(multiAsset);
            const txOutput = wasm.TransactionOutput.new(targetAddress, txOutputValue);
            txBuilder.txBuilder.add_output(txOutput);
          }

          // 4. Balance transaction (calculate fee and add change output)
          txBuilder.txBuilder.add_change_if_needed(targetAddress);

          // 5. Build unsigned transaction — build_tx() compiles the finished WASM Transaction directly
          const tx = txBuilder.txBuilder.build_tx();
          const unsignedTxHex = walletStore.toHex(tx.to_bytes());

          // 5. Sign and Submit
          const witnessSetHex = await walletStore.walletApi.signTx(
            unsignedTxHex,
            true,
          );
          const witnessSet = wasm.TransactionWitnessSet.from_bytes(
            walletStore.fromHex(witnessSetHex),
          );
          const signedTx = wasm.Transaction.new(
            tx.body(),
            witnessSet,
            tx.auxiliary_data(),
          );
          console.log("signedTx", signedTx);
          const signedTxHex = walletStore.toHex(signedTx.to_bytes());

          txHash = await walletStore.walletApi.submitTx(signedTxHex);
          console.log(txHash);
        } else {
          // Demo mode — simulate signing delay
          await new Promise((resolve) => setTimeout(resolve, 1500));
          txHash =
            "tx_consolidated_" +
            Math.random().toString(36).substring(2, 10) +
            "_batch_" +
            i;
        }

        transactionHashes.value.push(txHash);

        // 6. Update local store: remove consolidated inputs from state
        const keysToRemove = currentBatchInputs.map(
          (u) => `${u.txHash}#${u.index}`,
        );
        walletStore.utxos = walletStore.utxos.filter(
          (u) => !keysToRemove.includes(`${u.txHash}#${u.index}`),
        );
      }

      batchStatus.value = "success";
      selectedKeys.value = []; // Clear selections
    } catch (err: any) {
      console.error(err);
      executionError.value = err.message || "Consolidation batch failed.";
      batchStatus.value = "error";
    } finally {
      isExecuting.value = false;
    }
  };

  // Action: Clear active batch statuses
  const resetBatchFlow = () => {
    isExecuting.value = false;
    currentBatchIndex.value = 0;
    totalBatches.value = 0;
    batchStatus.value = "idle";
    transactionHashes.value = [];
    executionError.value = null;
  };

  return {
    selectedKeys,
    isExecuting,
    currentBatchIndex,
    totalBatches,
    batchStatus,
    transactionHashes,
    executionError,
    selectedUtxos,
    totalSelectedLovelace,
    totalSelectedAda,
    estimatedFeeAda,
    recoverableAda,
    isInefficient,
    toggleSelection,
    selectAll,
    deselectAll,
    selectDust,
    executeConsolidation,
    resetBatchFlow,
  };
});
