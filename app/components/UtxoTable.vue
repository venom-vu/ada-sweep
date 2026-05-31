<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWalletStore } from '~/stores/wallet'
import { useOptimizerStore } from '~/stores/optimizer'

const walletStore = useWalletStore()
const optimizerStore = useOptimizerStore()

// Filter value for maximum ADA limit
const maxAdaFilter = ref<string>('')

// Computed list of UTXOs matching the custom ADA threshold
const filteredUtxos = computed(() => {
  const limit = parseFloat(maxAdaFilter.value)
  if (isNaN(limit) || limit < 0 || maxAdaFilter.value === '') {
    return walletStore.utxos
  }
  return walletStore.utxos.filter(utxo => (utxo.lovelace / 1000000) <= limit)
})

// Check if all currently filtered UTXOs are selected
const isAllSelected = computed(() => {
  if (filteredUtxos.value.length === 0) return false
  return filteredUtxos.value.every(utxo =>
    optimizerStore.selectedKeys.includes(`${utxo.txHash}#${utxo.index}`)
  )
})

// Select all currently filtered UTXOs
const selectFiltered = () => {
  filteredUtxos.value.forEach(utxo => {
    const key = `${utxo.txHash}#${utxo.index}`
    if (!optimizerStore.selectedKeys.includes(key)) {
      optimizerStore.selectedKeys.push(key)
    }
  })
}

// Deselect only the currently filtered UTXOs
const deselectFiltered = () => {
  const filteredKeys = filteredUtxos.value.map(utxo => `${utxo.txHash}#${utxo.index}`)
  optimizerStore.selectedKeys = optimizerStore.selectedKeys.filter(
    key => !filteredKeys.includes(key)
  )
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    deselectFiltered()
  } else {
    selectFiltered()
  }
}

// Quick presets
const applyPreset = (limitAda: number) => {
  maxAdaFilter.value = limitAda.toString()
}

const formatAda = (lovelace: number) => {
  return (lovelace / 1000000).toFixed(2)
}
</script>

