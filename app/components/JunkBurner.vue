<script setup lang="ts">
import { toRef, computed } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { useCleanerStore } from "~/stores/cleaner";
import { calculateMinAda } from "~/utils/minAdaCalculator";
import { fetchProtocolParams } from "~/utils/protocolParams";
import { TxBuilder } from "@hydra-sdk/transaction";
import { CardanoWASM } from "@hydra-sdk/cardano-wasm";

const props = defineProps<{
  selectedJunk: string[];
}>();

const emit = defineEmits(["burnSuccess", "burnError"]);

const walletStore = useWalletStore();
const cleanerStore = useCleanerStore();

const cleaningMode = ref<"isolate" | "burn">("isolate");
const burnerStatus = toRef(cleanerStore, "burnerStatus");
const transactionHash = toRef(cleanerStore, "transactionHash");
const executionError = toRef(cleanerStore, "executionError");
const isExecuting = computed(() => cleanerStore.isExecuting);



const config = useRuntimeConfig();
const coinsPerUtxoSize = ref(4310);

onMounted(async () => {
  try {
    const pp = await fetchProtocolParams(
      walletStore.selectedNetwork,
      blockfrostKey.value,
    );
    coinsPerUtxoSize.value = pp.coinsPerUtxoSize ?? 4310;
  } catch {
    // fallback to default
  }
});

const blockfrostKey = computed(() => {
  return walletStore.selectedNetwork === "mainnet"
    ? (config.public.blockfrostApiKeyMainnet as string)
    : (config.public.blockfrostApiKeyPreprod as string);
});

function getDeadAddress(): string {
  const network = walletStore.networkId === 1 ? 1 : 0;
  const zeroHash = "00000000000000000000000000000000000000000000000000000000";
  const keyHash = CardanoWASM.Ed25519KeyHash.from_hex(zeroHash);
  const cred = CardanoWASM.Credential.from_keyhash(keyHash);
  const addr = CardanoWASM.EnterpriseAddress.new(network, cred);
  return addr.to_address().to_bech32();
}

const selectedJunkSet = computed(() => new Set(props.selectedJunk));

const selectedAssetsDetails = computed(() => {
  const set = selectedJunkSet.value;
  return cleanerStore.classifiedAssets.filter((asset) =>
    set.has(asset.assetId),
  );
});

const newJunkBoxMinAda = computed(() => {
  if (props.selectedJunk.length === 0) return 0;
  const assetsArray = selectedAssetsDetails.value.map((a) => ({
    policyId: a.policyId,
    assetNameHex: a.assetNameHex,
  }));
  return calculateMinAda(assetsArray, coinsPerUtxoSize.value) / 1000000;
});

const currentLockedAda = computed(() => {
  let lovelaceSum = 0;
  const set = selectedJunkSet.value;
  walletStore.utxos.forEach((utxo) => {
    const containsSelected = Object.keys(utxo.assets).some((id) =>
      set.has(id),
    );
    if (containsSelected) {
      lovelaceSum += utxo.lovelace;
    }
  });
  return lovelaceSum / 1000000;
});

const estimatedReclaim = computed(() => {
  if (props.selectedJunk.length === 0) return 0;
  const estFee = 0.2;
  const raw = currentLockedAda.value - newJunkBoxMinAda.value - estFee;
  return Math.max(0, raw);
});

const reclaimNote = computed(() => {
  if (props.selectedJunk.length === 0) return "";
  const raw = currentLockedAda.value - newJunkBoxMinAda.value - 0.2;
  if (raw <= 0)
    return "New min-ADA equals locked ADA — no additional ADA will be freed";
  if (cleaningMode.value === "burn") {
    return `Note: ${newJunkBoxMinAda.value.toFixed(2)} ADA will be permanently sent to the burn address along with the tokens.`;
  }
  return "";
});

