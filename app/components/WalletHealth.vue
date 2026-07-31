<script setup lang="ts">
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

const scoreBadgeClass = computed(() => {
  if (score.value < 45)
    return "bg-rose-500/10 border-rose-500/20 text-rose-400";
  if (score.value < 75)
    return "bg-amber-500/10 border-amber-500/20 text-amber-400";
  return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
});

const gaugeStrokeClass = computed(() => {
  if (score.value < 45) return "stroke-rose-500";
  if (score.value < 75) return "stroke-amber-400";
  return "stroke-emerald-400";
});

const scoreLabel = computed(() => {
  if (score.value >= 75) return "Excellent";
  if (score.value >= 45) return "Fragmented";
  return "Critical";
});

const radius = 54;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = computed(() => {
  return circumference - (score.value / 100) * circumference;
});

const insightCards = computed(() => [
  {
    id: "fragmentation",
    label: "Fragmentation",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h8m-8 6h16" />`,
    value: `${walletStore.totalUtxoCount} UTXOs`,
    isWarning: walletStore.totalUtxoCount > 8,
    badgeOk: "Optimized",
    badgeWarn: "Suboptimal",
    descOk: "Optimal number of inputs",
    descWarn: "Many fragmented dust UTXOs",
    accentOk: "emerald",
    accentWarn: "amber",
  },
  {
    id: "fee",
    label: "Fee Efficiency",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />`,
    value:
      walletStore.totalUtxoCount > 8 ? "Higher TX Fees" : "Highly Efficient",
    isWarning: walletStore.totalUtxoCount > 8,
    badgeOk: "Optimal",
    badgeWarn: "Suboptimal",
    descOk: "Minimal overhead per transfer",
    descWarn: "Dust inputs increase TX size",
    accentOk: "emerald",
    accentWarn: "amber",
  },
  {
    id: "spam",
    label: "Spam & Clutter",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`,
    value: `${cleanerStore.suspiciousAssets.length} Spam Assets`,
    isWarning: cleanerStore.suspiciousAssets.length > 0,
    badgeOk: "Clean",
    badgeWarn: "Spam Alert",
    descOk: "No spam tokens detected",
    descWarn: "Scam assets locking min-ADA",
    accentOk: "emerald",
    accentWarn: "rose",
  },
]);
</script>

