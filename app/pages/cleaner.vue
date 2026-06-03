<script setup lang="ts">
import { ref } from "vue";
import JunkDetector from "~/components/JunkDetector.vue";
import JunkBurner from "~/components/JunkBurner.vue";
import { useSeoMeta } from "#imports";

definePageMeta({
  auth: true,
  layout: "dashboard",
});

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
};
</script>

<template>
  <div>
    <ClientOnly>
      <!-- CONNECTED STATE -->
      <div class="flex flex-col gap-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <JunkDetector
            class="lg:col-span-2"
            @update:selectedJunk="onSelectedJunkUpdate"
          />
          <JunkBurner
            class="lg:col-span-1"
            :selectedJunk="selectedJunkIds"
            @burnSuccess="onBurnSuccess"
          />
        </div>
      </div>
    </ClientOnly>
  </div>
</template>
