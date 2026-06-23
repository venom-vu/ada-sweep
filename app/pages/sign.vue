<script setup lang="ts">
import { ref, computed } from "vue";
import { toast } from "vue-sonner";
import { useWalletStore } from "~/stores/wallet";

definePageMeta({
  layout: "dashboard",
});

const walletStore = useWalletStore();

const textInput = ref("");
const isSigning = ref(false);
const signatureHex = ref("");
const keyHex = ref("");
const signError = ref<string | null>(null);

// Hex representation of inputs
const hexOutput = computed(() => {
  if (!textInput.value) return "";
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(textInput.value);
    return walletStore.toHex(bytes);
  } catch (err) {
    return "";
  }
});

const isEternl = computed(() => {
  return walletStore.isConnected && walletStore.walletName === "eternl";
});

const canSign = computed(() => {
  return isEternl.value && hexOutput.value.length > 0 && !isSigning.value;
});

const signMessage = async () => {
  if (!canSign.value) return;
  isSigning.value = true;
  signError.value = null;
  signatureHex.value = "";
  keyHex.value = "";

  try {
    const api = walletStore.walletApi;
    if (!api) throw new Error("Wallet connection not found");

    const changeAddressHex = await api.getChangeAddress();
    const result = await api.signData(changeAddressHex, hexOutput.value);

    if (result && result.signature && result.key) {
      signatureHex.value = result.signature;
      keyHex.value = result.key;
      toast.success("Data signed successfully!");
    } else {
      throw new Error("Wallet did not return a valid signature format");
    }
  } catch (err: any) {
    console.error(err);
    signError.value =
      err.info || err.message || JSON.stringify(err) || "Error signing data";
    toast.error(`Signing failed: ${signError.value}`);
  } finally {
    isSigning.value = false;
  }
};

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}!`);
  } catch (err) {
    toast.error("Failed to copy data");
  }
};

useSeoMeta({
  title: "Eternl Wallet Data Signing & CIP-30 Signature Generator — ADASweep",
  ogTitle: "Eternl Wallet Data Signing & CIP-30 Signature Generator — ADASweep",
  description:
    "Sign plain text messages and data hexes securely using your Cardano Eternl wallet. Fulfills CIP-30 data signing standards for address ownership verification.",
  ogDescription:
    "Sign plain text messages and data hexes securely using your Cardano Eternl wallet. Fulfills CIP-30 data signing standards for address ownership verification.",
  keywords:
    "Cardano data signing tool, Eternl sign message, CIP-30 message signing, Cardano sign data hex, verify Cardano address signature, Eternl CIP-30 signature generator",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Eternl Wallet Data Signing & CIP-30 Generator — ADASweep",
        "url": "https://adasweep.xyz/sign",
        "description": "A developer tool to perform plain text message signing and data hex signature generation using the Cardano Eternl wallet based on the CIP-30 standard.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
      }),
    },
  ],
});
</script>

<template>
  <ClientOnly>
    <div
      v-if="walletStore.isConnected"
      class="flex flex-col gap-8 animate-fade-in"
    >
      <h1 class="sr-only">Eternl Wallet Data Signing (CIP-30)</h1>
      <!-- Wallet gating message -->
      <div
        v-if="!isEternl"
        class="flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400 text-xs"
      >
        <div class="shrink-0 text-amber-400">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="font-bold text-amber-200">Unsupported Connected Wallet</h4>
          <p class="leading-normal text-slate-300">
            Data signing is currently only supported when connected via the
            **Eternl** wallet. Your current wallet is
            <span class="text-violet-400 capitalize font-semibold">{{
              walletStore.walletName || "Not Connected"
            }}</span
            >. Please disconnect and reconnect using Eternl.
          </p>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <!-- Input section -->
        <div class="glass-card p-6 flex flex-col min-h-[400px]">
          <h2
            id="sign-input-heading"
            class="text-sm font-semibold text-white tracking-wide font-heading mb-4 pb-2 border-b border-white/[0.04]"
          >
            MESSAGE TO SIGN
          </h2>

          <div class="flex flex-col gap-2">
            <label
              for="plain-text"
              class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
              >Plain Text</label
            >
            <textarea
              id="plain-text"
              v-model="textInput"
              :disabled="!isEternl"
              placeholder="Enter message to sign here..."
              class="w-full bg-fintech-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-sans text-sm focus:border-fintech-purple focus:ring-1 focus:ring-fintech-purple/50 transition-all duration-200 outline-none resize-y disabled:opacity-40 disabled:cursor-not-allowed"
              rows="6"
            ></textarea>
            <div class="text-[10px] text-slate-500 font-sans text-right mt-1">
              {{ textInput.length }} characters
            </div>
          </div>

          <div class="flex flex-col gap-2 mt-4">
            <label
              class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
              >Corresponding Hex (UTF-8 bytes)</label
            >
            <div
              class="bg-fintech-black/50 border border-white/5 p-3 rounded-lg flex items-center min-h-[50px] overflow-hidden"
            >
              <code
                v-if="hexOutput"
                class="font-mono text-xs text-violet-300 break-all select-all"
                >{{ hexOutput }}</code
              >
              <span v-else class="text-xs text-slate-600"
                >Automatically encoded Hex will be displayed here...</span
              >
            </div>
          </div>

          <button
            id="sign-message-button"
            class="w-full mt-6 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer"
            :disabled="!canSign"
            @click="signMessage"
          >
            <span v-if="isSigning" class="flex items-center gap-2">
              <svg
                class="animate-spin w-4 h-4 text-white"
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
              Calling wallet...
            </span>
            <span v-else>Sign Message</span>
          </button>
        </div>

        <!-- Output section -->
        <div class="glass-card p-6 flex flex-col min-h-[400px]">
          <h2
            id="sign-output-heading"
            class="text-sm font-semibold text-white tracking-wide font-heading mb-4 pb-2 border-b border-white/[0.04]"
          >
            GENERATED SIGNATURE
          </h2>

          <div v-if="signatureHex && keyHex" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center mb-1">
                <label
                  class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >Signature (Signature Hex)</label
                >
                <button
                  id="copy-signature-btn"
                  class="px-2 py-0.5 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded transition-all duration-200 cursor-pointer shrink-0"
                  @click="copyToClipboard(signatureHex, 'Signature')"
                >
                  Copy
                </button>
              </div>
              <div
                class="bg-fintech-black/50 border border-white/5 p-3 rounded-lg flex items-start max-h-[120px] overflow-y-auto scrollbar-thin"
              >
                <code
                  class="font-mono text-xs text-violet-300 break-all select-all"
                  >{{ signatureHex }}</code
                >
              </div>
            </div>

            <div class="flex flex-col gap-1 mt-2">
              <div class="flex justify-between items-center mb-1">
                <label
                  class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >Public Key (Key Hex)</label
                >
                <button
                  id="copy-publickey-btn"
                  class="px-2 py-0.5 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded transition-all duration-200 cursor-pointer shrink-0"
                  @click="copyToClipboard(keyHex, 'Public Key')"
                >
                  Copy
                </button>
              </div>
              <div
                class="bg-fintech-black/50 border border-white/5 p-3 rounded-lg flex items-start max-h-[120px] overflow-y-auto scrollbar-thin"
              >
                <code
                  class="font-mono text-xs text-violet-300 break-all select-all"
                  >{{ keyHex }}</code
                >
              </div>
            </div>
          </div>

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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <p v-if="isSigning">
              Please sign the message in your Eternl wallet popup...
            </p>
            <p v-else-if="signError" class="text-rose-400 font-semibold">
              Error: {{ signError }}
            </p>
            <p v-else>
              Signing results will be displayed here after you sign the message
              in the left panel.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <WalletGate
        title="Signing Tool Locked"
        description="Please connect your Eternl wallet to sign plain text messages securely using your private keys (CIP-30 standard)."
      />
    </div>
  </ClientOnly>
</template>
