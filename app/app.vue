<script setup lang="ts">
import "~/assets/css/tailwind.css";
import "~/assets/css/app.css";
import { useWalletStore } from "~/stores/wallet";
import { onMounted, watch } from "vue";
import { useRequestURL, useSeoMeta } from "#imports";
import { Toaster, toast } from "vue-sonner";

const walletStore = useWalletStore();

onMounted(async () => {
  walletStore.initNetwork();
  await walletStore.tryAutoConnect();
});

watch(() => walletStore.isConnected, (connected, was) => {
  if (connected && !was) {
    toast.success(`Wallet connected: ${walletStore.walletName}`)
  }
})

const url = useRequestURL();
const ogImageUrl = `${url.origin}/og-image.png`;

useSeoMeta({
  ogImage: ogImageUrl,
  twitterImage: ogImageUrl,
  ogUrl: url.href,
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
