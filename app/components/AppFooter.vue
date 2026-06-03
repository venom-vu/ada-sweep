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
  if (!walletStore.isConnected) {
    walletStore.utxos = [];
  }
}
</script>

<template>
  <footer class="w-full border-t border-white/5 bg-slate-950/40 backdrop-blur-md py-10 px-6 sm:px-10 pb-28 md:pb-10 mt-16">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="flex flex-col items-center md:items-start text-center md:text-left gap-3 max-w-sm">
        <img src="/logo-text.png" class="h-16" alt="ADASweep Logo" />
        <p class="text-xs text-slate-500 leading-relaxed">
          Optimize eUTXO structures and clean scam native assets/NFTs automatically. Safe, secure, and non-custodial on Cardano.
        </p>
        <span class="text-xs text-slate-600">
          &copy; 2026 ADASweep. All rights reserved.
        </span>
      </div>

      <div class="flex flex-col items-center gap-5">
        <div class="relative">
          <button
            class="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] text-white text-xs font-semibold transition-all duration-200"
            @click="toggleDropdown"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="walletStore.selectedNetwork === 'mainnet' ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-amber-400 shadow-amber-400/50'"
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

          <div
            v-if="showDropdown"
            class="absolute bottom-full right-0 mb-2 w-48 p-2 flex flex-col gap-1 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl z-50 animate-slide-up backdrop-blur-xl"
          >
            <button
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-500 text-xs font-medium cursor-not-allowed opacity-50"
              disabled
            >
              <span class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Mainnet (Disabled)</span>
              </span>
            </button>
            <button
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-white text-xs font-medium transition-colors"
              @click="selectNetwork('preprod')"
            >
              <span class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Preprod</span>
              </span>
              <svg
                v-if="walletStore.selectedNetwork === 'preprod'"
                class="w-3.5 h-3.5 text-violet-400"
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

        <div class="flex items-center gap-5">
          <a
            href="https://github.com/sawyer-vu/clean-cardano-wallet"
            target="_blank"
            class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
            aria-label="GitHub Repository"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          <a
            href="https://x.com/venom_vux"
            target="_blank"
            class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
            aria-label="Twitter X Profile"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/huyvu-dev/"
            target="_blank"
            class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
            aria-label="LinkedIn"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9H7.12v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z" />
            </svg>
          </a>
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
