---
title: ADASweep — Multi-Network DEX-Powered Asset Classification Engine
status: final
created: 2026-06-05
updated: 2026-06-06
---

# PRD: ADASweep — Multi-Network DEX-Powered Asset Classification Engine

## 0. Document Purpose

PRD này định nghĩa yêu cầu cho **Asset Classification Engine** của ADASweep — module phát hiện và phân loại token rác / phishing trong ví Cardano dựa trên dữ liệu thanh khoản thật từ nhiều sàn DEX, hoạt động xuyên suốt cả Preprod testnet lẫn Mainnet.

Tài liệu tập trung vào **luồng classification** (scan → detect → classify), không bao gồm luồng consolidate/burn (đã có trong PRD riêng). Đầu ra của module này là danh sách `trusted` / `suspicious` assets — consumer là JunkBurner, Optimizer và các module downstream khác.

## 1. Vision

Ví Cardano bị tấn công bởi spam token airdrop — hàng trăm asset rác, phishing NFT, low-liquidity meme coin được gửi vào ví mà người dùng không mong muốn. Các ví thông thường chỉ ẩn chúng đi, nhưng chúng vẫn chiếm UTXO và khóa min-ADA.

**ADASweep Asset Classification Engine** giải quyết vấn đề này bằng cách:

- **Quét thật từ DEX**: Kiểm tra thanh khoản thực tế trên nhiều sàn (Minswap, VyFinance, Spectrum, SundaeSwap...) để phân biệt token thật và token rác — không dùng heuristic mù.
- **Cross-network từ ngày 1**: Chạy được trên cả Preprod (test) và Mainnet, tự động chọn DEX provider phù hợp với network đang dùng.
- **Phân loại real-time**: Khi user switch network ở footer, quét lại với provider của network đó.
- **Bảo vệ user khỏi phishing**: Phát hiện metadata URL độc hại, shield ảnh NFT tự động.

Kết quả: user biết chắc asset nào là rác (có thể dọn), asset nào là thật (giữ lại). Không false-positive gây mất token thật.

## 2. Target User

### 2.1 Jobs To Be Done

- **"Tôi muốn biết token nào trong ví là rác thật sự, không phải guess dựa trên tên."** — Functional, trust.
- **"Tôi dùng nhiều ví trên nhiều network, classification phải chạy đúng trên từng network."** — Functional, cross-network.
- **"Tôi không muốn click qua từng asset để kiểm tra — hãy tự động quét và show kết quả."** — Emotional, convenience.
- **"Tôi sợ dính phishing NFT — cần biết cái nào an toàn để mở."** — Emotional, safety.

### 2.2 Non-Users (v1)

- User muốn classification chạy hoàn toàn offline (không cần internet / API).
- Developer muốn tự host DEX scanner riêng (open-source indexer).

### 2.3 Key User Journeys

#### UJ-1: Venom mở app, thấy ngay danh sách token rác

Venom connect ví Preprod, vào page Cleaner. App tự động scan UTXOs → chạy heuristic local (whitelist/blacklist + name pattern) → phân loại asset ngay lập tức (không network latency). Venom thấy tab "Suspicious" có 12 assets, mỗi asset có badge "🔍 Local Heuristic". Venom chọn 12 assets → qua JunkBurner dọn.

- **Edge case:** Nếu DEX API timeout (network chậm), classification fallback về heuristic (name pattern + whitelist/blacklist) trong <5s. Liquidity data update background sau khi API trả về.

#### UJ-2: Venom switch từ Preprod sang Mainnet, classification tự động chạy lại

Venom đang ở Preprod, thấy 12 suspicious assets. Switch network ở footer sang Mainnet → app clear cache → fetch lại từ Mainnet DEX providers (Minswap Aggregator) → chỉ còn 3 suspicious (vì mainnet có nhiều DEX coverage hơn). Venom thấy chính xác.

- **Edge case:** Nếu chưa có Blockfrost API key cho Mainnet trong `.env`, app hiển thị warning "Mainnet DEX check unavailable — using heuristic fallback".

#### UJ-3: Venom mark nhầm token là trusted, sau đó sửa lại

Venom thấy token "SpaceBudz" bị flag suspicious (vì chưa có liquidity cache). Venom click "Mark Trusted" → token chuyển sang tab Trusted + lưu vào localStorage whitelist. Sau đó Venom đổi ý → vào tab Trusted → click "Flag as Spam" → token về lại Suspicious + xóa khỏi whitelist.

