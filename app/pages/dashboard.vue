<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";
import { CardanoWASM } from "@hydra-sdk/cardano-wasm";
import { toast } from "vue-sonner";
import WalletHealth from "~/components/WalletHealth.vue";

definePageMeta({
  layout: "dashboard",
});

const walletStore = useWalletStore();

// --- Wallet Credential Derivation ---
interface WalletKeyInfo {
  vkhHex: string;
  enterpriseAddress: string;
  paymentAddress: string;
  rewardAddress: string;
}

const walletKeyInfo = ref<WalletKeyInfo | null>(null);
const isDeriving = ref(false);
const copiedKey = ref<string | null>(null);

const deriveWalletKeyInfo = async () => {
  if (!walletStore.isConnected || !walletStore.walletApi) {
    walletKeyInfo.value = null;
    return;
  }
  isDeriving.value = true;
  try {
    const fromHex = walletStore.fromHex;

    const changeAddrHex = await walletStore.walletApi.getChangeAddress();
    const changeAddrBytes = fromHex(changeAddrHex);
    const baseAddr = CardanoWASM.Address.from_bytes(changeAddrBytes);
    const paymentAddress = baseAddr.to_bech32();

    let vkhHex = "";
    let enterpriseAddress = "";

    try {
      const baseAddrObj = CardanoWASM.BaseAddress.from_address(baseAddr);
      if (baseAddrObj) {
        const paymentCred = baseAddrObj.payment_cred();
        const keyHash = paymentCred.to_keyhash();
        if (keyHash) {
          vkhHex = keyHash.to_hex();
          const networkId = walletStore.networkId ?? 0;
          const entAddr = CardanoWASM.EnterpriseAddress.new(networkId, paymentCred);
          enterpriseAddress = entAddr.to_address().to_bech32();
        }
      } else {
        const entAddrObj = CardanoWASM.EnterpriseAddress.from_address(baseAddr);
        if (entAddrObj) {
          const paymentCred = entAddrObj.payment_cred();
          const keyHash = paymentCred.to_keyhash();
          if (keyHash) {
            vkhHex = keyHash.to_hex();
            enterpriseAddress = baseAddr.to_bech32();
          }
        }
      }
    } catch (e) {
      console.warn("Could not extract payment credential:", e);
    }

    let rewardAddress = "";
    try {
      const rewardAddrs: string[] = await walletStore.walletApi.getRewardAddresses();
      if (rewardAddrs && rewardAddrs.length > 0) {
        const rewardBytes = fromHex(rewardAddrs[0]!);
        const rewardAddr = CardanoWASM.Address.from_bytes(rewardBytes);
        rewardAddress = rewardAddr.to_bech32();
      }
    } catch (e) {
      console.warn("Could not fetch reward address:", e);
    }

    walletKeyInfo.value = { vkhHex, enterpriseAddress, paymentAddress, rewardAddress };
  } catch (e: any) {
    console.error("Error deriving wallet key info:", e);
    walletKeyInfo.value = null;
  } finally {
    isDeriving.value = false;
  }
};

watch(
  () => walletStore.isConnected,
  (connected) => {
    if (connected) deriveWalletKeyInfo();
    else walletKeyInfo.value = null;
  },
  { immediate: true },
);

const copyText = async (text: string, key: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedKey.value = key;
    toast.success(`Copied ${label}!`);
    setTimeout(() => {
      if (copiedKey.value === key) copiedKey.value = null;
    }, 2000);
  } catch {
    toast.error("Failed to copy text");
  }
};

