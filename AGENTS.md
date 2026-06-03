# AGENTS.md — ADASweep (Cardano UTXO Consolidator)

## Quick start
```bash
pnpm install          # pnpm is the primary package manager (pnpm-lock.yaml v9)
pnpm dev              # starts at http://localhost:3000
pnpm test             # vitest run (specs co-located, e.g. app/utils/*.spec.ts)
cp .env.example .env  # required; set NUXT_PUBLIC_SITE_URL
```

## Architecture
- **Nuxt 4** (`compatibilityVersion: 4`) with `app/` directory as root
- Path aliases: `~/` and `@/` both resolve to `app/`
- Two layouts: `default.vue` (public landing), `dashboard.vue` (sidebar for authenticated pages)
- State: Pinia stores — `wallet`, `optimizer`, `cleaner`
- All Cardano WASM code is **client-side only** — SSR-safe patterns required (see below)

## WASM / SSR critical rules
- `@hydra-sdk/cardano-wasm` MUST be excluded from Vite optimizeDeps (already in `nuxt.config.ts`)
- Never import WASM modules at the top level; use dynamic `import()` guarded by `typeof window !== "undefined"`
- WASM-reliant components/content MUST be wrapped in `<ClientOnly>`
- Vite plugins `vite-plugin-wasm` + `vite-plugin-top-level-await` and `build.target: 'esnext'` are required

## Wallet / network constraints
- **Mainnet is disabled** — `connectWallet()` rejects `networkId === 1`; only Preprod testnet works
- Wallet auto-reconnects from `sessionStorage` key `adasweep-session-wallet`
- Network selection stored in `localStorage` key `adasweep-network`

## Tx building (Hydra SDK)
- UTXOs decoded via `CardanoWASM.TransactionUnspentOutput.from_bytes()` from CIP-30 CBOR hex
- TxBuilder from `@hydra-sdk/transaction` used for manual input selection (bypasses CIP-2 coin selection)
- Max 40 inputs per batch (`chunkUtxos`) to stay under 16KB tx size limit
- Address decoding: `wasm.Address.from_bytes(hexBytes).to_bech32()`

## Key local storage keys
| Key | Purpose |
|---|---|
| `adasweep-session-wallet` | sessionStorage — auto-reconnect wallet name |
| `adasweep-network` | localStorage — selected network (`preprod`) |
| `adasweep-whitelist-overrides` | localStorage — user-trusted asset IDs |

## Testing
- Framework: Vitest (run with `pnpm test`)
- Spec files co-located next to source: `app/utils/*.spec.ts`
- Pure unit tests only (no browser/SSR dependencies in test utils)

## Chat rules
- Mở đầu mỗi chat: chạy skill `caveman` ngay lập tức (dùng lệnh `/caveman` hoặc invoke skill caveman)
