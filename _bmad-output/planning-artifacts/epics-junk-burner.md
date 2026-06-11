---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-clean-cardano-wallet-2026-06-05/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
---

# clean-cardano-wallet — Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ADASweep Asset Classification Engine, decomposing the requirements from the PRD, Architecture, and UX (if exists) into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: DexService singleton cung cấp interface thống nhất — DexServiceError type, LiquidityResult type, factory pattern per network
FR2: Fetch liquidity real-time từ DEX API khi vào Cleaner page (batch query, cache, loading indicator)
FR3: Fallback heuristic khi DEX API unavailable — name pattern + whitelist/blacklist, ClassificationStatus tracking
FR4: Network switch triggers re-classify — clear cache, re-fetch với DEX provider mới, AbortController
FR5: Mainnet — Minswap Aggregator API integration (batch request, rate-limit handling)
FR6: Preprod — Heuristic local (whitelist/blacklist + name pattern, zero external API call)
FR7: UTXO scanning fallback (Mainnet-only) — check pool script addresses via Blockfrost
FR8: Phishing URL detection pipeline — shield metadata URLs, block image rendering
FR9: Whitelist override persist — localStorage key `adasweep-whitelist-overrides-{network}`
FR10: Whitelist phân tách theo network — mỗi network có key riêng

### Non-Functional Requirements

NFR1: Classification accuracy ≥ 95% — user manual override rate < 5% (SM-1)
NFR2: DEX scan hoàn thành trong < 10s cho ví có ≤ 100 UTXOs (SM-2)
NFR3: Zero crash khi switch network (SM-3)
NFR4: Không vượt quá rate-limit Minswap Aggregator — cache TTL design (SM-C1)
NFR5: Zero external API call trên Preprod
NFR6: Tất cả chạy client-side — browser gọi API trực tiếp, không backend server
NFR7: Cache TTL hợp lý — liquidity cache 5 phút, protocol params cache 1 epoch (~5 ngày)
NFR8: Phishing URL shielding trong DOM — không render image từ URL bị shield
NFR9: Network switch race condition safe — AbortController + isCurrentNetwork flag
NFR10: 15s timeout cho mỗi DEX request — tự động set error nếu quá hạn
NFR11: Stale-while-revalidate cho protocol params — dùng cache cũ nếu fetch fail

### Additional Requirements (Architecture)

AR1: Nuxt 4 + Vue 3 + TypeScript + Hydra SDK stack
AR2: DexService abstraction tại `app/services/dex/` — interface + implementations + factory
AR3: Blockfrost utility tại `app/utils/protocolParams.ts` — fetch + cache protocol params
AR4: ClassificationStatus type (idle | loading | dexlive | fallback | error) + transition matrix
AR5: AssetClassification extend với status, dexSource, phishingUrlShielded fields
AR6: Pinia Setup Store syntax — wallet.ts, cleaner.ts, optimizer.ts
AR7: `<ClientOnly>` wrapping cho mọi WASM/CIP-30 code
AR8: Vite optimizeDeps exclude `@hydra-sdk/cardano-wasm`
AR9: Co-located Vitest spec files tại `app/utils/__tests__/`, `app/services/dex/__tests__/`
AR10: Phishing URL shielding — `v-if="!asset.phishingUrlShielded"` trong template

### UX Design Requirements

Không có UX document — bỏ qua.

### FR Coverage Map

| FR                                              | Epic   |
| ----------------------------------------------- | ------ |
| FR1 (DexService interface + types)              | Epic 1 |
| FR2 (Fetch liquidity real-time)                 | Epic 1 |
| FR3 (Fallback heuristic + ClassificationStatus) | Epic 1 |
| FR4 (Network switch re-classify)                | Epic 1 |
| FR5 (Minswap Aggregator Mainnet)                | Epic 1 |
| FR6 (Heuristic local Preprod)                   | Epic 1 |
| FR7 (UTXO scanning fallback Mainnet)            | Epic 1 |
| FR8 (Phishing URL detection)                    | Epic 2 |
| FR9 (Whitelist override persist)                | Epic 2 |
| FR10 (Whitelist per network)                    | Epic 2 |
| AR1-AR9 (Architecture standards)                | Epic 1 |
| AR10 (Phishing URL shielding)                   | Epic 2 |

## Epic List

### Epic 1: Asset Classification Engine

User kết nối ví, vào Cleaner page, thấy tất cả asset được phân loại chính xác bằng dữ liệu DEX thật — real-time, cross-network, với fallback heuristic khi API không available.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, AR1-AR9
**NFRs covered:** NFR2, NFR3, NFR5, NFR6, NFR7, NFR9, NFR10, NFR11

