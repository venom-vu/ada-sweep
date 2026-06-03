<script setup lang="ts">
import UtxoTable from "~/components/UtxoTable.vue";
import OptimizerControls from "~/components/OptimizerControls.vue";
import { useSeoMeta } from "#imports";

definePageMeta({
  auth: true,
  layout: "dashboard",
});

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
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <UtxoTable class="lg:col-span-2" />
          <OptimizerControls class="lg:col-span-1" />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
