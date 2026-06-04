<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";
import { useCleanerStore } from "~/stores/cleaner";
import { calculateMinAda } from "~/utils/minAdaCalculator";

const props = defineProps<{
  selectedJunk: string[];
}>();

const emit = defineEmits(["burnSuccess", "burnError"]);

const walletStore = useWalletStore();
const cleanerStore = useCleanerStore();

const cleaningMode = ref<"isolate" | "burn">("isolate");
const burnerStatus = ref<
  "idle" | "signing" | "submitted" | "confirming" | "success" | "error"
>("idle");
const transactionHash = ref<string | null>(null);
const executionError = ref<string | null>(null);
const isExecuting = computed(
  () =>
    burnerStatus.value !== "idle" &&
    burnerStatus.value !== "success" &&
    burnerStatus.value !== "error",
);

let resetTimer: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (resetTimer) clearTimeout(resetTimer);
});

const DEAD_ADDRESS =
  "addr1vx9z9zv9g5k27xpfl9wsmph938l2s7l7rshq8f0m4d2e7d3cf23a859_dead";

const selectedAssetsDetails = computed(() => {
  return cleanerStore.classifiedAssets.filter((asset) =>
    props.selectedJunk.includes(asset.assetId),
  );
});

const newJunkBoxMinAda = computed(() => {
  if (props.selectedJunk.length === 0) return 0;
  const assetsArray = selectedAssetsDetails.value.map((a) => ({
    policyId: a.policyId,
    assetNameHex: a.assetNameHex,
  }));
  return calculateMinAda(assetsArray) / 1000000;
});

const currentLockedAda = computed(() => {
  let lovelaceSum = 0;
  walletStore.utxos.forEach((utxo) => {
    const containsSelected = Object.keys(utxo.assets).some((id) =>
      props.selectedJunk.includes(id),
    );
    if (containsSelected) {
      lovelaceSum += utxo.lovelace;
    }
  });
  return lovelaceSum / 1000000;
});

const estimatedReclaim = computed(() => {
  if (props.selectedJunk.length === 0) return 0;
  if (cleaningMode.value === "burn") return 0;
  const estFee = 0.2;
  return Math.max(0, currentLockedAda.value - newJunkBoxMinAda.value - estFee);
});

const feePercentage = computed(() => {
  if (currentLockedAda.value === 0) return 0;
  return Math.round((0.2 / currentLockedAda.value) * 100);
});

