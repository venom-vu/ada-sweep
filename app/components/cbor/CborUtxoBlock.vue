<script setup lang="ts">
import type { DecodedResult } from "~/utils/cborDecoder";

defineProps<{
  decodedResult: DecodedResult;
}>();

const emit = defineEmits<{
  copy: [text: string, label: string];
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
        <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          UTXO Source (Input)
        </h4>
        <div class="bg-white/[0.01] border border-white/5 p-4 rounded-lg space-y-3">
          <div class="flex flex-col gap-1.5">
            <span
              class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
              >Tx Hash</span
            >
            <div
              class="flex justify-between items-center gap-3 bg-fintech-black/50 border border-white/5 p-2 px-3 rounded-lg overflow-hidden"
            >
              <code class="break-all font-mono text-violet-300 text-xs select-all"
                >{{ decodedResult.data.input.transaction_id }}</code
              >
              <button
                class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                @click="
                  emit(
                    'copy',
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
            <code class="font-mono text-sm text-white select-all mt-0.5">{{
              decodedResult.data.input.index
            }}</code>
          </div>
        </div>
      </div>

      <!-- Output payload -->
      <div class="space-y-2 mt-4">
        <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          UTXO Allocation (Output)
        </h4>
        <div class="bg-white/[0.01] border border-white/5 p-4 rounded-lg space-y-4">
          <div class="flex flex-col gap-1.5">
            <span
              class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
              >Target Address</span
            >
            <div
              class="flex justify-between items-center gap-3 bg-fintech-black/50 border border-white/5 p-2 px-3 rounded-lg overflow-hidden"
            >
              <code class="break-all font-mono text-violet-300 text-xs select-all"
                >{{ decodedResult.data.output.address }}</code
              >
              <button
                class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                @click="
                  emit('copy', decodedResult.data.output.address, 'Address')
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
            <div class="text-[10px] uppercase text-slate-400 tracking-wider">
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
                Object.keys(decodedResult.data.output.amount.multiasset).length >
                  0
              "
              class="flex flex-col gap-2 mt-1.5"
            >
              <div
                v-for="(assets, policyId) in decodedResult.data.output.amount
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
                  JSON.stringify(decodedResult.data.output.plutus_data, null, 2)
                }}</pre
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
