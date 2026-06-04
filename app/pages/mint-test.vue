<script setup lang="ts">
import { useWalletStore } from "~/stores/wallet";
import { ref } from "vue";

definePageMeta({
  auth: true,
  layout: "dashboard",
});

const walletStore = useWalletStore();

const isExecuting = ref(false);
const error = ref<string | null>(null);
const txHash = ref<string | null>(null);
const mintedTokens = ref<{ name: string; amount: number }[]>([]);

const standardParams = {
  epoch: 500,
  minFeeA: 44,
  minFeeB: 155381,
  maxBlockSize: 90112,
  maxTxSize: 16384,
  maxBlockHeaderSize: 1100,
  keyDeposit: 2000000,
  poolDeposit: 500000000,
  decentralisation: 0,
  minPoolCost: "340000000",
  priceMem: 0.0577,
  priceStep: 0.0000721,
  maxTxExMem: "14000000",
  maxTxExSteps: "10000000000",
  maxBlockExMem: "62000000",
  maxBlockExSteps: "20000000000",
  maxValSize: 5000,
  collateralPercent: 150,
  maxCollateralInputs: 3,
  coinsPerUtxoSize: 34482,
  minFeeRefScriptCostPerByte: 15,
};

const tokensToMint = [
  { name: "SCAMCOIN", amount: 1000000 },
  { name: "JUNKTOKEN", amount: 500000 },
  { name: "SPAMTEST", amount: 10000000 },
  { name: "AIRDROP1", amount: 1 },
];