#### Story 1.1: DexService interface + type definitions

As a **developer**,
I want **a DexService interface with DexServiceError and LiquidityResult types**,
So that **all DEX providers implement the same contract and errors are typed, not raw throws**.

**Acceptance Criteria:**

**Given** chưa có DexService abstraction,
**When** tạo `app/services/dex/DexService.ts`,
**Then** nó exports `DexServiceErrorCode`, `DexServiceError`, `LiquidityResult`, và `DexService` interface.

**Given** `DexServiceErrorCode`,
**When** khai báo,
**Then** nó gồm 5 variants: `NETWORK_ERROR`, `RATE_LIMITED`, `API_DOWN`, `PARSE_ERROR`, `UNSUPPORTED_NETWORK`.

**Given** `DexServiceError`,
**When** khai báo,
**Then** nó có `code: DexServiceErrorCode`, `message: string`, `retryAfter?: number`.

**Given** `LiquidityResult`,
**When** khai báo,
**Then** nó có `assetId`, `hasLiquidity`, `tvl`, `source: 'minswap' | 'heuristic'`, `checkedAt`.

**Given** `DexService` interface,
**When** khai báo,
**Then** nó có `checkLiquidity(assetId: string): Promise<LiquidityResult | DexServiceError>` và `getSupportedNetworks(): Network[]`.

#### Story 1.2: HeuristicService — Preprod classification

As a **user on Preprod testnet**,
I want **assets to be classified instantly without external API calls**,
So that **I can test the classification feature without network dependency**.

**Acceptance Criteria:**

**Given** Preprod network,
**When** `createDexService('preprod')` được gọi,
**Then** nó trả về instance của `HeuristicService`.

**Given** `HeuristicService.checkLiquidity(assetId)`,
**When** assetId nằm trong localStorage whitelist,
**Then** trả về `LiquidityResult` với `hasLiquidity: true`, `source: 'heuristic'`.

**Given** `HeuristicService.checkLiquidity(assetId)`,
**When** assetId có name hex chứa "Scam"/"Fake"/"Junk",
**Then** trả về `LiquidityResult` với `hasLiquidity: false`.

**Given** `HeuristicService.checkLiquidity(assetId)`,
**When** assetId không match bất kỳ rule nào,
**Then** trả về `LiquidityResult` với `hasLiquidity: true` (default trusted).

**Given** `HeuristicService`,
**When** gọi `getSupportedNetworks()`,
**Then** trả về `['preprod']`.

**Given** `HeuristicService`,
**When** bất kỳ method nào được gọi,
**Then** không có HTTP request nào được thực hiện (zero external API).

#### Story 1.3: protocolParams.ts — Blockfrost params fetch

As a **developer**,
I want **to fetch Cardano protocol parameters from Blockfrost with memory cache**,
So that **TxBuilder receives fresh params without hardcoding and without re-fetching every time**.

**Acceptance Criteria:**

**Given** `fetchProtocolParams('mainnet')`,
**When** gọi lần đầu,
**Then** nó fetch từ Blockfrost `/epochs/latest/parameters` và cache kết quả.

**Given** `fetchProtocolParams('preprod')`,
**When** gọi lần đầu,
**Then** nó fetch từ Blockfrost Preprod endpoint.

**Given** cache đã có params cho 'mainnet',
**When** gọi `fetchProtocolParams('mainnet')` trong vòng 5 ngày (TTL),
**Then** nó trả về cached value, không fetch lại.

**Given** cache đã có params nhưng fetch mới thất bại (network error),
**When** gọi `fetchProtocolParams`,
**Then** nó trả về cached value cũ (stale-while-revalidate).

**Given** cache chưa có params và fetch thất bại,
**When** gọi `fetchProtocolParams`,
**Then** nó throw error.

**Given** cache keyed by network,
**When** fetch cho 'preprod' và 'mainnet',
**Then** mỗi network có cache entry riêng, không cross-contaminate.

#### Story 1.4: DexService factory

As a **developer**,
I want **a factory function `createDexService(network)` that returns the correct DexService implementation**,
So that **the store and components can get the right provider without knowing implementation details**.

**Acceptance Criteria:**

**Given** `createDexService('preprod')`,
**When** gọi,
**Then** nó trả về instance của `HeuristicService`.

**Given** `createDexService('mainnet')`,
**When** gọi,
**Then** nó trả về instance của `MinswapService`.

**Given** `createDexService('mainnet')`,
**When** `MinswapService` chưa implement xong,
**Then** nó throw `DexServiceError` với code `UNSUPPORTED_NETWORK`.

