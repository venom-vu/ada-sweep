---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-06-06'
completedAt: '2026-06-05'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **FR-1 (Wallet Analysis & Health Score):** Quét ví qua CIP-30, tính toán chính xác tổng ADA, ADA khả dụng, ADA bị khóa, và chấm điểm sức khỏe ví dựa trên độ phân mảnh UTXO.
- **FR-2 (Spam Detection & Media Shielding):** Nhận diện spam động bằng whitelist, blacklist và kiểm tra thanh khoản DEX. Tích hợp cơ chế ẩn media NFT Suspicious để chống phishing và lưu "Mark as Trusted" vào LocalStorage.
- **FR-3 (Smart/Manual UTXO Consolidation):** Cung cấp chế độ gom bụi tự động (Smart) và gom tick chọn thủ công (Manual). Tích hợp cảnh báo hiệu quả kinh tế khi tỷ lệ Phí giao dịch / ADA thu hồi > 30%.
- **FR-4 (Transaction Batching):** Tự động phân tách và chia nhỏ hàng trăm UTXO cần gom thành các lô giao dịch tối ưu dưới giới hạn kích thước 16KB của Cardano.
- **FR-5 (Spam Consolidation vs. Full Burn):** Mặc định gom tất cả token rác được chọn vào một UTXO duy nhất để cách ly ("Isolated Junk Box") giải phóng 90%+ ADA bị khóa. Tùy chọn nâng cao gửi UTXO rác này đến địa chỉ chết ("Full Burn") hy sinh lượng min-ADA tối thiểu còn lại.

**Non-Functional Requirements:**
- **Non-Custodial Security:** An toàn tuyệt đối, dApp không giữ private key, mọi giao dịch phải được ký bởi người dùng qua ví CIP-30.
- **Client-Side Heavy Architecture:** Toàn bộ việc xử lý UTXO, tính toán min-ADA, và build transaction được thực hiện trên client-side để đảm bảo quyền riêng tư và tốc độ.
- **Performance & Responsiveness:** Thời gian quét ví và tải dữ liệu thanh khoản từ DEX API dưới 3 giây. Hỗ trợ giao diện responsive Dark Mode cao cấp.
- **Strict Size Constraint Compliance:** Đảm bảo 100% các giao dịch build ra đều hợp lệ về kích thước (<16KB) và đủ min-ADA yêu cầu để tránh lỗi node từ chối.

**Scale & Complexity:**
- Primary domain: Web-based Cardano Frontend dApp
- Complexity level: Medium (phụ thuộc vào thuật toán Cardano Transaction Building & Batching)
- Estimated architectural components: 4 core client-side components:
  1. Wallet Provider & Connection Manager (CIP-30)
  2. UTXO Analyzer & Spam Classifier Engine (DEX API, LocalStorage)
  3. Transaction Builder & Fee/Min-ADA Estimator
  4. Tx Batching & Serialization Manager (Cardano SDK)

### Technical Constraints & Dependencies
- **Cardano Ledger Constraints:** Giới hạn kích thước transaction tối đa ~16.384 bytes; công thức tính min-ADA động (Babbage/Conway eras).
- **CIP-30 Wallet Protocol:** Phụ thuộc vào việc các ví extension/mobile cài đặt đúng chuẩn CIP-30, trả về UTXO HEX mã hóa theo CBOR.
- **External DEX Aggregator API:** Phụ thuộc vào tính ổn định và tốc độ của API ngoài (như Minswap API) để quét pool thanh khoản của token.
- **Client Sandbox Limitation:** local storage của trình duyệt dùng để lưu cấu hình Whitelist ghi đè (Mark as Trusted) sẽ bị mất nếu người dùng xóa cache trình duyệt.

