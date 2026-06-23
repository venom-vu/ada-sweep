<script setup lang="ts">
import JunkDetector from "~/components/JunkDetector.vue";
import JunkBurner from "~/components/JunkBurner.vue";
import { toRef } from "vue";
import { toast } from "vue-sonner";
import { useCleanerStore } from "~/stores/cleaner";
import { useWalletStore } from "~/stores/wallet";

definePageMeta({
  layout: "dashboard",
});

const cleanerStore = useCleanerStore();
const walletStore = useWalletStore();

useSeoMeta({
  title: "Clean Cardano Spam, Burn Phishing NFTs & Reclaim ADA — ADASweep",
  ogTitle: "Clean Cardano Spam, Burn Phishing NFTs & Reclaim ADA — ADASweep",
  description:
    "Scan and isolate scam tokens or phishing NFTs in your Cardano wallet. Burn junk native assets securely to release and recover locked min-ADA deposits back to your balance.",
  ogDescription:
    "Scan and isolate scam tokens or phishing NFTs in your Cardano wallet. Burn junk native assets securely to release and recover locked min-ADA deposits back to your balance.",
  keywords:
    "burn Cardano spam tokens, Cardano spam token burner, recover locked ADA Cardano, clean Cardano wallet, phishing NFT burner, Cardano min-ADA recovery tool",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Cardano Junk Cleaner & Spam Burner — ADASweep",
        "url": "https://adasweep.xyz/cleaner",
        "description": "Secure, non-custodial tool to scan your Cardano wallet for suspicious tokens and burn junk native assets to reclaim locked minimum ADA deposits.",
        "applicationCategory": "FinancialApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
      }),
    },
  ],
});

const selectedJunkIds = toRef(cleanerStore, "selectedJunkIds");
const junkDetectorRef = ref<InstanceType<typeof JunkDetector> | null>(null);

const onSelectedJunkUpdate = (ids: string[]) => {
  selectedJunkIds.value = ids;
};

// Auto-refresh UTXOs every 30s (only when not cleaning)
let refreshTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  refreshTimer = setInterval(() => {
    if (!cleanerStore.isExecuting) {
      walletStore.fetchUtxos();
    }
  }, 30000);
});

watch(
  () => cleanerStore.burnerStatus,
  (status) => {
    if (status === "success") {
      toast.success("Junk sweep built and submitted successfully!", {
        id: "junk-sweep",
      });
      selectedJunkIds.value = [];
      junkDetectorRef.value?.resetFilters();
      walletStore.fetchUtxos();
      setTimeout(() => {
        cleanerStore.resetBurnerFlow();
      }, 2500);
    }
    if (status === "error") {
      toast.error(cleanerStore.executionError || "Junk sweep failed", {
        id: "junk-sweep",
      });
      setTimeout(() => {
        cleanerStore.resetBurnerFlow();
      }, 2500);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  cleanerStore.clearStoreState();
  junkDetectorRef.value?.resetFilters();
});
</script>

<template>
  <div>
    <h1 class="sr-only">Clean Cardano Spam, Burn Phishing NFTs & Reclaim Locked ADA</h1>
    <ClientOnly>
      <div v-if="walletStore.isConnected" class="flex flex-col gap-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <JunkDetector
            ref="junkDetectorRef"
            class="lg:col-span-3"
            :selected-junk="selectedJunkIds"
            @update:selectedJunk="onSelectedJunkUpdate"
          />
          <JunkBurner class="lg:col-span-2" :selectedJunk="selectedJunkIds" />
        </div>
      </div>
      <div v-else>
        <WalletGate
          title="Junk Cleaner Access Required"
          description="Please connect your Cardano wallet to scan for scam/phishing tokens and burn junk native assets to recover locked min-ADA."
        />
      </div>
    </ClientOnly>
  </div>
</template>