const feePercentage = computed(() => {
  if (currentLockedAda.value === 0) return 0;
  return Math.round((0.2 / currentLockedAda.value) * 100);
});const handleExecuteCleanup = async () => {
  if (props.selectedJunk.length === 0) return;
  if (!walletStore.walletApi) {
    throw new Error("Wallet not connected");
  }
  burnerStatus.value = "signing";
  executionError.value = null;
  transactionHash.value = null;

  try {
    const set = selectedJunkSet.value;
    const junkUtxos = walletStore.utxos.filter((utxo) =>
      Object.keys(utxo.assets).some((id) => set.has(id)),
    );

    if (junkUtxos.length === 0)
      throw new Error("No selected assets found in active UTXOs.");

    const totalJunkAda = junkUtxos.reduce((s, u) => s + u.lovelace, 0);
    const minOutAda = calculateMinAda(
      selectedAssetsDetails.value.map((a) => ({
        policyId: a.policyId,
        assetNameHex: a.assetNameHex,
      })),
      coinsPerUtxoSize.value,
    );
    const estFee = 200000;
    const shortfall = Math.max(0, minOutAda + estFee - totalJunkAda);

    // Add extra non-junk UTXOs if junk UTXOs don't have enough ADA
    const extraUtxos: any[] = [];
    if (shortfall > 0) {
      const nonJunkUtxos = walletStore.utxos
        .filter(
          (u) =>
            !junkUtxos.includes(u) &&
            !Object.keys(u.assets).some((id) =>
              set.has(id),
            ),
        )
        .sort((a, b) => b.lovelace - a.lovelace);
      let collected = 0;
      for (const u of nonJunkUtxos) {
        extraUtxos.push(u);
        collected += u.lovelace;
        if (collected >= shortfall) break;
      }
      if (collected < shortfall) {
        throw new Error(
          `Insufficient ADA in wallet to cover output (need ${((shortfall - collected) / 1000000).toFixed(2)} more ADA).`,
        );
      }
    }

    const txBuilder = new TxBuilder({
      isHydra: false,
      params: { coinsPerUtxoSize: coinsPerUtxoSize.value },
    });

    // Add junk UTXOs as inputs (must include ALL assets for correct value conservation)
    junkUtxos.forEach((utxo) => {
      const assets: any[] = [
        { unit: "lovelace", quantity: utxo.lovelace.toString() },
      ];
      Object.entries(utxo.assets).forEach(([assetId, qty]) => {
        assets.push({
          unit: assetId.replace(".", ""),
          quantity: qty.toString(),
        });
      });
      txBuilder.txIn(utxo.txHash, utxo.index, assets, utxo.address);
    });

    // Add extra ADA UTXOs as inputs (include all their assets for value conservation)
    extraUtxos.forEach((utxo) => {
      const assets: any[] = [
        { unit: "lovelace", quantity: utxo.lovelace.toString() },
      ];
      Object.entries(utxo.assets).forEach(([assetId, quantity]) => {
        assets.push({
          unit: assetId.replace(".", ""),
          quantity: quantity!.toString(),
        });
      });
      txBuilder.txIn(utxo.txHash, utxo.index, assets, utxo.address);
    });

    const targetAddress =
      cleaningMode.value === "burn"
        ? getDeadAddress()
        : walletStore.walletAddress;
    const outputAmount: any[] = [];
    selectedAssetsDetails.value.forEach((a) => {
      outputAmount.push({
        unit: a.assetId.replace(".", ""),
        quantity: a.amount.toString(),
      });
    });

    const baseLovelace = minOutAda.toString();
    txBuilder.txOut(targetAddress, [
      { unit: "lovelace", quantity: baseLovelace },
      ...outputAmount,
    ]);
    txBuilder.changeAddress(walletStore.walletAddress);

    const tx = await txBuilder.complete();
    const unsignedTxHex = walletStore.toHex(tx.to_bytes());

    const witnessSetHex = await walletStore.walletApi.signTx(
      unsignedTxHex,
      true,
    );
    burnerStatus.value = "submitted";
    const signedTx = CardanoWASM.Transaction.new(
      tx.body(),
      CardanoWASM.TransactionWitnessSet.from_bytes(
        walletStore.fromHex(witnessSetHex),
      ),
      tx.auxiliary_data(),
    );
    const signedTxHex = walletStore.toHex(signedTx.to_bytes());
    const txHash = await walletStore.walletApi.submitTx(signedTxHex);
    transactionHash.value = txHash;
    burnerStatus.value = "success";
  } catch (err: any) {
    console.error(err);
    executionError.value = err.message || "Transaction building failed.";
    burnerStatus.value = "error";
  }
};
</script>

