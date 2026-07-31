<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";

const walletStore = useWalletStore();
const route = useRoute();

const pageTitle = computed(() => {
  if (route.path.startsWith("/optimizer")) {
    return "Optimize UTXOs";
  }
  if (route.path.startsWith("/cleaner")) {
    return "Junk Cleaner";
  }
  if (route.path.startsWith("/sign")) {
    return "Sign Data";
  }
  if (route.path.startsWith("/cbor")) {
    return "CBOR Deserializer";
  }
  if (route.path.startsWith("/dashboard")) {
    return "Dashboard";
  }
  return "Key Generator";
});
</script>

<template>
  <div
    v-if="walletStore.isSessionChecked"
    class="flex relative min-h-screen font-sans bg-fintech-black text-slate-100"
  >
    <!-- DESKTOP LEFT SIDEBAR -->
    <DashboardSidebar />

    <!-- MOBILE NAVIGATION & MAIN AREA -->
    <div class="flex flex-col flex-1 md:pl-64">
      <!-- Mobile Navigation Header & Drawer -->
      <MobileDrawer />

      <!-- Top Desktop Header -->
      <header
        class="hidden md:flex sticky top-0 z-40 justify-between items-center px-10 py-5 w-full border-b backdrop-blur-md bg-fintech-black/60 border-white/5"
      >
        <div>
          <h1 class="text-lg font-extrabold text-white mt-0.5 tracking-tight">
            {{ pageTitle }}
          </h1>
        </div>
        <ClientOnly>
          <WalletHeaderInfo />
        </ClientOnly>
      </header>

      <!-- Main Panel Wrapper -->
      <main class="relative flex-1 px-6 py-6 pb-10 sm:px-10 md:py-10 z-10">
        <!-- Decorative subtle background orb -->
        <div
          class="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"
        ></div>
        <div
          class="absolute bottom-[20%] left-[5%] w-[250px] h-[250px] rounded-full bg-amber-500/3 blur-[100px] pointer-events-none"
        ></div>
        <ClientOnly>
          <NetworkMismatchBanner />
        </ClientOnly>
        <slot />
      </main>
    </div>
  </div>
  <div
    v-else
    class="flex items-center justify-center min-h-screen bg-fintech-black"
  >
    <svg
      class="animate-spin h-8 w-8 text-violet-500"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
</template>
