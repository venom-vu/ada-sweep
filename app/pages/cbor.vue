<script setup lang="ts">
import { toast } from "vue-sonner";
import { decodeCardanoCbor, type DecodedResult } from "~/utils/cborDecoder";
import { createHighlighter } from "shiki";

definePageMeta({
  layout: "dashboard",
});

const cborInput = ref("");
const isDecoding = ref(false);
const decodedResult = ref<DecodedResult | null>(null);
const decodeError = ref<string | null>(null);
const activeTab = ref<"block" | "json">("block");

// Shiki state
const isShikiLoading = ref(false);
const shikiHighlighter = ref<any>(null);
const highlightedJson = ref("");

// Collapsible state for sections
const collapsedSections = ref<Record<string, boolean>>({
  txBody: false,
  inputs: false,
  outputs: false,
  collateral: true,
  referenceInputs: true,
  requiredSigners: true,
  mint: true,
  validity: true,
  collateralReturn: true,

  witnessSet: false,
  keyWitnesses: false,
  plutusScripts: true,
  plutusData: true,
  redeemers: true,

  auxData: false,
});

const toggleSection = (section: string) => {
  collapsedSections.value[section] = !collapsedSections.value[section];
};

const initShiki = async () => {
  if (shikiHighlighter.value || isShikiLoading.value) return;
  isShikiLoading.value = true;
  try {
    shikiHighlighter.value = await createHighlighter({
      themes: ["github-dark"],
      langs: ["json"],
    });
  } catch (err) {
    console.error("Failed to load Shiki highlighter:", err);
  } finally {
    isShikiLoading.value = false;
  }
};

const highlightJson = (jsonObj: any): string => {
  const jsonStr = JSON.stringify(jsonObj, undefined, 2);
  const safeStr = jsonStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return safeStr.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-400"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-violet-400 font-semibold"; // key
        } else {
          cls = "text-emerald-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-blue-400"; // boolean
      } else if (/null/.test(match)) {
        cls = "text-slate-500"; // null
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
};

const renderJson = async () => {
  if (!decodedResult.value) return;
  const jsonStr = JSON.stringify(decodedResult.value.data, null, 2);

  if (shikiHighlighter.value) {
    try {
      highlightedJson.value = shikiHighlighter.value.codeToHtml(jsonStr, {
        lang: "json",
        theme: "github-dark",
      });
    } catch (e) {
      highlightedJson.value = `<pre class="text-slate-100">${jsonStr}</pre>`;
    }
  } else {
    highlightedJson.value = `<pre class="text-slate-100">${highlightJson(decodedResult.value.data)}</pre>`;
    await initShiki();
    if (shikiHighlighter.value) {
      try {
        highlightedJson.value = shikiHighlighter.value.codeToHtml(jsonStr, {
          lang: "json",
          theme: "github-dark",
        });
      } catch (e) {}
    }
  }
};

watch(
  [activeTab, decodedResult],
  () => {
    if (activeTab.value === "json" && decodedResult.value) {
      renderJson();
    }
  },
  { deep: true, immediate: true },
);

let debounceTimeout: any = null;

const runAutoDecode = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout);

  const cleanInput = cborInput.value.trim();
  if (!cleanInput) {
    decodedResult.value = null;
    decodeError.value = null;
    return;
  }

  isDecoding.value = true;
  decodeError.value = null;

  debounceTimeout = setTimeout(async () => {
    try {
      // Validate format
      if (!/^[0-9a-fA-F\s]+$/.test(cleanInput.replace(/\s/g, ""))) {
        throw new Error("Invalid hexadecimal characters.");
      }

      const result = await decodeCardanoCbor(cleanInput.replace(/\s/g, ""));
      decodedResult.value = result;
      decodeError.value = null;
      toast.success("CBOR decoded successfully!");
    } catch (err: any) {
      console.error(err);
      decodeError.value =
        err.message || "Failed to decode this CBOR into a valid Cardano entity";
      decodedResult.value = null;
    } finally {
      isDecoding.value = false;
    }
  }, 400);
};

watch(cborInput, () => {
  runAutoDecode();
});

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
});

const clearInput = () => {
  cborInput.value = "";
  decodedResult.value = null;
  decodeError.value = null;
};

