<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";
import WalletHealth from "~/components/WalletHealth.vue";

definePageMeta({
  layout: "dashboard",
});

const walletStore = useWalletStore();

useSeoMeta({
  title: "Cardano Wallet Health Audit & UTXO Dashboard — ADASweep",
  ogTitle: "Cardano Wallet Health Audit & UTXO Dashboard — ADASweep",
  description:
    "Audit your Cardano wallet health metrics in real-time. Track UTXO fragmentation levels, calculate reclaimable ADA locked in dust inputs, and launch optimization tools.",
  ogDescription:
    "Audit your Cardano wallet health metrics in real-time. Track UTXO fragmentation levels, calculate reclaimable ADA locked in dust inputs, and launch optimization tools.",
  keywords:
    "Cardano wallet health audit, eUTXO fragmentation tracker, check reclaimable ADA, Cardano wallet diagnostics, UTXO health score, locked ADA audit, ADASweep dashboard",
  robots: "index, follow",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Cardano Wallet Health Audit & UTXO Dashboard — ADASweep",
        url: "https://adasweep.xyz/dashboard",
        description:
          "Interactive dashboard to audit Cardano wallet health, detect spam assets, track UTXO fragmentation, and identify reclaimable ADA.",
        applicationCategory: "FinancialApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
      }),
    },
  ],
});
</script>

<template>
  <div class="flex flex-col gap-8 animate-fade-in font-sans">
    <h1 class="sr-only">Cardano Wallet Health Audit & Dashboard</h1>

    <ClientOnly>
      <!-- Main Content -->
      <div v-if="walletStore.isConnected" class="space-y-8">
        <WalletHealth />
      </div>
      <div v-else>
        <WalletGate
          title="Dashboard Access Required"
          description="Please connect your Cardano wallet to view your health audit dashboard, analyze UTXO fragmentation, and inspect your assets."
        />
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
