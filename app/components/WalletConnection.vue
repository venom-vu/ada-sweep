<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";

const showDisconnectDropdown = ref(false);
const walletStore = useWalletStore();

const toggleDisconnectDropdown = () => {
  showDisconnectDropdown.value = !showDisconnectDropdown.value;
};

const handleDisconnect = () => {
  showDisconnectDropdown.value = false;
  walletStore.disconnectWallet();
};
</script>

<template>
  <div class="relative z-50">
    <!-- CONNECTED STATE -->
    <div v-if="walletStore.isConnected">
      <button
        @click="toggleDisconnectDropdown"
        class="w-full inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-semibold hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-200 cursor-pointer"
      >
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="walletStore.networkId === 1 ? 'bg-emerald-400' : 'bg-amber-400'"></span>
          <span class="relative inline-flex rounded-full h-2 w-2" :class="walletStore.networkId === 1 ? 'bg-emerald-500' : 'bg-amber-500'"></span>
        </span>
        Connected
        <svg class="w-3.5 h-3.5 text-slate-400" :class="{ 'rotate-180': showDisconnectDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div v-if="showDisconnectDropdown" class="absolute bottom-full right-0 mb-2 w-full p-4 flex flex-col gap-3 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl dropdown-slide backdrop-blur-xl">
        <div class="flex justify-between items-center">
          <p class="text-xs font-semibold text-slate-400">Network</p>
          <span
            class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            :class="walletStore.networkId === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'"
          >
            {{ walletStore.networkId === 1 ? "Mainnet" : "Preprod" }}
          </span>
        </div>
        <div class="h-px bg-white/[0.08]"></div>
        <button
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
          @click="handleDisconnect"
        >
          Disconnect
        </button>
      </div>
    </div>

    <!-- DISCONNECTED STATE -->
    <div v-else>
      <button
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95 transition-all duration-200 cursor-pointer"
        @click="walletStore.showConnectionModal = true"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <line x1="12" y1="4" x2="12" y2="20"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
        </svg>
        Connect Wallet
      </button>
    </div>
  </div>
</template>

<style scoped>
.dropdown-slide {
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
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
