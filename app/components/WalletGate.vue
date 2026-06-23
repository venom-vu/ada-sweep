<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";

interface Props {
  title?: string;
  description?: string;
}

withDefaults(defineProps<Props>(), {
  title: "Wallet Connection Required",
  description: "Connect your Cardano wallet to access this tool, view your UTXO breakdown, and execute transactions."
});

const walletStore = useWalletStore();

const openConnectModal = () => {
  walletStore.showConnectionModal = true;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center p-6 md:p-12 min-h-[450px] w-full max-w-2xl mx-auto text-center">
    <div class="glass-card p-8 md:p-10 w-full relative overflow-hidden group">
      <!-- Glow background decoration -->
      <div class="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-violet-600/10 blur-[60px] pointer-events-none group-hover:bg-violet-600/20 transition-all duration-500"></div>
      <div class="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-amber-500/5 blur-[60px] pointer-events-none group-hover:bg-amber-500/15 transition-all duration-500"></div>

      <!-- Icon Wrapper -->
      <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center mb-6 relative">
        <!-- Pulse effect -->
        <span class="absolute inset-0 rounded-2xl bg-violet-500/5 animate-pulse"></span>
        <svg
          class="w-8 h-8 text-violet-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      </div>

      <!-- Content -->
      <h2 class="text-xl md:text-2xl font-bold text-white tracking-tight mb-3 font-heading uppercase">
        {{ title }}
      </h2>
      <p class="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-8 font-sans">
        {{ description }}
      </p>

      <!-- Action Button -->
      <button
        @click="openConnectModal"
        class="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 active:scale-95 transition-all duration-200 cursor-pointer"
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