### Cross-Cutting Concerns Identified
- **Wallet Connection State Persistence:** Trạng thái kết nối ví của người dùng phải được duy trì mượt mà giữa các trang và tự động khôi phục khi reload.
- **Transaction Signing Failures Handlers:** Phải có cơ chế catch các lỗi người dùng từ chối ký ví (User Rejected), lỗi hết hạn giao dịch (Slot expired), hoặc trượt phí mạng lưới.
- **Phishing URL Shielding:** Cách ly dữ liệu metadata chứa link lừa đảo của các Suspicious NFT khỏi DOM để đảm bảo tính an toàn tối đa cho trình duyệt người dùng.
- **Network Switch Race Condition:** User switch network nhanh 2 lần — DEX request cũ chưa kịp abort, response overwrite kết quả mới. Dùng `AbortController` + `isCurrentNetwork` flag để reject stale response.
- **Network-Aware Cache:** Liquidity cache phải keyed by network ID (`cacheKey = network + assetId`). Switch network → clear cache cũ, fetch mới.
- **DEX Service Lifecycle:** Component mount trước khi DexService init → crash. Giải pháp: `watch(selectedNetwork)` + `await` service factory trước khi component render.
- **Classification UI States:** Store cần expose `classificationStatus` map per token và global `dexStatus` (idle/loading/dexlive/fallback/error) để component render đúng trạng thái UI — spinner, badge xanh/dẻ/red, và warning banner.
- **DEX Status Indicator:** UI cần badge nhỏ "🔍 DEX: Online" hoặc "🔍 Local: Limited" để user biết mức độ tin cậy của kết quả phân loại.

## Starter Template Evaluation

### Primary Technology Domain
- **Domain:** Client-side Web Application (dApp)
- **Framework:** Nuxt 4 (Vue 3, File-system Routing, Server-Side capabilities via Nitro, powerful auto-imports and composable architecture).
- **Cardano SDK:** `Hydra SDK` (developed by Vtechcom Labs, sponsored by Project Catalyst; optimized for high-performance browser execution with native WASM integration and built-in polyfills).

### Starter Options Considered

1. **Nuxt 4 + TypeScript + Hydra SDK (SELECTED BY USER OVERRIDE):**
   - *Pros:* Excellent full-stack Vue 3 developer experience, native ESM and Vite performance, high type-safety. Hydra SDK solves browser bundling and polyfill issues for Cardano WASM natively, simplifies wallet connection, and enables future expansion into Hydra L2 scaling.
   - *Cons:* Nuxt SSR (Server-Side Rendering) requires specific `<ClientOnly>` encapsulation for browser-only CIP-30 APIs and WASM bindings.

2. **React + Vite + TypeScript + Lucid Evolution (REJECTED):**
   - *Pros:* Basic, lightweight, single-page application.
   - *Cons:* Missing Nuxt's rich ecosystem of auto-imports, File-System Routing, and structured layout templates.

3. **Next.js + Mesh SDK (REJECTED):**
   - *Pros:* High-level React components.
   - *Cons:* Severe WASM integration issues in Next.js SSR environment, high-level abstraction hides low-level UTXO coin selection.

### Selected Starter: Nuxt 4 + TypeScript + Hydra SDK

**Rationale for Selection:**
- **User Preference & Framework Power:** The user explicitly requested Nuxt 4. This framework provides state-of-the-art developer experience, clean reactive composables (like `useCardanoWallet`), and optimal code structure via the new Nuxt 4 layout conventions.
- **Browser-Ready WASM (Hydra SDK):** Unlike older SDKs that suffer from heavy bundling/polyfill issues on the web, Hydra SDK (`@hydra-sdk/core` and `@hydra-sdk/cardano-wasm`) is specifically designed to be high-performance and browser-compatible, with built-in WASM integration.
- **L2 Expansion Readiness:** Hydra SDK natively supports Hydra Head interactions, making the codebase future-proof for Cardano Layer 2 scaling (Phase 4 of the product roadmap).