<template>
  <div class="fintech-card p-7">
    <h3 class="text-lg font-bold text-white mb-6">Junk Sweep Controller</h3>

    <!-- Unselected State -->
    <div v-if="props.selectedJunk.length === 0 && !cleanerStore.isExecuting" class="text-center py-10 px-4">
      <p class="text-slate-400 text-sm leading-relaxed">
        Select suspicious assets from the list on the left to activate cleaning
        mechanisms.
      </p>
    </div>

    <!-- Selected Action Controls -->
    <div v-else class="flex flex-col gap-5">
        <!-- Summary box -->
        <div
          class="flex flex-wrap justify-between items-center gap-3 bg-white/[0.02] border border-white/[0.08] rounded-xl px-5 py-3.5"
        >
          <div class="text-left">
            <span
              class="block text-[11px] uppercase text-slate-500 font-semibold tracking-wider font-sans"
              >Target Assets</span
            >

            <span
              class="block text-xl font-black font-heading text-amber-400 mt-0.5"
              >{{ props.selectedJunk.length }}
              <span class="text-slate-500 text-[10px] font-medium ml-0.5"
                >Assets</span
              ></span
            >
          </div>
          <div class="text-left sm:text-right">
            <span
              class="block text-[11px] uppercase text-slate-500 font-semibold tracking-wider font-sans"
              >Locked Balance</span
            >
            <span class="block text-xl font-black font-heading text-white mt-0.5">
              {{
                currentLockedAda.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              }}
              <span class="text-slate-500 text-[10px] font-medium ml-0.5"
                >ADA</span
              >
            </span>
          </div>
        </div>

        <!-- Mode Selection Toggle -->
        <div class="flex flex-col gap-2.5">
          <label
            class="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200"
            :class="
              cleaningMode === 'isolate'
                ? 'bg-amber-500/[0.03] border-amber-500/30'
                : 'bg-white/[0.01] border-white/[0.08] hover:bg-white/[0.03]'
            "
          >
            <input
              type="radio"
              name="cleaningMode"
              value="isolate"
              v-model="cleaningMode"
              class="hidden"
            />
            <span class="font-bold text-white text-sm font-sans"
              >Isolated Junk Box</span
            >
            <div class="relative group flex-shrink-0">
              <svg
                class="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors cursor-help"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div
                class="absolute bottom-full right-0 mb-2 w-56 bg-slate-950/95 backdrop-blur-xl text-white text-[11px] leading-snug p-2.5 rounded-lg border border-white/[0.08] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center font-sans"
              >
                Merge all junk assets into 1 output to salvage 90%+ locked ADA.
              </div>
            </div>
          </label>

          <label
            class="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200"
            :class="
              cleaningMode === 'burn'
                ? 'bg-rose-500/[0.03] border-rose-500/30'
                : 'bg-white/[0.01] border-white/[0.08] hover:bg-white/[0.03]'
            "
          >
            <input
              type="radio"
              name="cleaningMode"
              value="burn"
              v-model="cleaningMode"
              class="hidden"
            />
            <span class="font-bold text-rose-400 text-sm">Full Burn Address</span>
            <div class="relative group flex-shrink-0">
              <svg
                class="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors cursor-help"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div
                class="absolute bottom-full right-0 mb-2 w-56 bg-slate-950/95 backdrop-blur-xl text-white text-[11px] leading-snug p-2.5 rounded-lg border border-white/[0.08] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center font-sans"
              >
                Discard junk tokens completely. Sacrifice new min-ADA for a clean
                wallet.
              </div>
            </div>
          </label>
        </div>

        <div class="h-px bg-white/[0.08]"></div>

        <!-- Estimation Breakdown -->
        <div class="flex flex-col gap-2 font-display">
          <div class="flex justify-between text-sm text-slate-400">
            <span>New UTXO Locked ADA</span>
            <span>
              {{
                cleaningMode === "burn"
                  ? "0"
                  : newJunkBoxMinAda.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })
              }}
              <span class="text-slate-500 text-[10px] font-medium ml-0.5"
                >ADA</span
              >
            </span>
          </div>
          <div
            class="flex justify-between text-base font-bold border-t border-dashed border-white/[0.08] pt-2 mt-1"
          >
            <span class="text-white">Recoverable ADA Balance</span>
            <span class="text-emerald-400">
              <span v-if="estimatedReclaim > 0">+</span
              >{{
                estimatedReclaim.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              }}
              <span class="text-emerald-500/80 text-[10px] font-medium ml-0.5"
                >ADA</span
              >
            </span>
          </div>
          <div
            v-if="reclaimNote"
            class="flex items-start gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2"
          >
            <svg
              class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{{ reclaimNote }}</span>
          </div>
        </div>

        <!-- Economic Viability Warning -->
        <div
          v-if="feePercentage > 30 && cleaningMode === 'isolate'"
          class="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.08] border-l-4 border-amber-500 text-amber-200"
        >
          <svg
            class="w-5 h-5 flex-shrink-0 stroke-amber-400 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <p class="font-bold text-sm">Low Economic Efficiency</p>
            <p class="text-xs leading-snug mt-1 text-amber-200/80">
              Network fee is ~{{ feePercentage }}% of recoverable ADA. Consider
              selecting more junk assets in one batch to optimize network costs.
            </p>
          </div>
        </div>

      <!-- IDLE: Submit button -->
      <button
        v-if="['idle', 'error'].includes(burnerStatus)"
        class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer"
        :class="
          cleaningMode === 'burn'
            ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg'
            : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg'
        "
        @click="handleExecuteCleanup"
      >
        {{
          cleaningMode === "burn"
            ? "Initiate Full Burn Sweep"
            : "Compile Isolated Junk Box"
        }}
      </button>

      <!-- SIGNING: Wallet signature request -->
      <div v-else-if="burnerStatus === 'signing'" class="flex flex-col gap-3">
        <button
          disabled
          class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/30 text-sm font-semibold cursor-not-allowed"
        >
          <svg
            class="animate-spin h-4 w-4 text-violet-300"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Signing...
        </button>
      </div>

      <!-- SUBMITTED: Show tx hash + submitting -->
      <div
        v-else-if="
          burnerStatus === 'submitted'
        "
        class="flex flex-col gap-3"
      >
        <div
          v-if="transactionHash"
          class="flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]"
        >
          <span class="text-xs font-semibold text-slate-400">Tx Hash:</span>
          <a
            :href="
              'https://preprod.cardanoscan.io/transaction/' + transactionHash
            "
            target="_blank"
            class="text-xs font-mono text-violet-400 hover:text-violet-300 underline truncate max-w-[220px]"
          >
            {{ transactionHash.slice(0, 16) }}...{{ transactionHash.slice(-4) }}
          </a>
        </div>
        <button
          disabled
          class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-sm font-semibold cursor-not-allowed"
        >
          <svg
            class="animate-spin h-4 w-4 text-emerald-300"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Submitting to network...
        </button>
      </div>
    </div>
  </div>
</template>