**Given** `createDexService` với network không hợp lệ,
**When** gọi,
**Then** nó throw `DexServiceError` với code `UNSUPPORTED_NETWORK`.

**Given** `app/services/dex/index.ts`,
**When** kiểm tra exports,
**Then** nó export `createDexService`, `DexService`, `DexServiceError`, `LiquidityResult`.

#### Story 1.5: Cập nhật cleaner.ts — DexService pipeline

As a **user**,
I want **assets in my wallet to be automatically classified when I visit the Cleaner page**,
So that **I can see which tokens are junk and which are real without manual work**.

**Acceptance Criteria:**

**Given** user vào Cleaner page,
**When** `fetchDexLiquidity()` được gọi,
**Then** nó lấy danh sách assetIds từ wallet UTXOs và gọi `DexService.checkLiquidity()` cho từng asset.

**Given** classification đang chạy,
**When** asset đang được check,
**Then** `classificationStatus[assetId] === 'loading'`.

**Given** DEX trả về `LiquidityResult` với `hasLiquidity: true`,
**When** pipeline hoàn tất,
**Then** `classificationStatus[assetId] === 'dexlive'`.

**Given** DEX trả về `LiquidityResult` với `hasLiquidity: false`,
**When** pipeline hoàn tất,
**Then** `classificationStatus[assetId] === 'dexlive'` (DEX đã confirm).

**Given** DEX trả về `DexServiceError`,
**When** pipeline chạy fallback heuristic,
**Then** `classificationStatus[assetId] === 'fallback'`.

**Given** DEX request timeout > 15s,
**When** quá hạn,
**Then** `classificationStatus[assetId] === 'error'`.

**Given** tất cả asset đã classify,
**When** kiểm tra store,
**Then** `classifiedAssets` computed trả về danh sách đầy đủ với `status` và `dexSource` fields.

#### Story 1.6: MinswapService — Mainnet Aggregator

As a **user on Mainnet**,
I want **assets to be checked against real DEX liquidity via Minswap Aggregator**,
So that **I can trust the classification is based on real market data**.

**Acceptance Criteria:**

**Given** `MinswapService` implements `DexService`,
**When** kiểm tra class,
**Then** nó có `checkLiquidity(assetId)` và `getSupportedNetworks()` methods.

**Given** `checkLiquidity(assetId)`,
**When** gọi,
**Then** nó gửi POST request đến Minswap Aggregator API với danh sách asset IDs.

**Given** API trả về `tvl > 0` cho asset,
**When** parse response,
**Then** trả về `LiquidityResult` với `hasLiquidity: true`, `source: 'minswap'`, `tvl` từ response.

**Given** API không trả về asset trong response,
**When** parse,
**Then** trả về `LiquidityResult` với `hasLiquidity: false`, `tvl: 0`.

**Given** API trả về HTTP error hoặc timeout,
**When** xử lý,
**Then** trả về `DexServiceError` với code tương ứng.

**Given** API rate-limited (429),
**When** xử lý,
**Then** trả về `DexServiceError` với code `RATE_LIMITED` và `retryAfter` từ response header.

**Given** `getSupportedNetworks()`,
**When** gọi,
**Then** trả về `['mainnet']`.

#### Story 1.7: UTXO scanning fallback (Mainnet)

As a **user on Mainnet**,
I want **assets not found by Minswap Aggregator to be checked via UTXO scanning at pool addresses**,
So that **I still get liquidity data even if the aggregator doesn't cover a specific asset**.

**Acceptance Criteria:**

**Given** Minswap Aggregator không trả về data cho asset,
**When** `MinswapService` fallback được kích hoạt,
**Then** nó gọi Blockfrost `GET /addresses/{poolAddr}/utxos` cho danh sách pool script addresses.

**Given** asset xuất hiện trong UTXO của pool address,
**When** scan hoàn tất,
**Then** trả về `LiquidityResult` với `hasLiquidity: true`, `source: 'minswap'`.

**Given** asset không xuất hiện trong bất kỳ pool nào,
**When** scan hoàn tất,
**Then** trả về `LiquidityResult` với `hasLiquidity: false`.

**Given** Blockfrost pool list chưa được cấu hình,
**When** fallback được gọi,
**Then** trả về `DexServiceError` với code `UNSUPPORTED_NETWORK`.

#### Story 1.8: Network switch re-classify

As a **user switching between Preprod and Mainnet**,
I want **classification to automatically re-run with the correct DEX provider**,
So that **I always see accurate results for the network I'm using**.

**Acceptance Criteria:**

