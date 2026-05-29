<script setup lang="ts">
import { computed } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { useCleanerStore } from "~/stores/cleaner";

const walletStore = useWalletStore();
const cleanerStore = useCleanerStore();

const score = computed(() => cleanerStore.walletHealthScore);

const scoreColorClass = computed(() => {
  if (score.value < 45) return "text-rose-500";
  if (score.value < 75) return "text-amber-400";
  return "text-emerald-400";
});

const gaugeStrokeClass = computed(() => {
  if (score.value < 45) return "stroke-rose-500";
  if (score.value < 75) return "stroke-amber-400";
  return "stroke-emerald-400";
});

const radius = 54;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = computed(() => {
  return circumference - (score.value / 100) * circumference;
});
</script>

<template>
  <div
    class="fintech-card p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
  >
    <!-- Health score SVG ring -->
    <div
      class="flex flex-col items-center gap-5 text-center md:border-r md:border-white/[0.06] md:pr-8"
    >
      <div class="relative w-36 h-36">
        <svg class="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle class="gauge-bg" cx="60" cy="60" :r="radius"></circle>
          <circle
            class="gauge-progress"
            :class="gaugeStrokeClass"
            cx="60"
            cy="60"
            :r="radius"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
          ></circle>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span
            class="text-3xl font-black font-display"
            :class="scoreColorClass"
            >{{ score }}%</span
          >
          <span
            class="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1"
            >Health Score</span
          >
        </div>
      </div>
      <div class="max-w-xs">
        <h4 class="text-base font-bold" :class="scoreColorClass">
          {{
            score >= 75
              ? "Wallet Status: Excellent"
              : score >= 45
                ? "Wallet Status: Highly Fragmented"
                : "Wallet Status: Heavy Spam Warning"
          }}
        </h4>
        <p class="text-slate-400 text-xs leading-relaxed mt-2">
          {{
            score >= 75
              ? "Your wallet UTXO structure is clean and well-consolidated. Safe from transaction limit failures."
              : score >= 45
                ? "Several small dust outputs and native tokens are trapping your liquidity. Optimization is recommended."
                : "Spam NFTs, zero-liquidity tokens, and extreme UTXO fragmentation are locking substantial ADA. Immediate clean-up is required."
          }}
        </p>
      </div>
    </div>

    <!-- Statistics panel -->
    <div class="flex flex-col gap-4 md:pl-2">
      <h3 class="text-lg font-bold text-white font-display">
        eUTXO Financial Report
      </h3>
      <div class="flex flex-col gap-3.5">
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-400 font-medium">Total Wallet Balance</span>
          <span class="font-bold text-white font-display"
            >{{ parseFloat(walletStore.balanceAda).toFixed(2) }} ADA</span
          >
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-400 font-medium">Usable ADA</span>
          <span class="font-bold text-emerald-400 font-display"
            >{{ cleanerStore.usableAda.toFixed(2) }} ADA</span
          >
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-400 font-medium">Locked ADA</span>
          <span class="font-bold text-rose-400 font-display"
            >{{ cleanerStore.lockedAda.toFixed(2) }} ADA</span
          >
        </div>
        <div class="h-px bg-white/[0.08]"></div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-400 font-medium">Total UTXO Inputs</span>
          <span class="font-bold text-white font-display">{{
            walletStore.totalUtxoCount
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gauge-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.03);
  stroke-width: 8px;
}

.gauge-progress {
  fill: none;
  stroke-width: 8px;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
