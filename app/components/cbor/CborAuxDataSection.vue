<script setup lang="ts">
import type { DecodedResult } from "~/utils/cborDecoder";

defineProps<{
  decodedResult: DecodedResult;
  collapsedSections: Record<string, boolean>;
}>();

const emit = defineEmits<{
  toggle: [section: string];
}>();
</script>

<template>
  <!-- SECTION 3: AUXILIARY DATA (If any) -->
  <div
    v-if="decodedResult.data.auxiliary_data"
    class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all duration-200"
  >
    <div
      class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all duration-150"
      @click="emit('toggle', 'auxData')"
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
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
