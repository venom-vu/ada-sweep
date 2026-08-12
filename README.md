# ADASweep — Cardano Wallet Optimizer & Developer Toolkit 🧹✨

[![Cardano](https://img.shields.io/badge/Cardano-ADA-blue?logo=cardano)](https://cardano.org/)
[![Framework](https://img.shields.io/badge/Framework-Nuxt_4-00DC82?logo=nuxt.js)](https://nuxt.com/)

**ADASweep** is a free, non-custodial, client-side Web3 toolkit for the Cardano ecosystem. It helps users analyze wallet health, remove spam and phishing tokens, reclaim locked ADA, consolidate fragmented eUTXOs, decode CBOR transactions, sign data on-chain, and derive cryptographic keys from BIP-39 mnemonics — all running directly in the browser with no server involvement.

---

## 📖 Vision & Core Objectives

Cardano's eUTXO model provides high security but can lead to fragmented wallets with many "dust" UTXOs. According to Cardano's **min-ADA requirement**, each UTXO containing native assets/NFTs must lock 1–2 ADA to prevent ledger spam. This traps user capital and increases transaction size/fees. Phishing actors also exploit this by airdropping spam tokens with malicious metadata URLs.

ADASweep serves as a client-side toolbox to:

- **Clean Wallet**: Detect and isolate/burn spam & phishing tokens to reclaim locked ADA.
- **Consolidate UTXOs**: Merge multiple fragmented UTXOs into optimized configurations.
- **Developer Utilities**: Provide CBOR decoding, on-chain data signing, and BIP-39 key derivation tools.

---

## 🚀 Key Modules & Pages

### 🛡️ 1. Wallet Cleaner ([cleaner.vue](./app/pages/cleaner.vue) / [dashboard.vue](./app/pages/dashboard.vue))

- **DEX-Powered Classification**: Scans wallet assets and queries real-time liquidity to separate real tokens from spam/phishing assets.
  - **Mainnet**: Queries the **Minswap Aggregator API** (TVL > 0 checks) with a fallback to scanning UTXOs on known Mainnet liquidity pool script addresses via Blockfrost.
  - **Preprod Testnet**: Employs local heuristics (whitelist/blacklist + name pattern check) without external API dependencies.
- **Phishing URL Shielding**: Automatically detects phishing metadata URLs on suspicious NFTs and shields their media content to protect users.
- **Whitelist Override**: Allows marking safe assets, persisted to network-specific keys in `localStorage` (`adasweep-whitelist-overrides-preprod` / `adasweep-whitelist-overrides-mainnet`).
- **Junk Burner**:
  - **Spam Consolidation (Default)**: Combines selected junk tokens into a single isolated UTXO at the bottom of the wallet to reduce locked min-ADA to ~3–5 ADA.
  - **Full Burn**: Sends junk tokens to an unspendable address to clean the wallet 100%.

### 🔄 2. UTXO Consolidator ([optimizer.vue](./app/pages/optimizer.vue))

- **Smart & Manual Selection**: Merge all clean ADA UTXOs automatically or check specific UTXOs manually from a list.
- **Economic Viability Alert**: Displays warnings if the network transaction fee exceeds 30% of the reclaimed ADA.
- **Transaction Batching**: Auto-splits large transactions into multiple batches (maximum 40 inputs per batch) to stay safely within Cardano's 16KB transaction size limit.

### 🔍 3. CBOR Decoder ([cbor.vue](./app/pages/cbor.vue))

- **Cardano WASM Decoder**: Decodes raw hex-encoded CBOR bytes into readable structures. Supports four main Cardano entities:
  1. `Transaction`
  2. `UTXO` (`TransactionUnspentOutput`)
  3. `Address`
  4. `Value`
- **Dual Display Tabs**:
  - **JSON View**: Standard formatted and indented JSON tree.
  - **Block View**: High-quality visual representation of inputs, outputs, Bech32 addresses, assets, and fees.

### ✍️ 4. Data Signer ([sign.vue](./app/pages/sign.vue))

- **Eternl Only Utility**: Encodes plain text input into Hex bytes and signs it using the Eternl wallet's CIP-30 `signData` API.
- **Output Formats**: Displays signed data in **COSE_Sign1** hex and public key in **COSE_Key** hex with quick-copy support.

### 🔑 5. Key Generator ([keygen.vue](./app/pages/keygen.vue))

- **BIP-39 Mnemonic Derivation**: Derives Cardano signing keys (SK), verification keys (VK), and verification key hashes (VKH) from a mnemonic phrase.
- **Configurable Derivation Path**: Supports custom account index and key index for HD wallet path selection.
- **Output Formats**: Exports keys as CBOR hex for direct use with Cardano tooling (`cardano-cli`, etc.).
- **Fully Client-Side**: The mnemonic phrase never leaves the browser; all derivation is performed locally using `@hydra-sdk/core`.

---

## 🏗️ Architecture & WASM Integration

ADASweep runs **100% Client-Side** (`ssr: false` in [nuxt.config.ts](./nuxt.config.ts)).

- **SSR-Safe WASM Patterns**: Even though SSR is disabled globally, the app enforces SSR-safe practices to prevent execution crashes with WebAssembly:
  - WASM imports are loaded dynamically (guarded by `typeof window !== 'undefined'`).
  - WASM-reliant views are encapsulated inside `<ClientOnly>` tags.
- **Bundler Settings**: Vite is configured in [nuxt.config.ts](./nuxt.config.ts) to handle WebAssembly packaging via `vite-plugin-wasm` + `vite-plugin-top-level-await`, and target output set to `esnext`. `@hydra-sdk/cardano-wasm` is excluded from dependency optimization (`optimizeDeps.exclude`).

---

## 🛠️ Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, Pinia) built as a Single Page Application (SPA/CSR).
- **Cardano Tools**: `@hydra-sdk/core`, `@hydra-sdk/cardano-wasm`, and `@hydra-sdk/transaction`.
- **Styling**: Tailwind CSS & Vanilla CSS (Futuristic Dark Glassmorphism theme).
- **State Management**: Pinia stores (`wallet`, `optimizer`, `cleaner`).

---

## 🛡️ Security Commitments

- **Client-Side Only**: All execution happens directly on your browser. Your seed phrases or private keys are never accessed or stored.
- **Explicit Consent**: Every wallet optimization or token-burning transaction requires explicit CIP-30 extension signing. No automatic or hidden transfers.
- **Open Source**: The full codebase is auditable. MIT Licensed.
