<script setup lang="ts">
import WalletHeaderInfo from '~/components/WalletHeaderInfo.vue'
</script>

<template>
  <div class="min-h-screen bg-fintech-black text-slate-100 font-sans flex flex-col relative bg-grid">
    <!-- Ambient Blur Orbs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-[120px]"></div>
    </div>

    <!-- Floating Navbar -->
    <header class="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-4 sm:px-8 h-16 mx-auto max-w-7xl bg-slate-950/75 border border-white/[0.06] hover:border-violet-500/20 rounded-2xl backdrop-blur-xl shadow-xl shadow-black/30 transition-all duration-300">
      <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0 hover:opacity-90 active:scale-95 transition-all">
        <img src="/logo.png" class="h-12 sm:hidden object-contain" alt="ADASweep Logo" />
        <img src="/logo-text.png" class="h-16 hidden sm:block object-contain" alt="ADASweep Logo" />
      </NuxtLink>
      <ClientOnly>
        <WalletHeaderInfo />
      </ClientOnly>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-6 sm:px-10 pt-20 pb-24 md:pb-10 relative z-10">
      <slot />
    </main>

    <ClientOnly>
      <AppFooter />
      <NetworkWelcomeModal />
    </ClientOnly>

  </div>
</template>
