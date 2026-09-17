<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";

const walletStore = useWalletStore();

const assetCountRange = ref(20);

const calculatedAdaTrapped = computed(() => {
  return (assetCountRange.value * 1.48).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
});

const estimatedReclaimAda = computed(() => {
  const trapped = parseFloat(calculatedAdaTrapped.value.replace(/,/g, ""));
  const savings = trapped - 1.6;
  return savings > 0
    ? savings.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : "0";
});

// SEO Metadata
useSeoMeta({
  title: "ADASweep — Cardano Wallet Optimizer, UTXO Cleaner & Developer Tools",
  ogTitle:
    "ADASweep — Cardano Wallet Optimizer, UTXO Cleaner & Developer Tools",
  description:
    "Free, non-custodial Cardano toolkit: consolidate eUTXOs, reclaim locked ADA from spam & phishing tokens, decode CBOR transactions, sign data on-chain, and derive BIP-39 keys — all in your browser.",
  ogDescription:
    "Free, non-custodial Cardano toolkit: consolidate eUTXOs, reclaim locked ADA from spam & phishing tokens, decode CBOR transactions, sign data on-chain, and derive BIP-39 keys — all in your browser.",
  keywords:
    "Cardano UTXO consolidator, reclaim locked ADA, Cardano wallet cleanup, spam token burner, eUTXO optimizer, CBOR decoder Cardano, Cardano key generator, BIP-39 mnemonic Cardano, Cardano data signer, non-custodial Web3 tools, ADASweep",
});

