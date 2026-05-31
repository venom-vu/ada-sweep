<script setup lang="ts">
import { ref } from 'vue'
import { useWalletStore } from '~/stores/wallet'

const walletStore = useWalletStore()
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectNetwork = (network: 'mainnet' | 'preprod') => {
  walletStore.setNetwork(network)
  showDropdown.value = false
  // If not connected, clear utxos to let it reload mock or stay empty
  if (!walletStore.isConnected) {
    walletStore.utxos = [];
  }
}
</script>

<template>
  <footer class="w-full border-t border-white/5 bg-slate-950/40 backdrop-blur-md py-8 px-6 sm:px-10 mt-12 pb-24 md:pb-8">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      
      <!-- Left side: logo and copyright -->
      <div class="flex flex-col items-center md:items-start text-center md:text-left gap-2 max-w-sm">
          <img src="/logo-text.png" class="h-16" alt="ADASweep Logo" />
        <p class="text-[10px] text-slate-500 leading-relaxed mt-1">
          Optimize eUTXO structures and clean scam native assets/NFTs automatically. Safe, secure, and non-custodial on Cardano.
        </p>
        <span class="text-[10px] text-slate-600 mt-0.5">
          © 2026 ADASweep. All rights reserved.
        </span>
      </div>

      <!-- Center: Social Icons -->
      <div class="flex items-center gap-6">
        <!-- GitHub -->
        <a
          href="https://github.com/huyvq-cardano/clean-cardano-wallet"
          target="_blank"
          class="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          aria-label="GitHub Repository"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>

        <!-- Twitter/X -->
        <a
          href="https://x.com/adasweep"
          target="_blank"
          class="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          aria-label="Twitter X Profile"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        <!-- Telegram -->
        <a
          href="https://t.me/adasweep"
          target="_blank"
          class="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          aria-label="Telegram Community"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.04-.19-.01-.27.01-.12.02-1.95 1.23-5.5 3.63-.52.36-.97.53-1.35.52-.42-.01-1.22-.24-1.82-.44-.73-.24-1.31-.37-1.26-.78.03-.22.33-.44.9-.67 3.52-1.53 5.87-2.54 7.04-3.03 3.36-1.39 4.05-1.63 4.51-1.64.1 0 .33.02.48.15.12.1.15.24.17.34.02.1.03.22.02.29z" />
          </svg>
        </a>
      </div>

      <!-- Right side: network selector -->
      <div class="relative">
        <button
          class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/[0.08] hover:bg-white/10 hover:border-white/20 text-white text-xs font-semibold transition-all duration-200"
          @click="toggleDropdown"
        >
          <span
            class="w-1.5 h-1.5 rounded-full shadow"
            :class="
              walletStore.selectedNetwork === 'mainnet'
                ? 'bg-emerald-400 shadow-emerald-400/50'
                : 'bg-amber-400 shadow-amber-400/50'
            "
          ></span>
          <span class="font-bold tracking-wide uppercase text-[10px]">
            {{ walletStore.selectedNetwork === 'mainnet' ? 'Mainnet' : 'Preprod' }}
          </span>
          <svg
            class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': showDropdown }"
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

        <!-- Dropdown Menu -->
        <div
          v-if="showDropdown"
          class="absolute bottom-full right-0 mb-2 w-48 p-2 flex flex-col gap-1 fintech-card bg-slate-950/95 border border-white/10 shadow-2xl z-50 animate-slide-up"
        >
          <button
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-500 text-xs font-medium cursor-not-allowed opacity-50 bg-transparent"
            disabled
          >
            <span class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Mainnet (Disabled)</span>
            </span>
          </button>
          
          <button
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.05] text-white text-xs font-medium transition-colors"
            @click="selectNetwork('preprod')"
          >
            <span class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Preprod</span>
            </span>
            <svg
              v-if="walletStore.selectedNetwork === 'preprod'"
              class="w-3.5 h-3.5 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