## 3. Glossary

- **Asset Classification** — Quá trình gán nhãn `trusted` hoặc `suspicious` cho mỗi native asset trong ví.
- **DEX Provider** — Một nguồn dữ liệu thanh khoản (Minswap Aggregator, VyFinance API, UTXO scanning...).
- **DexService** — Singleton service abstraction, chọn DEX provider dựa trên network.
- **Liquidity Cache** — `Map<assetId, {tvl: number, source: string, checkedAt: timestamp}>`, cached trong memory + có TTL.
- **Phishing URL Shield** — Cơ chế tự động block/replace URL từ metadata của NFT可疑 để tránh user click nhầm.
- **Whitelist Override** — Danh sách assetId user tự trust, lưu trong localStorage, persist cross-session.
- **Network Switch** — Hành động user chuyển Preprod ↔ Mainnet qua dropdown ở footer.
- **DexServiceError** — Error type chuẩn cho tất cả lỗi DEX provider: `NETWORK_ERROR | RATE_LIMITED | API_DOWN | PARSE_ERROR | UNSUPPORTED_NETWORK`.
- **ClassificationStatus** — Trạng thái phân loại mỗi asset: `idle | loading | dexlive | fallback | error`.
- **LiquidityResult** — Kết quả check thanh khoản: `{assetId, hasLiquidity, tvl, source, checkedAt}`.

## 4. Features

### 4.1 Multi-Network DEX Scanner

**Description:** Core scanning engine. Khi user vào Cleaner page (hoặc switch network), hệ thống tự động fetch liquidity data từ DEX providers tương ứng với network hiện tại. Kết quả được cache trong memory với TTL, tránh re-fetch trên mỗi computed reactive.

Network → DEX Provider mapping:

| Network | Primary Provider | Fallback |
|---------|-----------------|----------|
| Preprod | Không gọi API — heuristic local (whitelist/blacklist + name pattern) | — |
| Mainnet | Minswap Aggregator API (`agg-api.minswap.org`) — covers 17+ DEX protocols | Blockfrost UTXO scan tại known pool addresses |

**Realizes UJ-1, UJ-2.**

**Functional Requirements:**

#### FR-1: DexService singleton cung cấp interface thống nhất

Hệ thống có `DexService` abstraction với method:
```typescript
type DexServiceErrorCode =
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'API_DOWN'
  | 'PARSE_ERROR'
  | 'UNSUPPORTED_NETWORK'

interface DexServiceError {
  code: DexServiceErrorCode
  message: string
  retryAfter?: number
}

interface LiquidityResult {
  assetId: string
  hasLiquidity: boolean
  tvl: number
  source: 'minswap' | 'heuristic'
  checkedAt: number
}

interface DexService {
  checkLiquidity(assetId: string): Promise<LiquidityResult | DexServiceError>;
  getSupportedNetworks(): Network[];
}
```
Implementation được inject dựa trên `walletStore.selectedNetwork`. Không hardcode provider trong store.

**Consequences:**
- `app/services/dex/DexService.ts` tồn tại, export interface + types
- `app/services/dex/index.ts` export `createDexService(network): DexService`
- Mỗi network có implementation riêng, testable riêng
- Mọi lỗi từ DexService đều trả về `DexServiceError` — không `throw raw Error`
- Thêm DEX provider mới không cần sửa store

#### FR-2: Fetch liquidity real-time từ DEX API khi vào Cleaner page

Khi `cleaner.vue onMounted` (hoặc network switch), gọi `fetchDexLiquidity()` thật:

1. Lấy danh sách tất cả `assetId` từ wallet UTXOs
2. Batch query DEX providers (tối ưu: gộp nhiều asset vào 1 request nếu API support)
3. Cache kết quả trong `liquidityCache` với TTL 5 phút
4. Show loading indicator trong khi fetch (đã có `isLoadingLiquidity`)

**Consequences:**
- Không mock setTimeout — gọi API thật
- Cache TTL để tránh rate-limit DEX API
- Retry 1 lần nếu fail

#### FR-3: Fallback heuristic khi DEX API unavailable

