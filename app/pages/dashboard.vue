<script setup lang="ts">
import { watchEffect } from "vue";
import { useWalletStore } from "~/stores/wallet";
import WalletHealth from "~/components/WalletHealth.vue";
import { navigateTo, setPageLayout } from "#app";

const walletStore = useWalletStore();

// If disconnected, automatically navigate back to landing page.
// Otherwise, set page layout to 'dashboard'.
watchEffect(() => {
  if (!walletStore.isConnected) {
    navigateTo("/");
  } else {
    setPageLayout("dashboard");
  }
});
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <ClientOnly>
      <div v-if="walletStore.isConnected" class="space-y-8">
        <!-- Wallet Health primary gauge & report -->
        <WalletHealth />

        <!-- Quick navigation actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Consolidation Option Card -->
          <div
            class="fintech-card fintech-card-hover p-8 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20"
                  >UTXO Optimizer</span
                >
              </div>
              <h3 class="text-lg font-bold text-white mb-2">
                Consolidate Fragmented Dust
              </h3>
              <p class="text-slate-400 text-xs leading-relaxed mb-6">
                Group tiny, isolated eUTXO dust inputs into custom standardized
                targets. Prevents transaction sizing failures and decreases
                average network transfer fees.
              </p>
            </div>
            <div>
              <NuxtLink
                to="/optimizer"
                class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                Configure Optimizer
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </NuxtLink>
            </div>
          </div>

          <!-- Spam Sweeper Card -->
          <div
            class="fintech-card fintech-card-hover p-8 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/20"
                  >Spam sweeping</span
                >
              </div>
              <h3 class="text-lg font-bold text-white mb-2">
                Isolate Scam & Phishing Tokens
              </h3>
              <p class="text-slate-400 text-xs leading-relaxed mb-6">
                Scan native assets for zero-liquidity meme listings and airdrop
                links. Group dangerous items into isolated boxes to reclaim the
                underlying min-ADA deposits.
              </p>
            </div>
            <div>
              <NuxtLink
                to="/cleaner"
                class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors bg-white/5 border border-white/10 text-white hover:bg-white/10"
              >
                Launch Spam Sweeper
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Ledger UTXO Breakdown -->
        <div class="fintech-card p-6 sm:p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-bold text-white">
              Standard Ledger Outputs
            </h3>
            <span class="text-xs font-mono text-slate-500"
              >{{ walletStore.utxos.length }} UTXOs found</span
            >
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="border-b border-white/5 text-slate-500 text-xs font-medium uppercase tracking-wider"
                >
                  <th class="pb-3 pr-4">Transaction hash</th>
                  <th class="pb-3 px-4">Index</th>
                  <th class="pb-3 px-4 text-right">Lovelace</th>
                  <th class="pb-3 px-4 text-right">ADA Value</th>
                  <th class="pb-3 pl-4 text-right">Contains</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-sm">
                <tr
                  v-for="utxo in walletStore.utxos.slice(0, 5)"
                  :key="utxo.txHash"
                  class="group hover:bg-white/[0.01]"
                >
                  <td class="py-4 pr-4 font-mono text-slate-400 text-xs">
                    {{ utxo.txHash.slice(0, 24) }}...
                  </td>
                  <td class="py-4 px-4 font-mono text-slate-400 text-xs">
                    {{ utxo.index }}
                  </td>
                  <td
                    class="py-4 px-4 text-right font-mono text-slate-400 text-xs"
                  >
                    {{ utxo.lovelace.toLocaleString() }}
                  </td>
                  <td class="py-4 px-4 text-right font-semibold text-white">
                    {{ (utxo.lovelace / 1000000).toFixed(2) }} ADA
                  </td>
                  <td class="py-4 pl-4 text-right">
                    <span
                      v-if="Object.keys(utxo.assets).length === 0"
                      class="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase"
                    >
                      Pure ADA
                    </span>
                    <span
                      v-else
                      class="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase"
                    >
                      {{ Object.keys(utxo.assets).length }} Assets
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="walletStore.utxos.length > 5"
            class="mt-6 pt-4 border-t border-white/5 text-center text-xs text-slate-500"
          >
            Showing first 5 Standard outputs. Launch the
            <NuxtLink to="/optimizer" class="text-cyan-400 hover:underline"
              >UTXO Optimizer</NuxtLink
            >
            to compress further.
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
