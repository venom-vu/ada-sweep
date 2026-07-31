<script setup lang="ts">
import { toast } from "vue-sonner";
import { KeysUtils } from "@hydra-sdk/core";
import { CardanoWASM } from "@hydra-sdk/cardano-wasm";

definePageMeta({
  layout: "dashboard",
});

// SEO Metadata
useSeoMeta({
  title: 'Key Generator — Derive Cardano Keys from Mnemonic | ADASweep',
  ogTitle: 'Key Generator — Derive Cardano Keys from Mnemonic | ADASweep',
  description: 'Derive Cardano signing keys, verification keys, and key hashes from a BIP-39 mnemonic phrase. Client-side, non-custodial key derivation tool for developers and power users.',
  ogDescription: 'Derive Cardano signing keys, verification keys, and key hashes from a BIP-39 mnemonic phrase. Client-side, non-custodial key derivation tool for developers and power users.',
  keywords: 'Cardano key generator, derive Cardano keys, BIP-39 mnemonic Cardano, Cardano signing key, Cardano verification key, key hash Cardano, non-custodial key derivation',
});

// JSON-LD Structured Data
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'ADASweep Key Generator',
        'url': 'https://adasweep.xyz/keygen',
        'description': 'Client-side, non-custodial tool to derive Cardano signing keys, verification keys, and key hashes from a BIP-39 mnemonic phrase.',
        'applicationCategory': 'DeveloperApplication, UtilitiesApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'featureList': [
          'BIP-39 mnemonic to Cardano key derivation',
          'Signing key (SK) CBOR hex export',
          'Verification key (VK) CBOR hex export',
          'Verification key hash (VKH) export',
          'Account index & key index selection',
          'Fully client-side — mnemonic never leaves your browser'
        ]
      })
    }
  ]
});

const mnemonicInput = ref("");
const accountIndex = ref(0);
const keyIndex = ref(0);
const isProcessing = ref(false);
const processError = ref<string | null>(null);

interface KeyResult {
  skCborHex: string;
  vkCborHex: string;
  vkhHex: string;
}

const keyResult = ref<KeyResult | null>(null);

let debounceTimeout: any = null;

const runDerive = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);

  const clean = mnemonicInput.value.trim();
  if (!clean) {
    keyResult.value = null;
    processError.value = null;
    return;
  }

  isProcessing.value = true;
  processError.value = null;

  debounceTimeout = setTimeout(async () => {
    try {
      if (typeof window === "undefined") {
        throw new Error("Client-side only");
      }

      const words = clean.split(/\s+/).filter(Boolean);
      if (words.length < 12) {
        throw new Error(
          `Mnemonic must have at least 12 words. Got: ${words.length}.`,
        );
      }

      const { sk, vk } = KeysUtils.mnemonicToCliKey(
        words,
        accountIndex.value,
        keyIndex.value,
      );

      // Compute vkhHex: blake2b-224 hash of the raw 32-byte vkey
      // vk.cborHex format: "5820" + 32 bytes (64 hex chars)
      const rawVkHex = vk.cborHex.startsWith("5820")
        ? vk.cborHex.slice(4)
        : vk.cborHex;

      const rawVkBytes = Uint8Array.from(
        rawVkHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)),
      );

      const publicKey = CardanoWASM.PublicKey.from_bytes(rawVkBytes);
      const vkhHex = publicKey.hash().to_hex();

      keyResult.value = {
        skCborHex: sk.cborHex,
        vkCborHex: vk.cborHex,
        vkhHex,
      };
      processError.value = null;
      toast.success("Keys derived successfully!");
    } catch (err: any) {
      console.error(err);
      processError.value =
        err.message || "Failed to derive keys from mnemonic.";
      keyResult.value = null;
    } finally {
      isProcessing.value = false;
    }
  }, 500);
};

watch([mnemonicInput, accountIndex, keyIndex], () => {
  runDerive();
});

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
});

