<script setup lang="ts">
import { computed } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { useCleanerStore } from "~/stores/cleaner";

const walletStore = useWalletStore();
const cleanerStore = useCleanerStore();

const score = computed(() => cleanerStore.walletHealthScore);

const scoreColorClass = computed(() => {
  if (score.value < 45) return "text-rose-400";
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
  <div class="fintech-card p-6 sm:p-8 flex flex-col gap-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <!-- Health score SVG ring & Potential Improvement -->
      <div class="flex flex-col items-center gap-4 text-center md:border-r md:border-white/[0.06] md:pr-8">
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
            <span class="text-3xl font-black font-heading" :class="scoreColorClass">
              {{ score }}%
            </span>
            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1 font-sans">
              Wallet Health
            </span>
          </div>
        </div>

        <div class="max-w-xs">
          <h4 class="text-base font-bold font-sans" :class="scoreColorClass">
            {{
              score >= 75
                ? "Wallet Status: Excellent"
                : score >= 45
                  ? "Wallet Status: Highly Fragmented"
                  : "Wallet Status: Heavy Spam Warning"
            }}
          </h4>
          <p class="text-slate-400 text-xs leading-relaxed mt-2 font-sans">
            {{
              score >= 75
                ? "Your wallet UTXO structure is clean and well-consolidated. Safe from transaction limit failures."
                : score >= 45
                  ? "Several small dust outputs and native tokens are trapping your liquidity. Optimization is recommended."
                  : "Spam NFTs, zero-liquidity tokens, and extreme UTXO fragmentation are locking substantial ADA. Immediate clean-up is required."
            }}
          </p>
        </div>

        <!-- Potential Improvement Meter -->
        <div class="w-full max-w-xs flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 mt-2">
          <span class="text-xs text-slate-400 font-sans">Potential Improvement</span>
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs font-mono text-amber-400">{{ score }} &rarr; 95</span>
            <span class="text-[10px] font-semibold font-sans bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
              +{{ Math.max(0, 95 - score) }} HP
            </span>
          </div>
        </div>
      </div>

      <!-- Statistics panel -->
      <div class="flex flex-col gap-4 md:pl-2">
        <h3 class="text-lg font-bold text-white font-sans">
          eUTXO Financial Report
        </h3>
        <div class="flex flex-col gap-3.5">
          <div class="flex justify-between items-center text-sm font-sans">
            <span class="text-slate-400">Total Wallet Balance</span>
            <span class="font-bold text-white font-mono">
              {{ parseFloat(walletStore.balanceAda).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
              <span class="text-slate-500 text-[10px] font-medium ml-0.5">ADA</span>
            </span>
          </div>
          <div class="flex justify-between items-center text-sm font-sans">
            <span class="text-slate-400">Usable ADA</span>
            <span class="font-bold text-emerald-400 font-mono">
              {{ cleanerStore.usableAda.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
              <span class="text-emerald-500/80 text-[10px] font-medium ml-0.5">ADA</span>
            </span>
          </div>
          <div class="flex justify-between items-center text-sm font-sans">
            <span class="text-slate-400">Locked ADA</span>
            <span class="font-bold text-rose-400 font-mono">
              {{ cleanerStore.lockedAda.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
              <span class="text-rose-500/80 text-[10px] font-medium ml-0.5">ADA</span>
            </span>
          </div>
          <div class="h-px bg-white/[0.08]"></div>
          <div class="flex justify-between items-center text-sm font-sans">
            <span class="text-slate-400">Total UTXO Inputs</span>
            <span class="font-bold text-white font-mono">{{ walletStore.totalUtxoCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3 Dynamic Insight Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/[0.06] pt-6">
      <!-- Insight 1: UTXO Fragmentation -->
      <div class="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/20 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[9px] font-bold text-slate-500 uppercase font-sans">Fragmentation</span>
            <span :class="walletStore.totalUtxoCount > 8 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'" class="text-[10px] font-semibold px-2.5 py-1 rounded-lg border uppercase font-sans">
              {{ walletStore.totalUtxoCount > 8 ? 'Suboptimal' : 'Optimized' }}
            </span>
          </div>
          <p class="text-white font-bold text-xs font-mono">{{ walletStore.totalUtxoCount }} UTXOs</p>
        </div>
        <p class="text-slate-400 text-[10px] leading-relaxed mt-2 font-sans">
          {{ walletStore.totalUtxoCount > 8 ? 'Many fragmented dust UTXOs' : 'Optimal number of inputs' }}
        </p>
      </div>

      <!-- Insight 2: Fees -->
      <div class="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/20 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[9px] font-bold text-slate-500 uppercase font-sans">Fee Efficiency</span>
            <span :class="walletStore.totalUtxoCount > 8 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'" class="text-[10px] font-semibold px-2.5 py-1 rounded-lg border uppercase font-sans">
              {{ walletStore.totalUtxoCount > 8 ? 'Suboptimal' : 'Optimal' }}
            </span>
          </div>
          <p class="text-white font-bold text-xs font-sans">
            {{ walletStore.totalUtxoCount > 8 ? 'Higher TX Fees' : 'Highly Efficient' }}
          </p>
        </div>
        <p class="text-slate-400 text-[10px] leading-relaxed mt-2 font-sans">
          {{ walletStore.totalUtxoCount > 8 ? 'Dust inputs increase TX size' : 'Minimal overhead per transfer' }}
        </p>
      </div>

      <!-- Insight 3: Spam & Clutter -->
      <div class="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/20 transition-all duration-300 flex flex-col justify-between min-h-[110px]">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[9px] font-bold text-slate-500 uppercase font-sans">Spam & Clutter</span>
            <span :class="cleanerStore.suspiciousAssets.length > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'" class="text-[10px] font-semibold px-2.5 py-1 rounded-lg border uppercase font-sans">
              {{ cleanerStore.suspiciousAssets.length > 0 ? 'Spam Alert' : 'Clean' }}
            </span>
          </div>
          <p class="text-white font-bold text-xs font-mono">{{ cleanerStore.suspiciousAssets.length }} Spam Assets</p>
        </div>
        <p class="text-slate-400 text-[10px] leading-relaxed mt-2 font-sans">
          {{ cleanerStore.suspiciousAssets.length > 0 ? 'Scam assets locking min-ADA' : 'No spam tokens detected' }}
        </p>
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
