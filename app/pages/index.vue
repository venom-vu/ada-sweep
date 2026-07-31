<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";

const walletStore = useWalletStore();

const assetCountRange = ref(20);

const calculatedAdaTrapped = computed(() => {
  return (assetCountRange.value * 1.48).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
});

const estimatedReclaimAda = computed(() => {
  const trapped = parseFloat(calculatedAdaTrapped.value.replace(/,/g, ''));
  const savings = trapped - 1.6;
  return savings > 0 ? savings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "0";
});

// SEO Metadata
useSeoMeta({
  title: 'ADASweep — One-Click Cardano Wallet Cleanup & UTXO Optimizer',
  ogTitle: 'ADASweep — One-Click Cardano Wallet Cleanup & UTXO Optimizer',
  description: 'Reclaim locked ADA and clean up your Cardano wallet in one click. Safe, non-custodial UTXO consolidator and spam scanner to recover trapped ADA instantly.',
  ogDescription: 'Reclaim locked ADA and clean up your Cardano wallet in one click. Safe, non-custodial UTXO consolidator and spam scanner to recover trapped ADA instantly.',
  keywords: 'Cardano UTXO optimizer, reclaim locked ADA, Cardano wallet cleanup, optimize Cardano wallet, Cardano spam token burner, Cardano eUTXO consolidation',
});

// JSON-LD Structured Data
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'ADASweep',
        'url': 'https://adasweep.xyz',
        'description': 'Safe, non-custodial UTXO consolidator and spam scanner to reclaim locked baseline ADA on Cardano.',
        'applicationCategory': 'BusinessApplication, FinancialApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'eUTXO Consolidation to reduce fee overhead',
          'Spam & Phishing Token Isolation',
          'ADA Salvaging by releasing standard deposits'
        ]
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is ADASweep?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'ADASweep is a client-side, non-custodial wallet optimization tool for Cardano. It helps you consolidate fragmented UTXOs, burn or isolate spam tokens, and recover trapped ADA.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is ADASweep safe to use?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, ADASweep is fully open-source and client-side only. It does not access your seed phrases or keys. All transactions are compiled in your browser and signed using standard wallet extensions like Eternl, Nami, or Lace.'
            }
          }
        ]
      })
    }
  ]
});
</script>

