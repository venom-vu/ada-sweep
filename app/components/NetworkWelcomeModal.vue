<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWalletStore } from '~/stores/wallet'

const walletStore = useWalletStore()
const showModal = ref(false)

onMounted(() => {
  // Initialize from localStorage
  walletStore.initNetwork()
  
  // If still null, it is their first time
  if (!walletStore.selectedNetwork) {
    showModal.value = true
  }
})

const handleSelect = (network: 'mainnet' | 'preprod') => {
  walletStore.setNetwork(network)
  showModal.value = false
  // If not connected, clear utxos to let it reload mock or stay empty
  if (!walletStore.isConnected) {
    walletStore.utxos = [];
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <!-- Dark Blur Backdrop -->
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"></div>

      <!-- Modal Container -->
      <div
        class="relative w-full max-w-lg p-8 sm:p-10 flex flex-col gap-6 fintech-card bg-slate-950/95 border border-white/10 shadow-2xl modal-zoom z-10 text-center"
      >
        <!-- Header logo & title -->
        <div class="flex flex-col items-center gap-3">
          <img src="/logo.png" class="w-12 h-12 object-contain rounded-xl shadow-lg shadow-cyan-500/10" alt="ADASweep Logo" />
          <h2 class="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mt-2">
            Welcome to ADASweep
          </h2>
          <p class="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
            Please select the Cardano network environment you wish to scan and optimize UTXOs on.
          </p>
        </div>

        <div class="h-px bg-white/5 my-2"></div>

        <!-- Choice Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- MAINNET OPTION (DISABLED) -->
          <div
            class="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.01] border border-white/5 opacity-40 cursor-not-allowed text-slate-500 text-center relative"
          >
            <div class="absolute top-2.5 right-2.5 bg-slate-900 border border-white/10 text-[9px] font-bold text-slate-400 px-2 py-0.5 rounded-full">
              Disabled
            </div>
            <div class="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center border border-white/5">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="space-y-1">
              <span class="font-bold text-sm block tracking-wide text-slate-400">Cardano Mainnet</span>
              <span class="text-[10px] text-slate-600 leading-snug block">Production network. (Unavailable)</span>
            </div>
          </div>

          <!-- PREPROD OPTION -->
          <button
            class="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.02] text-white transition-all duration-300 group text-center"
            @click="handleSelect('preprod')"
          >
            <div class="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div class="space-y-1">
              <span class="font-bold text-sm block tracking-wide text-white group-hover:text-amber-400 transition-colors">Preprod</span>
              <span class="text-[10px] text-slate-500 leading-snug block">Test environment. Safe for learning and demo.</span>
            </div>
          </button>
        </div>

        <div class="h-px bg-white/5 my-2"></div>
        <p class="text-[9px] text-slate-500 leading-relaxed max-w-xs mx-auto">
          You can change this selection at any time using the network switcher in the footer.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-zoom {
  animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
