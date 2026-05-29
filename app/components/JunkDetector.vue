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
      <h2 class="text-lg font-bold text-white">Cardano Asset Classifier</h2>
      <div class="flex bg-white/[0.03] border border-white/[0.08] rounded-lg p-1 gap-1">
        <button
          class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
          :class="activeTab === 'suspicious' ? 'bg-[#141b2d] text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          @click="selectTab('suspicious')"
        >
          Suspicious ({{ cleanerStore.suspiciousAssets.length }})
        </button>
        <button
          class="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
          :class="activeTab === 'trusted' ? 'bg-[#141b2d] text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          @click="selectTab('trusted')"
        >
          Trusted ({{ cleanerStore.trustedAssets.length }})
        </button>
      </div>
    </div>

    <div class="h-px bg-white/[0.06] mb-6"></div>

    <!-- DEX loading indicator -->
    <div v-if="cleanerStore.isLoadingLiquidity" class="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3 mb-6 text-xs text-blue-400">
      <div class="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin flex-shrink-0"></div>
      <p>Syncing token liquidity with DEX aggregator pool statistics...</p>
    </div>

    <!-- TAB 1: SUSPICIOUS SPAM LIST -->
    <div v-if="activeTab === 'suspicious'">
      <div v-if="cleanerStore.suspiciousAssets.length === 0" class="text-center py-12 px-6">
        <div class="text-4xl mb-4 text-emerald-400">✓</div>
        <h3 class="text-white font-semibold mb-2">No Suspicious Assets Found</h3>
        <p class="text-slate-400 text-sm">Your wallet is currently 100% clean of known spam tokens and inactive native assets.</p>
      </div>
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <p class="text-slate-400 text-xs">Select suspicious assets to consolidate or sweep.</p>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 transition-colors"
            @click="selectAllSpam"
          >
            {{ selectedJunk.length === cleanerStore.suspiciousAssets.length ? 'Deselect All' : 'Select All Spam' }}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-white/[0.12] text-slate-500 text-xs font-medium uppercase tracking-wider">
                <th class="pb-3 pr-4 w-10">Sel</th>
                <th class="pb-3 px-4">Asset</th>
                <th class="pb-3 px-4">Risk Reason</th>
                <th class="pb-3 px-4">Balance</th>
                <th class="pb-3 pl-4 w-36">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04] text-sm">
              <tr v-for="asset in cleanerStore.suspiciousAssets" :key="asset.assetId" class="hover:bg-white/[0.01] transition-colors">
                <td class="py-4 pr-4">
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
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#141b2d] text-white text-[11px] leading-snug p-2.5 rounded-lg border border-white/[0.08] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
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
                  <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">{{ asset.reason }}</span>
                </td>
                <td class="py-4 px-4 font-semibold font-display text-white">{{ asset.amount }}</td>
                <td class="py-4 pl-4">
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
      </div>
    </div>

    <!-- TAB 2: TRUSTED NATIVE ASSETS -->
    <div v-if="activeTab === 'trusted'">
      <div v-if="cleanerStore.trustedAssets.length === 0" class="text-center py-12 px-6">
        <h3 class="text-white font-semibold mb-2">No Trusted Assets Found</h3>
        <p class="text-slate-400 text-sm">This wallet contains no verified whitelisted or active native Cardano assets.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-white/[0.12] text-slate-500 text-xs font-medium uppercase tracking-wider">
              <th class="pb-3 px-4">Verified Asset</th>
              <th class="pb-3 px-4">Liquidity Origin</th>
              <th class="pb-3 px-4">Balance</th>
              <th class="pb-3 pl-4 w-36">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04] text-sm">
            <tr v-for="asset in cleanerStore.trustedAssets" :key="asset.assetId" class="hover:bg-white/[0.01] transition-colors">
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
                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{{ asset.reason }}</span>
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
</style>
