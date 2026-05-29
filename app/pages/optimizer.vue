<script setup lang="ts">
import { watchEffect } from "vue";
import { useWalletStore } from "~/stores/wallet";
import { setPageLayout } from "#app";
import UtxoTable from "~/components/UtxoTable.vue";
import OptimizerControls from "~/components/OptimizerControls.vue";

const walletStore = useWalletStore();

watchEffect(() => {
  setPageLayout(walletStore.isConnected ? "dashboard" : "default");
});
</script>

<template>
  <div>
    <ClientOnly>
      <!-- DISCONNECTED STATE PROMPT -->
      <div
        v-if="!walletStore.isConnected"
        class="max-w-xl mx-auto mt-10 text-center rounded-2xl border border-white/[0.06] bg-[rgba(10,14,24,0.72)] backdrop-blur-xl p-14 flex flex-col items-center gap-5"
      >
        <h2 class="text-2xl font-extrabold font-display text-white">
          Cardano eUTXO Optimizer
        </h2>
        <p class="text-slate-400 text-sm leading-relaxed">
          To audit your UTXO fragmentation, simulate network fee reductions, and
          consolidate dust inputs under the 16KB ledger limit, please connect
          your Cardano wallet extension.
        </p>
        <div
          class="inline-flex items-center gap-2 text-sm text-cyan-400 bg-cyan-950/40 px-4 py-2.5 rounded-xl border border-cyan-500/20 font-medium"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"
          ></span>
          Use the "Connect Wallet" button in the top header
        </div>
      </div>

      <!-- CONNECTED OPTIMIZER PAGE -->
      <div v-else class="flex flex-col gap-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <UtxoTable class="lg:col-span-2" />
          <OptimizerControls class="lg:col-span-1" />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