// Copy helper
const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}!`);
  } catch (e) {
    toast.error("Failed to copy text");
  }
};

// Hex to ASCII asset name decoder
const decodeAssetName = (hex: string | number): string => {
  try {
    const hexStr = String(hex);
    const bytes = new Uint8Array(
      hexStr.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [],
    );
    const decoded = new TextDecoder().decode(bytes);
    return /^[\x20-\x7E]*$/.test(decoded) ? decoded : `(Hex: ${hexStr})`;
  } catch (e) {
    return String(hex);
  }
};

// Utility to parse value output for display
const parseAmount = (coinStr: string) => {
  const lovelace = parseInt(coinStr) || 0;
  return {
    lovelace,
    ada: lovelace / 1000000,
  };
};

useSeoMeta({
  title: "Cardano CBOR Decoder & Transaction Deserializer — ADASweep",
  ogTitle: "Cardano CBOR Decoder & Transaction Deserializer — ADASweep",
  description:
    "Decode and inspect raw Cardano CBOR hexadecimal inputs offline. Deserialize transactions, UTXOs, addresses, and values into readable visual cards and JSON trees.",
  ogDescription:
    "Decode and inspect raw Cardano CBOR hexadecimal inputs offline. Deserialize transactions, UTXOs, addresses, and values into readable visual cards and JSON trees.",
  keywords:
    "Cardano CBOR decoder, Cardano transaction deserializer, decode Cardano hex, online Cardano CBOR parser, CIP-30 CBOR viewer, inspect Cardano UTXO",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Cardano CBOR Decoder & Deserializer — ADASweep",
        url: "https://adasweep.xyz/cbor",
        description:
          "An offline-safe parser to decode, inspect, and deserialize raw Cardano CBOR hex inputs into structured JSON and user-friendly visual cards.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
      }),
    },
  ],
});
</script>

<template>
  <div class="flex flex-col gap-8 animate-fade-in font-sans">
    <h1 class="sr-only">Cardano CBOR Decoder & Transaction Deserializer</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Input Panel -->
      <div class="glass-card p-6 flex flex-col min-h-[450px]">
        <div
          class="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.04]"
        >
          <h2
            id="cbor-input-heading"
            class="text-sm font-semibold text-white tracking-wide font-heading uppercase"
          >
            CBOR HEX INPUT
          </h2>
          <button
            v-if="cborInput"
            id="cbor-clear-btn"
            class="text-xs font-semibold text-slate-500 hover:text-white px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] transition-all duration-200 cursor-pointer"
            @click="clearInput"
          >
            Clear
          </button>
        </div>

        <div class="relative flex-1 flex flex-col">
          <textarea
            id="cbor-input-textarea"
            v-model="cborInput"
            placeholder="Paste CBOR hex here (e.g. 84a300d90102... or 1a075bcd15)"
            class="w-full flex-1 min-h-[260px] bg-fintech-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-xs focus:border-fintech-purple focus:ring-1 focus:ring-fintech-purple/50 transition-all duration-200 outline-none resize-none"
            rows="12"
          ></textarea>

          <!-- Input Status Indicators -->
          <div class="absolute bottom-3 right-3 flex items-center gap-2">
            <span
              v-if="isDecoding"
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
              Decoding...
            </span>
            <span
              v-else-if="decodedResult"
              class="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium"
            >
              Parsed ({{ decodedResult.type }})
            </span>
          </div>
        </div>

        <!-- Error Panel -->
        <div
          v-if="decodeError"
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
            <span class="font-bold">Decoding Error:</span>
            <p class="break-all leading-normal">{{ decodeError }}</p>
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
            id="cbor-analysis-heading"
            class="text-sm font-semibold text-white tracking-wide font-heading uppercase"
          >
            DECODED ANALYSIS
          </h2>
          <div
            v-if="decodedResult"
            class="flex bg-fintech-dark border border-white/5 rounded-lg p-0.5"
          >
            <button
              id="cbor-tab-cards"
              class="px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer"
              :class="
                activeTab === 'block'
                  ? 'text-white bg-white/[0.05] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              "
              @click="activeTab = 'block'"
            >
              Cards Layout
            </button>
            <button
              id="cbor-tab-json"
              class="px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer"
              :class="
                activeTab === 'json'
                  ? 'text-white bg-white/[0.05] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              "
              @click="activeTab = 'json'"
            >
              JSON Tree
            </button>
          </div>
        </div>

        <!-- Decoded View -->
        <div v-if="decodedResult" class="flex flex-col gap-4 flex-1">
          <!-- Summary Header Card -->
          <div
            class="border border-white/5 bg-white/[0.01] rounded-xl p-4 flex flex-col gap-3"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400">Detected Entity:</span>
                <span
                  class="px-2 py-0.5 rounded text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 font-heading"
                >
                  {{ decodedResult.type }}
                </span>
              </div>
              <div class="text-xs text-slate-400">
                Hex Size:
                <span class="text-slate-200 font-mono font-medium"
                  >{{ decodedResult.size }} bytes</span
                >
              </div>
            </div>

            <!-- Transaction specific details in Header Card -->
            <div
              v-if="decodedResult.type === 'Transaction'"
              class="flex flex-col gap-3 border-t border-white/[0.02] pt-3"
            >
              <div class="flex flex-col gap-1.5">
                <span
                  class="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading"
                  >Transaction Hash (TxID)</span
                >
                <div
                  v-if="decodedResult.txHash"
                  class="flex items-center justify-between gap-3 bg-fintech-black/30 border border-white/5 p-2 px-3 rounded-lg overflow-hidden"
                >
                  <code
                    class="break-all text-violet-300 font-mono text-xs select-all"
                    >{{ decodedResult.txHash }}</code
                  >
                  <button
                    class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                    title="Copy Transaction Hash"
                    @click="copyText(decodedResult.txHash!, 'Transaction Hash')"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  </button>
                </div>
                <div v-else class="text-xs text-slate-500 italic">
                  Hashing not supported for this transaction format.
                </div>
              </div>

              <!-- General Stats Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                <div
                  class="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-0.5"
                >
                  <span
                    class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-heading"
                    >Inputs</span
                  >
                  <span class="text-base font-bold text-white">{{
                    decodedResult.data.body?.inputs?.length || 0
                  }}</span>
                </div>
                <div
                  class="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-0.5"
                >
                  <span
                    class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-heading"
                    >Outputs</span
                  >
                  <span class="text-base font-bold text-white">{{
                    decodedResult.data.body?.outputs?.length || 0
                  }}</span>
                </div>
                <div
                  class="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-0.5"
                >
                  <span
                    class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-heading"
                    >Fee</span
                  >
                  <span class="text-base font-bold text-amber-400">
                    ₳
                    {{
                      parseAmount(decodedResult.data.body?.fee).ada.toFixed(6)
                    }}
                  </span>
                </div>
                <div
                  class="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg flex flex-col gap-0.5"
                >
                  <span
                    class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-heading"
                    >Size</span
                  >
                  <span
                    class="text-base font-bold text-slate-200 font-mono text-sm mt-0.5"
                    >{{ decodedResult.size }} B</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Cards View -->
          <div v-if="activeTab === 'block'" class="flex flex-col gap-5">
            <!-- ADDRESS BLOCK -->
            <div
              v-if="decodedResult.type === 'Address'"
              class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden"
            >
              <div
                class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span
                  class="font-bold text-xs text-slate-200 tracking-wide font-heading uppercase"
                  >Cardano Address</span
                >
              </div>
              <div class="p-4 space-y-4">
                <div class="flex flex-col gap-1.5">
                  <span
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >Bech32 Address</span
                  >
                  <div
                    class="flex items-center justify-between gap-3 bg-fintech-black/50 border border-white/5 p-3 rounded-lg mt-1 overflow-hidden"
                  >
                    <code
                      class="break-all text-violet-300 font-mono text-xs select-all"
                      >{{ decodedResult.data.bech32 }}</code
                    >
                    <button
                      class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                      @click="copyText(decodedResult.data.bech32, 'Address')"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <span
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >Network ID</span
                  >
                  <div class="mt-1.5">
                    <span
                      class="px-2.5 py-1 rounded text-xs font-bold border"
                      :class="
                        decodedResult.data.networkId === 1
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      "
                    >
                      {{
                        decodedResult.data.networkId === 1
                          ? "Mainnet (1)"
                          : "Testnet / Preprod (0)"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- VALUE BLOCK -->
            <div
              v-else-if="decodedResult.type === 'Value'"
              class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden"
            >
              <div
                class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2"
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  class="font-bold text-xs text-slate-200 tracking-wide font-heading uppercase"
                  >Cardano Value</span
                >
              </div>
              <div class="p-4 space-y-4">
                <div
                  class="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10 p-5 rounded-xl text-center flex flex-col items-center justify-center"
                >
                  <div
                    class="text-[10px] uppercase text-slate-400 tracking-wider"
                  >
                    Total ADA Balance
                  </div>
                  <div class="text-2xl font-black text-white mt-1.5">
                    ₳
                    {{
                      parseAmount(decodedResult.data.coin).ada.toLocaleString(
                        undefined,
                        { minimumFractionDigits: 6 },
                      )
                    }}
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono mt-1">
                    {{ decodedResult.data.coin }} Lovelace
                  </div>
                </div>

                <!-- Tokens subsection -->
                <div class="space-y-2 mt-4">
                  <h4
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Associated Assets (Tokens)
                  </h4>
                  <div
                    v-if="
                      decodedResult.data.multiasset &&
                      Object.keys(decodedResult.data.multiasset).length > 0
                    "
                    class="flex flex-col gap-2"
                  >
                    <div
                      v-for="(assets, policyId) in decodedResult.data
                        .multiasset"
                      :key="policyId"
                      class="border border-white/5 bg-white/[0.01] rounded-lg overflow-hidden"
                    >
                      <div
                        class="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 text-xs text-slate-500"
                      >
                        <span class="shrink-0 font-semibold">Policy:</span>
                        <code
                          class="font-mono text-slate-400 truncate flex-1 block select-all"
                          >{{ policyId }}</code
                        >
                      </div>
                      <div class="px-3 py-2 flex flex-col gap-1.5">
                        <div
                          v-for="(amount, nameHex) in assets"
                          :key="nameHex"
                          class="flex justify-between items-center text-xs"
                        >
                          <span class="font-medium text-slate-300">{{
                            decodeAssetName(nameHex)
                          }}</span>
                          <span
                            class="font-mono text-violet-400 font-semibold"
                            >{{ amount }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="text-xs text-slate-500 italic mt-1 bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg"
                  >
                    No other native assets.
                  </div>
                </div>
              </div>
            </div>

            <!-- UTXO BLOCK -->
            <div
              v-else-if="decodedResult.type === 'UTXO'"
              class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden"
            >
              <div
                class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2"
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span
                  class="font-bold text-xs text-slate-200 tracking-wide font-heading uppercase"
                  >Unspent Transaction Output (UTXO)</span
                >
              </div>
              <div class="p-4 space-y-4">
                <!-- Input source -->
                <div class="space-y-2">
                  <h4
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    UTXO Source (Input)
                  </h4>
                  <div
                    class="bg-white/[0.01] border border-white/5 p-4 rounded-lg space-y-3"
                  >
                    <div class="flex flex-col gap-1.5">
                      <span
                        class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
                        >Tx Hash</span
                      >
                      <div
                        class="flex justify-between items-center gap-3 bg-fintech-black/50 border border-white/5 p-2 px-3 rounded-lg overflow-hidden"
                      >
                        <code
                          class="break-all font-mono text-violet-300 text-xs select-all"
                          >{{ decodedResult.data.input.transaction_id }}</code
                        >
                        <button
                          class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                          @click="
                            copyText(
                              decodedResult.data.input.transaction_id,
                              'Tx Hash',
                            )
                          "
                        >
                          <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span
                        class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
                        >Index</span
                      >
                      <code
                        class="font-mono text-sm text-white select-all mt-0.5"
                        >{{ decodedResult.data.input.index }}</code
                      >
                    </div>
                  </div>
                </div>

                <!-- Output payload -->
                <div class="space-y-2 mt-4">
                  <h4
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >
                    UTXO Allocation (Output)
                  </h4>
                  <div
                    class="bg-white/[0.01] border border-white/5 p-4 rounded-lg space-y-4"
                  >
                    <div class="flex flex-col gap-1.5">
                      <span
                        class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
                        >Target Address</span
                      >
                      <div
                        class="flex justify-between items-center gap-3 bg-fintech-black/50 border border-white/5 p-2 px-3 rounded-lg overflow-hidden"
                      >
                        <code
                          class="break-all font-mono text-violet-300 text-xs select-all"
                          >{{ decodedResult.data.output.address }}</code
                        >
                        <button
                          class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                          @click="
                            copyText(
                              decodedResult.data.output.address,
                              'Address',
                            )
                          "
                        >
                          <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div
                      class="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10 p-5 rounded-xl text-center flex flex-col items-center justify-center"
                    >
                      <div
                        class="text-[10px] uppercase text-slate-400 tracking-wider"
                      >
                        ADA Balance
                      </div>
                      <div class="text-2xl font-black text-white mt-1.5">
                        ₳
                        {{
                          parseAmount(
                            decodedResult.data.output.amount.coin,
                          ).ada.toLocaleString(undefined, {
                            minimumFractionDigits: 6,
                          })
                        }}
                      </div>
                      <div class="text-[10px] text-slate-500 font-mono mt-1">
                        {{ decodedResult.data.output.amount.coin }} Lovelace
                      </div>
                    </div>

                    <!-- Output tokens -->
                    <div class="space-y-2">
                      <span
                        class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                        >Received Tokens</span
                      >
                      <div
                        v-if="
                          decodedResult.data.output.amount.multiasset &&
                          Object.keys(
                            decodedResult.data.output.amount.multiasset,
                          ).length > 0
                        "
                        class="flex flex-col gap-2 mt-1.5"
                      >
                        <div
                          v-for="(assets, policyId) in decodedResult.data.output
                            .amount.multiasset"
                          :key="policyId"
                          class="border border-white/5 bg-white/[0.01] rounded-lg overflow-hidden"
                        >
                          <div
                            class="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 text-xs text-slate-500"
                          >
                            <span class="shrink-0 font-semibold">Policy:</span>
                            <code
                              class="font-mono text-slate-400 truncate flex-1 block select-all"
                              >{{ policyId }}</code
                            >
                          </div>
                          <div class="px-3 py-2 flex flex-col gap-1.5">
                            <div
                              v-for="(amount, nameHex) in assets"
                              :key="nameHex"
                              class="flex justify-between items-center text-xs"
                            >
                              <span class="font-medium text-slate-300">{{
                                decodeAssetName(nameHex)
                              }}</span>
                              <span
                                class="font-mono text-violet-400 font-semibold"
                                >{{ amount }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="text-xs text-slate-500 italic mt-1 bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg"
                      >
                        No other native assets.
                      </div>
                    </div>

                    <!-- Inline Datum / Datum Hash (If any) -->
                    <div
                      v-if="decodedResult.data.output.plutus_data"
                      class="space-y-2 border-t border-white/[0.02] pt-4"
                    >
                      <span
                        class="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading"
                        >Plutus Datum</span
                      >
                      <div
                        class="bg-violet-950/20 border border-violet-500/10 p-3 rounded-lg text-xs mt-1"
                      >
                        <pre
                          class="font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all"
                          >{{
                            JSON.stringify(
                              decodedResult.data.output.plutus_data,
                              null,
                              2,
                            )
                          }}</pre
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TRANSACTION FULL CARDS -->
            <template v-else-if="decodedResult.type === 'Transaction'">
              <!-- SECTION 1: TRANSACTION BODY -->
              <div
                class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all duration-200"
              >
                <div
                  class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all duration-150"
                  @click="toggleSection('txBody')"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-violet-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span
                      class="font-bold text-xs text-slate-200 tracking-wide font-heading uppercase"
                      >Transaction Body</span
                    >
                  </div>
                  <svg
                    class="w-4 h-4 text-slate-400 transition-transform duration-200"
                    :class="{ 'rotate-180': collapsedSections.txBody }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div
                  v-show="!collapsedSections.txBody"
                  class="p-4 flex flex-col gap-4"
                >
                  <!-- SUB-CARD: INPUTS -->
                  <div
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('inputs')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Inputs ({{
                          decodedResult.data.body?.inputs?.length || 0
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': collapsedSections.inputs }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.inputs"
                      class="p-3 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1.5 scrollbar-thin"
                    >
                      <div
                        v-for="(input, idx) in decodedResult.data.body?.inputs"
                        :key="idx"
                        class="flex gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs items-start"
                      >
                        <span class="font-bold text-violet-400"
                          >#{{ idx }}</span
                        >
                        <div class="flex flex-col gap-1 flex-1 min-w-0">
                          <code
                            class="font-mono text-violet-300 break-all select-all"
                            >{{ input.transaction_id }}</code
                          >
                          <span
                            class="text-slate-500 text-[10px] font-mono mt-0.5"
                            >Index: {{ input.index }}</span
                          >
                        </div>
                        <button
                          class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                          @click="
                            copyText(input.transaction_id, `Input #${idx} Hash`)
                          "
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                      <div
                        v-if="!decodedResult.data.body?.inputs?.length"
                        class="text-xs text-slate-500 italic p-2"
                      >
                        No inputs in transaction body.
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: OUTPUTS -->
                  <div
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('outputs')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Outputs ({{
                          decodedResult.data.body?.outputs?.length || 0
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': collapsedSections.outputs }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.outputs"
                      class="p-3 flex flex-col gap-3.5 max-h-[450px] overflow-y-auto pr-1.5 scrollbar-thin"
                    >
                      <div
                        v-for="(output, idx) in decodedResult.data.body
                          ?.outputs"
                        :key="idx"
                        class="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl space-y-3"
                      >
                        <div
                          class="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span
                            class="text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded w-max"
                          >
                            Output #{{ idx }}
                          </span>
                          <div
                            class="flex items-center gap-2 bg-fintech-black/30 border border-white/[0.03] p-1 px-2.5 rounded-lg max-w-full overflow-hidden"
                          >
                            <code
                              class="font-mono text-[10px] text-slate-300 truncate select-all"
                              >{{ output.address }}</code
                            >
                            <button
                              class="p-1 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer shrink-0"
                              @click="
                                copyText(
                                  output.address,
                                  `Output #${idx} Address`,
                                )
                              "
                            >
                              <svg
                                class="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div class="flex flex-col gap-2">
                          <!-- Amount Display -->
                          <div
                            class="text-xs font-semibold text-slate-400 flex items-center gap-1.5"
                          >
                            ADA Value:
                            <span class="text-emerald-400 font-bold font-mono"
                              >₳
                              {{
                                parseAmount(
                                  output.amount.coin,
                                ).ada.toLocaleString(undefined, {
                                  minimumFractionDigits: 6,
                                })
                              }}</span
                            >
                            <span class="text-[10px] text-slate-500 font-mono"
                              >({{ output.amount.coin }} Lovelace)</span
                            >
                          </div>

                          <!-- Multiasset Tokens -->
                          <div
                            v-if="
                              output.amount.multiasset &&
                              Object.keys(output.amount.multiasset).length > 0
                            "
                            class="flex flex-col gap-1 mt-1 border-t border-white/[0.02] pt-2"
                          >
                            <div
                              v-for="(assets, policy) in output.amount
                                .multiasset"
                              :key="policy"
                              class="text-[10px] space-y-1"
                            >
                              <div
                                class="text-slate-500 font-mono truncate select-all"
                              >
                                Policy: {{ policy }}
                              </div>
                              <div
                                v-for="(qty, nameHex) in assets"
                                :key="nameHex"
                                class="flex justify-between items-center text-slate-300 font-mono pl-3 py-0.5"
                              >
                                <span>- {{ decodeAssetName(nameHex) }}</span>
                                <span class="text-violet-400 font-bold">{{
                                  qty
                                }}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Inline Datum / Plutus Data in outputs -->
                          <div
                            v-if="output.plutus_data"
                            class="mt-2 border-t border-white/[0.02] pt-2"
                          >
                            <span
                              class="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-heading block mb-1"
                              >Inline Datum</span
                            >
                            <div
                              class="bg-violet-950/15 border border-violet-500/10 p-2.5 rounded-lg text-[11px] font-mono text-slate-300 max-h-[150px] overflow-y-auto scrollbar-thin whitespace-pre-wrap select-all"
                            >
                              {{ JSON.stringify(output.plutus_data, null, 2) }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="!decodedResult.data.body?.outputs?.length"
                        class="text-xs text-slate-500 italic p-2"
                      >
                        No outputs in transaction body.
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: COLLATERAL INPUTS (If any) -->
                  <div
                    v-if="decodedResult.data.body?.collateral?.length"
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('collateral')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Collateral Inputs ({{
                          decodedResult.data.body.collateral.length
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': collapsedSections.collateral }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.collateral"
                      class="p-3 flex flex-col gap-2"
                    >
                      <div
                        v-for="(coll, idx) in decodedResult.data.body
                          .collateral"
                        :key="idx"
                        class="flex gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs items-start"
                      >
                        <span class="font-bold text-amber-400">#{{ idx }}</span>
                        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                          <code
                            class="font-mono text-amber-300 break-all select-all"
                            >{{ coll.transaction_id }}</code
                          >
                          <span
                            class="text-slate-500 text-[10px] font-mono mt-0.5"
                            >Index: {{ coll.index }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: REFERENCE INPUTS (If any) -->
                  <div
                    v-if="decodedResult.data.body?.reference_inputs?.length"
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('referenceInputs')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Reference Inputs ({{
                          decodedResult.data.body.reference_inputs.length
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{
                          'rotate-180': collapsedSections.referenceInputs,
                        }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.referenceInputs"
                      class="p-3 flex flex-col gap-2"
                    >
                      <div
                        v-for="(refInput, idx) in decodedResult.data.body
                          .reference_inputs"
                        :key="idx"
                        class="flex gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs items-start"
                      >
                        <span class="font-bold text-sky-400">#{{ idx }}</span>
                        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                          <code
                            class="font-mono text-sky-300 break-all select-all"
                            >{{ refInput.transaction_id }}</code
                          >
                          <span
                            class="text-slate-500 text-[10px] font-mono mt-0.5"
                            >Index: {{ refInput.index }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: MINTING ASSETS (If any) -->
                  <div
                    v-if="
                      decodedResult.data.body?.mint &&
                      Object.keys(decodedResult.data.body.mint).length > 0
                    "
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('mint')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                        >Minted Assets</span
                      >
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': collapsedSections.mint }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.mint"
                      class="p-3 flex flex-col gap-3"
                    >
                      <div
                        v-for="(assets, policyId) in decodedResult.data.body
                          .mint"
                        :key="policyId"
                        class="border border-white/5 bg-white/[0.01] rounded-lg overflow-hidden"
                      >
                        <div
                          class="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 text-xs text-slate-500"
                        >
                          <span class="shrink-0 font-semibold">Policy:</span>
                          <code
                            class="font-mono text-slate-400 truncate flex-1 block select-all"
                            >{{ policyId }}</code
                          >
                        </div>
                        <div class="px-3 py-2 flex flex-col gap-1.5">
                          <div
                            v-for="(amount, nameHex) in assets"
                            :key="nameHex"
                            class="flex justify-between items-center text-xs"
                          >
                            <span class="font-medium text-slate-300">{{
                              decodeAssetName(nameHex)
                            }}</span>
                            <span
                              class="font-mono font-bold"
                              :class="
                                parseInt(amount) >= 0
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              "
                            >
                              {{ parseInt(amount) >= 0 ? "+" : "" }}{{ amount }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: REQUIRED SIGNERS (If any) -->
                  <div
                    v-if="decodedResult.data.body?.required_signers?.length"
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('requiredSigners')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Required Signers ({{
                          decodedResult.data.body.required_signers.length
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{
                          'rotate-180': collapsedSections.requiredSigners,
                        }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.requiredSigners"
                      class="p-3 flex flex-col gap-2"
                    >
                      <div
                        v-for="(signer, idx) in decodedResult.data.body
                          .required_signers"
                        :key="idx"
                        class="flex justify-between items-center gap-3 p-2 px-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs"
                      >
                        <code class="font-mono text-violet-300 select-all">{{
                          signer
                        }}</code>
                        <button
                          class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                          @click="copyText(signer, `Signer Key Hash #${idx}`)"
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: VALIDITY / TIME RANGE -->
                  <div
                    v-if="
                      decodedResult.data.body?.ttl ||
                      decodedResult.data.body?.validity_start_interval
                    "
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('validity')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                        >Validity Range (Slots)</span
                      >
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': collapsedSections.validity }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.validity"
                      class="p-3 space-y-3 text-xs"
                    >
                      <div
                        v-if="decodedResult.data.body?.validity_start_interval"
                        class="flex justify-between items-center py-1 border-b border-white/[0.02]"
                      >
                        <span class="text-slate-400">Validity Start Slot</span>
                        <span
                          class="font-mono font-semibold text-white select-all"
                          >{{
                            decodedResult.data.body.validity_start_interval
                          }}</span
                        >
                      </div>
                      <div
                        v-if="decodedResult.data.body?.ttl"
                        class="flex justify-between items-center py-1"
                      >
                        <span class="text-slate-400">TTL Slot (Expiry)</span>
                        <span
                          class="font-mono font-semibold text-white select-all"
                          >{{ decodedResult.data.body.ttl }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- OTHER DETAILS -->
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-1"
                  >
                    <div
                      v-if="decodedResult.data.body?.network_id !== null"
                      class="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex justify-between items-center"
                    >
                      <span class="text-slate-500 font-medium"
                        >Explicit Network ID</span
                      >
                      <span class="font-bold text-white">{{
                        decodedResult.data.body.network_id
                      }}</span>
                    </div>
                    <div
                      v-if="decodedResult.data.body?.auxiliary_data_hash"
                      class="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex flex-col gap-1 items-start"
                    >
                      <span
                        class="text-slate-500 font-medium font-heading text-[10px] uppercase"
                        >Auxiliary Data Hash</span
                      >
                      <code
                        class="font-mono text-violet-300 text-[10px] break-all select-all"
                        >{{ decodedResult.data.body.auxiliary_data_hash }}</code
                      >
                    </div>
                    <div
                      v-if="decodedResult.data.body?.script_data_hash"
                      class="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex flex-col gap-1 items-start"
                    >
                      <span
                        class="text-slate-500 font-medium font-heading text-[10px] uppercase"
                        >Script Data Hash</span
                      >
                      <code
                        class="font-mono text-violet-300 text-[10px] break-all select-all"
                        >{{ decodedResult.data.body.script_data_hash }}</code
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION 2: WITNESS SET -->
              <div
                class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all duration-200"
              >
                <div
                  class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all duration-150"
                  @click="toggleSection('witnessSet')"
                >
                  <div class="flex items-center gap-2">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span
                      class="font-bold text-xs text-slate-200 tracking-wide font-heading uppercase"
                      >Witness Set (Signatures)</span
                    >
                  </div>
                  <svg
                    class="w-4 h-4 text-slate-400 transition-transform duration-200"
                    :class="{ 'rotate-180': collapsedSections.witnessSet }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div
                  v-show="!collapsedSections.witnessSet"
                  class="p-4 flex flex-col gap-4"
                >
                  <!-- SUB-CARD: KEY WITNESSES -->
                  <div
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('keyWitnesses')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Cryptographic Signatures ({{
                          decodedResult.data.witness_set?.vkeys?.length || 0
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{
                          'rotate-180': collapsedSections.keyWitnesses,
                        }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.keyWitnesses"
                      class="p-3 flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1.5 scrollbar-thin"
                    >
                      <div
                        v-for="(witness, idx) in decodedResult.data.witness_set
                          ?.vkeys"
                        :key="idx"
                        class="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3"
                      >
                        <div
                          class="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-heading"
                        >
                          Signature Witness #{{ idx }}
                        </div>

                        <!-- Derived Key Hash -->
                        <div
                          v-if="witness.keyHash"
                          class="flex flex-col gap-1.5"
                        >
                          <span
                            class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold"
                            >🔑 Key Hash</span
                          >
                          <div
                            class="flex items-center justify-between gap-3 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg overflow-hidden"
                          >
                            <code
                              class="break-all text-emerald-300 font-mono text-[11px] select-all"
                              >{{ witness.keyHash }}</code
                            >
                            <button
                              class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                              @click="
                                copyText(witness.keyHash, `Key Hash #${idx}`)
                              "
                            >
                              <svg
                                class="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <!-- Bech32 Format -->
                        <div
                          v-if="witness.bech32"
                          class="flex flex-col gap-1.5"
                        >
                          <span
                            class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold"
                            >🔒 Public Key (Bech32)</span
                          >
                          <div
                            class="flex items-center justify-between gap-3 bg-violet-950/20 border border-violet-500/10 p-2.5 rounded-lg overflow-hidden"
                          >
                            <code
                              class="break-all text-violet-300 font-mono text-[11px] select-all"
                              >{{ witness.bech32 }}</code
                            >
                            <button
                              class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                              @click="
                                copyText(witness.bech32, `Public Key #${idx}`)
                              "
                            >
                              <svg
                                class="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <!-- Signature (Collapsible within the witness card) -->
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center justify-between">
                            <span
                              class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold"
                              >Signature Hex</span
                            >
                            <button
                              class="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                              @click="
                                copyText(witness.signature, `Signature #${idx}`)
                              "
                            >
                              Copy Signature
                            </button>
                          </div>
                          <div
                            class="bg-fintech-black/50 border border-white/5 p-2 px-3 rounded-lg max-h-[100px] overflow-y-auto scrollbar-thin select-all text-[11px] font-mono text-slate-400 break-all leading-normal"
                          >
                            {{ witness.signature }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="!decodedResult.data.witness_set?.vkeys?.length"
                        class="text-xs text-slate-500 italic p-2"
                      >
                        No cryptographic signatures found.
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: PLUTUS DATA / DATUM DICTIONARY (If any) -->
                  <div
                    v-if="decodedResult.data.witness_set?.plutus_data?.length"
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('plutusData')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Witness Plutus Data / Datums ({{
                          decodedResult.data.witness_set.plutus_data.length
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': collapsedSections.plutusData }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.plutusData"
                      class="p-3 flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1.5"
                    >
                      <div
                        v-for="(datum, idx) in decodedResult.data.witness_set
                          .plutus_data"
                        :key="idx"
                        class="p-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs"
                      >
                        <div class="flex items-center justify-between mb-1.5">
                          <span
                            class="font-bold text-purple-400 font-heading text-[10px] uppercase"
                            >Datum #{{ idx }}</span
                          >
                          <button
                            class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                            @click="
                              copyText(JSON.stringify(datum), `Datum #${idx}`)
                            "
                          >
                            <svg
                              class="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                          </button>
                        </div>
                        <pre
                          class="font-mono text-slate-300 leading-normal overflow-x-auto select-all bg-fintech-black/30 p-2 rounded border border-white/[0.02]"
                          >{{ JSON.stringify(datum, null, 2) }}</pre
                        >
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: PLUTUS SCRIPTS (If any) -->
                  <div
                    v-if="
                      decodedResult.data.witness_set?.plutus_scripts?.length
                    "
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('plutusScripts')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Witness Plutus Scripts ({{
                          decodedResult.data.witness_set.plutus_scripts.length
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{
                          'rotate-180': collapsedSections.plutusScripts,
                        }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.plutusScripts"
                      class="p-3 flex flex-col gap-2"
                    >
                      <div
                        v-for="(script, idx) in decodedResult.data.witness_set
                          .plutus_scripts"
                        :key="idx"
                        class="flex flex-col gap-1 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs"
                      >
                        <span
                          class="font-bold text-rose-400 font-heading text-[10px] uppercase"
                          >Script #{{ idx }}</span
                        >
                        <div
                          class="text-[10px] text-slate-400 font-mono mt-0.5"
                        >
                          Type:
                          <span class="text-slate-200 font-semibold">{{
                            script.language || "PlutusV2"
                          }}</span>
                        </div>
                        <div
                          class="text-[10px] text-slate-400 font-mono mt-0.5 break-all select-all"
                        >
                          Bytes:
                          <span class="text-slate-300">{{ script.bytes }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SUB-CARD: REDEEMERS (If any) -->
                  <div
                    v-if="decodedResult.data.witness_set?.redeemers?.length"
                    class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
                  >
                    <div
                      class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
                      @click="toggleSection('redeemers')"
                    >
                      <span
                        class="text-xs font-semibold text-slate-300 font-heading"
                      >
                        Witness Redeemers ({{
                          decodedResult.data.witness_set.redeemers.length
                        }})
                      </span>
                      <svg
                        class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': collapsedSections.redeemers }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    <div
                      v-show="!collapsedSections.redeemers"
                      class="p-3 flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1.5"
                    >
                      <div
                        v-for="(red, idx) in decodedResult.data.witness_set
                          .redeemers"
                        :key="idx"
                        class="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl text-xs space-y-2.5"
                      >
                        <div class="flex items-center justify-between">
                          <span
                            class="font-bold text-rose-400 font-heading text-[10px] uppercase"
                            >Redeemer #{{ idx }}</span
                          >
                          <span
                            class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          >
                            Tag: {{ red.tag }}
                          </span>
                        </div>

                        <div
                          class="grid grid-cols-2 gap-3 text-[10px] text-slate-400 leading-normal"
                        >
                          <div>
                            Index:
                            <span
                              class="text-slate-200 font-mono font-semibold"
                              >{{ red.index }}</span
                            >
                          </div>
                          <div>
                            Execution Units:
                            <span
                              class="text-slate-200 font-mono font-semibold"
                            >
                              (Mem: {{ red.ex_units?.mem }}, Steps:
                              {{ red.ex_units?.steps }})
                            </span>
                          </div>
                        </div>

                        <div
                          class="space-y-1 mt-1 border-t border-white/[0.02] pt-2"
                        >
                          <span
                            class="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-heading"
                            >Redeemer Data</span
                          >
                          <pre
                            class="font-mono text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all bg-fintech-black/30 p-2 rounded border border-white/[0.02]"
                            >{{ JSON.stringify(red.data, null, 2) }}</pre
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION 3: AUXILIARY DATA (If any) -->
              <div
                v-if="decodedResult.data.auxiliary_data"
                class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all duration-200"
              >
                <div
                  class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all duration-150"
                  @click="toggleSection('auxData')"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-violet-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span
                      class="font-bold text-xs text-slate-200 tracking-wide font-heading uppercase"
                      >Auxiliary Data (Metadata)</span
                    >
                  </div>
                  <svg
                    class="w-4 h-4 text-slate-400 transition-transform duration-200"
                    :class="{ 'rotate-180': collapsedSections.auxData }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <div v-show="!collapsedSections.auxData" class="p-4 space-y-3">
                  <pre
                    class="font-mono text-xs text-slate-300 leading-normal overflow-x-auto whitespace-pre-wrap select-all bg-fintech-black/40 p-4 rounded-xl border border-white/5"
                    >{{
                      JSON.stringify(decodedResult.data.auxiliary_data, null, 2)
                    }}</pre
                  >
                </div>
              </div>
            </template>
          </div>

          <!-- JSON View -->
          <div
            v-else-if="activeTab === 'json'"
            class="flex flex-col flex-1 relative border border-white/5 rounded-xl bg-fintech-dark overflow-hidden"
          >
            <button
              class="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-[10px] text-slate-300 hover:text-white font-semibold cursor-pointer backdrop-blur-md transition-all duration-200"
              title="Copy JSON"
              @click="
                copyText(JSON.stringify(decodedResult.data, null, 2), 'JSON')
              "
            >
              Copy JSON
            </button>
            <div
              class="max-h-[600px] overflow-auto scrollbar-thin text-xs font-mono flex-1"
            >
              <!-- Highlighted Output container -->
              <div
                v-html="highlightedJson"
                class="p-4 [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent"
              ></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="flex flex-col items-center justify-center p-12 py-24 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] flex-1 text-slate-500 text-sm gap-3"
        >
          <svg
            class="w-8 h-8 text-slate-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p v-if="isDecoding">Decoding CBOR string...</p>
          <p v-else>Decoded results will be displayed here in detail.</p>
        </div>
      </div>
    </div>
  </div>
</template>
