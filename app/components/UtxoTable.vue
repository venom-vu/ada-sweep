<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";
import { useOptimizerStore } from "~/stores/optimizer";
import { ref, computed } from "vue";

const walletStore = useWalletStore();
const optimizerStore = useOptimizerStore();

const isConsolidating = computed(() => optimizerStore.batchStatus !== "idle")

// Filter value for maximum ADA limit
const maxAdaFilter = ref<string>("");

// Computed list of UTXOs matching the custom ADA threshold
const filteredUtxos = computed(() => {
  let utxos = walletStore.utxos;

  const limit = parseFloat(maxAdaFilter.value);
  if (isNaN(limit) || limit < 0 || maxAdaFilter.value === "") {
    return utxos;
  }
  return utxos.filter((utxo) => utxo.lovelace / 1000000 <= limit);
});

// Check if all currently filtered UTXOs are selected
const isAllSelected = computed(() => {
  if (filteredUtxos.value.length === 0) return false;
  return filteredUtxos.value.every((utxo) =>
    optimizerStore.selectedKeys.includes(`${utxo.txHash}#${utxo.index}`),
  );
});

// Select all currently filtered UTXOs
const selectFiltered = () => {
  filteredUtxos.value.forEach((utxo) => {
    const key = `${utxo.txHash}#${utxo.index}`;
    if (!optimizerStore.selectedKeys.includes(key)) {
      optimizerStore.selectedKeys.push(key);
    }
  });
};

// Deselect only the currently filtered UTXOs
const deselectFiltered = () => {
  const filteredKeys = filteredUtxos.value.map(
    (utxo) => `${utxo.txHash}#${utxo.index}`,
  );
  optimizerStore.selectedKeys = optimizerStore.selectedKeys.filter(
    (key) => !filteredKeys.includes(key),
  );
};

const toggleSelectAll = () => {
  if (isConsolidating.value) return;
  if (isAllSelected.value) {
    deselectFiltered();
  } else {
    selectFiltered();
  }
};

// Quick presets
const applyPreset = (limitAda: number) => {
  maxAdaFilter.value = limitAda.toString();
};

