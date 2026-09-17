<script setup lang="ts">
import type { DecodedResult } from "~/utils/cborDecoder";

defineProps<{
  decodedResult: DecodedResult;
}>();

const emit = defineEmits<{
  copy: [text: string, label: string];
}>();
</script>

<template>
  <div class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden">
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
          <code class="break-all text-violet-300 font-mono text-xs select-all"
            >{{ decodedResult.data.bech32 }}</code
          >
          <button
            class="p-1.5 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
            @click="emit('copy', decodedResult.data.bech32, 'Address')"
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
</template>
