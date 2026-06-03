<script setup lang="ts">
import type { NuxtError } from "#app";
import type { PropType } from "vue";

const props = defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    default: () => ({ statusCode: 404, message: "Page not found" }),
  },
});

const handleError = () => clearError({ redirect: "/" });

const handleReload = () => {
  window.location.reload();
};
</script>

<template>
  <div
    class="min-h-screen bg-fintech-black text-slate-100 font-sans flex flex-col justify-between relative bg-grid overflow-hidden"
  >
    <!-- Ambient Blur Orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        class="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[150px]"
      ></div>
      <div
        class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]"
      ></div>
    </div>

    <!-- Main Content Area -->
    <main
      class="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 relative z-10"
    >
      <!-- Glow Error Code -->
      <div class="relative mb-6">
        <h1
          class="text-8xl sm:text-[12rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-violet-400 via-indigo-500 to-blue-500 select-none animate-pulse"
        >
          {{ props.error.statusCode }}
        </h1>
        <div
          class="absolute inset-0 bg-violet-500/10 blur-[80px] -z-10 rounded-full scale-75"
        ></div>
      </div>

      <!-- Error Subtitle -->
      <h2
        class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-3"
      >
        <template v-if="props.error.statusCode === 404">
          Oops! Page Not Found
        </template>
        <template v-else-if="props.error.statusCode === 500">
          Internal Server Glitch
        </template>
        <template v-else> An Unexpected Error Occurred </template>
      </h2>

      <!-- Description -->
      <p
        class="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-6 font-sans"
      >
        <template v-if="props.error.statusCode === 404">
          The page you are looking for might have been moved, deleted, or never
          existed in the Preprod testnet registry.
        </template>
        <template v-else-if="props.error.statusCode === 500">
          The Cardano node interface or background server is currently
          experiencing congestion. Please try again later.
        </template>
        <template v-else>
          We've encountered an issue building or submitting the transactions.
          Please check your wallet connection.
        </template>
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <button
          @click="handleError"
          class="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          Return to Home
        </button>
        <button
          @click="handleReload"
          class="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          Reload Page
        </button>
      </div>
    </main>

    <!-- Footer Copyright -->
    <footer
      class="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 relative z-10 border-t border-white/[0.04]"
    >
      <p class="font-sans">
        &copy; {{ new Date().getFullYear() }} ADASweep. All rights reserved.
        Preprod Testnet Environment.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Gradient grid background effect */
.bg-grid {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
}
</style>