const handleMint = async () => {
  if (!walletStore.walletApi) {
    error.value = "Wallet not connected";
    return;
  }

  isExecuting.value = true;
  error.value = null;
  txHash.value = null;
  mintedTokens.value = [];

  try {
    const wasm = await walletStore.loadWasm();
    const { TxBuilder } = await import("@hydra-sdk/transaction");

    const txBuilder = new TxBuilder({ isHydra: false, params: standardParams });
    const targetAddress = wasm.Address.from_bech32(walletStore.walletAddress);

    // Pick a UTXO with enough ADA for fees + min-ADA
    const inputUtxo = walletStore.utxos.sort(
      (a, b) => b.lovelace - a.lovelace,
    )[0];
    if (!inputUtxo) throw new Error("No UTXOs available for fee");

    // Add input
    const txInput = wasm.TransactionInput.new(
      wasm.TransactionHash.from_hex(inputUtxo.txHash),
      inputUtxo.index,
    );
    const inputValue = wasm.Value.new(
      wasm.BigNum.from_str(inputUtxo.lovelace.toString()),
    );
    txBuilder.txBuilder.add_regular_input(targetAddress, txInput, inputValue);

    // Create native script policy: use wallet's payment key (requires user signature)
    const baseAddress = wasm.BaseAddress.from_address(
      wasm.Address.from_bech32(walletStore.walletAddress),
    );
    if (!baseAddress) throw new Error("Unsupported address type");
    const paymentKeyHash = baseAddress.payment_cred().to_keyhash();
    if (!paymentKeyHash) throw new Error("Could not extract payment key hash");
    const policyScript = wasm.NativeScript.new_script_pubkey(
      wasm.ScriptPubkey.new(paymentKeyHash),
    );

    // Build mint using low-level API
    for (const token of tokensToMint) {
      const assetName = wasm.AssetName.new(
        new TextEncoder().encode(token.name),
      );
      const amount = wasm.Int.new(
        wasm.BigNum.from_str(token.amount.toString()),
      );
      txBuilder.txBuilder.add_mint_asset(policyScript, assetName, amount);
    }

    // Collect native scripts for witness set (required by mint policy)
    const mintScripts = wasm.NativeScripts.new();
    mintScripts.add(policyScript);

    // Handle change (minted tokens go to change output)
    txBuilder.txBuilder.add_change_if_needed(targetAddress);

    // Build unsigned transaction
    const tx = txBuilder.txBuilder.build_tx();
    const unsignedTxHex = walletStore.toHex(tx.to_bytes());

    // Sign with wallet (returns VKey witnesses only)
    const witnessSetHex = await walletStore.walletApi.signTx(
      unsignedTxHex,
      true,
    );
    const vkeyWitnessSet = wasm.TransactionWitnessSet.from_bytes(
      walletStore.fromHex(witnessSetHex),
    );

    // Combine VKey witnesses + native scripts into full witness set
    const fullWitnessSet = wasm.TransactionWitnessSet.new();
    const vkeys = vkeyWitnessSet.vkeys();
    if (vkeys) fullWitnessSet.set_vkeys(vkeys);
    fullWitnessSet.set_native_scripts(mintScripts);

    const signedTx = wasm.Transaction.new(
      tx.body(),
      fullWitnessSet,
      tx.auxiliary_data(),
    );
    const signedTxHex = walletStore.toHex(signedTx.to_bytes());

    // Submit
    const hash = await walletStore.walletApi.submitTx(signedTxHex);
    txHash.value = hash;
    mintedTokens.value = [...tokensToMint];
  } catch (err: any) {
    console.error(err);
    error.value = err.message || "Minting failed";
  } finally {
    isExecuting.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="fintech-card p-7">
      <h3 class="text-lg font-bold text-white mb-2">Mint Test Tokens</h3>
      <p class="text-xs text-slate-400 mb-6">
        Mint junk tokens on Preprod testnet for testing the Junk Cleaner. Uses a
        timelock policy (after slot 0, always valid).
      </p>

      <!-- Tokens to mint -->
      <div
        class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 mb-6"
      >
        <p
          class="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider"
        >
          Tokens to mint
        </p>
        <div class="flex flex-col gap-2">
          <div
            v-for="t in tokensToMint"
            :key="t.name"
            class="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]"
          >
            <span class="text-sm font-mono text-white">{{ t.name }}</span>
            <span class="text-xs text-slate-400">{{
              t.amount.toLocaleString()
            }}</span>
          </div>
        </div>
      </div>

      <!-- Mint button -->
      <button
        class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-600/20 active:scale-95 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        :disabled="isExecuting"
        @click="handleMint"
      >
        <svg
          v-if="isExecuting"
          class="animate-spin h-4 w-4"
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
        {{ isExecuting ? "Minting..." : "Mint Test Tokens" }}
      </button>

      <!-- Error -->
      <div
        v-if="error"
        class="mt-4 flex items-start gap-3 p-4 rounded-xl bg-rose-500/[0.08] border-l-4 border-rose-500 text-rose-300"
      >
        <svg
          class="w-5 h-5 flex-shrink-0 stroke-rose-400 mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <div>
          <p class="font-bold text-sm">Minting Failed</p>
          <p class="text-xs mt-1 leading-snug">{{ error }}</p>
        </div>
      </div>

      <!-- Success -->
      <div
        v-if="txHash"
        class="mt-4 flex items-start gap-3 p-4 rounded-xl bg-emerald-500/[0.08] border-l-4 border-emerald-500 text-emerald-300"
      >
        <svg
          class="w-5 h-5 flex-shrink-0 stroke-emerald-400 mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div>
          <p class="font-bold text-sm text-emerald-400">Mint Successful!</p>
          <p class="text-xs mt-1 leading-snug">
            {{ mintedTokens.length }} tokens minted and sent to your wallet.
            <a
              :href="'https://preprod.cardanoscan.io/transaction/' + txHash"
              target="_blank"
              class="font-semibold underline text-violet-400 hover:text-violet-300"
            >
              View Tx: {{ txHash.slice(0, 16) }}...
            </a>
          </p>
          <div class="mt-2 flex flex-col gap-1">
            <div
              v-for="t in mintedTokens"
              :key="t.name"
              class="text-xs text-emerald-400/80 font-mono"
            >
              +{{ t.amount.toLocaleString() }} {{ t.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