// --- SEO ---
useSeoMeta({
  title: "Cardano Wallet Health Audit & UTXO Dashboard — ADASweep",
  ogTitle: "Cardano Wallet Health Audit & UTXO Dashboard — ADASweep",
  description:
    "Audit your Cardano wallet health metrics in real-time. Track UTXO fragmentation levels, calculate reclaimable ADA locked in dust inputs, and launch optimization tools.",
  ogDescription:
    "Audit your Cardano wallet health metrics in real-time. Track UTXO fragmentation levels, calculate reclaimable ADA locked in dust inputs, and launch optimization tools.",
  keywords:
    "Cardano wallet health audit, eUTXO fragmentation tracker, check reclaimable ADA, Cardano wallet diagnostics, UTXO health score, locked ADA audit, ADASweep dashboard",
  robots: "index, follow",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Cardano Wallet Health Audit & UTXO Dashboard — ADASweep",
        url: "https://adasweep.xyz/dashboard",
        description:
          "Interactive dashboard to audit Cardano wallet health, detect spam assets, track UTXO fragmentation, and identify reclaimable ADA.",
        applicationCategory: "FinancialApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
      }),
    },
  ],
});
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in font-sans">
    <h1 class="sr-only">Cardano Wallet Health Audit &amp; Dashboard</h1>

    <ClientOnly>
      <!-- ── Connected ── -->
      <div v-if="walletStore.isConnected" class="flex flex-col gap-6">

        <!-- Section 1: Wallet Health Overview -->
        <WalletHealth />

        <!-- Section 2: Wallet Credentials -->
        <section class="fintech-card overflow-hidden">
          <!-- Section Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div class="flex items-center gap-3">
              <!-- Key icon -->
              <div class="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-bold text-white font-heading uppercase tracking-widest">Wallet Credentials</h2>
                <p class="text-[11px] text-slate-500 mt-0.5">Addresses &amp; key hashes derived from your connected wallet</p>
              </div>
            </div>

            <!-- Status badge -->
            <span
              v-if="isDeriving"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-400 font-medium"
            >
              <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Deriving…
            </span>
            <span
              v-else-if="walletKeyInfo"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>

          <!-- Credential Rows -->
          <div v-if="walletKeyInfo" class="divide-y divide-white/[0.04]">

            <!-- VKH Hex -->
            <div
              v-if="walletKeyInfo.vkhHex"
              class="credential-row group"
              id="dashboard-cred-vkh"
            >
              <div class="cred-icon bg-emerald-500/10 border-emerald-500/20">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-bold text-white uppercase tracking-wider font-heading">Verification Key Hash</span>
                  <span class="cred-badge text-emerald-400 bg-emerald-500/10 border-emerald-500/20">vkhHex · blake2b-224</span>
                </div>
                <code class="block font-mono text-xs text-emerald-300/80 truncate">{{ walletKeyInfo.vkhHex }}</code>
              </div>
              <button
                id="dashboard-copy-vkhhex-btn"
                class="copy-btn"
                :class="copiedKey === 'vkh' ? 'text-emerald-400 border-emerald-500/30' : ''"
                @click="copyText(walletKeyInfo?.vkhHex ?? '', 'vkh', 'vkhHex')"
                title="Copy Verification Key Hash"
              >
                <svg v-if="copiedKey !== 'vkh'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            <!-- Enterprise Address -->
            <div
              v-if="walletKeyInfo.enterpriseAddress"
              class="credential-row group"
              id="dashboard-cred-enterprise"
            >
              <div class="cred-icon bg-amber-500/10 border-amber-500/20">
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-bold text-white uppercase tracking-wider font-heading">Enterprise Address</span>
                  <span class="cred-badge text-amber-400 bg-amber-500/10 border-amber-500/20">addr · no staking</span>
                </div>
                <code class="block font-mono text-xs text-amber-300/80 truncate">{{ walletKeyInfo.enterpriseAddress }}</code>
              </div>
              <button
                id="dashboard-copy-enterprise-btn"
                class="copy-btn"
                :class="copiedKey === 'enterprise' ? 'text-amber-400 border-amber-500/30' : ''"
                @click="copyText(walletKeyInfo?.enterpriseAddress ?? '', 'enterprise', 'Enterprise Address')"
                title="Copy Enterprise Address"
              >
                <svg v-if="copiedKey !== 'enterprise'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            <!-- Payment / Base Address -->
            <div class="credential-row group" id="dashboard-cred-payment">
              <div class="cred-icon bg-violet-500/10 border-violet-500/20">
                <svg class="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-bold text-white uppercase tracking-wider font-heading">Payment Address</span>
                  <span class="cred-badge text-violet-400 bg-violet-500/10 border-violet-500/20">addr · base · receives ADA</span>
                </div>
                <code class="block font-mono text-xs text-violet-300/80 truncate">{{ walletKeyInfo.paymentAddress }}</code>
              </div>
              <button
                id="dashboard-copy-payment-btn"
                class="copy-btn"
                :class="copiedKey === 'payment' ? 'text-violet-400 border-violet-500/30' : ''"
                @click="copyText(walletKeyInfo?.paymentAddress ?? '', 'payment', 'Payment Address')"
                title="Copy Payment Address"
              >
                <svg v-if="copiedKey !== 'payment'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            <!-- Reward / Staking Address -->
            <div
              v-if="walletKeyInfo.rewardAddress"
              class="credential-row group"
              id="dashboard-cred-reward"
            >
              <div class="cred-icon bg-indigo-500/10 border-indigo-500/20">
                <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-bold text-white uppercase tracking-wider font-heading">Reward Address</span>
                  <span class="cred-badge text-indigo-400 bg-indigo-500/10 border-indigo-500/20">stake · delegation</span>
                </div>
                <code class="block font-mono text-xs text-indigo-300/80 truncate">{{ walletKeyInfo.rewardAddress }}</code>
              </div>
              <button
                id="dashboard-copy-reward-btn"
                class="copy-btn"
                :class="copiedKey === 'reward' ? 'text-indigo-400 border-indigo-500/30' : ''"
                @click="copyText(walletKeyInfo?.rewardAddress ?? '', 'reward', 'Reward Address')"
                title="Copy Reward Address"
              >
                <svg v-if="copiedKey !== 'reward'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Deriving loading state -->
          <div
            v-else-if="isDeriving"
            class="flex items-center justify-center py-14 gap-3 text-slate-500"
          >
            <svg class="animate-spin w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="text-sm">Deriving wallet credentials…</span>
          </div>
        </section>
      </div>

      <!-- ── Not connected ── -->
      <div v-else>
        <WalletGate
          title="Dashboard Access Required"
          description="Please connect your Cardano wallet to view your health audit dashboard, analyze UTXO fragmentation, and inspect your assets."
        />
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}

/* Credential row — full-width horizontal list item */
.credential-row {
  @apply flex items-center gap-4 px-6 py-4 transition-colors duration-200 cursor-default;
}
.credential-row:hover {
  background: rgba(255, 255, 255, 0.018);
}

/* Colored icon box */
.cred-icon {
  @apply w-8 h-8 rounded-lg border flex items-center justify-center shrink-0;
}

/* Small pill badge next to label */
.cred-badge {
  @apply text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border font-mono;
}

/* Icon-only copy button */
.copy-btn {
  @apply shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
         text-slate-500 hover:text-slate-200
         bg-transparent hover:bg-white/[0.06]
         border border-transparent hover:border-white/[0.08]
         transition-all duration-200 cursor-pointer
         opacity-0 group-hover:opacity-100;
}
</style>