<template>
  <div class="space-y-32 py-4">
    <!-- Animated Background Orbs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[120px] animate-float"
      ></div>
      <div
        class="absolute top-[30%] right-[15%] w-[300px] h-[300px] rounded-full bg-amber-500/3 blur-[100px] animate-drift"
        style="animation-delay: -2s"
      ></div>
      <div
        class="absolute bottom-[20%] left-[20%] w-[250px] h-[250px] rounded-full bg-violet-500/4 blur-[80px] animate-float"
        style="animation-delay: -4s"
      ></div>
    </div>

    <!-- HERO -->
    <section
      class="flex flex-col items-center text-center max-w-4xl mx-auto relative"
    >
      <div
        class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[10px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-sm font-sans"
      >
        <span
          class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
        ></span>
        <span>Non-Custodial</span>
        <span class="w-1 h-1 rounded-full bg-slate-600"></span>
        <span>Cardano Native Utilities</span>
      </div>

      <h1
        class="mt-8 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] font-heading"
      >
        One-Click Wallet Cleanup
        <span
          class="bg-gradient-to-r from-violet-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent block sm:inline"
        >
          for Cardano</span
        >
      </h1>

      <p
        class="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed font-sans"
      >
        Safe. Non-custodial. Instant optimization. Merge fragmented dust
        outputs, remove spam tokens, and recover trapped ADA instantly.
      </p>

      <div
        class="mt-10 flex flex-col sm:flex-row items-center gap-4 relative z-20"
      >
        <NuxtLink
          v-if="walletStore.isConnected"
          to="/dashboard"
          id="hero-go-to-dashboard"
          class="group relative px-8 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95 transition-all duration-200 flex items-center gap-2"
        >
          <span>Go to Dashboard</span>
          <svg
            class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </NuxtLink>
        <button
          v-else
          @click="walletStore.showConnectionModal = true"
          id="hero-connect-wallet"
          class="group relative px-8 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <span>Connect Cardano Wallet</span>
          <svg
            class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
        <NuxtLink
          to="/dashboard"
          id="hero-explore-features"
          class="px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.02] active:scale-95 transition-all duration-200"
        >
          Explore Features
        </NuxtLink>
      </div>
    </section>

    <!-- DASHBOARD PREVIEW MOCKUP -->
    <section class="max-w-5xl mx-auto w-full px-0 sm:px-4">
      <div class="relative group">
        <div
          class="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        ></div>
        <div class="glass-card p-6 sm:p-8 relative overflow-hidden">
          <div
            class="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6"
          >
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span class="text-[10px] font-mono text-slate-600 ml-3"
                >adasweep-dashboard</span
              >
            </div>
            <span
              class="text-[10px] font-sans font-semibold uppercase bg-white/[0.04] text-slate-500 px-2.5 py-1 rounded-lg border border-white/[0.06]"
              >Preview</span
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              class="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200"
            >
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-rose-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span
                  class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
                  >Wallet Condition</span
                >
              </div>
              <span class="text-xl font-bold text-rose-400 block"
                >Fragmented</span
              >
              <p class="text-[10px] text-slate-500 mt-1.5 leading-snug">
                Multiple empty UTXOs causing fee inefficiency.
              </p>
            </div>
            <div
              class="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200"
            >
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span
                  class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
                  >Spam Score</span
                >
              </div>
              <span class="text-xl font-bold text-amber-400 block"
                >14 Spam Detected</span
              >
              <p class="text-[10px] text-slate-500 mt-1.5 leading-snug">
                Phishing NFTs locking core ADA reserves.
              </p>
            </div>
            <div
              class="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-200"
            >
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span
                  class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
                  >Reclaimable</span
                >
              </div>
              <span class="text-xl font-bold text-emerald-400 block"
                >~ 28.40 <span class="text-emerald-500/80 text-[10px] font-medium ml-0.5">ADA</span></span
              >
              <p class="text-[10px] text-slate-500 mt-1.5 leading-snug">
                Liquidity salvagable with one-click cleanup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES / BENEFITS -->
    <section class="max-w-5xl mx-auto w-full px-0 sm:px-4">
      <div class="text-center space-y-3 mb-14">
        <span
          class="inline-block text-[10px] font-semibold font-sans uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20"
          >Platform Features</span
        >
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">
          High Performance UTXO Operations
        </h2>
        <p class="text-slate-400 text-sm max-w-2xl mx-auto">
          ADASweep works fully client-side to sweep junk, bundle native assets
          safely, and release trapped ADA capital.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="group fintech-card fintech-card-hover p-7 text-left space-y-4"
        >
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-violet-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h3 class="font-bold text-white text-base">eUTXO Consolidation</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Consolidate dozens of dust inputs under the 16KB size restriction.
            Reduce blockchain storage clutter and slash future transaction
            overhead.
          </p>
        </div>
        <div
          class="group fintech-card fintech-card-hover p-7 text-left space-y-4"
        >
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/20 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 class="font-bold text-white text-base">Metadata Shield</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Isolate phishing tokens and malware native entries into single
            isolated UTXOs. Safe media-decoupling prevents malicious script
            injection.
          </p>
        </div>
        <div
          class="group fintech-card fintech-card-hover p-7 text-left space-y-4"
        >
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 class="font-bold text-white text-base">ADA Salvaging</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Every isolated asset locks 1.4+ ADA. Grouping multi-assets releases
            standard deposits back to your usable balance.
          </p>
        </div>
      </div>
    </section>

    <!-- TRUST / SECURITY -->
    <section class="max-w-5xl mx-auto w-full px-0 sm:px-4">
      <div class="glass-card p-8 sm:p-10">
        <div class="flex flex-col sm:flex-row items-start gap-8 text-left">
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-7 h-7 text-violet-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div class="space-y-4 flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 class="text-lg font-bold text-white font-sans">
                Fully Non-Custodial &amp; Auditable
              </h2>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-semibold font-sans text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Open Source
                </span>
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-semibold font-sans text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20"
                >
                  Client-Side Only
                </span>
              </div>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed">
              ADASweep runs entirely in your browser. We do not have access to
              seed phrases, keys, or credentials. Transactions are compiled
              locally and request standard signatures from Eternl, Nami, or Lace
              wallet extensions.
            </p>
            <div class="flex flex-wrap gap-6 pt-2">
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <svg
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                No server-side processing
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <svg
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                No data collection
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <svg
                  class="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                MIT Licensed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