<template>
  <section class="fintech-card overflow-hidden">
    <!-- ── Section Header ── -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
    >
      <div class="flex items-center gap-3">
        <!-- Heart-pulse icon -->
        <div
          class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"
        >
          <svg
            class="w-4 h-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <div>
          <h2
            class="text-sm font-bold text-white font-heading uppercase tracking-widest"
          >
            Wallet Health
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">
            eUTXO financial report &amp; fragmentation analysis
          </p>
        </div>
      </div>
      <!-- Score badge -->
      <span
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold border"
        :class="scoreBadgeClass"
      >
        <span
          class="w-1.5 h-1.5 rounded-full animate-pulse"
          :class="
            score >= 75
              ? 'bg-emerald-400'
              : score >= 45
                ? 'bg-amber-400'
                : 'bg-rose-400'
          "
        ></span>
        {{ scoreLabel }}
      </span>
    </div>

    <!-- ── Main Content ── -->
    <div class="p-5 flex flex-col gap-5">
      <!-- Health Score + Stats Row -->
      <div class="flex flex-col sm:flex-row items-center gap-6 sm:gap-7">
        <!-- Gauge Ring -->
        <div class="relative w-44 h-44 shrink-0 mx-12">
          <svg class="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
            <circle class="gauge-bg" cx="60" cy="60" :r="radius" />
            <circle
              class="gauge-progress"
              :class="gaugeStrokeClass"
              cx="60"
              cy="60"
              :r="radius"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
            />
          </svg>
          <div
            class="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span
              class="text-3xl font-black font-heading"
              :class="scoreColorClass"
              >{{ score }}%</span
            >
            <span
              class="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mt-1 font-sans"
              >Health</span
            >
          </div>
        </div>

        <!-- Divider (sm+) -->
        <div class="hidden sm:block w-px self-stretch bg-white/[0.06]"></div>

        <!-- Financial Stats -->
        <div class="flex-1 w-full min-w-0">
          <!-- Status headline -->
          <p class="text-sm font-semibold mb-4" :class="scoreColorClass">
            {{
              score >= 75
                ? "Wallet structure is clean and well-consolidated."
                : score >= 45
                  ? "Several dust outputs are trapping your liquidity."
                  : "Spam NFTs and fragmentation are locking substantial ADA."
            }}
          </p>

          <!-- Stat rows -->
          <div class="flex flex-col divide-y divide-white/[0.04]">
            <!-- Total Balance -->
            <div class="stat-row">
              <span class="stat-label">Total Wallet Balance</span>
              <span class="stat-value text-white">
                {{
                  parseFloat(walletStore.balanceAda).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })
                }}
                <span class="stat-unit">ADA</span>
              </span>
            </div>
            <!-- Usable ADA -->
            <div class="stat-row">
              <span class="stat-label">Usable ADA</span>
              <span class="stat-value text-emerald-400">
                {{
                  cleanerStore.usableAda.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })
                }}
                <span class="stat-unit text-emerald-500/70">ADA</span>
              </span>
            </div>
            <!-- Locked ADA -->
            <div class="stat-row">
              <span class="stat-label">Locked ADA</span>
              <span class="stat-value text-rose-400">
                {{
                  cleanerStore.lockedAda.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })
                }}
                <span class="stat-unit text-rose-500/70">ADA</span>
              </span>
            </div>
            <!-- UTXO Count -->
            <div class="stat-row">
              <span class="stat-label">Total UTXO Inputs</span>
              <span class="stat-value text-white font-mono">{{
                walletStore.totalUtxoCount
              }}</span>
            </div>
            <!-- Potential Improvement -->
            <div class="stat-row">
              <span class="stat-label">Potential Improvement</span>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs text-slate-400"
                  >{{ score }} → 95</span
                >
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono"
                >
                  +{{ Math.max(0, 95 - score) }} HP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Insight Cards Row ── -->
      <div
        class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]"
      >
        <div
          v-for="card in insightCards"
          :key="card.id"
          class="insight-card"
          :class="
            card.isWarning
              ? card.accentWarn === 'rose'
                ? 'hover:border-rose-500/25'
                : 'hover:border-amber-500/25'
              : 'hover:border-emerald-500/25'
          "
        >
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex items-center gap-2">
              <!-- Icon -->
              <div
                class="w-6 h-6 rounded-md flex items-center justify-center border"
                :class="
                  card.isWarning
                    ? card.accentWarn === 'rose'
                      ? 'bg-rose-500/10 border-rose-500/20'
                      : 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20'
                "
              >
                <svg
                  class="w-3 h-3"
                  :class="
                    card.isWarning
                      ? card.accentWarn === 'rose'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                      : 'text-emerald-400'
                  "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  v-html="card.icon"
                />
              </div>
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans"
                >{{ card.label }}</span
              >
            </div>
            <!-- Status pill -->
            <span
              class="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-sans"
              :class="
                card.isWarning
                  ? card.accentWarn === 'rose'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              "
            >
              {{ card.isWarning ? card.badgeWarn : card.badgeOk }}
            </span>
          </div>
          <p class="text-sm font-bold text-white font-mono mb-1">
            {{ card.value }}
          </p>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            {{ card.isWarning ? card.descWarn : card.descOk }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Gauge ring */
.gauge-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 8px;
}
.gauge-progress {
  fill: none;
  stroke-width: 8px;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Financial stat row */
.stat-row {
  @apply flex items-center justify-between py-2.5 gap-4;
}
.stat-label {
  @apply text-sm text-slate-400 font-sans;
}
.stat-value {
  @apply text-sm font-bold font-mono;
}
.stat-unit {
  @apply text-[10px] font-medium ml-0.5;
}

/* Insight cards */
.insight-card {
  @apply p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]
         transition-colors duration-200 cursor-default;
}
</style>
