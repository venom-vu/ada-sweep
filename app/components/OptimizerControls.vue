<script setup lang="ts">
import { useOptimizerStore } from '~/stores/optimizer'
import { useWalletStore } from '~/stores/wallet'

const optimizerStore = useOptimizerStore()
const walletStore = useWalletStore()

let resetTimer: ReturnType<typeof setTimeout> | null = null

const handleConsolidate = async () => {
  await optimizerStore.executeConsolidation()
}

const handleReset = () => {
  optimizerStore.resetBatchFlow()
}

const cardanoscanUrl = computed(() => {
  const hash = optimizerStore.latestTxHash
  if (!hash) return '#'
  const base = walletStore.selectedNetwork === 'preprod'
    ? 'https://preprod.cardanoscan.io/transaction/'
    : 'https://cardanoscan.io/transaction/'
  return base + hash
})

watch(() => optimizerStore.batchStatus, (status) => {
  if (status === 'success') {
    resetTimer = setTimeout(() => {
      optimizerStore.resetBatchFlow()
    }, 2500)
  }
})

onUnmounted(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <div class="fintech-card p-7">
    <h3 class="text-lg font-bold text-white mb-6">Optimizer Controller</h3>

    <!-- UNSELECTED STATE -->
    <div v-if="optimizerStore.selectedKeys.length === 0" class="text-center py-10 px-4">
      <p class="text-slate-400 text-sm leading-relaxed">
        Select individual UTXOs from the list or click <strong class="text-white">Select All Dust</strong> to calculate potential fee savings.
      </p>
    </div>

    <!-- ACTIVE SIMULATION CONTROL -->
    <div v-else class="flex flex-col gap-5">
      <!-- Statistics Summary Box -->
      <div class="flex flex-wrap justify-between items-center gap-3 bg-white/[0.02] border border-white/[0.08] rounded-xl px-5 py-3.5">
        <div class="text-left">
          <span class="block text-[11px] uppercase text-slate-500 font-semibold tracking-wider font-sans">Selected</span>
          <span class="block text-xl font-black font-heading text-white mt-0.5">{{ optimizerStore.selectedKeys.length }} <span class="text-slate-500 text-[10px] font-medium ml-0.5">UTXOs</span></span>
        </div>
        <div class="text-left sm:text-right">
          <span class="block text-[11px] uppercase text-slate-500 font-semibold tracking-wider font-sans">Total Balance</span>
          <span class="block text-xl font-black font-heading text-white mt-0.5">
            {{ optimizerStore.totalSelectedAda.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
            <span class="text-slate-500 text-[10px] font-medium ml-0.5">ADA</span>
          </span>
        </div>
      </div>

      <!-- Fee Breakdown -->
      <div class="flex flex-col gap-2 font-display">
        <div class="flex justify-between text-sm text-slate-400">
          <span>Estimated Network Fee</span>
          <span>
            {{ optimizerStore.estimatedFeeAda.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
            <span class="text-slate-500 text-[10px] font-medium ml-0.5">ADA</span>
          </span>
        </div>
        <div class="flex justify-between text-base font-bold border-t border-dashed border-white/[0.08] pt-2 mt-1">
          <span class="text-white">Recovered Net ADA</span>
          <span class="text-emerald-400">
            +{{ optimizerStore.recoverableAda.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
            <span class="text-emerald-500/80 text-[10px] font-medium ml-0.5">ADA</span>
          </span>
        </div>
      </div>

      <!-- Economic Inefficiency Warning -->
      <div v-if="optimizerStore.isInefficient" class="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.08] border-l-4 border-amber-500 text-amber-200">
        <svg class="w-5 h-5 flex-shrink-0 stroke-amber-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <div>
          <p class="font-bold text-sm">Economic Inefficiency Warning</p>
          <p class="text-xs mt-1 leading-snug text-amber-200/80">
            Your transaction fee consumes more than 30% of the total ADA you will recover.
            We recommend selecting more outputs or waiting for lower congestion.
          </p>
        </div>
      </div>

      <!-- DYNAMIC ACTION AREA -->

      <!-- IDLE: Submit button -->
      <button
        v-if="['idle','error'].includes(optimizerStore.batchStatus)"
        class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95 text-sm font-semibold transition-all duration-300 cursor-pointer"
        @click="handleConsolidate"
      >
        Optimize selected eUTXOs
      </button>

      <!-- SIGNING: Wallet signature request -->
      <div v-else-if="optimizerStore.batchStatus === 'signing'" class="flex flex-col gap-3">
        <button
          disabled
          class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/30 text-sm font-semibold cursor-not-allowed"
        >
          <svg class="animate-spin h-4 w-4 text-violet-300" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Signing...
        </button>
      </div>

      <!-- SUBMITTED / CONFIRMING: Show tx hash + waiting on-chain -->
      <div v-else-if="optimizerStore.batchStatus === 'submitted' || optimizerStore.batchStatus === 'confirming'" class="flex flex-col gap-3">
        <div v-if="optimizerStore.latestTxHash" class="flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
          <span class="text-xs font-semibold text-slate-400">Tx Hash:</span>
          <a
            :href="cardanoscanUrl"
            target="_blank"
            class="text-xs font-mono text-violet-400 hover:text-violet-300 underline truncate max-w-[220px]"
          >
            {{ optimizerStore.latestTxHash.slice(0, 16) }}...{{ optimizerStore.latestTxHash.slice(-4) }}
          </a>
        </div>
        <button
          disabled
          class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-sm font-semibold cursor-not-allowed"
        >
          <svg class="animate-spin h-4 w-4 text-emerald-300" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Confirming on-chain...
        </button>
      </div>

    </div>
  </div>
</template>
