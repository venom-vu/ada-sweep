<script setup lang="ts">
import "~/assets/css/tailwind.css";
import "~/assets/css/app.css";
import { useWalletStore } from "~/stores/wallet";
import { useRuntimeConfig, useRoute, useSeoMeta, useHead } from "#imports";
import { Toaster } from "vue-sonner";

const walletStore = useWalletStore();

onMounted(async () => {
  walletStore.initNetwork();
  await walletStore.tryAutoConnect();
});

const config = useRuntimeConfig();
const route = useRoute();
const siteUrl = (config.public?.siteUrl || "https://adasweep.xyz").replace(/\/$/, "");
const currentPath = route.path === "/" ? "" : route.path.replace(/\/$/, "");
const canonicalUrl = `${siteUrl}${currentPath || "/"}`;
const ogImageUrl = `${siteUrl}/og-image.webp`;

useSeoMeta({
  ogImage: ogImageUrl,
  twitterImage: ogImageUrl,
  ogUrl: canonicalUrl,
});

useHead({
  link: [
    { rel: "canonical", href: canonicalUrl },
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ClientOnly>
    <WalletConnectionModal />
    <Toaster richColors position="top-right" />
  </ClientOnly>
</template>

<style scoped>
/* Clean page transition settings */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
