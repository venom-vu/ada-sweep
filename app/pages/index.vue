<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWalletStore } from '~/stores/wallet'

const walletStore = useWalletStore()

const assetCountRange = ref(20)

// Calculated Trapped ADA slider logic
const calculatedAdaTrapped = computed(() => {
  return (assetCountRange.value * 1.48).toFixed(2)
})

const estimatedReclaimAda = computed(() => {
  const trapped = parseFloat(calculatedAdaTrapped.value)
  const savings = trapped - 1.6
  return savings > 0 ? savings.toFixed(2) : '0.00'
})
</script>

<template>
  <div class="space-y-24 py-4">
    <!-- HERO SECTION -->
    <section class="flex flex-col items-center text-center max-w-4xl mx-auto pt-10">
      <!-- Subtle SaaS badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
        <span>Non-Custodial</span>
        <span class="w-1 h-1 rounded-full bg-slate-500"></span>
        <span>Cardano Native Utilities</span>
      </div>

      <!-- Headline Option B -->
      <h1 class="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
        One-Click Wallet Cleanup <br/>
        <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">for Cardano</span>
      </h1>

      <!-- Subtitle Option B -->
      <p class="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
        Safe. Non-custodial. Instant optimization. Merge fragmented dust outputs, remove spam tokens, and recover trapped ADA instantly.
      </p>

      <!-- CTA Button -->
      <div class="mt-8 flex flex-col items-center">
        <NuxtLink 
          v-if="walletStore.isConnected"
          to="/dashboard" 
          class="px-8 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          Go to Dashboard
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </NuxtLink>
        <button 
          v-else
          @click="walletStore.showConnectionModal = true" 
          class="px-8 py-3.5 rounded-xl text-sm font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors flex items-center gap-2"
        >
          Connect Cardano Wallet
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </section>

    <!-- STATIC MINI PRODUCT PREVIEW (Mockup) -->
    <section class="max-w-4xl mx-auto">
      <div class="fintech-card p-6 sm:p-8 bg-slate-950/60 border border-white/5 shadow-2xl relative">
        <!-- Graphic Header -->
        <div class="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
            <span class="text-[10px] font-mono text-slate-500 ml-2">adasweep-dashboard-preview</span>
          </div>
          <span class="text-[9px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-white/5">Preview Mode</span>
        </div>

        <!-- Interior stats grid mockup -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div class="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
            <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Wallet Condition</span>
            <span class="text-xl font-bold text-rose-400 mt-2 block">Fragmented</span>
            <p class="text-[10px] text-slate-400 mt-1 leading-snug">Multiple empty UTXOs causing fee inefficiency.</p>
          </div>
          <div class="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
            <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Spam Score</span>
            <span class="text-xl font-bold text-amber-400 mt-2 block">14 Spam Detected</span>
            <p class="text-[10px] text-slate-400 mt-1 leading-snug">Phishing NFTs locking core ADA reserves.</p>
          </div>
          <div class="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
            <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Reclaimable Capital</span>
            <span class="text-xl font-bold text-emerald-400 mt-2 block">~ 28.40 ADA</span>
            <p class="text-[10px] text-slate-400 mt-1 leading-snug">Liquidity salvagable with one-click cleanup.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BENEFITS / FEATURES SECTION -->
    <section class="max-w-4xl mx-auto space-y-12">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold text-white">High Performance UTXO Operations</h2>
        <p class="text-slate-400 text-sm max-w-xl mx-auto">
          ADASweep works fully client-side to sweep junk, bundle native assets safely, and release trapped ADA capital.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="fintech-card p-6 text-left space-y-3">
          <h3 class="font-bold text-white text-base">eUTXO Consolidation</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Consolidate dozens of dust inputs under the 16KB size restriction. Reduce blockchain storage clutter and slash future transaction overhead.
          </p>
        </div>
        <div class="fintech-card p-6 text-left space-y-3">
          <h3 class="font-bold text-white text-base">Metadata Shield</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Isolate phishing tokens and malware native entries into single isolated UTXOs. Safe media-decoupling prevents malicious script injection.
          </p>
        </div>
        <div class="fintech-card p-6 text-left space-y-3">
          <h3 class="font-bold text-white text-base">ADA Salvaging</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Every isolated asset locks 1.4+ ADA. Grouping multi-assets releases standard deposits back to your usable balance.
          </p>
        </div>
      </div>
    </section>

    <!-- INTERACTIVE SLIDER CALCULATOR -->
    <section class="max-w-3xl mx-auto fintech-card p-8 sm:p-10 border border-white/10 relative overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
        <div class="space-y-4">
          <span class="text-xs uppercase tracking-wider text-cyan-400 font-bold block">Trapped Capital Calculator</span>
          <h3 class="text-xl font-bold text-white leading-snug">Estimate Your Recoverable ADA</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Drag the slider below to represent the approximate count of unique native tokens or junk NFTs inside your wallet.
          </p>
          
          <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Unique Assets</span>
              <span class="text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                {{ assetCountRange }} Assets
              </span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="100" 
              v-model="assetCountRange" 
              class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div class="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>2</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-900/60 rounded-xl p-6 border border-white/5 space-y-4 text-center">
          <div class="space-y-1">
            <span class="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Locked eUTXO Deposit</span>
            <span class="text-xl font-bold text-rose-400 font-mono">~ {{ calculatedAdaTrapped }} ADA</span>
          </div>
          <div class="h-px bg-white/5"></div>
          <div class="space-y-1">
            <span class="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold block">Net ADA Reclaimable</span>
            <span class="text-3xl font-black text-cyan-400 font-mono">~ {{ estimatedReclaimAda }} ADA</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECURITY / TRUST SECTION -->
    <section class="fintech-card p-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
      <div class="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 flex-shrink-0">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div class="space-y-1">
        <h4 class="text-sm font-semibold text-white">Fully Non-Custodial & auditable</h4>
        <p class="text-slate-400 text-xs leading-relaxed">
          ADASweep runs client-side. We do not have access to seed phrases, keys, or credentials. Transactions are compiled locally and request standard signatures from Eternl, Nami, or Lace wallet extensions.
        </p>
      </div>
    </section>
  </div>
</template>