// JSON-LD Structured Data
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "ADASweep",
        url: "https://adasweep.xyz",
        description:
          "Free, non-custodial Cardano wallet toolkit to consolidate eUTXOs, reclaim locked ADA, remove spam tokens, decode CBOR, sign data, and derive BIP-39 keys — all client-side.",
        applicationCategory:
          "BusinessApplication, FinancialApplication, DeveloperApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Wallet Health Analyzer with DEX-powered spam detection",
          "Phishing & Spam Token Isolation into a single quarantine UTXO",
          "Full Token Burn to unspendable address",
          "eUTXO Consolidation with automatic transaction batching",
          "Reclaim locked ADA from fragmented UTXOs",
          "CBOR Transaction Decoder with JSON and visual Block view",
          "On-chain Data Signer via CIP-30 (COSE_Sign1 output)",
          "BIP-39 Mnemonic Key Derivation for signing & verification keys",
        ],
      }),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is ADASweep?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ADASweep is a free, client-side, non-custodial Cardano toolkit. It helps you consolidate fragmented eUTXOs, isolate or burn spam/phishing tokens to reclaim locked ADA, decode CBOR transactions, sign data on-chain, and derive BIP-39 mnemonic keys — all running directly in your browser.",
            },
          },
          {
            "@type": "Question",
            name: "How does ADASweep reclaim locked ADA?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Each UTXO containing native assets on Cardano must lock a minimum ADA deposit (typically 1.4–2 ADA per UTXO). ADASweep's Wallet Cleaner consolidates multiple spam/phishing token UTXOs into a single quarantine UTXO, reducing locked ADA to a minimum, or burns them entirely to release all locked capital.",
            },
          },
          {
            "@type": "Question",
            name: "Is ADASweep safe to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. ADASweep is fully open-source and runs 100% client-side in your browser. It never accesses your seed phrases or private keys. All transactions are compiled locally and signed through standard CIP-30 wallet extensions like Eternl, Nami, or Lace — requiring your explicit approval every time.",
            },
          },
          {
            "@type": "Question",
            name: "What wallets are supported?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ADASweep supports any CIP-30 compatible Cardano wallet browser extension, including Eternl, Nami, Lace, Vespr, and others. It currently operates on the Preprod testnet.",
            },
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <div class="space-y-28 py-4 relative z-10">
    <!-- HERO -->
    <section class="flex flex-col items-center text-center max-w-4xl mx-auto relative pt-4 sm:pt-8">
      <!-- Trust / Non-Custodial Pill Badge -->
      <div
        class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm"
      >
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span class="text-slate-300">100% Client-Side WASM</span>
        <span class="text-slate-600">/</span>
        <span class="text-slate-400">Non-Custodial</span>
        <span class="text-slate-600">/</span>
        <span class="text-slate-400 font-mono text-[11px]">Preprod</span>
      </div>

      <!-- Main Headline: Clean modern typography without blocky Orbitron -->
      <h1
        class="mt-8 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] font-sans"
      >
        Cardano Wallet Toolkit
        <span
          class="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent block sm:inline font-semibold"
        >
          Built for Power Users</span
        >
      </h1>

      <p
        class="mt-6 text-base sm:text-lg text-slate-300/80 max-w-2xl leading-relaxed font-sans font-normal"
      >
        Clean spam tokens, consolidate fragmented eUTXOs, reclaim locked ADA, decode CBOR
        transactions, sign data on-chain, and derive BIP-39 keys.
      </p>

      <!-- Action Buttons -->
      <div class="mt-9 flex flex-col sm:flex-row items-center gap-3.5 relative z-20">
        <NuxtLink
          v-if="walletStore.isConnected"
          to="/dashboard"
          id="hero-go-to-dashboard"
          class="group relative px-7 py-3 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/30 shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
        >
          <span>Go to Dashboard</span>
          <svg
            class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>
        <button
          v-else
          @click="walletStore.showConnectionModal = true"
          id="hero-connect-wallet"
          class="group relative px-7 py-3 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/30 shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <span>Connect Cardano Wallet</span>
          <svg
            class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
        <NuxtLink
          to="/dashboard"
          id="hero-explore-features"
          class="px-6 py-3 rounded-xl text-sm font-medium border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.04] active:scale-[0.98] transition-all duration-200"
        >
          Explore All Utilities
        </NuxtLink>
      </div>

      <!-- Quick Trust Indicators below CTA -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>Zero seed phrase exposure</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>Standard CIP-30 protocol</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>Open source code</span>
        </div>
      </div>
    </section>

    <!-- INTERACTIVE DASHBOARD PREVIEW / UTXO SIMULATOR -->
    <section class="max-w-5xl mx-auto w-full px-0 sm:px-4">
      <div class="glass-card p-6 sm:p-8 relative overflow-hidden border border-white/[0.08] shadow-2xl">
        <!-- Telemetry Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-4 mb-6 gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
            <span class="text-xs font-mono font-medium text-slate-300">ADASweep Telemetry</span>
            <span class="text-slate-600 font-mono">/</span>
            <span class="text-xs font-mono text-slate-400">Live eUTXO &amp; Liquidity Simulation</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-mono text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
              Cardano Preprod Engine
            </span>
          </div>
        </div>

        <!-- Simulator Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <!-- Left Column: Health Diagnostic Metrics (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-400">Wallet UTXO Fragmentation</span>
                <span class="text-[11px] font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Degraded</span>
              </div>
              <div class="text-2xl font-bold text-white tracking-tight">48 <span class="text-xs font-normal text-slate-400">loose UTXOs</span></div>
              <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Fragmented dust inputs increase transaction byte size and risk hitting Cardano's 16KB limit.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-400">Spam &amp; Phishing Detection</span>
                <span class="text-[11px] font-mono font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">DEX Verified</span>
              </div>
              <div class="text-2xl font-bold text-white tracking-tight">14 <span class="text-xs font-normal text-slate-400">malicious assets</span></div>
              <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Zero liquidity pairs locking minimum ADA collateral inside unspendable outputs.
              </p>
            </div>
          </div>

          <!-- Right Column: Interactive ADA Reclaim Calculator (7 cols) -->
          <div class="lg:col-span-7 p-5 sm:p-6 rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-950/20 to-transparent flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold uppercase tracking-wider text-violet-400 font-mono">Interactive Calculator</span>
                <span class="text-xs font-mono text-slate-400">~1.48 ADA / asset locked</span>
              </div>
              <h3 class="text-lg font-bold text-white">Estimate Reclaimable Capital</h3>
              <p class="text-xs text-slate-400 mt-1">
                Adjust the slider to simulate how much trapped ADA can be unlocked from junk assets:
              </p>

              <!-- Interactive Range Slider -->
              <div class="mt-5 space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-300 font-medium">Junk &amp; Spam Assets:</span>
                  <span class="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {{ assetCountRange }} assets
                  </span>
                </div>
                <input
                  v-model.number="assetCountRange"
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div class="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>5 assets</span>
                  <span>30 assets</span>
                  <span>60 assets</span>
                </div>
              </div>

              <!-- Calculated Output Badges -->
              <div class="grid grid-cols-2 gap-3 mt-6">
                <div class="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                  <span class="text-[11px] text-slate-400 block mb-0.5">Currently Trapped</span>
                  <span class="text-lg sm:text-xl font-bold text-slate-200 font-mono">
                    {{ calculatedAdaTrapped }} <span class="text-xs text-slate-400 font-sans">ADA</span>
                  </span>
                </div>
                <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                  <span class="text-[11px] text-emerald-400 font-medium block mb-0.5">Instant Salvage</span>
                  <span class="text-lg sm:text-xl font-bold text-emerald-300 font-mono">
                    ~{{ estimatedReclaimAda }} <span class="text-xs text-emerald-400 font-sans">ADA</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span class="text-xs text-slate-400">Net after batch tx fee (~0.18 ADA)</span>
              <NuxtLink
                to="/dashboard"
                class="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Run full wallet scan</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CORE UTILITIES / ARCHITECTURE -->
    <section class="max-w-5xl mx-auto w-full px-0 sm:px-4">
      <div class="text-center space-y-3 mb-12">
        <span
          class="inline-block text-[11px] font-semibold font-mono uppercase tracking-wider text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20"
        >
          Engine Modules
        </span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-sans tracking-tight">
          Everything Your Cardano Wallet Needs
        </h2>
        <p class="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Six native utilities built on Hydra Cardano WASM, engineered to optimize wallet health and streamline on-chain operations.
        </p>
      </div>

      <!-- Feature Bento Grid: 2 Primary Flagships + 4 Power Utilities -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Flagship 1: Wallet Cleaner -->
        <div class="fintech-card p-6 sm:p-7 text-left space-y-4 relative group hover:border-violet-500/30 transition-all duration-300">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
            <span class="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">Spam Quarantine</span>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">Wallet Cleaner &amp; Token Burner</h3>
            <p class="text-slate-400 text-xs leading-relaxed mt-2">
              Cross-references all wallet assets against DEX liquidity pools to isolate malicious airdrops, phishing links, and zero-value tokens into a single quarantine UTXO or burn them completely.
            </p>
          </div>
          <div class="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
            <span class="px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05]">DEX Pair Verification</span>
            <span class="px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05]">Multi-Asset Grouping</span>
          </div>
        </div>

        <!-- Flagship 2: eUTXO Consolidator -->
        <div class="fintech-card p-6 sm:p-7 text-left space-y-4 relative group hover:border-violet-500/30 transition-all duration-300">
          <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-violet-400 group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
            </div>
            <span class="text-[11px] font-mono text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded border border-violet-500/20">Auto Batching</span>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">eUTXO Consolidator</h3>
            <p class="text-slate-400 text-xs leading-relaxed mt-2">
              Merge dozens of fragmented dust UTXOs automatically. Smart transaction batching (max 40 inputs per tx) stays safely within Cardano's 16KB protocol limit while slashing future transaction fees.
            </p>
          </div>
          <div class="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
            <span class="px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05]">Max 40 Inputs/Tx</span>
            <span class="px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05]">&lt;16KB Size Guard</span>
          </div>
        </div>
      </div>

      <!-- Supporting 4 Utilities in a Clean 4-Col Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <!-- Reclaim Locked ADA -->
        <div class="fintech-card p-5 text-left space-y-3 hover:border-emerald-500/30 transition-all duration-200">
          <div class="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-semibold text-white text-sm">Reclaim Locked ADA</h4>
          <p class="text-slate-400 text-xs leading-relaxed">
            Release the mandatory 1.4–2 ADA locked inside each native-asset UTXO back to your liquid balance.
          </p>
        </div>

        <!-- CBOR Decoder -->
        <div class="fintech-card p-5 text-left space-y-3 hover:border-cyan-500/30 transition-all duration-200">
          <div class="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </div>
          <h4 class="font-semibold text-white text-sm">CBOR Decoder</h4>
          <p class="text-slate-400 text-xs leading-relaxed">
            Decode raw transaction hex into readable JSON and visual block structures for on-chain inspection.
          </p>
        </div>

        <!-- On-Chain Data Signer -->
        <div class="fintech-card p-5 text-left space-y-3 hover:border-rose-500/30 transition-all duration-200">
          <div class="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rose-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <h4 class="font-semibold text-white text-sm">CIP-30 Data Signer</h4>
          <p class="text-slate-400 text-xs leading-relaxed">
            Sign arbitrary messages via Eternl to generate standard COSE_Sign1 proofs for off-chain auth.
          </p>
        </div>

        <!-- Key Generator -->
        <div class="fintech-card p-5 text-left space-y-3 hover:border-indigo-500/30 transition-all duration-200">
          <div class="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-indigo-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h4 class="font-semibold text-white text-sm">BIP-39 Key Derivation</h4>
          <p class="text-slate-400 text-xs leading-relaxed">
            Derive signing and verification keys from mnemonics with custom derivation paths, 100% in-browser.
          </p>
        </div>
      </div>
    </section>

    <!-- SECURITY & NON-CUSTODIAL GUARANTEE -->
    <section class="max-w-5xl mx-auto w-full px-0 sm:px-4">
      <div class="glass-card p-7 sm:p-9 border border-white/[0.08]">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-xs font-mono font-semibold uppercase text-emerald-400">Zero Trust Architecture</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-white font-sans">
              Non-Custodial by Design
            </h2>
          </div>
          <div class="flex flex-wrap gap-2 text-xs font-mono">
            <span class="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              Open Source
            </span>
            <span class="px-3 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300">
              In-Memory Processing
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-white text-sm font-semibold">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
              <span>Zero Key Storage</span>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed">
              Your seed phrases and private keys never leave your browser extension. Transactions are built locally and explicitly approved.
            </p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-white text-sm font-semibold">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.75 5.1a3 3 0 012.4-1.1h7.7a3 3 0 012.4 1.1l1.6 3.45a4.5 4.5 0 01.9 2.7" />
              </svg>
              <span>No Backend Relays</span>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed">
              All eUTXO evaluation, CBOR serialization, and token classification execute client-side via WebAssembly.
            </p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-white text-sm font-semibold">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span>Auditable Code</span>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed">
              Fully open source under Apache-2.0. Inspect the transaction builder, input selection logic, and WASM bindings on GitHub.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

