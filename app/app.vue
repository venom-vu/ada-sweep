<script setup lang="ts">
import "~/assets/css/tailwind.css";
import "~/assets/css/app.css";
import { useWalletStore } from "~/stores/wallet";
import { onMounted } from "vue";

const walletStore = useWalletStore();

onMounted(async () => {
  walletStore.initNetwork();
  await walletStore.tryAutoConnect();
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ClientOnly>
    <WalletConnectionModal />
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
