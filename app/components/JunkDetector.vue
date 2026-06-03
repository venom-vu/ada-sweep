<script setup lang="ts">
import { ref } from 'vue'
import { useCleanerStore } from '~/stores/cleaner'

const emit = defineEmits(['update:selectedJunk'])
const cleanerStore = useCleanerStore()
const activeTab = ref<'suspicious' | 'trusted'>('suspicious')
const selectedJunk = ref<string[]>([])

const selectTab = (tab: 'suspicious' | 'trusted') => {
  activeTab.value = tab
}

const toggleSelectJunk = (assetId: string) => {
  if (selectedJunk.value.includes(assetId)) {
    selectedJunk.value = selectedJunk.value.filter(id => id !== assetId)
  } else {
    selectedJunk.value.push(assetId)
  }
  emit('update:selectedJunk', selectedJunk.value)
}

const selectAllSpam = () => {
  const allSpamIds = cleanerStore.suspiciousAssets.map(a => a.assetId)
  if (selectedJunk.value.length === allSpamIds.length) {
    selectedJunk.value = []
  } else {
    selectedJunk.value = [...allSpamIds]
  }
  emit('update:selectedJunk', selectedJunk.value)
}

const handleMarkAsTrusted = (assetId: string) => {
  cleanerStore.markAsTrusted(assetId)
  selectedJunk.value = selectedJunk.value.filter(id => id !== assetId)
  emit('update:selectedJunk', selectedJunk.value)
}

const handleMarkAsSuspicious = (assetId: string) => {
  cleanerStore.markAsSuspicious(assetId)
}
</script>

