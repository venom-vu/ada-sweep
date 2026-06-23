<script setup lang="ts">
import WalletHeaderInfo from "~/components/WalletHeaderInfo.vue";
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
  return "ADASweep Platform";
});
</script>

<template>
  <div
    v-if="walletStore.isSessionChecked"
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

          <span
            class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 mt-6 mb-2 block"
            >Dev Tools</span
          >

          <NuxtLink
            to="/sign"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Sign Data</span>
          </NuxtLink>

          <NuxtLink
            to="/cbor"
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
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <span>CBOR Deserializer</span>
          </NuxtLink>

          <!-- <div
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
          </div> -->
        </nav>
      </div>

      <!-- Bottom Connection Panel -->
      <div class="space-y-4">
        <div class="h-px bg-white/5"></div>
        <div class="flex items-center justify-center gap-5 pt-1">
          <a
            href="https://github.com/sawyer-vu/clean-cardano-wallet"
            target="_blank"
            class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
            aria-label="GitHub Repository"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          <a
            href="https://x.com/venom_vux"
            target="_blank"
            class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
            aria-label="Twitter X Profile"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/huyvu-dev/"
            target="_blank"
            class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
            aria-label="LinkedIn"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9H7.12v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"
              />
            </svg>
          </a>
        </div>
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
