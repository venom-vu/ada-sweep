<script setup lang="ts">
import { useOptimizerStore } from '~/stores/optimizer'

const optimizerStore = useOptimizerStore()

const handleConsolidate = async () => {
  await optimizerStore.executeConsolidation()
}

const handleReset = () => {
  optimizerStore.resetBatchFlow()
}
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
          <span class="block text-[11px] uppercase text-slate-500 font-semibold tracking-wider font-sans">Selected Inputs</span>
          <span class="block text-xl font-black font-heading text-white mt-0.5">{{ optimizerStore.selectedKeys.length }} UTXOs</span>
        </div>
        <div class="text-left sm:text-right">
          <span class="block text-[11px] uppercase text-slate-500 font-semibold tracking-wider font-sans">Aggregated Balance</span>
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

      <!-- ACTION SUBMIT BUTTON -->
      <button
        v-if="optimizerStore.batchStatus === 'idle'"
        class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        :disabled="optimizerStore.isExecuting"
        @click="handleConsolidate"
      >
        Optimize selected eUTXOs
      </button>

      <!-- BATCH QUEUE TRACKER -->
      <div v-if="optimizerStore.batchStatus !== 'idle'" class="rounded-xl border border-white/[0.1] bg-[rgba(20,27,45,0.6)] p-5 flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <h4 class="text-sm font-bold font-display text-white">Consolidation Batches</h4>
          <span
            class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            :class="{
              'bg-amber-500/10 text-amber-400 border border-amber-500/20': optimizerStore.batchStatus === 'signing',
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': optimizerStore.batchStatus === 'success',
              'bg-rose-500/10 text-rose-400 border border-rose-500/20': optimizerStore.batchStatus === 'error'
            }"
          >
            {{ optimizerStore.batchStatus === 'signing' ? 'Signing in Progress' : optimizerStore.batchStatus === 'success' ? 'Completed' : 'Error' }}
          </span>
        </div>

        <!-- Progress Bar -->
        <div>
          <div class="flex justify-between text-xs text-slate-400 mb-1.5 font-sans">
            <span>Overall Progress</span>
            <span class="font-heading">Batch {{ optimizerStore.currentBatchIndex + 1 }} / {{ optimizerStore.totalBatches }}</span>
          </div>
          <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-violet-500 to-indigo-500 progress-fill"
              :style="{ width: ((optimizerStore.currentBatchIndex + (optimizerStore.batchStatus === 'success' ? 1 : 0)) / optimizerStore.totalBatches * 100) + '%' }"
            ></div>
          </div>
        </div>

        <!-- Batch Log Items -->
        <div class="flex flex-col gap-2">
          <div
            v-for="idx in optimizerStore.totalBatches"
            :key="idx"
            class="flex justify-between items-center px-3 py-2.5 rounded-lg border text-xs transition-all duration-200"
            :class="{
              'bg-violet-500/[0.03] border-violet-500/20 text-white': optimizerStore.currentBatchIndex === idx - 1 && optimizerStore.batchStatus === 'signing',
              'bg-emerald-500/[0.02] border-emerald-500/10 text-emerald-400': optimizerStore.currentBatchIndex > idx - 1 || optimizerStore.batchStatus === 'success',
              'bg-white/[0.01] border-white/[0.08] text-slate-400': !(optimizerStore.currentBatchIndex === idx - 1 && optimizerStore.batchStatus === 'signing') && !(optimizerStore.currentBatchIndex > idx - 1 || optimizerStore.batchStatus === 'success')
            }"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-violet-400 shadow-[0_0_6px_#8b5cf6] animate-pulse': optimizerStore.currentBatchIndex === idx - 1 && optimizerStore.batchStatus === 'signing',
                  'bg-emerald-400': optimizerStore.currentBatchIndex > idx - 1 || optimizerStore.batchStatus === 'success',
                  'bg-slate-600': !(optimizerStore.currentBatchIndex === idx - 1 && optimizerStore.batchStatus === 'signing') && !(optimizerStore.currentBatchIndex > idx - 1 || optimizerStore.batchStatus === 'success')
                }"
              ></span>
              <span>Batch #{{ idx }}</span>
            </div>
            <span class="font-semibold">
              {{ optimizerStore.currentBatchIndex > idx - 1 || optimizerStore.batchStatus === 'success' ? 'Signed & Submitted' :
                 optimizerStore.currentBatchIndex === idx - 1 && optimizerStore.batchStatus === 'signing' ? 'Signing...' :
                 optimizerStore.batchStatus === 'error' && optimizerStore.currentBatchIndex === idx - 1 ? 'Failed' : 'Pending' }}
            </span>
          </div>
        </div>

        <!-- Tx Hashes -->
        <div v-if="optimizerStore.transactionHashes.length > 0">
          <p class="text-xs font-semibold text-slate-400 mb-2">Dispatched Tx Hashes:</p>
          <div class="max-h-28 overflow-y-auto flex flex-col gap-1.5 bg-black/20 p-2.5 rounded-lg border border-white/[0.06]">
            <div v-for="(hash, index) in optimizerStore.transactionHashes" :key="hash" class="flex justify-between text-xs font-mono">
              <span class="text-slate-400">Batch {{ index + 1 }}:</span>
              <a :href="'https://preprod.cardanoscan.io/transaction/' + hash" target="_blank" class="text-violet-400 hover:text-violet-300 underline">
                {{ hash.slice(0, 16) }}...{{ hash.slice(-4) }}
              </a>
            </div>
          </div>
        </div>

        <!-- Reset / Retry -->
        <button
          v-if="optimizerStore.batchStatus === 'success' || optimizerStore.batchStatus === 'error'"
          class="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          @click="handleReset"
        >
          {{ optimizerStore.batchStatus === 'success' ? 'Back to Optimizer' : 'Retry Consolidation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-fill {
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>