<template>
  <div class="fintech-card p-7">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h3 class="text-lg font-bold text-white">Select UTXO Inputs to Consolidate</h3>
        <p class="text-xs text-slate-400 mt-1">Select individual UTXOs or apply filters to select in bulk.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 transition-all duration-200"
          @click="optimizerStore.deselectAll"
        >
          Clear Selection
        </button>
      </div>
    </div>

    <div class="h-px bg-white/[0.06] mb-6"></div>

    <!-- Unified, Space-Efficient Filter & Selection Controller -->
    <div v-if="walletStore.utxos.length > 0" class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 mb-6">
      
      <!-- Filter Inputs & Presets -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Quick Select Input -->
        <div class="flex items-center bg-white/[0.04] border border-white/[0.1] rounded-lg px-2.5 py-1.5 max-w-[170px] focus-within:border-cyan-500/30 transition-all">
          <span class="text-xs font-semibold text-slate-400 mr-2">Max:</span>
          <input
            type="number"
            v-model="maxAdaFilter"
            placeholder="No limit"
            step="0.5"
            min="0"
            class="bg-transparent border-none outline-none text-white text-xs font-semibold w-14 placeholder-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span class="text-[10px] text-slate-500 font-bold ml-1">ADA</span>
          <button
            v-if="maxAdaFilter !== ''"
            @click="maxAdaFilter = ''"
            class="ml-2 text-slate-400 hover:text-white transition-colors text-xs font-bold"
            title="Clear filter"
          >
            ✕
          </button>
        </div>

        <!-- Quick Preset Pills -->
        <div class="flex items-center gap-1.5">
          <button
            v-for="preset in [2, 5, 10]"
            :key="preset"
            @click="applyPreset(preset)"
            class="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150"
            :class="{ '!bg-cyan-500/10 !border-cyan-500/20 !text-cyan-400': maxAdaFilter === preset.toString() }"
          >
            &le; {{ preset }}.0 ADA
          </button>
        </div>
      </div>

      <!-- Action Buttons Scoped to Filter -->
      <div class="flex items-center gap-2">
        <button
          class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-200"
          @click="selectFiltered"
        >
          Select Filtered ({{ filteredUtxos.length }})
        </button>
        <button
          class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/5 border border-white/[0.08] text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
          @click="deselectFiltered"
        >
          Deselect Filtered
        </button>
      </div>
    </div>

    <div v-if="walletStore.utxos.length === 0" class="text-center py-10">
      <p class="text-slate-400 text-sm">No active UTXOs found. Make sure your wallet is connected.</p>
    </div>

    <div v-else-if="filteredUtxos.length === 0" class="text-center py-12 px-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
      <p class="text-slate-400 text-sm">No UTXOs match your filter threshold of <strong class="text-white">{{ maxAdaFilter }} ADA</strong>.</p>
      <button @click="maxAdaFilter = ''" class="mt-3.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">Clear active filter</button>
    </div>

    <!-- Scrollable views (Responsive Layout) -->
    <template v-else>
      <!-- Scrollable table (Desktop/Tablet View) -->
      <div class="hidden md:block table-scroll overflow-x-auto overflow-y-auto max-h-[480px] pr-1">
        <table class="w-full text-left">
          <thead class="sticky top-0 bg-[rgba(10,14,24,0.95)]">
            <tr class="border-b border-white/[0.12] text-slate-500 text-xs font-medium uppercase tracking-wider">
              <th class="pb-3 pr-4 w-10">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="checkbox-custom"
                />
              </th>
              <th class="pb-3 px-4">Transaction Hash & Index</th>
              <th class="pb-3 px-4">ADA Value</th>
              <th class="pb-3 pl-4">Native Assets</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04] text-sm">
            <tr
              v-for="utxo in filteredUtxos"
              :key="`${utxo.txHash}#${utxo.index}`"
              class="cursor-pointer transition-colors hover:bg-white/[0.02]"
              :class="{ 'bg-cyan-500/[0.025]': optimizerStore.selectedKeys.includes(`${utxo.txHash}#${utxo.index}`) }"
              @click="optimizerStore.toggleSelection(utxo)"
            >
              <td class="py-4 pr-4" @click.stop>
                <input
                  type="checkbox"
                  :checked="optimizerStore.selectedKeys.includes(`${utxo.txHash}#${utxo.index}`)"
                  @change="optimizerStore.toggleSelection(utxo)"
                  class="checkbox-custom"
                />
              </td>
              <td class="py-4 px-4 font-mono text-cyan-400 text-[13px]">
                <div class="flex items-center gap-1.5">
                  <span class="hover:text-cyan-300 transition-colors cursor-help" :title="utxo.txHash">
                    {{ utxo.txHash.slice(0, 8) }}...{{ utxo.txHash.slice(-4) }}
                  </span>
                  <strong class="text-blue-400 bg-white/5 px-1 py-0.5 rounded text-xs flex-shrink-0">#{{ utxo.index }}</strong>
                </div>
              </td>
              <td class="py-4 px-4 font-bold font-display text-white">
                {{ formatAda(utxo.lovelace) }} ADA
              </td>
              <td class="py-4 pl-4">
                <span v-if="Object.keys(utxo.assets).length === 0" class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Pure ADA
                </span>
                <span v-else class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {{ Object.keys(utxo.assets).length }} Assets
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile view (Stacked List View with Lazy Load) -->
      <div class="block md:hidden overflow-y-auto max-h-[320px] pr-1 space-y-3">
        <div
          v-for="utxo in filteredUtxos"
          :key="`${utxo.txHash}#${utxo.index}`"
          class="mobile-utxo-item p-4 border border-white/5 bg-white/[0.01] rounded-btn flex flex-col gap-2 transition-colors cursor-pointer"
          :class="{ 'bg-cyan-500/[0.025] !border-cyan-500/20': optimizerStore.selectedKeys.includes(`${utxo.txHash}#${utxo.index}`) }"
          @click="optimizerStore.toggleSelection(utxo)"
        >
          <!-- Row 1: TxHash & Checkbox -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span class="hover:text-cyan-300 transition-colors">
                {{ utxo.txHash.slice(0, 8) }}...{{ utxo.txHash.slice(-6) }}
              </span>
              <strong class="text-blue-400 bg-white/5 px-1 py-0.5 rounded text-[10px]">#{{ utxo.index }}</strong>
            </div>
            <div @click.stop>
              <input
                type="checkbox"
                :checked="optimizerStore.selectedKeys.includes(`${utxo.txHash}#${utxo.index}`)"
                @change="optimizerStore.toggleSelection(utxo)"
                class="checkbox-custom"
              />
            </div>
          </div>

          <!-- Row 2: Value & Assets -->
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-white font-mono">
              {{ formatAda(utxo.lovelace) }} ADA
            </span>
            <div>
              <span v-if="Object.keys(utxo.assets).length === 0" class="inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                Pure ADA
              </span>
              <span v-else class="inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
                {{ Object.keys(utxo.assets).length }} Assets
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.checkbox-custom {
  position: relative;
  width: 18px;
  height: 18px;
  appearance: none;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox-custom:checked {
  background: #06b6d4;
  border-color: #06b6d4;
}

.checkbox-custom:checked::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #000;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  position: absolute;
  top: 1px;
}

.table-scroll::-webkit-scrollbar {
  width: 6px;
}
.table-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.table-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.table-scroll::-webkit-scrollbar-thumb:hover {
  background: #06b6d4;
}

.mobile-utxo-item {
  content-visibility: auto;
  contain-intrinsic-size: 68px;
}
</style>