**Initialization Command:**
```bash
# Initialize Nuxt 4 in the current directory (non-interactive)
npx nuxi@latest init ./ --packageManager npm --gitInit false --force
# Install Hydra SDK packages
npm install @hydra-sdk/core @hydra-sdk/cardano-wasm
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** TypeScript (Strictly typed, compiler-assisted type safety for Hydra SDK types).
- **Styling Solution:** Vanilla CSS (`app.css` placed in `assets/css/` for global overrides and Native CSS Nesting).
- **Build Tooling:** Vite (Nitro Server for local dev/SSR, Vite client-side bundler optimized for WASM integration).
- **Nuxt Web3 Integration Guard:**
  - Wrap CIP-30 and transaction logic inside Vue 3 composables (`composables/useWallet.ts`) using Vue `ref`/`shallowRef` for reactive state.
  - Utilize Nuxt's `<ClientOnly>` wrapper in views to guarantee Web3 wallet connection APIs are only loaded inside the browser environment, completely bypassing SSR WASM errors.
- **Vite WebAssembly Configuration (`nuxt.config.ts`):**
  ```typescript
  export default defineNuxtConfig({
    // Nuxt 4 / app structure configurations
    future: { compatibilityVersion: 4 },
    vite: {
      optimizeDeps: {
        exclude: ['@hydra-sdk/cardano-wasm']
      }
    }
  })
  ```

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Cardano Node Connection & Transaction building:** Using **Hydra SDK** (`@hydra-sdk/core` & `@hydra-sdk/cardano-wasm`) for building, serialization, and wallet interactions.
- **Framework & SSR Safety:** Wrapping all reactive Web3 logic in Nuxt `<ClientOnly>` templates to completely prevent SSR mismatches and server-side node WASM loading crashes.

**Important Decisions (Shape Architecture):**
- **Frontend State Management:** Using **Pinia (v2.2.0)** to build reactive global stores (`wallet.ts`, `optimizer.ts`, `cleaner.ts`) for consistent state management across different views.
- **On-chain API Provider:** Using **Blockfrost API (v1)** as the primary backend provider/adapter to fetch wallet UTXOs, dispatch signed transactions, and fetch protocol parameters.
- **DEX Liquidity Service:** Using **DexService abstraction** (`app/services/dex/`) with per-network implementations — `MinswapService` (Mainnet: Minswap Aggregator API, covers 17+ DEX protocols) and `HeuristicService` (Preprod: local whitelist/blacklist + name pattern).
- **Protocol Parameters:** Fetch từ Blockfrost `/epochs/latest/parameters` qua utility `app/utils/protocolParams.ts`, không hardcode trong component.
- **Network State:** Wallet store `selectedNetwork` làm nguồn truth duy nhất. Liquidity cache keyed by network ID để tránh stale data khi switch network.
- **Junk Overrides Database:** Using **Browser LocalStorage** for saving custom whitelists and "Mark as Trusted" user overrides locally. Keyed by network: `adasweep-whitelist-overrides-{network}` (ví dụ `adasweep-whitelist-overrides-preprod`, `adasweep-whitelist-overrides-mainnet`).

**Deferred Decisions (Post-MVP):**
- **Community Spam Reporting Backend:** Postponed to later phases to avoid database and API hosting complexity in v1.
- **Layer 2 Hydra Head Operations:** Integration of L2 atomic swaps or Hydra head operations is deferred to Phase 4.

### Data Architecture
- **Blockchain Data Retrieval:** Direct connection to the Cardano ledger via **Blockfrost API** using the Hydra SDK Blockfrost Provider instance.
- **Local Cache & Storage:** Client-side **LocalStorage** key-value storage for persistence of local trusted tokens. Whitelist array structure: `['policyId.assetName', ...]`.

### Authentication & Security
- **Authentication:** Standard Cardano CIP-30 signature verification (non-custodial session). Users interact only via browser wallets (Eternl, Vespr, Nami, Flint, Lace).
- **Phishing Prevention:** Heavy sandbox shielding of Suspicious assets. Any media or external resource URL in Suspicious NFT metadata is dynamically stripped from the DOM; only plain text token titles and warning SVGs are rendered.

### API & Communication Patterns
- **DEX Liquidity Validation:** Via **DexService abstraction** (`app/services/dex/`). Mainnet dùng `MinswapService` (gọi Minswap Aggregator API — covers 17+ DEX). Preprod dùng `HeuristicService` (local whitelist + name pattern, zero external call).
- **DexService Error Handling:** Mọi lỗi từ DexService phải trả về `DexServiceError` type — không `throw raw Error`. Store catch error → set `ClassificationStatus = 'error' | 'fallback'`.
- **Blockfrost Querying:** Secured HTTPS communications between browser client and Blockfrost nodes, utilizing API keys configured in standard Nuxt runtime configurations (.env). Dùng cho cả UTXO query lẫn protocol params fetch.
- **Protocol Params Fetch:** `GET /epochs/latest/parameters` via Blockfrost, map response sang `Protocol` type từ `@hydra-sdk/core`. Cache trong memory (`Map<networkKey, {params, fetchedAt}>`) với TTL 1 epoch (~5 ngày). Keyed by network ID để tránh cross-network stale data.
- **Network Switch:** `walletStore.selectedNetwork` watch → `cleanerStore` clear liquidity cache → re-fetch với service mới. Dùng `AbortController` để cancel pending request khi switch nhanh liên tiếp.

### Frontend Architecture
- **Framework Stack:** **Nuxt 4 + Vue 3 + TypeScript**.
- **State Management:** **Pinia Store** to centralize CIP-30 instances, active UTXO arrays, health scores, and optimizer batches.
- **Styling system:** Strict Vanilla CSS. Modular layout design with component-level isolation and standard CSS variables for color tokens (Harmonious Dark/Light themes).

### Infrastructure & Deployment
- **Hosting Solution:** **Vercel or Netlify** static client build deployment. Zero backend requirement ensures robust scaling, cheap operational cost, and high security.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined
**Critical Conflict Points Identified:** 4 areas where AI agents could make different choices (Store syntax, Web3 rendering environments, naming conventions, and transaction lifecycle error boundaries).

### Naming Patterns
- **Vue Components:** PascalCase (e.g., `WalletHealth.vue`, `IsolatedJunkBox.vue`).
- **Composables/Stores:** camelCase with `use` prefix (e.g., `useWallet.ts`, `useOptimizer.ts`).
- **Pure JavaScript/TypeScript Utilities:** camelCase (e.g., `minAdaCalculator.ts`).
- **State Properties & Variables:** camelCase (e.g., `policyId`, `assetName`).

### Structure Patterns (Nuxt 4 app/ Layout)
Nuxt 4 organizes source files under the unified `app/` folder:
- `app/components/` - Vue UI Components.
- `app/composables/` - Auto-imported Vue composables.
- `app/stores/` - Auto-imported Pinia stores.
- `app/pages/` - Router Pages.
- `app/services/` - Service classes with lifecycle (DEX providers, external API wrappers).
- `app/utils/` - Pure TypeScript utilities.

### Format Patterns
- **Pinia stores:** MUST use Setup Store syntax. Options Store syntax is strictly forbidden to ensure native type-safety and smooth Composition API alignment.
- **Cardano Asset Representation:** Unified identifier string `policyId.assetNameHex` to represent assets in tables and arrays consistently.

### Process & Safety Patterns
- **Web3 SSR Shielding:** Any CIP-30 wallet query or `@hydra-sdk` transaction serialization code MUST be wrapped in Nuxt's `<ClientOnly>` component or guarded by `process.client` checks.
- **Unified Transaction State Lifecycle:** Every store action initiating a transaction (Consolidate/Burn) MUST enforce this state mutation:
  1. Set `isLoading.value = true` & `error.value = null`.
  2. Perform local validation (pre-flight checks).
  3. Execute Hydra SDK transaction construction & browser wallet signing.
  4. On success: trigger local state refresh and update `WalletHealthScore`.
  5. On failure: catch error, parse friendly ledger error messages, and set `error.value`.
  6. Finally: set `isLoading.value = false`.

### Protocol Params Cache — Assumption Audit & Failure Modes

| Assumption | Risk | Mitigation |
|---|---|---|
| Blockfrost always returns valid params | Blockfrost outage → không fetch được params | Stale-while-revalidate: giữ cached value cũ, dùng làm fallback nếu fetch fail |
| Params không đổi mid-epoch | ✅ Cardano chỉ thay đổi params ở epoch boundary | TTL 5 ngày = đúng 1 epoch, safe |
| Session không span epoch boundary | User để tab mở 5+ ngày → params stale | On tx build fail ("outside of validity range") → force-refetch |
| Cache keyed by network ID | Preprod vs Mainnet params khác nhau | ✅ `Map<networkKey, ...>` đã xử lý |
| Memory cache đủ | Single-tab, single-user | ✅ Không cần persist |

**Cache implementation pattern:**
```typescript
// app/utils/protocolParams.ts
const cache = new Map<string, {
  params: Protocol
  fetchedAt: number
}>()
const CACHE_TTL = 5 * 24 * 60 * 60 * 1000 // 1 epoch
const NETWORK_KEY = (n: string) => `params_${n}`

