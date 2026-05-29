<script setup lang="ts">
import { ref } from "vue";
import { useCardanoWallet } from "~/composables/useCardanoWallet";
import { useWalletStore } from "~/stores/wallet";
import { useRoute, navigateTo } from "#app";

const showDisconnectDropdown = ref(false);
const { installedWallets } = useCardanoWallet();
const walletStore = useWalletStore();
const route = useRoute();

const toggleDisconnectDropdown = () => {
  showDisconnectDropdown.value = !showDisconnectDropdown.value;
};

const handleConnect = async (walletName: string) => {
  walletStore.showConnectionModal = false;
  await walletStore.connectWallet(walletName);
  if (walletStore.isConnected && route.path === "/") {
    navigateTo("/dashboard");
  }
};

const handleDisconnect = () => {
  showDisconnectDropdown.value = false;
  walletStore.disconnectWallet();
};

const shortenAddress = (addr: string) => {
  if (!addr) return "";
  if (addr.length < 15) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
};
</script>

<template>
  <div class="relative z-50">
    <!-- CONNECTED STATE -->
    <div v-if="walletStore.isConnected" class="flex items-center gap-3">
      <button
        class="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/[0.08] hover:bg-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all duration-200"
        @click="toggleDisconnectDropdown"
      >
        <span
          class="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"
        ></span>
        <span class="font-bold tracking-wide text-xs uppercase">{{
          walletStore.walletName
        }}</span>
        <span class="text-emerald-400 font-mono text-xs font-semibold">
          {{ parseFloat(walletStore.balanceAda).toFixed(2) }} ADA
        </span>
        <span
          class="text-slate-400 font-mono text-xs bg-white/5 px-2 py-0.5 rounded"
          >{{ shortenAddress(walletStore.walletAddress) }}</span
        >
        <svg
          class="w-4 h-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <!-- Disconnect Dropdown -->
      <div
        v-if="showDisconnectDropdown"
        class="absolute top-full right-0 mt-2 w-72 p-4 flex flex-col gap-3 fintech-card shadow-2xl dropdown-slide"
      >
        <div class="flex justify-between items-center">
          <p class="text-xs font-semibold text-slate-400">Connected Network</p>
          <span
            class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            :class="
              walletStore.networkId === 1
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            "
          >
            {{
              walletStore.networkId === 1
                ? "Cardano Mainnet"
                : "Preprod Testnet"
            }}
          </span>
        </div>
        <div class="h-px bg-white/[0.08]"></div>
        <button
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors"
          @click="handleDisconnect"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>

    <!-- DISCONNECTED STATE -->
    <div v-else>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all duration-200"
        @click="walletStore.showConnectionModal = true"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <line x1="12" y1="4" x2="12" y2="20"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
        </svg>
        Connect Wallet
      </button>

      <!-- Connection Selection Modal Dialog -->
      <Teleport to="body">
        <div
          v-if="walletStore.showConnectionModal"
          class="fixed inset-0 z-[999] flex items-center justify-center p-4"
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
                class="text-slate-400 hover:text-white transition-colors p-1"
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
                class="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 text-white text-sm font-medium transition-all duration-200"
                @click="handleConnect(wallet.name)"
              >
                <span class="flex items-center gap-3">
                  <img
                    v-if="wallet.icon"
                    :src="wallet.icon"
                    class="w-6 h-6 rounded"
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
</style>
