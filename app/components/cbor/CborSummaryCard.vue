<script setup lang="ts">
import type { DecodedResult } from "~/utils/cborDecoder";

const props = defineProps<{
  decodedResult: DecodedResult;
}>();

const emit = defineEmits<{
  copy: [text: string, label: string];
}>();

const parseAmount = (coinStr: string) => {
  const lovelace = parseInt(coinStr) || 0;
  return { lovelace, ada: lovelace / 1000000 };
};
</script>

<template>
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
          <code class="break-all text-violet-300 font-mono text-xs select-all"
            >{{ decodedResult.txHash }}</code
          >
          <button
            class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
            title="Copy Transaction Hash"
            @click="emit('copy', decodedResult.txHash!, 'Transaction Hash')"
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
          <span class="text-base font-bold text-slate-200 font-mono text-sm mt-0.5"
            >{{ decodedResult.size }} B</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
