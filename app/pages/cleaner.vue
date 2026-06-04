<script setup lang="ts">
import JunkDetector from "~/components/JunkDetector.vue";
import JunkBurner from "~/components/JunkBurner.vue";
import { toast } from "vue-sonner";
import { useCleanerStore } from "~/stores/cleaner";
import { useWalletStore } from "~/stores/wallet";
import { onMounted } from "vue";

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

const selectedJunkIds = ref<string[]>([]);

const onSelectedJunkUpdate = (ids: string[]) => {
  selectedJunkIds.value = ids;
};

const onBurnSuccess = () => {
  selectedJunkIds.value = [];
  toast.success("Junk sweep completed on-chain!", { id: "junk-sweep" });
};

const onBurnError = (msg: string) => {
  toast.error(msg || "Junk sweep failed", { id: "junk-sweep" });
};

// Auto-scan assets on mount
onMounted(() => {
  if (walletStore.utxos.length > 0) {
    cleanerStore.fetchDexLiquidity();
  }
});
</script>

<template>
  <div>
    <ClientOnly>
      <!-- CONNECTED STATE -->
      <div class="flex flex-col gap-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <JunkDetector
            class="lg:col-span-3"
            @update:selectedJunk="onSelectedJunkUpdate"
          />
          <JunkBurner
            class="lg:col-span-2"
            :selectedJunk="selectedJunkIds"
            @burnSuccess="onBurnSuccess"
            @burnError="onBurnError"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
