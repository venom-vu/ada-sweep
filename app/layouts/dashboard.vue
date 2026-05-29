<script setup lang="ts">
import WalletConnection from '~/components/WalletConnection.vue'
import { useWalletStore } from '~/stores/wallet'

const walletStore = useWalletStore()
</script>

<template>
  <div class="min-h-screen bg-fintech-black text-slate-100 font-sans flex relative">
    
    <!-- DESKTOP LEFT SIDEBAR (Hides on Mobile) -->
    <aside class="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-fintech-dark/40 border-r border-white/5 p-6 justify-between z-30 backdrop-blur-md">
      <div class="space-y-8">
        <!-- Minimal Brand Title -->
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5 group">
          <img src="/logo.png" class="w-8 h-8 object-contain rounded-lg shadow-lg shadow-cyan-500/10" alt="ADASweep Logo" />
          <span class="font-display font-semibold text-lg text-white tracking-tight">ADASweep</span>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 mb-2 block">Menu</span>
          
          <NuxtLink to="/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-white/[0.02]" active-class="!text-cyan-400 !bg-white/[0.04] border border-white/5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Dashboard
          </NuxtLink>
          
          <NuxtLink to="/optimizer" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-white/[0.02]" active-class="!text-cyan-400 !bg-white/[0.04] border border-white/5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Optimize UTXOs
          </NuxtLink>
          
          <NuxtLink to="/cleaner" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-white/[0.02]" active-class="!text-cyan-400 !bg-white/[0.04] border border-white/5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142a2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Junk Cleaner
          </NuxtLink>

          <!-- Upcoming Premium items as simple tooltips -->
          <div class="opacity-50 pointer-events-none flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Activity
          </div>
        </nav>
      </div>

      <!-- Bottom Connection Panel -->
      <div class="space-y-4">
        <div class="h-px bg-white/5"></div>
        <ClientOnly>
          <WalletConnection />
        </ClientOnly>
      </div>
    </aside>

    <!-- MOBILE NAVIGATION (Top Bar & Bottom Tabs) & MAIN AREA -->
    <div class="flex-1 flex flex-col md:pl-64">
      
      <!-- Top Mobile Header -->
      <header class="md:hidden w-full flex items-center justify-between px-6 py-4 bg-fintech-black/90 sticky top-0 border-b border-white/5 z-40 backdrop-blur-md">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/logo.png" class="w-6 h-6 object-contain rounded" alt="ADASweep Logo" />
          <span class="font-display font-semibold text-white">ADASweep</span>
        </NuxtLink>
        <ClientOnly>
          <WalletConnection />
        </ClientOnly>
      </header>

      <!-- Main Panel Wrapper -->
      <main class="flex-1 px-6 sm:px-10 py-6 md:py-10 pb-24 md:pb-10 relative">
        <!-- Decorative subtle background orb -->
        <div class="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-slate-500/3 blur-[120px] pointer-events-none"></div>
        <slot />
      </main>

      <!-- Bottom Mobile Tab Bar -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-fintech-dark/95 backdrop-blur-lg border-t border-white/5 py-3 px-6 flex items-center justify-around">
        <NuxtLink to="/dashboard" class="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-white" active-class="!text-cyan-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          Home
        </NuxtLink>
        <NuxtLink to="/optimizer" class="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-white" active-class="!text-cyan-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Optimize
        </NuxtLink>
        <NuxtLink to="/cleaner" class="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-white" active-class="!text-cyan-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Cleaner
        </NuxtLink>
      </nav>

    </div>
  </div>
</template>
