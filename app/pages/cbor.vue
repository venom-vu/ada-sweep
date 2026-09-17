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
      let cls = "text-amber-400";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-violet-400 font-semibold";
        } else {
          cls = "text-emerald-400";
        }
      } else if (/true|false/.test(match)) {
        cls = "text-blue-400";
      } else if (/null/.test(match)) {
        cls = "text-slate-500";
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

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}!`);
  } catch (e) {
    toast.error("Failed to copy text");
  }
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
    <h1 class="sr-only">Cardano CBOR Decoder &amp; Transaction Deserializer</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Input Panel -->
      <CborInputPanel
        v-model="cborInput"
        :is-decoding="isDecoding"
        :decoded-result="decodedResult"
        :decode-error="decodeError"
        @clear="clearInput"
      />

      <!-- Result Panel -->
      <div class="glass-card col-span-1 lg:col-span-2 p-6 flex flex-col min-h-[450px]">
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
          <CborSummaryCard :decoded-result="decodedResult" @copy="copyText" />

          <!-- Cards View -->
          <div v-if="activeTab === 'block'" class="flex flex-col gap-5">
            <!-- ADDRESS BLOCK -->
            <CborAddressBlock
              v-if="decodedResult.type === 'Address'"
              :decoded-result="decodedResult"
              @copy="copyText"
            />

            <!-- VALUE BLOCK -->
            <CborValueBlock
              v-else-if="decodedResult.type === 'Value'"
              :decoded-result="decodedResult"
            />

            <!-- UTXO BLOCK -->
            <CborUtxoBlock
              v-else-if="decodedResult.type === 'UTXO'"
              :decoded-result="decodedResult"
              @copy="copyText"
            />

            <!-- TRANSACTION FULL CARDS -->
            <template v-else-if="decodedResult.type === 'Transaction'">
              <CborTxBodySection
                :decoded-result="decodedResult"
                :collapsed-sections="collapsedSections"
                @toggle="toggleSection"
                @copy="copyText"
              />
              <CborWitnessSection
                :decoded-result="decodedResult"
                :collapsed-sections="collapsedSections"
                @toggle="toggleSection"
                @copy="copyText"
              />
              <CborAuxDataSection
                :decoded-result="decodedResult"
                :collapsed-sections="collapsedSections"
                @toggle="toggleSection"
              />
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