export async function fetchProtocolParams(
  network: 'preprod' | 'mainnet'
): Promise<Protocol> {
  const key = NETWORK_KEY(network)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.params
  }
  try {
    const params = await blockfrostFetch(network) // ...
    cache.set(key, { params, fetchedAt: Date.now() })
    return params
  } catch (e) {
    if (cached) return cached.params // stale-while-revalidate
    throw e // no cache at all → propagate
  }
}
```

### ClassificationStatus Transition Matrix

```
         ┌─────────────────────────────────────────────┐
         │               CURRENT STATE                 │
         │  idle    loading   dexlive   fallback  error │
┌────────┼─────────────────────────────────────────────┤
│  idle   │  -        OK       OK        OK       OK   │ (reset)
│ loading │  OK       DEDUP    OK        OK       OK   │
│ dexlive │  -        OK       -         -        -    │
│fallback │  -        OK       -         -        -    │
│  error  │  -        OK       -         -        -    │
└────────┴─────────────────────────────────────────────┘
```

**Rules:**
- `DEDUP`: Nếu đã `loading`, ignore trigger thứ 2 (dùng `isFetching` flag)
- `idle` ← any: reset khi switch network hoặc clear cache
- `→ loading` luôn đi qua `idle` step (set idle trước, rồi set loading)
- Timeout: nếu `loading` quá 15s → tự động set `error`

**Safety net:**
```typescript
// cleaner.ts
const FETCH_TIMEOUT = 15_000 // ms
const classificationTimeout = new Map<string, ReturnType<typeof setTimeout>>()

