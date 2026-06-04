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

// Auto-refresh UTXOs every 60s
let refreshTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  refreshTimer = setInterval(() => {
    walletStore.fetchUtxos();
  }, 60000);
});
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  optimizer.resetBatchFlow();
});

watch(
  () => optimizer.batchStatus,
  (status) => {
    if (status === "success")
      toast.success("All transactions confirmed on-chain!", {
        id: "tx-confirm",
      });
    if (status === "error")
      toast.error(optimizer.executionError || "Transaction failed", {
        id: "tx-confirm",
      });
  },
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
          <UtxoTable class="lg:col-span-3" />
          <OptimizerControls class="lg:col-span-2" />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
