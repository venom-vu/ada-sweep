<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { useCardanoWallet } from "~/composables/useCardanoWallet";
import { useRoute, navigateTo } from "#app";

const walletStore = useWalletStore();
const { installedWallets } = useCardanoWallet();
const route = useRoute();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const isCopied = ref(false);

const activeWallet = computed(() => {
  return installedWallets.value.find((w) => w.name === walletStore.walletName);
});

const shortenAddress = (addr: string) => {
  if (!addr) return "";
  if (addr.length < 15) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
};

const formatAda = (adaStr: string) => {
  const parsed = parseFloat(adaStr);
  return isNaN(parsed)
    ? "0.00"
    : parsed.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleConnectClick = () => {
  walletStore.showConnectionModal = true;
};

const handleDisconnect = () => {
  closeDropdown();
  walletStore.disconnectWallet();
  if (route.path !== "/") {
    navigateTo("/");
  }
};

const copyAddress = async () => {
  if (!walletStore.walletAddress) return;
  try {
    await navigator.clipboard.writeText(walletStore.walletAddress);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

// Click outside handling
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="relative inline-block text-left z-50" ref="dropdownRef">
    <!-- CONNECTED STATE -->
    <div v-if="walletStore.isConnected" class="relative">
      <button
        @click.stop="toggleDropdown"
        class="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:bg-slate-900/80 transition-all duration-200 shadow-premium active:scale-95 group cursor-pointer"
      >
        <!-- Pulse Dot & Icon -->
        <div class="relative flex items-center justify-center">
          <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              :class="walletStore.networkId === 1 ? 'bg-emerald-400' : 'bg-amber-400'"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2.5 w-2.5"
              :class="walletStore.networkId === 1 ? 'bg-emerald-500' : 'bg-amber-500'"
            ></span>
          </span>

          <img
            v-if="activeWallet?.icon"
            :src="activeWallet.icon"
            class="w-6 h-6 rounded bg-slate-950 p-0.5 object-contain"
            alt=""
          />
          <div
            v-else
            class="w-6 h-6 rounded bg-slate-950 border border-white/10 flex items-center justify-center font-bold text-cyan-400 text-[10px]"
          >
            {{ walletStore.walletName ? walletStore.walletName[0].toUpperCase() : 'W' }}
          </div>
        </div>

        <!-- Address Info (hidden on mobile, responsive layout) -->
        <div class="hidden sm:flex flex-col text-left leading-none pr-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {{ activeWallet?.displayName || walletStore.walletName }}
          </span>
          <span class="text-xs font-mono text-slate-300 mt-0.5">
            {{ shortenAddress(walletStore.walletAddress) }}
          </span>
        </div>

        <!-- Balance Badge -->
        <div class="hidden min-[400px]:inline-block px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs font-mono">
          {{ formatAda(walletStore.balanceAda) }} ADA
        </div>

        <!-- Chevron Icon -->
        <svg
          class="w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Popover -->
      <transition name="popover-fade">
        <div
          v-if="isOpen"
          class="absolute right-0 mt-2.5 w-80 rounded-xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl z-[100] flex flex-col gap-4 dropdown-slide"
        >
          <!-- Wallet Info Header -->
          <div class="flex items-center gap-3">
            <img
              v-if="activeWallet?.icon"
              :src="activeWallet.icon"
              class="w-10 h-10 rounded bg-slate-900 p-1 object-contain border border-white/5"
              alt=""
            />
            <div
              v-else
              class="w-10 h-10 rounded bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-cyan-400 text-sm"
            >
              {{ walletStore.walletName ? walletStore.walletName[0].toUpperCase() : 'W' }}
            </div>
            <div class="flex flex-col">
              <h4 class="text-sm font-bold text-white leading-tight">
                {{ activeWallet?.displayName || walletStore.walletName }}
              </h4>
              <span class="text-[10px] text-slate-500 font-mono mt-0.5">
                CIP-30 Wallet Enabled
              </span>
            </div>
            <span
              class="ml-auto inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              Connected
            </span>
          </div>

          <div class="h-px bg-white/5"></div>

          <!-- Network Panel -->
          <div class="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-xl p-3">
            <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Network</span>
            <span
              class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="
                walletStore.networkId === 1
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              "
            >
              {{ walletStore.networkId === 1 ? 'Mainnet' : 'Preprod' }}
            </span>
          </div>

          <!-- Address Panel with Copy Utility -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] uppercase font-bold tracking-widest text-slate-500">Wallet Address</label>
            <div class="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[11px] font-mono text-slate-300 break-all select-all flex-1">
                {{ shortenAddress(walletStore.walletAddress) }}
              </span>
              <button
                @click="copyAddress"
                class="p-1.5 rounded-lg bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-slate-400 hover:text-white transition-all active:scale-90 flex-shrink-0 flex items-center justify-center cursor-pointer"
                title="Copy Address"
              >
                <!-- Copy SVG or Check SVG -->
                <svg
                  v-if="!isCopied"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                <svg
                  v-else
                  class="w-3.5 h-3.5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <span v-if="isCopied" class="text-[9px] text-emerald-400 font-bold ml-1 self-start animate-fade-in">
              Address copied successfully!
            </span>
          </div>

          <!-- Balance Details -->
          <div class="flex flex-col gap-2 bg-white/[0.01] border border-white/5 rounded-xl p-4">
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-400">Total Balance</span>
              <span class="text-sm font-bold text-white font-mono">{{ formatAda(walletStore.balanceAda) }} ADA</span>
            </div>
            <div class="h-px bg-white/5"></div>
            <div class="flex justify-between items-center text-[10px] text-slate-500">
              <span>Lovelace</span>
              <span class="font-mono">{{ walletStore.balanceLovelace.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Disconnect Button -->
          <button
            @click="handleDisconnect"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/10 hover:shadow-rose-500/20 active:scale-[0.98] cursor-pointer"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </transition>
    </div>

    <!-- DISCONNECTED STATE -->
    <div v-else>
      <button
        @click="handleConnectClick"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
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
    </div>
  </div>
</template>

<style scoped>
.dropdown-slide {
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
