<script setup lang="ts">
import UtxoTable from "~/components/UtxoTable.vue";
import OptimizerControls from "~/components/OptimizerControls.vue";
import { toast } from "vue-sonner";
import { useOptimizerStore } from "~/stores/optimizer";
import { useWalletStore } from "~/stores/wallet";

definePageMeta({
  layout: "dashboard",
});

const optimizer = useOptimizerStore();
const walletStore = useWalletStore();
const utxoTableRef = ref<InstanceType<typeof UtxoTable> | null>(null);

// Auto-refresh UTXOs every 30s (only when not consolidating)
let refreshTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  refreshTimer = setInterval(() => {
    if (!optimizer.isExecuting) {
      walletStore.fetchUtxos();
    }
  }, 30000);
});
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  optimizer.clearStoreState();
  utxoTableRef.value?.resetFilters();
});

watch(
  () => optimizer.batchStatus,
  (status) => {
    if (status === "success") {
      toast.success("Transactions built and submitted successfully!", {
        id: "tx-confirm",
      });
      optimizer.deselectAll();
      utxoTableRef.value?.resetFilters();
      walletStore.fetchUtxos();
      setTimeout(() => {
        optimizer.resetBatchFlow();
      }, 2500);
    }
    if (status === "error") {
      toast.error(optimizer.executionError || "Transaction failed", {
        id: "tx-confirm",
      });
      setTimeout(() => {
        optimizer.resetBatchFlow();
      }, 2500);
    }
  },
  { immediate: true },
);

useSeoMeta({
  title: "Cardano UTXO Optimizer & eUTXO Consolidation — ADASweep",
  ogTitle: "Cardano UTXO Optimizer & eUTXO Consolidation — ADASweep",
  description:
    "Optimize your Cardano wallet by consolidating fragmented dust UTXO inputs under the 16KB ledger limit. Save on future transaction fees and prevent sizing failures.",
  ogDescription:
    "Optimize your Cardano wallet by consolidating fragmented dust UTXO inputs under the 16KB ledger limit. Save on future transaction fees and prevent sizing failures.",
  keywords:
    "Cardano UTXO optimizer, consolidate UTXOs Cardano, reduce Cardano transaction fee, eUTXO consolidation tool, optimize Cardano wallet, merge dust UTXOs, Cardano 16KB limit solver",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Cardano UTXO Optimizer & Fee Consolidator — ADASweep",
        "url": "https://adasweep.xyz/optimizer",
        "description": "A non-custodial, client-side optimizer to group and consolidate fragmented dust UTXOs to reduce future Cardano transaction costs and avoid size limit errors.",
        "applicationCategory": "FinancialApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
      }),
    },
  ],
});
</script>

<template>
  <div>
    <h1 class="sr-only">Cardano UTXO Optimizer & eUTXO Consolidation</h1>
    <!-- CONNECTED OPTIMIZER PAGE -->
    <ClientOnly>
      <div v-if="walletStore.isConnected" class="flex flex-col gap-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <UtxoTable ref="utxoTableRef" class="lg:col-span-3" />
          <OptimizerControls class="lg:col-span-2" />
        </div>
      </div>
      <div v-else>
        <WalletGate
          title="Optimizer Access Required"
          description="Please connect your Cardano wallet to analyze your UTXO layout and consolidate fragmented dust outputs to save on future fees."
        />
      </div>
    </ClientOnly>
  </div>
</template>