function startClassification(assetId: string) {
  classificationTimeout.set(assetId, setTimeout(() => {
    setStatus(assetId, 'error')
  }, FETCH_TIMEOUT))
}
```

### Key Type Definitions

```typescript
// app/services/dex/DexService.ts
export type DexServiceErrorCode =
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'API_DOWN'
  | 'PARSE_ERROR'
  | 'UNSUPPORTED_NETWORK'

export interface DexServiceError {
  code: DexServiceErrorCode
  message: string
  retryAfter?: number // ms
}

export type LiquidityResult = {
  assetId: string
  hasLiquidity: boolean
  tvl: number
  source: 'minswap' | 'heuristic'
  checkedAt: number
}

// app/stores/cleaner.ts
export type ClassificationStatus =
  | 'idle'        // chưa check
  | 'loading'     // đang gọi DEX
  | 'dexlive'     // DEX xác thực
  | 'fallback'    // heuristic (DEX fail)
  | 'error'       // lỗi ko xác định

// Extend AssetClassification
export interface AssetClassification {
  // existing fields ...
  status: ClassificationStatus
  dexSource?: string  // 'Minswap Aggregator' | 'Local Heuristic'
  phishingUrlShielded: boolean
}
```

### Anti-Patterns to Avoid
- *Anti-Pattern:* Directly binding suspicious NFT metadata images to `<img>` source. (Causes phishing risk).
- *Anti-Pattern:* Implementing blockchain interaction code on Nuxt server-side hooks (`useAsyncData`, `onServerPrefetch`). (Causes server WASM execution crash).
- *Anti-Pattern:* Gộp DEX logic vào Pinia store. (Store khó test, khó mock. Tách ra `app/services/dex/` cho testable).
- *Anti-Pattern:* Không abort request cũ khi switch network. (Race condition → stale data overwrite kết quả mới).
- *Anti-Pattern:* `throw raw Error` từ DexService. (Phải dùng `DexServiceError` type để store handle đúng).
- *Anti-Pattern:* Gọi DEX API trên Preprod. (Preprod dùng heuristic local — không cần, không nên gọi API ngoài).

## Project Structure & Boundaries

### Complete Project Directory Structure
```
clean-cardano-wallet/
├── README.md
├── package.json
├── nuxt.config.ts
├── tsconfig.json
├── .env
├── app/
│   ├── app.vue
│   ├── assets/
│   │   └── css/
│   │       └── app.css
│   ├── components/
│   │   ├── WalletConnection.vue
│   │   ├── WalletHealth.vue
│   │   ├── UtxoTable.vue
│   │   ├── OptimizerControls.vue
│   │   ├── JunkDetector.vue
│   │   └── JunkBurner.vue
│   ├── composables/
│   │   ├── useCardanoWallet.ts
│   │   └── useLocalStorage.ts
│   ├── services/
│   │   └── dex/
│   │       ├── DexService.ts          (interface)
│   │       ├── MinswapService.ts      (mainnet)
│   │       ├── HeuristicService.ts    (preprod)
│   │       └── index.ts               (factory: createDexService)
│   ├── pages/
│   │   ├── index.vue
│   │   ├── optimizer.vue
│   │   └── cleaner.vue
│   ├── stores/
│   │   ├── wallet.ts
│   │   ├── optimizer.ts
│   │   └── cleaner.ts
│   └── utils/
│       ├── cardanoCodec.ts
│       ├── minAdaCalculator.ts
│       ├── protocolParams.ts
│       ├── transactionBatcher.ts
│       └── __tests__/
│           └── dexService.spec.ts
```

### Architectural Boundaries

**API Boundaries:**
- **External Blockchain Access:** Toàn bộ việc kết nối và gửi giao dịch được thực hiện qua **Blockfrost API** HTTPS endpoints, đóng gói hoàn toàn bên trong store `wallet.ts`.
- **DEX Liquidity Check:** Được giới hạn trong `cleaner.ts` store thông qua các truy vấn HTTP GET bất đồng bộ đến **Minswap API** công khai.

**Component Boundaries:**
- **Store-Driven Reactive UI:** Các Vue Components (`WalletHealth`, `UtxoTable`, `JunkDetector`) tuyệt đối **không** được chứa logic kết nối blockchain hoặc tự build transaction. Components chỉ đọc dữ liệu (state) và gọi các Action từ store.

**Data Boundaries:**
- **LocalStorage Override Sandboxing:** Dữ liệu whitelist người dùng ghi đè được quản lý độc quyền qua composable `useLocalStorage.ts`. Không component nào được trực tiếp gọi `window.localStorage` để tránh mất đồng bộ.

### Requirements to Structure Mapping

- **FR-1 (DexService — Mainnet):** `app/services/dex/MinswapService.ts` (Minswap Aggregator API).
- **FR-2 (DexService — Preprod):** `app/services/dex/HeuristicService.ts` (local whitelist + name pattern).
- **FR-3 (Network-aware classification pipeline):** `app/stores/cleaner.ts` (6-step pipeline: whitelist → blacklist → system whitelist → name pattern → DEX → fallback), `app/services/dex/index.ts` (factory).
- **FR-4 (Protocol params fetch):** `app/utils/protocolParams.ts` (Blockfrost `/epochs/latest/parameters`).
- **FR-5 (Phishing URL Shielding):** `app/components/JunkDetector.vue` (template: `v-if="!asset.phishingUrlShielded"`), `app/stores/cleaner.ts` (flag computation).
- **FR-6 (User Whitelist Management):** `app/composables/useLocalStorage.ts` (key per network: `adasweep-whitelist-overrides-{network}`), `app/stores/cleaner.ts` (markAsTrusted / markAsSuspicious actions).
- **FR-7 (Network switch re-classify):** `app/stores/wallet.ts` (selectedNetwork), `app/stores/cleaner.ts` (watch + AbortController + cache clear).
- **Wallet Analysis & Health Score:** `app/stores/wallet.ts`, `app/components/WalletHealth.vue`.
- **UTXO Consolidation & Batching:** `app/stores/optimizer.ts`, `app/utils/transactionBatcher.ts`.

**Note:** Classification Engine scope covers FR-1 to FR-7. Consolidate/burn features (old FR-3 to FR-5) là scope riêng, không thuộc PRD hiện tại.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Nuxt 4 + Vue 3 + TypeScript + Hydra SDK + Blockfrost — tương thích hoàn toàn.
- `DexService` abstraction + Pinia stores — service layer độc lập, không xung đột với store pattern.
- `MinswapService` (Mainnet) + `HeuristicService` (Preprod) — cùng interface, khác implementation, plug-and-play qua factory.
- `AbortController` pattern + cache keyed by network ID — race condition handling đồng bộ với store watch.

**Pattern Consistency:**
- Setup Store syntax nhất quán xuyên suốt (`wallet.ts`, `cleaner.ts`, `optimizer.ts`).
- Naming: PascalCase components, camelCase stores/utils/services, `policyId.assetNameHex` asset format.
- Anti-patterns mới (DEX logic trong store, raw Error throw) bổ sung để tránh implementation drift.

**Structure Alignment:**
- `app/services/dex/` là physical boundary rõ ràng cho DEX logic — không lẫn với store hay composable.
- `app/utils/protocolParams.ts` là pure utility, không lifecycle — đúng vị trí.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (PRD 06/05):**
- **FR-1 (DexService Mainnet):** `app/services/dex/MinswapService.ts` ✅
- **FR-2 (DexService Preprod):** `app/services/dex/HeuristicService.ts` ✅
- **FR-3 (Classification pipeline):** `app/stores/cleaner.ts` + `app/services/dex/index.ts` ✅
- **FR-4 (Protocol params fetch):** `app/utils/protocolParams.ts` ✅
- **FR-5 (Phishing shielding):** `app/components/JunkDetector.vue` + `cleaner.ts` ✅
- **FR-6 (User whitelist):** `app/composables/useLocalStorage.ts` + `cleaner.ts` ✅
- **FR-7 (Network switch re-classify):** `wallet.ts` + `cleaner.ts` (watch + AbortController) ✅

**Non-Functional Requirements Coverage:**
- **Cross-network:** DexService factory pattern + cache keyed by network ID.
- **Phishing Prevention:** `phishingUrlShielded` flag trong `AssetClassification`, template `v-if` block.
- **Zero API call on Preprod:** `HeuristicService` không fetch HTTP.
- **Race condition safe:** `AbortController` + `isCurrentNetwork` flag.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Tất cả critical decisions (DexService, protocol params, network switch, whitelist) đã document kèm rationale.
- Party Mode insights integrated (edge cases, anti-patterns, test strategy, UI states).

**Structure Completeness:**
- Cây thư mục đã update với `app/services/dex/`, `app/utils/protocolParams.ts`, `app/utils/__tests__/`.

**Pattern Completeness:**
11 anti-patterns explicitly listed. Naming/structure/format/process patterns defined. DexService interface convention added.

### Gap Analysis Results

**Important (minor):** ✅ Resolved (see key type definitions below)
- ~~`DexServiceError` type chưa được định nghĩa~~ → Đã định nghĩa trong `DexService.ts` (xem Key Type Definitions).
- ~~`ClassificationStatus` enum chưa được document~~ → Đã định nghĩa trong `cleaner.ts` (xem Key Type Definitions).

**Nice-to-Have:**
- UI state binding matrix (store status → component render) chưa được document chi tiết — có thể bổ sung trong UX spec.
- ~~`protocolParams.ts` cần cache strategy document cụ thể~~ → Đã document: Map cache với TTL 1 epoch (~5 ngày), keyed by network ID (xem API & Communication Patterns).

### Architecture Completeness Checklist

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** `READY FOR IMPLEMENTATION` (Sẵn sàng triển khai — 16/16 checklist items đạt, chỉ còn minor gaps không blocking).

**Confidence Level:** High

**Key Strengths:**
- DexService abstraction cho phép test dễ dàng (mock interface) + mở rộng DEX provider sau này.
- Preprod zero external call — không phụ thuộc API khi dev/test.
- Network switch handle race condition ngay từ architecture (AbortController + cache key).
- UI states exposure cho phép UX render chính xác 4 trạng thái.

**Areas for Future Enhancement:**
- UI state binding matrix (store status → component render) — chi tiết hóa trong UX spec.
- `DexServiceError` và `ClassificationStatus` — đã định nghĩa, cần verify khi implement.

### Implementation Handoff

**AI Agent Guidelines:**
- `DexService` interface là contract — MinswapService và HeuristicService phải implement đúng signature.
- `DexServiceError` dùng cho tất cả error paths — không `throw new Error(...)`.
- `classificationStatus` per token phải được expose từ `cleaner.ts` — component chỉ render, không tự fetch.
- Network switch: `AbortController.abort()` request cũ trước khi fetch mới.
- Preprod: `createDexService('preprod')` trả về HeuristicService — không gọi HTTP.
- Test: Unit test DexService với mock fetch; integration test Preprod heuristic không cần mock.

**First Implementation Priority (updated):**
1. `app/services/dex/DexService.ts` — interface + types
2. `app/services/dex/HeuristicService.ts` — Preprod implementation (dễ, không phụ thuộc API)
3. `app/utils/protocolParams.ts` — Blockfrost fetch utility
4. `app/services/dex/index.ts` — factory function
5. Update `app/stores/cleaner.ts` — network-aware fetch + classificationStatus
6. `app/services/dex/MinswapService.ts` — Mainnet implementation (cần test với API key thật)