Nếu tất cả DEX providers cho network hiện tại đều fail (timeout / rate-limit / network error):
- Dùng heuristic fallback: name pattern check + whitelist/blacklist
- Set `classificationStatus = 'fallback'` + `dexSource = 'Local Heuristic'`
- Background retry mỗi 30s (tối đa 3 lần, sau đó set `'error'`)

**Consequences:**
- User không bị block vô thời hạn khi API down
- UI render badge tương ứng: "✅ DEX Verified" (dexlive) | "🔍 Limited" (fallback) | "⚠️ Error" (error)
- Timeout 15s per request — nếu quá lâu, tự động set `'error'`

#### FR-4: Network switch triggers re-classify

Khi user switch network qua footer:

1. `walletStore.setNetwork(n)` chạy
2. Cleaner store watch `walletStore.selectedNetwork` → clear `liquidityCache`
3. Re-fetch `fetchDexLiquidity()` với DEX provider mới
4. `classifiedAssets` computed tự động recompute với cache mới

**Out of Scope:**
- Migrate whitelist overrides giữa các network (mỗi network có whitelist riêng)

### 4.2 DEX Provider Implementations

**Description:** Implementations cụ thể cho từng network. Abstraction cho phép thay thế / thêm provider mà không ảnh hưởng classification pipeline.

#### FR-5: Mainnet — Minswap Aggregator integration

Gọi `POST https://agg-api.minswap.org/aggregator/tokens` với danh sách asset IDs cần check. Response chứa `price_by_ada`, `tvl` cho mỗi token.

Mapping response:
- `tvl > 0` + có `price_by_ada` → trusted (có thị trường thật)
- `tvl = 0` hoặc không có trong response → suspicious

**Consequences:**
- Batch request tối đa 50 assets/request
- Rate-limit handling: 10 requests/second, queue nếu vượt
- Covers: MinswapV2, SundaeSwap, VyFinance, Spectrum, WingRiders, MuesliSwap, Splash,...

#### FR-6: Preprod — Heuristic local (không gọi API ngoài)

Preprod là testnet, token không có giá trị thật. Không cần check DEX — sử dụng heuristic cục bộ:

1. LocalStorage whitelist
2. System blacklist / whitelist
3. Hex name pattern check (Scam/Fake/Junk)

**Consequences:**
- Zero external API call trên Preprod
- Classification instant (không network latency)
- `fetchDexLiquidity()` bỏ qua nếu `network === 'preprod'`

#### FR-7: UTXO scanning fallback (Mainnet)

Nếu Minswap Aggregator API không support một asset cụ thể trên Mainnet, fallback về UTXO scanning:

1. Lấy danh sách pool script addresses cho Mainnet (precomputed config)
2. Blockfrost: `GET /addresses/{poolAddr}/utxos` → kiểm tra asset có trong UTXO assets không
3. Nếu asset xuất hiện trong pool → có liquidity

**Bỏ qua Preprod:** Preprod dùng heuristic local (FR-6), không cần UTXO scan — testnet token không có giá trị.

**Out of Scope:**
- Tính toán TVL từ UTXO data (chỉ check existence)

### 4.3 Phishing Protection & URL Shielding

**Description:** Bảo vệ user khỏi phishing URL ẩn trong NFT metadata tự động.

#### FR-8: Phishing URL detection pipeline

Khi phân loại asset, kiểm tra metadata URL nếu có:
1. URL chứa từ khóa phishing pattern → flag `phishingUrlShielded: true`
2. Auto-block hiển thị image từ URL này
3. UI không fetch/render image từ URL bị shield

**Consequences:**
- `AssetClassification.phishingUrlShielded` flag đã tồn tại, cần implement logic shielding thật trong template
- JunkDetector: `v-if="!asset.phishingUrlShielded"` cho image render

### 4.4 User Whitelist Management

**Description:** User có thể override classification kết quả.

#### FR-9: Whitelist override persist

- `localWhitelistOverrides` lưu trong localStorage, key `adasweep-whitelist-overrides-{network}`
- Khi user switch network, whitelist tự động đọc key tương ứng cho network đó
- Whitelist ưu tiên cao hơn DEX check

#### FR-10: Whitelist phân tách theo network