<template>
  <div class="fintech-card p-7">
    <!-- Header & Tabs -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h3 class="text-lg font-bold text-white">Cardano Asset Classifier</h3>
        <p class="text-xs text-slate-400 mt-1">
          Scan native assets, audit liquidities, and sweep spam to release locked ADA.
        </p>
      </div>
      <div class="flex bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 gap-1 relative z-10">
        <button
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          :class="activeTab === 'suspicious' ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'"
          @click="selectTab('suspicious')"
        >
          Suspicious ({{ cleanerStore.suspiciousAssets.length }})
        </button>
        <button
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
          :class="activeTab === 'trusted' ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'"
          @click="selectTab('trusted')"
        >
          Trusted ({{ cleanerStore.trustedAssets.length }})
        </button>
      </div>
    </div>

    <div class="h-px bg-white/[0.06] mb-6"></div>

    <!-- DEX loading indicator -->
    <div v-if="cleanerStore.isLoadingLiquidity" class="flex items-center gap-3 bg-violet-500/5 border border-violet-500/20 rounded-xl px-4 py-3 mb-6 text-xs text-violet-400">
      <div class="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin flex-shrink-0"></div>
      <p class="font-sans">Syncing token liquidity with DEX aggregator pool statistics...</p>
    </div>

    <!-- TAB 1: SUSPICIOUS SPAM LIST -->
    <div v-if="activeTab === 'suspicious'">
      <div v-if="cleanerStore.suspiciousAssets.length === 0" class="text-center py-12 px-6">
        <div class="text-4xl mb-4 text-emerald-400">✓</div>
        <h3 class="text-white font-semibold mb-2">No Suspicious Assets Found</h3>
        <p class="text-slate-400 text-sm">Your wallet is currently 100% clean of known spam tokens and inactive native assets.</p>
      </div>
      <div v-else>
        <div
          v-if="cleanerStore.suspiciousAssets.length > 0"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 mb-6"
        >
          <div>
            <p class="text-slate-400 text-xs font-sans">
              Select suspicious assets to consolidate or sweep.
            </p>
          </div>
          <div class="w-full sm:w-auto flex items-center">
            <button
              class="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
              :class="selectedJunk.length === cleanerStore.suspiciousAssets.length
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 shadow-sm shadow-amber-500/5'
                : 'bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 shadow-sm shadow-violet-500/5'"
              @click="selectAllSpam"
            >
              <span>{{ selectedJunk.length === cleanerStore.suspiciousAssets.length ? 'Deselect All' : 'Select All Spam' }}</span>
              <span class="opacity-80">({{ cleanerStore.suspiciousAssets.length }})</span>
            </button>
          </div>
        </div>

        <!-- Desktop Table view -->
        <div class="hidden md:block table-scroll overflow-x-auto overflow-y-auto max-h-[480px] pr-1">
          <table class="w-full text-left">
            <thead class="sticky top-0 z-10 bg-fintech-dark">
              <tr class="border-b border-white/[0.12] text-slate-500 text-xs font-medium uppercase tracking-wider">
                <th class="py-4 pr-4 w-10">Sel</th>
                <th class="py-4 px-4">Asset</th>
                <th class="py-4 px-4">Risk Reason</th>
                <th class="py-4 px-4">Balance</th>
                <th class="py-4 pl-4 w-36">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04] text-sm">
              <tr
                v-for="asset in cleanerStore.suspiciousAssets"
                :key="asset.assetId"
                class="cursor-pointer transition-colors duration-150 hover:bg-white/[0.02]"
                :class="{ 'bg-violet-500/[0.025]': selectedJunk.includes(asset.assetId) }"
                @click="toggleSelectJunk(asset.assetId)"
              >
                <td class="py-4 pr-4" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedJunk.includes(asset.assetId)"
                    @change="toggleSelectJunk(asset.assetId)"
                    class="checkbox-custom"
                  />
                </td>
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="relative w-9 h-9 bg-rose-500/[0.06] border border-dashed border-rose-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group cursor-help">
                      <span class="text-base">⚠️</span>
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-950/95 backdrop-blur-xl text-white text-[11px] leading-snug p-2.5 rounded-lg border border-white/[0.08] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center font-sans">
                        PHISHING SHIELD ACTIVE: Media components have been safely decoupled to prevent browser attacks.
                      </div>
                    </div>
                    <div>
                      <p class="font-semibold text-white text-sm">{{ asset.displayName }}</p>
                      <p class="text-slate-500 text-[11px] font-mono mt-0.5 hover:text-slate-300 transition-colors cursor-help" :title="asset.policyId">{{ asset.policyId.slice(0, 16) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <span class="w-1 h-1 rounded-full bg-rose-400"></span>
                    {{ asset.reason }}
                  </span>
                </td>
                <td class="py-4 px-4 font-semibold font-display text-white">{{ asset.amount }}</td>
                <td class="py-4 pl-4" @click.stop>
                  <button
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 transition-colors"
                    @click="handleMarkAsTrusted(asset.assetId)"
                  >
                    Mark Trusted
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Stacked Card view -->
        <div class="block md:hidden space-y-3">
          <div
            v-for="asset in cleanerStore.suspiciousAssets"
            :key="asset.assetId"
            class="p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col gap-3 transition-colors cursor-pointer"
            :class="{ 'bg-rose-500/[0.015] border-rose-500/10': selectedJunk.includes(asset.assetId) }"
            @click="toggleSelectJunk(asset.assetId)"
          >
            <!-- Row 1: Checkbox & Warning shield badge -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedJunk.includes(asset.assetId)"
                    @change="toggleSelectJunk(asset.assetId)"
                    class="checkbox-custom"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm">⚠️</span>
                  <span class="text-[10px] uppercase tracking-wider font-semibold font-sans text-rose-400/80 bg-rose-950/20 px-2.5 py-1 rounded-lg border border-rose-500/20">Phishing Shield</span>
                </div>
              </div>
              <span class="text-slate-400 text-xs font-semibold">Balance: <strong class="text-white font-mono">{{ asset.amount }}</strong></span>
            </div>

            <!-- Row 2: Asset Details -->
            <div class="flex flex-col text-left">
              <p class="font-bold text-white text-sm leading-snug">{{ asset.displayName }}</p>
              <p class="text-slate-500 text-[10px] font-mono mt-1 select-all break-all" :title="asset.policyId">
                Policy: {{ asset.policyId.slice(0, 12) }}...{{ asset.policyId.slice(-8) }}
              </p>
            </div>

            <!-- Divider -->
            <div class="h-px bg-white/5"></div>

            <!-- Row 3: Risk reason & Action buttons -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 text-xs">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-rose-500/10 text-rose-400 border border-rose-500/20 text-left">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></span>
                <span>{{ asset.reason }}</span>
              </span>
              <button
                class="w-full sm:w-auto px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 transition-colors flex-shrink-0"
                @click.stop="handleMarkAsTrusted(asset.assetId)"
              >
                Mark Trusted
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- TAB 2: TRUSTED NATIVE ASSETS -->
    <div v-if="activeTab === 'trusted'">
      <div v-if="cleanerStore.trustedAssets.length === 0" class="text-center py-12 px-6">
        <h3 class="text-white font-semibold mb-2">No Trusted Assets Found</h3>
        <p class="text-slate-400 text-sm">This wallet contains no verified whitelisted or active native Cardano assets.</p>
      </div>
      <div v-else>
        
        <!-- Desktop Table view -->
        <div class="hidden md:block table-scroll overflow-x-auto overflow-y-auto max-h-[480px] pr-1">
          <table class="w-full text-left">
            <thead class="sticky top-0 z-10 bg-fintech-dark">
              <tr class="border-b border-white/[0.12] text-slate-500 text-xs font-medium uppercase tracking-wider">
                <th class="py-4 px-4">Verified Asset</th>
                <th class="py-4 px-4">Liquidity Origin</th>
                <th class="py-4 px-4">Balance</th>
                <th class="py-4 pl-4 w-36">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04] text-sm">
              <tr v-for="asset in cleanerStore.trustedAssets" :key="asset.assetId" class="hover:bg-white/[0.02] transition-colors duration-150">
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <span class="text-emerald-400 font-bold">✓</span>
                    <div>
                      <p class="font-semibold text-white text-sm">{{ asset.displayName }}</p>
                      <p class="text-slate-500 text-[11px] font-mono mt-0.5 hover:text-slate-300 transition-colors cursor-help" :title="asset.policyId">{{ asset.policyId.slice(0, 16) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
                    {{ asset.reason }}
                  </span>
                </td>
                <td class="py-4 px-4 font-semibold font-display text-white">{{ asset.amount }}</td>
                <td class="py-4 pl-4">
                  <button
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 transition-colors"
                    @click="handleMarkAsSuspicious(asset.assetId)"
                  >
                    Flag as Spam
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Stacked Card view -->
        <div class="block md:hidden space-y-3">
          <div
            v-for="asset in cleanerStore.trustedAssets"
            :key="asset.assetId"
            class="p-4 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col gap-3"
          >
            <!-- Row 1: verified tick mark & balance -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <span>✓</span>
                <span class="text-[10px] uppercase tracking-wider font-semibold font-sans bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/20">Verified Asset</span>
              </div>
              <span class="text-slate-400 text-xs font-semibold">Balance: <strong class="text-white font-mono">{{ asset.amount }}</strong></span>
            </div>

            <!-- Row 2: Asset Details -->
            <div class="flex flex-col text-left">
              <p class="font-bold text-white text-sm leading-snug">{{ asset.displayName }}</p>
              <p class="text-slate-500 text-[10px] font-mono mt-1 select-all break-all" :title="asset.policyId">
                Policy: {{ asset.policyId.slice(0, 12) }}...{{ asset.policyId.slice(-8) }}
              </p>
            </div>

            <!-- Divider -->
            <div class="h-px bg-white/5"></div>

            <!-- Row 3: Risk reason & Action buttons -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 text-xs">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-left">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <span>{{ asset.reason }}</span>
              </span>
              <button
                class="w-full sm:w-auto px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 transition-colors flex-shrink-0"
                @click="handleMarkAsSuspicious(asset.assetId)"
              >
                Flag as Spam
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
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
  background: #8b5cf6;
  border-color: #8b5cf6;
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
  background: #8b5cf6;
}
</style>
