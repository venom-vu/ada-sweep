<script setup lang="ts">
import { useWalletStore } from '~/stores/wallet'

const walletStore = useWalletStore()

const syncNetwork = () => {
  if (walletStore.networkId === 1) {
    walletStore.setNetwork('mainnet')
  } else if (walletStore.networkId === 0) {
    walletStore.setNetwork('preprod')
  }
}
</script>

<template>
  <div
    v-if="walletStore.networkMismatch"
    class="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-white shadow-[0_0_15px_rgba(244,63,94,0.05)] animate-slide-in"
  >
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="space-y-0.5 text-left">
        <h4 class="text-xs font-bold font-sans uppercase tracking-wider text-rose-400">
          Network Mismatch Detected!
        </h4>
        <p class="text-[11px] text-slate-300 leading-snug">
          Your wallet is on <span class="font-bold text-white font-mono uppercase">{{ walletStore.networkId === 1 ? 'Mainnet' : 'Preprod' }}</span>, but the dApp is set to <span class="font-bold text-white font-mono uppercase">{{ walletStore.selectedNetwork }}</span>. Please switch network in your wallet or sync the dApp environment to avoid transaction failures.
        </p>
      </div>
    </div>
    
    <button
      class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wide transition-all uppercase duration-200 shadow-md shadow-rose-600/10 flex-shrink-0"
      @click="syncNetwork"
    >
      Sync dApp Network
    </button>
  </div>
</template>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
