<script setup lang="ts">
import JunkDetector from "~/components/JunkDetector.vue";
import JunkBurner from "~/components/JunkBurner.vue";
import { toRef } from "vue";
import { toast } from "vue-sonner";
import { useCleanerStore } from "~/stores/cleaner";
import { useWalletStore } from "~/stores/wallet";

definePageMeta({
  auth: true,
  layout: "dashboard",
});

const cleanerStore = useCleanerStore();
const walletStore = useWalletStore();

useSeoMeta({
  title: "Clean Cardano Spam & Burn Phishing Tokens — ADASweep",
  ogTitle: "Clean Cardano Spam & Burn Phishing Tokens — ADASweep",
  description:
    "Scan and isolate scam tokens or phishing NFTs in your Cardano wallet. Burn junk native assets to release and recover locked min-ADA deposits back to your usable balance.",
  ogDescription:
    "Scan and isolate scam tokens or phishing NFTs in your Cardano wallet. Burn junk native assets to release and recover locked min-ADA deposits back to your usable balance.",
  keywords:
    "Cardano spam token burner, burn Cardano spam tokens, recover locked ADA, Cardano wallet cleaner",
});

const selectedJunkIds = toRef(cleanerStore, "selectedJunkIds");
const junkDetectorRef = ref<InstanceType<typeof JunkDetector> | null>(null);

const onSelectedJunkUpdate = (ids: string[]) => {
  selectedJunkIds.value = ids;
};

watch(
  () => cleanerStore.burnerStatus,
  (status) => {
    if (status === "success") {
      toast.success("Junk sweep completed on-chain!", { id: "junk-sweep" });
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
  { immediate: true }
);

onUnmounted(() => {
  if (!cleanerStore.isExecuting) {
    selectedJunkIds.value = [];
    junkDetectorRef.value?.resetFilters();
    cleanerStore.resetBurnerFlow();
  }
});
</script>

<template>
  <div>
    <ClientOnly>
      <div class="flex flex-col gap-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <JunkDetector
            ref="junkDetectorRef"
            class="lg:col-span-3"
            :selected-junk="selectedJunkIds"
            @update:selectedJunk="onSelectedJunkUpdate"
          />
          <JunkBurner
            class="lg:col-span-2"
            :selectedJunk="selectedJunkIds"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
