<script setup lang="ts">
import type { DecodedResult } from "~/utils/cborDecoder";

defineProps<{
  decodedResult: DecodedResult;
  collapsedSections: Record<string, boolean>;
}>();

const emit = defineEmits<{
  toggle: [section: string];
  copy: [text: string, label: string];
}>();
</script>

<template>
  <!-- SECTION 2: WITNESS SET -->
  <div
    class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all duration-200"
  >
    <div
      class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all duration-150"
      @click="emit('toggle', 'witnessSet')"
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <div v-show="!collapsedSections.witnessSet" class="p-4 flex flex-col gap-4">
      <!-- SUB-CARD: KEY WITNESSES -->
      <div
        class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
      >
        <div
          class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
          @click="emit('toggle', 'keyWitnesses')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
            Cryptographic Signatures ({{
              decodedResult.data.witness_set?.vkeys?.length || 0
            }})
          </span>
          <svg
            class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
            :class="{ 'rotate-180': collapsedSections.keyWitnesses }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div
          v-show="!collapsedSections.keyWitnesses"
          class="p-3 flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1.5 scrollbar-thin"
        >
          <div
            v-for="(witness, idx) in decodedResult.data.witness_set?.vkeys"
            :key="idx"
            class="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3"
          >
            <div
              class="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-heading"
            >
              Signature Witness #{{ idx }}
            </div>

            <!-- Derived Key Hash -->
            <div v-if="witness.keyHash" class="flex flex-col gap-1.5">
              <span
                class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold"
                >🔑 Key Hash</span
              >
              <div
                class="flex items-center justify-between gap-3 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg overflow-hidden"
              >
                <code class="break-all text-emerald-300 font-mono text-[11px] select-all">{{
                  witness.keyHash
                }}</code>
                <button
                  class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                  @click="emit('copy', witness.keyHash, `Key Hash #${idx}`)"
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
            <div v-if="witness.bech32" class="flex flex-col gap-1.5">
              <span
                class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold"
                >🔒 Public Key (Bech32)</span
              >
              <div
                class="flex items-center justify-between gap-3 bg-violet-950/20 border border-violet-500/10 p-2.5 rounded-lg overflow-hidden"
              >
                <code class="break-all text-violet-300 font-mono text-[11px] select-all">{{
                  witness.bech32
                }}</code>
                <button
                  class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                  @click="emit('copy', witness.bech32, `Public Key #${idx}`)"
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

            <!-- Signature -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <span
                  class="text-[9px] text-slate-500 uppercase tracking-wider font-semibold"
                  >Signature Hex</span
                >
                <button
                  class="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                  @click="emit('copy', witness.signature, `Signature #${idx}`)"
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
          @click="emit('toggle', 'plutusData')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div
          v-show="!collapsedSections.plutusData"
          class="p-3 flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1.5"
        >
          <div
            v-for="(datum, idx) in decodedResult.data.witness_set.plutus_data"
            :key="idx"
            class="p-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs"
          >
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-bold text-purple-400 font-heading text-[10px] uppercase"
                >Datum #{{ idx }}</span
              >
              <button
                class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
                @click="emit('copy', JSON.stringify(datum), `Datum #${idx}`)"
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
        v-if="decodedResult.data.witness_set?.plutus_scripts?.length"
        class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
      >
        <div
          class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
          @click="emit('toggle', 'plutusScripts')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
            Witness Plutus Scripts ({{
              decodedResult.data.witness_set.plutus_scripts.length
            }})
          </span>
          <svg
            class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
            :class="{ 'rotate-180': collapsedSections.plutusScripts }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div v-show="!collapsedSections.plutusScripts" class="p-3 flex flex-col gap-2">
          <div
            v-for="(script, idx) in decodedResult.data.witness_set.plutus_scripts"
            :key="idx"
            class="flex flex-col gap-1 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs"
          >
            <span class="font-bold text-rose-400 font-heading text-[10px] uppercase"
              >Script #{{ idx }}</span
            >
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">
              Type:
              <span class="text-slate-200 font-semibold">{{
                script.language || "PlutusV2"
              }}</span>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5 break-all select-all">
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
          @click="emit('toggle', 'redeemers')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div
          v-show="!collapsedSections.redeemers"
          class="p-3 flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1.5"
        >
          <div
            v-for="(red, idx) in decodedResult.data.witness_set.redeemers"
            :key="idx"
            class="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl text-xs space-y-2.5"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-rose-400 font-heading text-[10px] uppercase"
                >Redeemer #{{ idx }}</span
              >
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"
              >
                Tag: {{ red.tag }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-[10px] text-slate-400 leading-normal">
              <div>
                Index:
                <span class="text-slate-200 font-mono font-semibold">{{
                  red.index
                }}</span>
              </div>
              <div>
                Execution Units:
                <span class="text-slate-200 font-mono font-semibold">
                  (Mem: {{ red.ex_units?.mem }}, Steps:
                  {{ red.ex_units?.steps }})
                </span>
              </div>
            </div>

            <div class="space-y-1 mt-1 border-t border-white/[0.02] pt-2">
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
</template>