**Given** user đang ở Mainnet với kết quả classification,
**When** switch sang Preprod,
**Then** `walletStore.selectedNetwork` change → `cleanerStore` clear liquidity cache + re-fetch với `HeuristicService`.

**Given** DEX request đang pending cho Mainnet,
**When** user switch network nhanh,
**Then** `AbortController.abort()` được gọi, request cũ bị cancel.

**Given** request cũ bị abort,
**When** response trả về sau khi abort,
**Then** nó bị ignore (không overwrite kết quả mới).

**Given** switch network lần 2 khi request lần 1 chưa xong,
**When** abort request 1 và start request 2,
**Then** chỉ có request 2 được xử lý.

**Given** cache keyed by network ID,
**When** switch từ Preprod về Mainnet,
**Then** cache Mainnet cũ (nếu còn TTL) được dùng lại, không fetch lại.

### Epic 2: Phishing Protection & User Whitelist

User được bảo vệ khỏi phishing NFT ẩn trong metadata, có thể tự trust/flag asset và override classification qua localStorage whitelist — phân tách theo từng network.
**FRs covered:** FR8, FR9, FR10, AR10
**NFRs covered:** NFR1, NFR4, NFR8

#### Story 2.1: Phishing URL detection pipeline

As a **user**,
I want **metadata URLs in NFT assets to be automatically checked for phishing patterns**,
So that **I'm protected from accidentally clicking malicious links**.

**Acceptance Criteria:**

**Given** asset metadata chứa URL,
**When** classification pipeline chạy,
**Then** nó kiểm tra URL với danh sách phishing patterns (từ khóa, domain可疑).

**Given** URL match phishing pattern,
**When** pipeline hoàn tất,
**Then** `asset.phishingUrlShielded === true`.

**Given** URL không match phishing pattern,
**When** pipeline hoàn tất,
**Then** `asset.phishingUrlShielded === false`.

**Given** metadata không có URL field,
**When** pipeline chạy,
**Then** bỏ qua, `phishingUrlShielded === false`.

#### Story 2.2: Phishing URL shielding template

As a **user**,
I want **phishing NFT images to not be rendered in the UI**,
So that **I never accidentally trigger a malicious URL by loading an image**.

**Acceptance Criteria:**

**Given** `asset.phishingUrlShielded === true`,
**When** JunkDetector.vue render asset card,
**Then** `<img>` src bị block, hiển thị warning SVG thay thế.

**Given** `asset.phishingUrlShielded === true`,
**When** kiểm tra DOM,
**Then** URL gốc không xuất hiện trong bất kỳ attribute nào (`src`, `href`, `data-*`).

**Given** `asset.phishingUrlShielded === false`,
**When** JunkDetector.vue render asset card,
**Then** image được render bình thường.

#### Story 2.3: Whitelist override localStorage

As a **user**,
I want **to mark a suspicious asset as trusted (or vice versa) and have my choice persist**,
So that **I don't have to re-classify assets I already know are safe**.

**Acceptance Criteria:**

**Given** user click "Mark Trusted" trên asset Suspicious,
**When** action được gọi,
**Then** asset ID được thêm vào localStorage key `adasweep-whitelist-overrides-{network}` (ví dụ `adasweep-whitelist-overrides-mainnet`) và classification chuyển sang trusted.

**Given** user click "Flag as Spam" trên asset Trusted,
**When** action được gọi,
**Then** asset ID bị xóa khỏi localStorage whitelist của network hiện tại và classification chuyển sang suspicious.

**Given** whitelist đã có entries cho Mainnet,
**When** user switch sang Preprod,
**Then** whitelist Preprod (key khác) được đọc, không bị ảnh hưởng bởi whitelist Mainnet.

**Given** localStorage `adasweep-whitelist-overrides-preprod`,
**When** user refresh browser ở Preprod,
**Then** whitelist entries cho Preprod được load lại và áp dụng cho classification.

#### Story 2.4: Whitelist UI interactions

As a **user**,
I want **clear buttons to trust or flag assets directly in the classification UI**,
So that **I can quickly correct misclassifications without leaving the page**.

**Acceptance Criteria:**

**Given** asset ở tab Suspicious,
**When** render JunkDetector card,
**Then** có nút "Mark Trusted" hiển thị.

**Given** asset ở tab Trusted,
**When** render JunkDetector card,
**Then** có nút "Flag as Spam" hiển thị.

**Given** user click "Mark Trusted",
**When** action hoàn tất,
**Then** asset di chuyển từ Suspicious sang Trusted tab ngay lập tức (optimistic update).

**Given** user click "Flag as Spam",
**When** action hoàn tất,
**Then** asset di chuyển từ Trusted sang Suspicious tab ngay lập tức.
