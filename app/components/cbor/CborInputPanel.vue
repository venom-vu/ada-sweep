<script setup lang="ts">
import type { DecodedResult } from "~/utils/cborDecoder";

defineProps<{
  modelValue: string;
  isDecoding: boolean;
  decodedResult: DecodedResult | null;
  decodeError: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  clear: [];
}>();
</script>

<template>
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
        v-if="modelValue"
        id="cbor-clear-btn"
        class="text-xs font-semibold text-slate-500 hover:text-white px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] transition-all duration-200 cursor-pointer"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>

    <div class="relative flex-1 flex flex-col">
      <textarea
        id="cbor-input-textarea"
        :value="modelValue"
        placeholder="Paste CBOR hex here (e.g. 84a300d90102... or 1a075bcd15)"
        class="w-full flex-1 min-h-[260px] bg-fintech-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono text-xs focus:border-fintech-purple focus:ring-1 focus:ring-fintech-purple/50 transition-all duration-200 outline-none resize-none"
        rows="12"
        @input="
          emit(
            'update:modelValue',
            ($event.target as HTMLTextAreaElement).value,
          )
        "
      ></textarea>
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
</template>