- Mỗi network có whitelist riêng: key `adasweep-whitelist-overrides-{network}` (ví dụ `adasweep-whitelist-overrides-preprod`, `adasweep-whitelist-overrides-mainnet`)
- Khi switch network, whitelist tự động đọc đúng key cho network đó
- User có thể trust token X trên Mainnet nhưng không trust trên Preprod

### 4.5 Classification Pipeline (End-to-End)

**Description:** Thứ tự ưu tiên phân loại — mỗi asset chạy qua pipeline, dừng ở heuristic đầu tiên match.

```
Input: assetId, policyId, nameHex, metadata

1. LocalStorage whitelist?          → trusted (User Whitelisted)
2. System blacklist?                → suspicious (Blacklisted)
3. System whitelist?                → trusted (System Whitelisted)
4. Hex name chứa "Scam"/"Fake"?     → suspicious (Scam Name Pattern)
5. DEX liquidity > 0?               → trusted (Real Asset — TVL: $X)
6. DEX liquidity = 0?               → suspicious (No DEX Liquidity)
7. DEX unavailable (fallback)?      → trusted (Standard Asset — fallback mode)
8. Mặc định                         → trusted (Standard Asset)
```

**Status tracking per asset:** Mỗi asset trong pipeline mang `ClassificationStatus`:
```
idle → loading (→ timeout 15s → error)
     → dexlive (DEX confirmed)
     → fallback (heuristic do DEX fail)
     → error (không thể classify)
```
Store expose `classificationStatus: Map<assetId, ClassificationStatus>` + `dexSource` string. Component render badge dựa trên status.

**Realizes UJ-1.**

## 5. Non-Goals (Explicit)

- Không xây dựng backend server riêng cho DEX scanning — tất cả chạy client-side (browser gọi API trực tiếp).
- Không implement community spam reporting / feedback loop trong v1.
- Không implement on-chain metadata fetching (IPFS) trong v1 — chỉ xử lý URL metadata nếu có sẵn.
- Không implement liquidity TVL calculation — chỉ check existence (có > 0).
- Không support custom RPC endpoint configuration — chỉ dùng Blockfrost config từ `.env`.

## 6. MVP Scope

### 6.1 In Scope

| Item | Priority |
|------|----------|
| DexService abstraction + interface | P0 |
| Mainnet: Minswap Aggregator integration | P0 |
| Preprod: heuristic local (không gọi API) | P0 |
| Cache với TTL | P0 |
| Network switch → re-classify | P0 |
| Whitelist phân tách theo network | P1 |
| Phishing URL shielding trong UI | P1 |
| Fallback heuristic khi DEX API down | P1 |

### 6.2 Out of Scope for MVP

| Item | Reason | Defer to |
|------|--------|----------|
| Koios integration (alternative to Blockfrost) | Blockfrost đã có sẵn | v2 |
| UI indicator "DEX check mode" (full vs limited) | Nice-to-have | v2 |
| Manual refresh button cho DEX scan | Auto-scan đã đủ | v2 |
| Community spam reporting | Cần backend | v3 |
| IPFS metadata fetching | Phức tạp, ít giá trị | v3 |

## 7. Success Metrics

**Primary**
- **SM-1**: Classification accuracy ≥ 95% — số lần user manually override (mark trusted / flag spam) < 5% trên tổng số asset đã classify. Validates FR-5, FR-6, FR-7.

**Secondary**
- **SM-2**: DEX scan hoàn thành trong < 10s cho ví có ≤ 100 UTXOs. Validates FR-2, FR-3.
- **SM-3**: Zero crash khi switch network. Validates FR-4.

**Counter-metrics**
- **SM-C1**: Số lượng API request/giờ đến Minswap Aggregator — không vượt quá rate-limit (giới hạn ẩn). Cache TTL design chống over-fetch.

## 8. Open Questions

1. Minswap Aggregator API có rate-limit cụ thể không? Cần test thực tế.
2. Pool script addresses cho UTXO scanning trên Mainnet — cần list chính xác các DEX pool addresses.

## 9. Assumptions Index

- `[ASSUMPTION §4.1 FR-2]`: Minswap Aggregator API hỗ trợ batch query hoặc rate-limit đủ cho use case.
- `[ASSUMPTION §6.1]`: Blockfrost API key Mainnet đã được config trong `.env` trước khi launch.
- `[ASSUMPTION §6.2]`: Trên Preprod, heuristic local (whitelist + name pattern) đủ chính xác cho testnet use case.
