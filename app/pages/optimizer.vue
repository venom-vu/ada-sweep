<script setup lang="ts">
import UtxoTable from "~/components/UtxoTable.vue";
import OptimizerControls from "~/components/OptimizerControls.vue";
import { toast } from "vue-sonner";
import { useOptimizerStore } from "~/stores/optimizer";
import { useWalletStore } from "~/stores/wallet";

definePageMeta({
  auth: true,
  layout: "dashboard",
});

const optimizer = useOptimizerStore();
const walletStore = useWalletStore();
const utxoTableRef = ref<InstanceType<typeof UtxoTable> | null>(null);

// Auto-refresh UTXOs every 60s
let refreshTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  refreshTimer = setInterval(() => {
    walletStore.fetchUtxos();
  }, 60000);
});
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (!optimizer.isExecuting) {
    optimizer.resetBatchFlow();
    optimizer.deselectAll();
  }
  utxoTableRef.value?.resetFilters();
});

watch(
  () => optimizer.batchStatus,
  (status) => {
    if (status === "success") {
      toast.success("All transactions confirmed on-chain!", {
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
  { immediate: true }
);

useSeoMeta({
  title: "Cardano eUTXO Consolidation & Fee Optimizer — ADASweep",
  ogTitle: "Cardano eUTXO Consolidation & Fee Optimizer — ADASweep",
  description:
    "Group and consolidate fragmented dust UTXO inputs under the 16KB ledger limit. Prevent transaction sizing failures and reduce network transaction fees on Cardano.",
  ogDescription:
    "Group and consolidate fragmented dust UTXO inputs under the 16KB ledger limit. Prevent transaction sizing failures and reduce network transaction fees on Cardano.",
  keywords:
    "Cardano eUTXO consolidation, optimize Cardano wallet, reduce Cardano transaction fee, UTXO fee optimizer",
});
</script>

<template>
  <div>
    <ClientOnly>
      <!-- CONNECTED OPTIMIZER PAGE -->
      <div class="flex flex-col gap-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <UtxoTable ref="utxoTableRef" class="lg:col-span-3" />
          <OptimizerControls class="lg:col-span-2" />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
