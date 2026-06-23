import { useWalletStore } from "./wallet";
import { chunkUtxos, type UTXO } from "~/utils/transactionBatcher";
import { TxBuilder } from "@hydra-sdk/transaction";
import { CardanoWASM } from "@hydra-sdk/cardano-wasm";

export const useOptimizerStore = defineStore("optimizer", () => {
  const walletStore = useWalletStore();

  // Checklist tracking selected UTXO keys formatted as "txHash#index"
  const selectedKeys = ref<string[]>([]);

  // A computed Set of selectedKeys for fast O(1) lookups
  const selectedKeysSet = computed(() => new Set(selectedKeys.value));

  // Batching workflow state
  const isExecuting = ref(false);
  const currentBatchIndex = ref(0);
  const totalBatches = ref(0);
  const batchStatus = ref<
    "idle" | "signing" | "submitted" | "success" | "error"
  >("idle");
  const transactionHashes = ref<string[]>([]);
  const executionError = ref<string | null>(null);

  const latestTxHash = computed(() => {
    const hashes = transactionHashes.value;
    return hashes.length > 0 ? hashes[hashes.length - 1] : null;
  });

  // Map selected keys to full UTXO objects
  const selectedUtxos = computed<UTXO[]>(() => {
    const keysSet = selectedKeysSet.value;
    return walletStore.utxos.filter((utxo) =>
      keysSet.has(`${utxo.txHash}#${utxo.index}`),
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

  // Helper to group flat asset objects by policy id
  const groupAssetsByPolicy = (assets: Record<string, number>): Record<string, Record<string, number>> => {
    const grouped: Record<string, Record<string, number>> = {};
    Object.entries(assets).forEach(([assetId, qty]) => {
      const parts = assetId.split(".");
      const policyId = parts[0];
      const assetNameHex = parts[1] || "";
      if (policyId) {
        let policyMap = grouped[policyId];
        if (!policyMap) {
          policyMap = {};
          grouped[policyId] = policyMap;
        }
        policyMap[assetNameHex] = (policyMap[assetNameHex] || 0) + qty;
      }
    });
    return grouped;
  };

  // Helper to build CardanoWASM.MultiAsset from grouped assets
  const buildMultiAsset = (
    grouped: Record<string, Record<string, number>>,
    fromHex: (hex: string) => Uint8Array
  ) => {
    const multiAsset = CardanoWASM.MultiAsset.new();
    Object.entries(grouped).forEach(([policyId, nameQtyMap]) => {
      const policyHash = CardanoWASM.ScriptHash.from_hex(policyId);
      const assets = CardanoWASM.Assets.new();
      Object.entries(nameQtyMap).forEach(([assetNameHex, qty]) => {
        assets.insert(
          CardanoWASM.AssetName.new(fromHex(assetNameHex)),
          CardanoWASM.BigNum.from_str(qty.toString()),
        );
      });
      multiAsset.insert(policyHash, assets);
    });
    return multiAsset;
  };

  // Action: Build and run the batch transaction flow
  const executeConsolidation = async () => {
    if (selectedUtxos.value.length === 0) return;
    if (!walletStore.walletApi) {
      throw new Error("Wallet not connected");
    }

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

        // 1. Instantiate TxBuilder
        const txBuilder = new TxBuilder();

        // 2. Add Inputs manually directly to CSL builder to bypass CIP-2 Coin Selection
        currentBatchInputs.forEach((utxo) => {
          const txInput = CardanoWASM.TransactionInput.new(
            CardanoWASM.TransactionHash.from_hex(utxo.txHash),
            utxo.index,
          );

          // Construct CSL Value object (Lovelace + Native Assets)
          const value = CardanoWASM.Value.new(
            CardanoWASM.BigNum.from_str(utxo.lovelace.toString()),
          );
          if (Object.keys(utxo.assets).length > 0) {
            const grouped = groupAssetsByPolicy(utxo.assets);
            const multiAsset = buildMultiAsset(grouped, walletStore.fromHex);
            value.set_multiasset(multiAsset);
          }

          const addressObj = CardanoWASM.Address.from_bech32(utxo.address);
          txBuilder.txBuilder.add_regular_input(addressObj, txInput, value);
        });

        // 3. Group and aggregate native assets by policy ID for the consolidated output
        const aggregatedAssets: Record<string, number> = {};
        currentBatchInputs.forEach((u) => {
          Object.entries(u.assets).forEach(([assetId, qty]) => {
            aggregatedAssets[assetId] = (aggregatedAssets[assetId] || 0) + qty;
          });
        });

        const targetAddress = CardanoWASM.Address.from_bech32(
          walletStore.walletAddress,
        );
        const baseLovelace = CardanoWASM.BigNum.from_str("2000000"); // 2.0 ADA

        if (Object.keys(aggregatedAssets).length > 0) {
          const txOutputValue = CardanoWASM.Value.new(baseLovelace);
          const grouped = groupAssetsByPolicy(aggregatedAssets);
          const multiAsset = buildMultiAsset(grouped, walletStore.fromHex);
          txOutputValue.set_multiasset(multiAsset);
          
          const txOutput = CardanoWASM.TransactionOutput.new(
            targetAddress,
            txOutputValue,
          );
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
        const witnessSet = CardanoWASM.TransactionWitnessSet.from_bytes(
          walletStore.fromHex(witnessSetHex),
        );
        const signedTx = CardanoWASM.Transaction.new(
          tx.body(),
          witnessSet,
          tx.auxiliary_data(),
        );

        const signedTxHex = walletStore.toHex(signedTx.to_bytes());

        txHash = await walletStore.walletApi.submitTx(signedTxHex);
        console.log(txHash);

        transactionHashes.value.push(txHash);
        batchStatus.value = "submitted";
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

  // Action: Reset/clear everything when leaving page
  const clearStoreState = () => {
    selectedKeys.value = [];
    resetBatchFlow();
  };

  return {
    selectedKeys,
    selectedKeysSet,
    isExecuting,
    currentBatchIndex,
    totalBatches,
    batchStatus,
    transactionHashes,
    executionError,
    latestTxHash,
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
    clearStoreState,
  };
});