const formatAda = (lovelace: number) => {
  return (lovelace / 1000000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
</script>

<template>
  <div class="fintech-card p-7">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
    >
      <div>
        <h3 class="text-lg font-bold text-white">
          Select UTXO Inputs to Consolidate
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          Select individual UTXOs or apply filters to select in bulk.
        </p>
      </div>
      <div class="flex items-center gap-3 min-h-[38px]">
        <!-- <div
          v-if="optimizerStore.selectedKeys.length > 0"
          class="flex items-center gap-2.5 animate-fade-in"
        >
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-sm"
          >
            <span
              class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
            ></span>
            Selected: {{ optimizerStore.selectedKeys.length }} ({{
              optimizerStore.totalSelectedAda.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            }}<span class="text-violet-400/70 text-[10px] font-medium ml-0.5">ADA</span>)
          </span>
        </div> -->
        <button
          @click="walletStore.fetchUtxos()"
          class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Refresh UTXOs"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <div class="h-px bg-white/[0.06] mb-6"></div>

    <!-- Unified, Space-Efficient Filter & Selection Controller -->
    <div
      v-if="walletStore.utxos.length > 0"
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 mb-6"
    >
      <!-- Filter Inputs & Presets -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Quick Select Input -->
        <div
          class="flex items-center bg-white/[0.04] border border-white/[0.1] rounded-lg px-2.5 py-1.5 max-w-[170px] focus-within:border-violet-500/30 transition-all"
        >
          <span class="text-xs font-semibold text-slate-400 mr-2 font-sans"
            >Max:</span
          >
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
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="preset in [2, 5, 10]"
            :key="preset"
            @click="applyPreset(preset)"
            class="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150"
            :class="{
              '!bg-violet-500/10 !border-violet-500/20 !text-violet-400':
                maxAdaFilter === preset.toString(),
            }"
          >
            &le; {{ preset }}.0 ADA
          </button>
        </div>
      </div>

      <!-- Action Buttons Scoped to Filter -->
      <div
        v-if="filteredUtxos.length > 0"
        class="w-full sm:w-auto flex items-center"
      >
        <button
          class="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            isAllSelected
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 shadow-sm shadow-amber-500/5'
              : 'bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 shadow-sm shadow-violet-500/5'
          "
          :disabled="isConsolidating"
          @click="toggleSelectAll"
        >
          <span v-if="isAllSelected">Deselect Filtered</span>
          <span v-else>Select Filtered</span>
          <span class="opacity-80">({{ filteredUtxos.length }})</span>
        </button>
      </div>
    </div>

    <div v-if="walletStore.utxos.length === 0" class="text-center py-10">
      <p class="text-slate-400 text-sm">
        No active UTXOs found. Make sure your wallet is connected.
      </p>
    </div>

    <div
      v-else-if="filteredUtxos.length === 0"
      class="text-center py-12 px-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]"
    >
      <p class="text-slate-400 text-sm">
        No UTXOs match your filter threshold of
        <strong class="text-white">{{ maxAdaFilter }} ADA</strong>.
      </p>
      <button
        @click="maxAdaFilter = ''"
        class="mt-3.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-all"
      >
        Clear active filter
      </button>
    </div>

    <!-- Scrollable views (Responsive Layout) -->
    <template v-else>
      <!-- Scrollable table (Desktop/Tablet View) -->
      <div
        class="hidden md:block table-scroll overflow-x-auto overflow-y-auto max-h-[480px] pr-1"
      >
        <table class="w-full text-left">
          <thead class="sticky top-0 z-10 bg-fintech-dark">
            <tr
              class="border-b border-white/[0.12] text-slate-500 text-xs font-medium uppercase tracking-wider"
            >
              <th class="p-4 w-10">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :disabled="isConsolidating"
                  @change="toggleSelectAll"
                  class="checkbox-custom"
                />
              </th>
              <th class="py-4 px-4">Tx Hash</th>
              <th class="py-4 px-4">ADA</th>
              <th class="py-4 pl-4">Native Assets</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04] text-sm">
            <tr
              v-for="utxo in filteredUtxos"
              :key="`${utxo.txHash}#${utxo.index}`"
              class="transition-colors hover:bg-white/[0.02]"
              :class="{
                'bg-violet-500/[0.025]': optimizerStore.selectedKeys.includes(
                  `${utxo.txHash}#${utxo.index}`,
                ),
                'cursor-pointer': !isConsolidating,
                'opacity-60': isConsolidating,
              }"
              @click="!isConsolidating && optimizerStore.toggleSelection(utxo)"
            >
              <td class="p-4" @click.stop>
                <input
                  type="checkbox"
                  :checked="
                    optimizerStore.selectedKeys.includes(
                      `${utxo.txHash}#${utxo.index}`,
                    )
                  "
                  :disabled="isConsolidating"
                  @change="optimizerStore.toggleSelection(utxo)"
                  class="checkbox-custom"
                />
              </td>
              <td class="py-4 px-4 font-mono text-violet-400 text-[13px]">
                <div class="flex items-center gap-1.5">
                  <span
                    class="hover:text-violet-300 transition-colors cursor-help"
                    :title="utxo.txHash"
                  >
                    {{ utxo.txHash.slice(0, 8) }}...{{ utxo.txHash.slice(-4) }}
                  </span>
                  <strong
                    class="text-blue-400 bg-white/5 px-1.5 py-0.5 rounded-lg text-[10px] font-sans font-semibold flex-shrink-0"
                    >#{{ utxo.index }}</strong
                  >
                </div>
              </td>
              <td class="py-4 px-4 font-semibold text-white font-mono text-sm">
                {{ formatAda(utxo.lovelace) }}
                <span class="text-slate-500 text-[10px] font-medium">ADA</span>
              </td>
              <td class="py-4 pl-4">
                <span
                  v-if="Object.keys(utxo.assets).length === 0"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
                  Pure ADA
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  <span class="w-1 h-1 rounded-full bg-amber-400"></span>
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
            class="mobile-utxo-item p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col gap-2 transition-colors"
            :class="{
              'bg-violet-500/[0.025] !border-violet-500/20':
                optimizerStore.selectedKeys.includes(
                  `${utxo.txHash}#${utxo.index}`,
                ),
              'cursor-pointer': !isConsolidating,
              'opacity-60': isConsolidating,
            }"
            @click="!isConsolidating && optimizerStore.toggleSelection(utxo)"
          >
            <!-- Row 1: TxHash & Checkbox -->
            <div class="flex items-center justify-between">
              <div
                class="flex items-center gap-2 font-mono text-[11px] text-slate-400"
              >
                <span class="hover:text-violet-300 transition-colors">
                  {{ utxo.txHash.slice(0, 8) }}...{{ utxo.txHash.slice(-6) }}
                </span>
                <strong
                  class="text-blue-400 bg-white/5 px-1.5 py-0.5 rounded-lg text-[10px] font-sans font-semibold"
                  >#{{ utxo.index }}</strong
                >
              </div>
              <div @click.stop>
                <input
                  type="checkbox"
                  :checked="
                    optimizerStore.selectedKeys.includes(
                      `${utxo.txHash}#${utxo.index}`,
                    )
                  "
                  :disabled="isConsolidating"
                  @change="optimizerStore.toggleSelection(utxo)"
                  class="checkbox-custom"
                />
              </div>
            </div>

          <!-- Row 2: Value & Assets -->
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-white font-mono text-sm">
              {{ formatAda(utxo.lovelace) }}
              <span class="text-slate-500 text-[10px] font-medium">ADA</span>
            </span>
            <div>
              <span
                v-if="Object.keys(utxo.assets).length === 0"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans"
              >
                <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
                Pure ADA
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans"
              >
                <span class="w-1 h-1 rounded-full bg-amber-400"></span>
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
  vertical-align: middle;
}

.checkbox-custom:checked {
  background: #8b5cf6;
  border-color: #8b5cf6;
}

.checkbox-custom:checked::after {
  content: "";
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
  background: #8b5cf6;
}

.mobile-utxo-item {
  content-visibility: auto;
  contain-intrinsic-size: 68px;
}
</style>
