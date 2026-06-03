<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";
import WalletHealth from "~/components/WalletHealth.vue";
import { useSeoMeta } from "#imports";

definePageMeta({
  auth: true,
  layout: "dashboard",
});

const walletStore = useWalletStore();

useSeoMeta({
  title: "Dashboard: Cardano Wallet Health Audit — ADASweep",
  ogTitle: "Dashboard: Cardano Wallet Health Audit — ADASweep",
  description:
    "Audit your Cardano wallet health, check UTXO fragmentation level, track reclaimable ADA, and launch optimizer or spam cleaning tools.",
  ogDescription:
    "Audit your Cardano wallet health, check UTXO fragmentation level, track reclaimable ADA, and launch optimizer or spam cleaning tools.",
  keywords:
    "Cardano wallet health, Cardano UTXO audit, wallet dashboard, ADASweep dashboard",
  robots: "noindex, nofollow",
});
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <ClientOnly>
      <!-- Main Content -->
      <div class="space-y-8">
        <WalletHealth />

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            class="fintech-card fintech-card-hover p-8 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-5">
                <div
                  class="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-violet-400"
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
                  class="text-[10px] font-semibold font-sans uppercase tracking-wider bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-lg border border-violet-500/20"
                  >UTXO Optimizer</span
                >
              </div>
              <h3 class="text-lg font-bold text-white mb-2 font-sans">
                Consolidate Fragmented Dust
              </h3>
              <p class="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                Group tiny, isolated eUTXO dust inputs into custom standardized
                targets. Prevents transaction sizing failures and decreases
                average network transfer fees.
              </p>
            </div>
            <NuxtLink
              to="/optimizer"
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95"
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

          <div
            class="fintech-card fintech-card-hover p-8 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-5">
                <div
                  class="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/20 flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-rose-400"
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
                  class="text-[10px] font-semibold font-sans uppercase tracking-wider bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/20"
                  >Spam Sweeping</span
                >
              </div>
              <h3 class="text-lg font-bold text-white mb-2 font-sans">
                Isolate Scam & Phishing Tokens
              </h3>
              <p class="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                Scan native assets for zero-liquidity meme listings and airdrop
                links. Group dangerous items into isolated boxes to reclaim the
                underlying min-ADA deposits.
              </p>
            </div>
            <NuxtLink
              to="/cleaner"
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.12] active:scale-95"
            >
              Launch Spam Sweeper
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

        <!-- UTXO Ledger -->
        <div class="fintech-card p-6 sm:p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-bold text-white">
              Standard Ledger Outputs
            </h3>
            <span
              class="text-[10px] font-semibold font-sans text-slate-500 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]"
            >
              {{ walletStore.utxos.length }} UTXOs
            </span>
          </div>

          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto scrollbar-thin">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="border-b border-white/[0.06] text-slate-500 text-xs font-medium uppercase tracking-wider"
                >
                  <th class="pb-3 pr-4 font-semibold">Tx Hash</th>
                  <th class="pb-3 px-4 font-semibold text-right">Lovelace</th>
                  <th class="pb-3 px-4 font-semibold text-right">ADA Value</th>
                  <th class="pb-3 pl-4 font-semibold text-right">Contains</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04] text-sm">
                <tr
                  v-for="utxo in walletStore.utxos.slice(0, 5)"
                  :key="utxo.txHash"
                  class="group hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer"
                >
                  <td class="py-4 pr-4 font-mono text-violet-400 text-[13px]">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="hover:text-violet-300 transition-colors cursor-help"
                        :title="utxo.txHash"
                      >
                        {{ utxo.txHash.slice(0, 8) }}...{{
                          utxo.txHash.slice(-4)
                        }}
                      </span>
                      <strong
                        class="text-blue-400 bg-white/5 px-1.5 py-0.5 rounded-lg text-[10px] font-sans font-semibold flex-shrink-0"
                        >#{{ utxo.index }}</strong
                      >
                    </div>
                  </td>
                  <td
                    class="py-4 px-4 text-right font-mono text-slate-400 text-xs"
                  >
                    {{ utxo.lovelace.toLocaleString() }}
                  </td>
                  <td
                    class="py-4 px-4 text-right font-semibold text-white font-mono text-sm"
                  >
                    {{
                      (utxo.lovelace / 1000000).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    }}
                    <span class="text-slate-500 text-[10px] font-medium ml-0.5"
                      >ADA</span
                    >
                  </td>
                  <td class="py-4 text-right">
                    <span
                      v-if="Object.keys(utxo.assets).length === 0"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
                      Pure ADA
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold font-sans bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      <span class="w-1 h-1 rounded-full bg-amber-400"></span>
                      {{ Object.keys(utxo.assets).length }} Assets
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="block md:hidden space-y-3">
            <div
              v-for="utxo in walletStore.utxos.slice(0, 5)"
              :key="utxo.txHash"
              class="p-4 border border-white/[0.06] bg-white/[0.015] rounded-xl flex flex-col gap-3 hover:bg-white/[0.03] transition-colors duration-200"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs text-slate-400">
                  {{ utxo.txHash.slice(0, 10) }}...{{ utxo.txHash.slice(-8) }}
                </span>
                <span
                  class="text-blue-400 bg-white/5 px-1.5 py-0.5 rounded-lg font-sans font-semibold text-[10px]"
                >
                  #{{ utxo.index }}
                </span>
              </div>
              <div class="h-px bg-white/[0.06]"></div>
              <div class="flex justify-between items-center">
                <div class="flex flex-col text-left">
                  <span
                    class="text-[9px] uppercase tracking-wider text-slate-500 font-semibold"
                    >Lovelace</span
                  >
                  <span class="font-mono text-xs text-slate-300 mt-0.5">{{
                    utxo.lovelace.toLocaleString()
                  }}</span>
                </div>
                <div class="text-right">
                  <span
                    class="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block"
                    >ADA Value</span
                  >
                  <span
                    class="font-bold text-white text-sm font-mono mt-0.5 block"
                  >
                    {{
                      (utxo.lovelace / 1000000).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    }}
                    <span class="text-slate-500 text-[10px] font-medium ml-0.5"
                      >ADA</span
                    >
                  </span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-slate-500">Contents</span>
                <div>
                  <span
                    v-if="Object.keys(utxo.assets).length === 0"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans"
                  >
                    <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
                    Pure ADA
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans"
                  >
                    <span class="w-1 h-1 rounded-full bg-amber-400"></span>
                    {{ Object.keys(utxo.assets).length }} Assets
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="walletStore.utxos.length > 5"
            class="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-slate-500"
          >
            Showing first 5 of {{ walletStore.utxos.length }} outputs.
            <NuxtLink
              to="/optimizer"
              class="text-violet-400 hover:text-violet-300 transition-colors font-semibold"
            >
              Open UTXO Optimizer &rarr;
            </NuxtLink>
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
