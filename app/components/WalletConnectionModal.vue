<script setup lang="ts">
import { useCardanoWallet } from "~/composables/useCardanoWallet";
import { useWalletStore } from "~/stores/wallet";
import { useRoute, navigateTo } from "#app";

const { installedWallets } = useCardanoWallet();
const walletStore = useWalletStore();
const route = useRoute();

const handleConnect = async (walletName: string) => {
  walletStore.showConnectionModal = false;
  await walletStore.connectWallet(walletName);
  if (walletStore.isConnected && route.path === "/") {
    navigateTo("/dashboard");
  }
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="walletStore.showConnectionModal"
      class="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in"
    >
      <!-- Dark Glass Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        @click="walletStore.showConnectionModal = false"
      ></div>

      <!-- Centered Dialog Box -->
      <div
        class="relative w-full max-w-sm p-6 flex flex-col gap-4 fintech-card bg-slate-950/95 border border-white/10 shadow-2xl modal-zoom z-10"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Select Wallet</h3>
          <button 
            class="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
            @click="walletStore.showConnectionModal = false"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="h-px bg-white/5"></div>

        <div class="flex flex-col gap-2 max-h-80 overflow-y-auto">
          <button
            v-for="wallet in installedWallets"
            :key="wallet.name"
            class="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 text-white text-sm font-medium transition-all duration-200 cursor-pointer"
            @click="handleConnect(wallet.name)"
          >
            <span class="flex items-center gap-3">
              <img
                v-if="wallet.icon"
                :src="wallet.icon"
                class="w-6 h-6 rounded object-contain bg-slate-950 p-0.5"
                alt=""
              />
              <span
                v-else
                class="w-6 h-6 rounded bg-slate-900 flex items-center justify-center font-bold text-cyan-400 text-xs"
                >{{ wallet.displayName[0] }}</span
              >
              <span>{{ wallet.displayName }}</span>
            </span>
            <span
              class="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >Installed</span
            >
          </button>

          <div
            v-if="installedWallets.length === 0"
            class="p-5 text-center text-slate-400 text-xs leading-relaxed bg-white/[0.01] rounded-xl border border-dashed border-white/5"
          >
            No browser wallet extensions found. Please install an extension (Eternl, Nami, Lace) to begin.
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-zoom {
  animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
