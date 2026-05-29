<script setup lang="ts">
import WalletConnection from '~/components/WalletConnection.vue'
</script>

<template>
  <div class="min-h-screen bg-fintech-black text-slate-100 font-sans flex flex-col relative">
    
    <!-- Top Landing Page Header (when disconnected) -->
    <header class="w-full flex items-center justify-between px-6 sm:px-10 h-20 bg-fintech-black/60 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
      <NuxtLink to="/" class="flex items-center gap-2">
        <img src="/logo-text.png" class="h-16 lg:h-20 object-contain" alt="ADASweep Logo" />
      </NuxtLink>
      <ClientOnly>
        <WalletConnection />
      </ClientOnly>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 px-6 sm:px-10 py-6 md:py-10 pb-24 md:pb-10 relative">
      <!-- Decorative subtle background orb -->
      <div class="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-slate-500/3 blur-[120px] pointer-events-none"></div>
      <slot />
    </main>

  </div>
</template>
