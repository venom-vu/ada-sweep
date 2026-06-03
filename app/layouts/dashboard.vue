<script setup lang="ts">
import { computed } from "vue";
import WalletConnection from "~/components/WalletConnection.vue";
import WalletHeaderInfo from "~/components/WalletHeaderInfo.vue";
import { useWalletStore } from "~/stores/wallet";
import { useRoute } from "#app";

const walletStore = useWalletStore();
const route = useRoute();

const pageTitle = computed(() => {
  if (route.path.startsWith("/optimizer")) {
    return "Optimize UTXOs";
  }
  if (route.path.startsWith("/cleaner")) {
    return "Junk Cleaner";
  }
  if (route.path.startsWith("/dashboard")) {
    return "Dashboard";
  }
  return "ADASweep Platform";
});
</script>

<template>
  <div
    class="flex relative min-h-screen font-sans bg-fintech-black text-slate-100"
  >
    <!-- DESKTOP LEFT SIDEBAR -->
    <aside
      class="hidden fixed inset-y-0 left-0 z-30 flex-col justify-between p-6 w-64 border-r backdrop-blur-md md:flex bg-fintech-dark/40 border-white/5"
    >
      <div class="space-y-8">
        <NuxtLink to="/dashboard">
          <img src="/logo-text.png" class="h-20" alt="ADASweep Logo" />
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1">
          <span
            class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 mb-2 block"
            >Menu</span
          >

          <NuxtLink
            to="/dashboard"
            class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
            active-class="!text-violet-400 !bg-violet-500/[0.04]"
          >
            <span
              class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
              aria-hidden="true"
            ></span>
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
              />
            </svg>
            <span>Dashboard</span>
          </NuxtLink>

          <NuxtLink
            to="/optimizer"
            class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
            active-class="!text-violet-400 !bg-violet-500/[0.04]"
          >
            <span
              class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
              aria-hidden="true"
            ></span>
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>Optimize UTXOs</span>
          </NuxtLink>

          <NuxtLink
            to="/cleaner"
            class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
            active-class="!text-violet-400 !bg-violet-500/[0.04]"
          >
            <span
              class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
              aria-hidden="true"
            ></span>
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Junk Cleaner</span>
          </NuxtLink>

          <div
            class="group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl opacity-50 pointer-events-none text-slate-600"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span>Activity</span>
            <span
              class="text-[8px] font-semibold uppercase tracking-wider bg-white/[0.04] text-slate-600 px-1.5 py-0.5 rounded ml-auto"
              >Soon</span
            >
          </div>
        </nav>
      </div>

      <!-- Bottom Connection Panel -->
      <div class="space-y-4">
        <div class="h-px bg-white/5"></div>
        <ClientOnly>
          <WalletConnection />
        </ClientOnly>
      </div>
    </aside>

    <!-- MOBILE NAVIGATION (Top Bar & Bottom Tabs) & MAIN AREA -->
    <div class="flex flex-col flex-1 md:pl-64">
      <!-- Top Mobile Header -->
      <header
        class="flex sticky top-0 z-40 justify-between items-center px-4 sm:px-4 py-2 w-full border-b backdrop-blur-md md:hidden bg-fintech-black/90 border-white/5"
      >
        <NuxtLink to="/dashboard" class="flex gap-2 items-center">
          <img
            src="/logo.png"
            class="h-12 sm:hidden object-contain"
            alt="ADASweep Logo"
          />
          <img
            src="/logo-text.png"
            class="h-16 hidden sm:block object-contain"
            alt="ADASweep Logo"
          />
        </NuxtLink>
        <ClientOnly>
          <WalletHeaderInfo />
        </ClientOnly>
      </header>

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
      <main
        class="relative flex-1 px-6 py-6 pb-24 sm:px-10 md:py-10 md:pb-10 z-10"
      >
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

      <!-- Bottom Mobile Tab Bar -->
      <nav
        class="flex fixed right-0 bottom-0 left-0 z-50 justify-around items-center px-6 py-3 border-t backdrop-blur-lg md:hidden bg-slate-950/95 border-white/5"
      >
        <NuxtLink
          to="/dashboard"
          class="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-white"
          active-class="!text-violet-400"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
            />
          </svg>
          Home
        </NuxtLink>
        <NuxtLink
          to="/optimizer"
          class="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-white"
          active-class="!text-violet-400"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Optimize
        </NuxtLink>
        <NuxtLink
          to="/cleaner"
          class="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-white"
          active-class="!text-violet-400"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Cleaner
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
