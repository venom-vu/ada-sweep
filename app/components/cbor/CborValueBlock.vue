<script setup lang="ts">
import type { DecodedResult } from "~/utils/cborDecoder";

defineProps<{
  decodedResult: DecodedResult;
}>();

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

const parseAmount = (coinStr: string) => {
  const lovelace = parseInt(coinStr) || 0;
  return { lovelace, ada: lovelace / 1000000 };
};
</script>

<template>
  <div class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden">
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
        <div class="text-[10px] uppercase text-slate-400 tracking-wider">
          Total ADA Balance
        </div>
        <div class="text-2xl font-black text-white mt-1.5">
          ₳
          {{
            parseAmount(decodedResult.data.coin).ada.toLocaleString(undefined, {
              minimumFractionDigits: 6,
            })
          }}
        </div>
        <div class="text-[10px] text-slate-500 font-mono mt-1">
          {{ decodedResult.data.coin }} Lovelace
        </div>
      </div>

      <!-- Tokens subsection -->
      <div class="space-y-2 mt-4">
        <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
            v-for="(assets, policyId) in decodedResult.data.multiasset"
            :key="policyId"
            class="border border-white/5 bg-white/[0.01] rounded-lg overflow-hidden"
          >
            <div
              class="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 text-xs text-slate-500"
            >
              <span class="shrink-0 font-semibold">Policy:</span>
              <code class="font-mono text-slate-400 truncate flex-1 block select-all"
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
                <span class="font-mono text-violet-400 font-semibold">{{
                  amount
                }}</span>
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
</template>
