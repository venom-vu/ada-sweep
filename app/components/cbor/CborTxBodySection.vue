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
  <!-- SECTION 1: TRANSACTION BODY -->
  <div
    class="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden transition-all duration-200"
  >
    <div
      class="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all duration-150"
      @click="emit('toggle', 'txBody')"
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <div v-show="!collapsedSections.txBody" class="p-4 flex flex-col gap-4">
      <!-- SUB-CARD: INPUTS -->
      <div
        class="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden"
      >
        <div
          class="px-3 py-2 bg-white/[0.015] border-b border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.025] transition-all duration-150"
          @click="emit('toggle', 'inputs')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
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
            <span class="font-bold text-violet-400">#{{ idx }}</span>
            <div class="flex flex-col gap-1 flex-1 min-w-0">
              <code class="font-mono text-violet-300 break-all select-all">{{
                input.transaction_id
              }}</code>
              <span class="text-slate-500 text-[10px] font-mono mt-0.5"
                >Index: {{ input.index }}</span
              >
            </div>
            <button
              class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
              @click="emit('copy', input.transaction_id, `Input #${idx} Hash`)"
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
          @click="emit('toggle', 'outputs')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div
          v-show="!collapsedSections.outputs"
          class="p-3 flex flex-col gap-3.5 max-h-[450px] overflow-y-auto pr-1.5 scrollbar-thin"
        >
          <div
            v-for="(output, idx) in decodedResult.data.body?.outputs"
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
                <code class="font-mono text-[10px] text-slate-300 truncate select-all">{{
                  output.address
                }}</code>
                <button
                  class="p-1 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer shrink-0"
                  @click="emit('copy', output.address, `Output #${idx} Address`)"
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
              <div class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                ADA Value:
                <span class="text-emerald-400 font-bold font-mono"
                  >₳
                  {{
                    parseAmount(output.amount.coin).ada.toLocaleString(undefined, {
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
                  v-for="(assets, policy) in output.amount.multiasset"
                  :key="policy"
                  class="text-[10px] space-y-1"
                >
                  <div class="text-slate-500 font-mono truncate select-all">
                    Policy: {{ policy }}
                  </div>
                  <div
                    v-for="(qty, nameHex) in assets"
                    :key="nameHex"
                    class="flex justify-between items-center text-slate-300 font-mono pl-3 py-0.5"
                  >
                    <span>- {{ decodeAssetName(nameHex) }}</span>
                    <span class="text-violet-400 font-bold">{{ qty }}</span>
                  </div>
                </div>
              </div>

              <!-- Inline Datum -->
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
          @click="emit('toggle', 'collateral')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div v-show="!collapsedSections.collateral" class="p-3 flex flex-col gap-2">
          <div
            v-for="(coll, idx) in decodedResult.data.body.collateral"
            :key="idx"
            class="flex gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs items-start"
          >
            <span class="font-bold text-amber-400">#{{ idx }}</span>
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <code class="font-mono text-amber-300 break-all select-all">{{
                coll.transaction_id
              }}</code>
              <span class="text-slate-500 text-[10px] font-mono mt-0.5"
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
          @click="emit('toggle', 'referenceInputs')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
            Reference Inputs ({{
              decodedResult.data.body.reference_inputs.length
            }})
          </span>
          <svg
            class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
            :class="{ 'rotate-180': collapsedSections.referenceInputs }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div
          v-show="!collapsedSections.referenceInputs"
          class="p-3 flex flex-col gap-2"
        >
          <div
            v-for="(refInput, idx) in decodedResult.data.body.reference_inputs"
            :key="idx"
            class="flex gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs items-start"
          >
            <span class="font-bold text-sky-400">#{{ idx }}</span>
            <div class="flex flex-col gap-0.5 flex-1 min-w-0">
              <code class="font-mono text-sky-300 break-all select-all">{{
                refInput.transaction_id
              }}</code>
              <span class="text-slate-500 text-[10px] font-mono mt-0.5"
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
          @click="emit('toggle', 'mint')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading"
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div v-show="!collapsedSections.mint" class="p-3 flex flex-col gap-3">
          <div
            v-for="(assets, policyId) in decodedResult.data.body.mint"
            :key="policyId"
            class="border border-white/5 bg-white/[0.01] rounded-lg overflow-hidden"
          >
            <div
              class="px-3 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 text-xs text-slate-500"
            >
              <span class="shrink-0 font-semibold">Policy:</span>
              <code class="font-mono text-slate-400 truncate flex-1 block select-all">{{
                policyId
              }}</code>
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
                    parseInt(amount) >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
          @click="emit('toggle', 'requiredSigners')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading">
            Required Signers ({{
              decodedResult.data.body.required_signers.length
            }})
          </span>
          <svg
            class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
            :class="{ 'rotate-180': collapsedSections.requiredSigners }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div
          v-show="!collapsedSections.requiredSigners"
          class="p-3 flex flex-col gap-2"
        >
          <div
            v-for="(signer, idx) in decodedResult.data.body.required_signers"
            :key="idx"
            class="flex justify-between items-center gap-3 p-2 px-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs"
          >
            <code class="font-mono text-violet-300 select-all">{{ signer }}</code>
            <button
              class="p-1 text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-md transition-all duration-200 cursor-pointer shrink-0"
              @click="emit('copy', signer, `Signer Key Hash #${idx}`)"
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
          @click="emit('toggle', 'validity')"
        >
          <span class="text-xs font-semibold text-slate-300 font-heading"
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div v-show="!collapsedSections.validity" class="p-3 space-y-3 text-xs">
          <div
            v-if="decodedResult.data.body?.validity_start_interval"
            class="flex justify-between items-center py-1 border-b border-white/[0.02]"
          >
            <span class="text-slate-400">Validity Start Slot</span>
            <span class="font-mono font-semibold text-white select-all">{{
              decodedResult.data.body.validity_start_interval
            }}</span>
          </div>
          <div
            v-if="decodedResult.data.body?.ttl"
            class="flex justify-between items-center py-1"
          >
            <span class="text-slate-400">TTL Slot (Expiry)</span>
            <span class="font-mono font-semibold text-white select-all">{{
              decodedResult.data.body.ttl
            }}</span>
          </div>
        </div>
      </div>

      <!-- OTHER DETAILS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-1">
        <div
          v-if="decodedResult.data.body?.network_id !== null"
          class="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex justify-between items-center"
        >
          <span class="text-slate-500 font-medium">Explicit Network ID</span>
          <span class="font-bold text-white">{{
            decodedResult.data.body.network_id
          }}</span>
        </div>
        <div
          v-if="decodedResult.data.body?.auxiliary_data_hash"
          class="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex flex-col gap-1 items-start"
        >
          <span class="text-slate-500 font-medium font-heading text-[10px] uppercase"
            >Auxiliary Data Hash</span
          >
          <code class="font-mono text-violet-300 text-[10px] break-all select-all">{{
            decodedResult.data.body.auxiliary_data_hash
          }}</code>
        </div>
        <div
          v-if="decodedResult.data.body?.script_data_hash"
          class="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex flex-col gap-1 items-start"
        >
          <span class="text-slate-500 font-medium font-heading text-[10px] uppercase"
            >Script Data Hash</span
          >
          <code class="font-mono text-violet-300 text-[10px] break-all select-all">{{
            decodedResult.data.body.script_data_hash
          }}</code>
        </div>
      </div>
    </div>
  </div>
</template>