const clearInput = () => {
  mnemonicInput.value = "";
  keyResult.value = null;
  processError.value = null;
};

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}!`);
  } catch {
    toast.error("Failed to copy text");
  }
};

const wordCount = computed(() =>
  mnemonicInput.value.trim()
    ? mnemonicInput.value.trim().split(/\s+/).filter(Boolean).length
    : 0,
);

useSeoMeta({
  title: "Cardano Key Generator — Derive Keys from Mnemonic — ADASweep",
  ogTitle: "Cardano Key Generator — Derive Keys from Mnemonic — ADASweep",
  description:
    "Derive Cardano CLI-compatible payment keys (skCborHex, vkCborHex, vkhHex) from a BIP-39 mnemonic phrase, entirely offline in your browser.",
  ogDescription:
    "Derive Cardano CLI-compatible payment keys (skCborHex, vkCborHex, vkhHex) from a BIP-39 mnemonic phrase, entirely offline in your browser.",
  keywords:
    "Cardano key generator, mnemonic to keys, derive Cardano payment key, skCborHex, vkCborHex, vkhHex, BIP-39 Cardano, offline key derivation",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Cardano Key Generator — ADASweep",
        url: "https://adasweep.xyz/keygen",
        description:
          "Offline tool to derive Cardano CLI-compatible payment keys (skCborHex, vkCborHex, vkhHex) from BIP-39 mnemonic phrases.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
      }),
    },
  ],
});
</script>

<template>
  <ClientOnly>
    <div class="flex flex-col gap-8 animate-fade-in font-sans">
      <h1 class="sr-only">Cardano Key Generator — Derive Keys from Mnemonic</h1>

      <!-- Security Warning Banner -->
      <div
        class="flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400 text-xs"
      >
        <svg
          class="w-5 h-5 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-amber-300"
            >Security Notice — Offline Only</span
          >
          <p class="leading-normal text-slate-300">
            Your mnemonic phrase is processed entirely
            <strong class="text-amber-200">in your browser</strong>. No data is
            ever sent to any server. Use this tool on a trusted device with a
            secure connection only.
          </p>
        </div>
      </div>

      <!-- Main Layout: 1/3 input + 2/3 output -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Input Panel -->
        <div class="glass-card p-6 flex flex-col min-h-[450px]">
          <div
            class="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.04]"
          >
            <h2
              id="keygen-input-heading"
              class="text-sm font-semibold text-white tracking-wide font-heading uppercase"
            >
              Mnemonic Phrase
            </h2>
            <button
              v-if="mnemonicInput"
              id="keygen-clear-btn"
              class="text-xs font-semibold text-slate-500 hover:text-white px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] transition-all duration-200 cursor-pointer"
              @click="clearInput"
            >
              Clear
            </button>
          </div>

          <!-- Mnemonic Textarea -->
          <div class="relative flex-1 flex flex-col">
            <textarea
              id="keygen-input-textarea"
              v-model="mnemonicInput"
              placeholder="Enter your BIP-39 mnemonic phrase here...&#10;&#10;e.g. abandon ability able about above absent..."
              class="w-full flex-1 min-h-[200px] bg-fintech-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-xs focus:border-fintech-purple focus:ring-1 focus:ring-fintech-purple/50 transition-all duration-200 outline-none resize-none"
              rows="10"
            />

            <!-- Word count + status indicator -->
            <div class="absolute bottom-3 right-3 flex items-center gap-2">
              <span
                v-if="isProcessing"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-400 font-medium"
              >
                <svg
                  class="animate-spin w-3 h-3 text-violet-400"
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
                Deriving...
              </span>
              <span
                v-else-if="wordCount > 0"
                :class="[
                  'px-2.5 py-1 rounded-md text-[10px] font-medium border',
                  wordCount === 12 ||
                  wordCount === 15 ||
                  wordCount === 18 ||
                  wordCount === 21 ||
                  wordCount === 24
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                ]"
              >
                {{ wordCount }} words
              </span>
            </div>
          </div>

          <!-- Derivation Path Controls -->
          <div class="mt-4 pt-4 border-t border-white/[0.04]">
            <p
              class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3"
            >
              Derivation Path
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label
                  for="account-index"
                  class="text-[10px] text-slate-500 font-medium"
                  >Account Index</label
                >
                <input
                  id="account-index"
                  v-model.number="accountIndex"
                  type="number"
                  min="0"
                  max="99"
                  class="w-full bg-fintech-dark/50 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-fintech-purple focus:ring-1 focus:ring-fintech-purple/50 transition-all duration-200 outline-none"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  for="key-index"
                  class="text-[10px] text-slate-500 font-medium"
                  >Key Index</label
                >
                <input
                  id="key-index"
                  v-model.number="keyIndex"
                  type="number"
                  min="0"
                  max="999"
                  class="w-full bg-fintech-dark/50 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-fintech-purple focus:ring-1 focus:ring-fintech-purple/50 transition-all duration-200 outline-none"
                />
              </div>
            </div>
            <p class="text-[10px] text-slate-600 mt-2 font-mono">
              m/1852'/1815'/{{ accountIndex }}'/0/{{ keyIndex }}
            </p>
          </div>

          <!-- Error Panel -->
          <div
            v-if="processError"
            class="flex gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 mt-4 text-rose-400 text-xs"
          >
            <svg
              class="w-5 h-5 text-rose-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="flex flex-col gap-0.5">
              <span class="font-bold">Key Derivation Error:</span>
              <p class="break-all leading-normal">{{ processError }}</p>
            </div>
          </div>
        </div>

        <!-- Result Panel -->
        <div
          class="glass-card col-span-1 lg:col-span-2 p-6 flex flex-col min-h-[450px]"
        >
          <div
            class="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.04]"
          >
            <h2
              id="keygen-result-heading"
              class="text-sm font-semibold text-white tracking-wide font-heading uppercase"
            >
              Derived Keys
            </h2>
            <div
              v-if="keyResult"
              class="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium"
            >
              Keys Ready
            </div>
          </div>

          <!-- Keys Output -->
          <div v-if="keyResult" class="flex flex-col gap-5 flex-1">
            <!-- Signing Key (skCborHex) -->
            <div
              class="border border-white/5 bg-white/[0.01] rounded-xl p-4 flex flex-col gap-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      class="text-xs font-bold text-white font-heading tracking-wide"
                    >
                      Signing Key CBOR Hex
                    </p>
                    <p class="text-[10px] text-slate-500 font-mono mt-0.5">
                      skCborHex · PaymentSigningKeyShelley_ed25519
                    </p>
                  </div>
                </div>
                <button
                  id="copy-skcborhex-btn"
                  class="shrink-0 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded transition-all duration-200 cursor-pointer"
                  @click="copyText(keyResult!.skCborHex, 'skCborHex')"
                >
                  Copy
                </button>
              </div>
              <div
                class="bg-fintech-black/50 border border-white/5 p-3 rounded-lg overflow-x-auto"
              >
                <code
                  class="font-mono text-xs text-rose-300 break-all select-all"
                  >{{ keyResult.skCborHex }}</code
                >
              </div>
              <p class="text-[10px] text-slate-600 leading-normal">
                ⚠️ This is your
                <strong class="text-rose-400/80">private signing key</strong>.
                Keep it secret. Never share it with anyone.
              </p>
            </div>

            <!-- Verification Key (vkCborHex) -->
            <div
              class="border border-white/5 bg-white/[0.01] rounded-xl p-4 flex flex-col gap-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-violet-400"
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
                  <div>
                    <p
                      class="text-xs font-bold text-white font-heading tracking-wide"
                    >
                      Verification Key CBOR Hex
                    </p>
                    <p class="text-[10px] text-slate-500 font-mono mt-0.5">
                      vkCborHex · PaymentVerificationKeyShelley_ed25519
                    </p>
                  </div>
                </div>
                <button
                  id="copy-vkcborhex-btn"
                  class="shrink-0 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded transition-all duration-200 cursor-pointer"
                  @click="copyText(keyResult!.vkCborHex, 'vkCborHex')"
                >
                  Copy
                </button>
              </div>
              <div
                class="bg-fintech-black/50 border border-white/5 p-3 rounded-lg overflow-x-auto"
              >
                <code
                  class="font-mono text-xs text-violet-300 break-all select-all"
                  >{{ keyResult.vkCborHex }}</code
                >
              </div>
            </div>

            <!-- Verification Key Hash (vkhHex) -->
            <div
              class="border border-white/5 bg-white/[0.01] rounded-xl p-4 flex flex-col gap-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      class="text-xs font-bold text-white font-heading tracking-wide"
                    >
                      Verification Key Hash
                    </p>
                    <p class="text-[10px] text-slate-500 font-mono mt-0.5">
                      vkhHex · blake2b-224(vkey) · Payment Credential
                    </p>
                  </div>
                </div>
                <button
                  id="copy-vkhhex-btn"
                  class="shrink-0 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded transition-all duration-200 cursor-pointer"
                  @click="copyText(keyResult!.vkhHex, 'vkhHex')"
                >
                  Copy
                </button>
              </div>
              <div
                class="bg-fintech-black/50 border border-white/5 p-3 rounded-lg overflow-x-auto"
              >
                <code
                  class="font-mono text-xs text-emerald-300 break-all select-all"
                  >{{ keyResult.vkhHex }}</code
                >
              </div>
              <p class="text-[10px] text-slate-600 leading-normal">
                This is the public key hash used as the payment credential in
                Cardano addresses (Enterprise &amp; Base address types).
              </p>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="flex flex-col items-center justify-center p-12 py-24 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] flex-1 text-slate-500 text-sm gap-3"
          >
            <svg
              class="w-10 h-10 text-slate-600 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <div class="flex flex-col gap-1">
              <p
                v-if="isProcessing"
                class="text-violet-400 font-semibold text-sm"
              >
                Deriving keys from mnemonic phrase...
              </p>
              <p v-else-if="processError" class="text-rose-400 font-semibold">
                {{ processError }}
              </p>
              <p v-else class="font-medium text-slate-400">
                Enter your mnemonic phrase on the left
              </p>
              <p
                v-if="!isProcessing && !processError"
                class="text-xs text-slate-600 max-w-xs mx-auto"
              >
                Keys (skCborHex, vkCborHex, vkhHex) will appear here
                automatically once a valid phrase is detected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