const handleExecuteCleanup = async () => {
  if (props.selectedJunk.length === 0) return;
  burnerStatus.value = "signing";
  executionError.value = null;
  transactionHash.value = null;

  try {
    const { TxBuilder } = await import("@hydra-sdk/transaction");

    const junkUtxos = walletStore.utxos.filter((utxo) =>
      Object.keys(utxo.assets).some((id) => props.selectedJunk.includes(id)),
    );

    if (junkUtxos.length === 0)
      throw new Error("No selected assets found in active UTXOs.");

    const standardParams = {
      epoch: 500,
      minFeeA: 44,
      minFeeB: 155381,
      maxBlockSize: 90112,
      maxTxSize: 16384,
      maxBlockHeaderSize: 1100,
      keyDeposit: 2000000,
      poolDeposit: 500000000,
      decentralisation: 0,
      minPoolCost: "340000000",
      priceMem: 0.0577,
      priceStep: 0.0000721,
      maxTxExMem: "14000000",
      maxTxExSteps: "10000000000",
      maxBlockExMem: "62000000",
      maxBlockExSteps: "20000000000",
      maxValSize: 5000,
      collateralPercent: 150,
      maxCollateralInputs: 3,
      coinsPerUtxoSize: 34482,
      minFeeRefScriptCostPerByte: 15,
    };

    const txBuilder = new TxBuilder({ isHydra: false, params: standardParams });

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

    const targetAddress =
      cleaningMode.value === "burn" ? DEAD_ADDRESS : walletStore.walletAddress;
    const outputAmount: any[] = [];
    selectedAssetsDetails.value.forEach((a) => {
      outputAmount.push({
        unit: a.assetId.replace(".", ""),
        quantity: a.amount.toString(),
      });
    });

    const baseLovelace = Math.max(
      2000000,
      calculateMinAda(
        selectedAssetsDetails.value.map((a) => ({
          policyId: a.policyId,
          assetNameHex: a.assetNameHex,
        })),
      ),
    ).toString();
    txBuilder.txOut(targetAddress, [
      { unit: "lovelace", quantity: baseLovelace },
      ...outputAmount,
    ]);
    txBuilder.changeAddress(walletStore.walletAddress);

    const tx = await txBuilder.complete();
    const unsignedTxHex = walletStore.toHex(tx.to_bytes());

    let txHash = "";
    if (walletStore.walletApi) {
      const witnessSetHex = await walletStore.walletApi.signTx(
        unsignedTxHex,
        true,
      );
      burnerStatus.value = "submitted";
      const wasm = await walletStore.loadWasm();
      const witnessSet = wasm.TransactionWitnessSet.from_bytes(
        walletStore.fromHex(witnessSetHex),
      );
      const signedTx = wasm.Transaction.new(
        tx.body(),
        witnessSet,
        tx.auxiliary_data(),
      );
      const signedTxHex = walletStore.toHex(signedTx.to_bytes());
      txHash = await walletStore.walletApi.submitTx(signedTxHex);
      transactionHash.value = txHash;
      burnerStatus.value = "confirming";
    } else {
      burnerStatus.value = "submitted";
      await new Promise((resolve) => setTimeout(resolve, 2000));
      txHash =
        "5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e";
      transactionHash.value = txHash;
      burnerStatus.value = "confirming";
    }

    const processedUtxos = walletStore.utxos.filter(
      (utxo) => !junkUtxos.includes(utxo),
    );

    if (cleaningMode.value === "isolate") {
      const consolidatedAssets: Record<string, number> = {};
      selectedAssetsDetails.value.forEach((a) => {
        consolidatedAssets[a.assetId] = a.amount;
      });
      processedUtxos.push({
        txHash: "tx_junk_box_" + Math.random().toString(36).substring(2, 9),
        index: 0,
        address: walletStore.walletAddress,
        lovelace: Math.round(
          newJunkBoxMinAda.value * 1000000 || parseInt(baseLovelace),
        ),
        assets: consolidatedAssets,
      });
    }

    walletStore.utxos = processedUtxos;
    burnerStatus.value = "success";
    emit("burnSuccess");

    resetTimer = setTimeout(() => {
      burnerStatus.value = "idle";
      transactionHash.value = null;
      executionError.value = null;
    }, 2500);
  } catch (err: any) {
    console.error(err);
    executionError.value = err.message || "Transaction building failed.";
    burnerStatus.value = "error";
    emit("burnError", err.message || "Transaction building failed.");
  }
};
</script>

<template>
  <div class="fintech-card p-7">
    <h3 class="text-lg font-bold text-white mb-6">Junk Sweep Controller</h3>

    <!-- Unselected State -->
    <div v-if="props.selectedJunk.length === 0" class="text-center py-10 px-4">
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
            <svg class="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="absolute bottom-full right-0 mb-2 w-56 bg-slate-950/95 backdrop-blur-xl text-white text-[11px] leading-snug p-2.5 rounded-lg border border-white/[0.08] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center font-sans">
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
          <span class="font-bold text-rose-400 text-sm"
            >Full Burn Address</span
          >
          <div class="relative group flex-shrink-0">
            <svg class="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div class="absolute bottom-full right-0 mb-2 w-56 bg-slate-950/95 backdrop-blur-xl text-white text-[11px] leading-snug p-2.5 rounded-lg border border-white/[0.08] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center font-sans">
              Discard junk tokens completely. Sacrifice new min-ADA for a clean wallet.
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
            +{{
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
        class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer"
        :class="
          cleaningMode === 'burn'
            ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20 active:scale-95'
            : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95'
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

      <!-- SUBMITTED / CONFIRMING: Show tx hash + waiting on-chain -->
      <div
        v-else-if="
          burnerStatus === 'submitted' || burnerStatus === 'confirming'
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
          Confirming on-chain...
        </button>
      </div>
    </div>
  </div>
</template>
