---
title: ADASweep — Multi-Network DEX-Powered Asset Classification Engine & Developer Tools
status: final
created: 2026-06-05
updated: 2026-06-23
---

# PRD: ADASweep — Multi-Network DEX-Powered Asset Classification Engine & Developer Tools

## 0. Document Purpose

PRD này định nghĩa yêu cầu cho hai nhóm chức năng chính của ADASweep:
1. **Asset Classification Engine**: Module phát hiện và phân loại token rác / phishing trong ví Cardano dựa trên dữ liệu thanh khoản thật từ nhiều sàn DEX, hoạt động xuyên suốt cả Preprod testnet lẫn Mainnet.
2. **Developer Tools**: Các công cụ bổ trợ dành cho nhà phát triển bao gồm trang Ký dữ liệu văn bản thuần (chỉ dành cho ví Eternl) và trang Giải mã CBOR Hex (hỗ trợ các thực thể Cardano thông dụng như Transaction, UTXO, Address, Value) sử dụng bộ công cụ `@hydra-sdk` có sẵn.

Tài liệu tập trung vào luồng classification (scan → detect → classify) và luồng hoạt động của 2 trang công cụ mới, không bao gồm luồng consolidate/burn (đã có trong PRD riêng).

## 1. Vision

Ví Cardano bị tấn công bởi spam token airdrop — hàng trăm asset rác, phishing NFT, low-liquidity meme coin được gửi vào ví mà người dùng không mong muốn. Các ví thông thường chỉ ẩn chúng đi, nhưng chúng vẫn chiếm UTXO và khóa min-ADA.

**ADASweep** giải quyết vấn đề này bằng cách:
- **Quét thật từ DEX**: Kiểm tra thanh khoản thực tế trên nhiều sàn để phân biệt token thật và token rác.
- **Cross-network từ ngày 1**: Chạy được trên cả Preprod (test) và Mainnet, tự động chọn DEX provider phù hợp với network đang dùng.
- **Phân loại real-time**: Khi user switch network ở footer, quét lại với provider của network đó.
- **Bảo vệ user khỏi phishing**: Phát hiện metadata URL độc hại, shield ảnh NFT tự động.
- **Công cụ hỗ trợ Dev tiện lợi**: Tích hợp trang ký dữ liệu nhanh bằng ví Eternl và giải mã nhanh các cấu trúc CBOR Cardano trực quan ngay trên trình duyệt mà không cần backend hay thư viện bên ngoài khác.

## 2. Target User

### 2.1 Jobs To Be Done

- **"Tôi muốn biết token nào trong ví là rác thật sự, không phải guess dựa trên tên."** — Functional, trust.
- **"Tôi dùng nhiều ví trên nhiều network, classification phải chạy đúng trên từng network."** — Functional, cross-network.
- **"Tôi sợ dính phishing NFT — cần biết cái nào an toàn để mở."** — Emotional, safety.
- **"Tôi là Cardano developer, tôi muốn ký nhanh một thông điệp văn bản bằng ví Eternl của mình để xác thực mà không cần code tool riêng."** — Functional, developer utility.
- **"Tôi muốn xem nhanh nội dung của một chuỗi CBOR hex (giao dịch, UTXO, địa chỉ...) dưới dạng đồ họa trực quan để debug nhanh."** — Functional, convenience.

### 2.2 Non-Users (v1)

- User muốn classification và công cụ chạy hoàn toàn offline (không cần internet / API).
- Developer muốn tự host DEX scanner riêng.

### 2.3 Key User Journeys

#### UJ-1: Venom mở app, thấy ngay danh sách token rác

Venom connect ví Preprod, vào page Cleaner. App tự động scan UTXOs → chạy heuristic local (whitelist/blacklist + name pattern) → phân loại asset ngay lập tức. Venom thấy tab "Suspicious" có 12 assets, mỗi asset có badge "🔍 Local Heuristic". Venom chọn 12 assets → qua JunkBurner dọn.

- **Edge case:** Nếu DEX API timeout (network chậm), classification fallback về heuristic trong <5s. Liquidity data update background sau khi API trả về.

#### UJ-2: Venom switch từ Preprod sang Mainnet, classification tự động chạy lại

Venom đang ở Preprod, thấy 12 suspicious assets. Switch network ở footer sang Mainnet → app clear cache → fetch lại từ Mainnet DEX providers (Minswap Aggregator) → chỉ còn 3 suspicious (vì mainnet có nhiều DEX coverage hơn). Venom thấy chính xác.

- **Edge case:** Nếu chưa có Blockfrost API key cho Mainnet trong `.env`, app hiển thị warning "Mainnet DEX check unavailable — using heuristic fallback".

#### UJ-3: Venom mark nhầm token là trusted, sau đó sửa lại

Venom thấy token "SpaceBudz" bị flag suspicious. Venom click "Mark Trusted" → token chuyển sang tab Trusted + lưu vào localStorage whitelist. Sau đó Venom đổi ý → vào tab Trusted → click "Flag as Spam" → token về lại Suspicious + xóa khỏi whitelist.

#### UJ-4: Venom ký thông điệp bằng ví Eternl

Venom muốn xác minh quyền sở hữu địa chỉ ví bằng cách ký một văn bản thuần. Venom vào trang "Sign Data", nhập văn bản "I approve this transaction". Hệ thống hiển thị chuỗi Hex của văn bản đó theo thời gian thực. Venom bấm "Sign", hệ thống gọi popup ví Eternl để Venom xác nhận ký. Sau khi ký xong, chữ ký dạng Hex (COSE Sign1) và mã khóa công khai (COSE Key) được hiển thị đầy đủ để Venom copy.

- **Edge case:** Nếu ví hiện tại đang kết nối không phải ví Eternl, nút "Sign" bị vô hiệu hóa và hệ thống hiển thị cảnh báo: "Chức năng ký dữ liệu hiện tại chỉ hỗ trợ ví Eternl. Vui lòng kết nối ví Eternl."

#### UJ-5: Venom giải mã một chuỗi CBOR hex sang dạng trực quan

Venom có một mã CBOR Hex đại diện cho một giao dịch nháp (Transaction). Venom vào trang "CBOR Deserializer", dán mã Hex vào và bấm "Deserialize". Hệ thống tự động nhận diện đây là thực thể Cardano Transaction, phân tích cấu trúc và hiển thị dưới dạng khối trực quan gồm: danh sách Inputs (TxHash và Index), Outputs (địa chỉ Bech32, số lượng Lovelace/ADA và danh sách token), cùng với mức phí (Fee). Venom cũng có thể chuyển sang tab JSON để xem trực tiếp cấu trúc cây JSON thô của đối tượng giải mã được từ thư viện WASM.

- **Edge case:** Nếu chuỗi CBOR nhập vào không hợp lệ hoặc không thuộc các đối tượng Cardano thông dụng, hệ thống hiển thị thông báo lỗi: "Không thể giải mã CBOR này thành thực thể Cardano hợp lệ".

## 3. Glossary

- **Asset Classification** — Quá trình gán nhãn `trusted` hoặc `suspicious` cho mỗi native asset trong ví.
- **DEX Provider** — Một nguồn dữ liệu thanh khoản (Minswap Aggregator, VyFinance API, UTXO scanning...).
- **DexService** — Singleton service abstraction, chọn DEX provider dựa trên network.
- **Liquidity Cache** — `Map<assetId, {tvl: number, source: string, checkedAt: timestamp}>`, cached trong memory + có TTL.
- **Phishing URL Shield** — Cơ chế tự động block/replace URL từ metadata của NFT để tránh user click nhầm.
- **Whitelist Override** — Danh sách assetId user tự trust, lưu trong localStorage, persist cross-session.
- **Network Switch** — Hành động user chuyển Preprod ↔ Mainnet qua dropdown ở footer.
- **DexServiceError** — Error type chuẩn cho tất cả lỗi DEX provider.
- **ClassificationStatus** — Trạng thái phân loại mỗi asset: `idle | loading | dexlive | fallback | error`.
- **LiquidityResult** — Kết quả check thanh khoản.
- **Data Sign** — Tính năng ký một thông điệp văn bản thuần bằng khóa riêng của địa chỉ ví thông qua chuẩn CIP-30.
- **COSE Sign1** — Định dạng cấu trúc chữ ký dữ liệu được chuẩn hóa trong CIP-30.
- **CBOR Deserialization** — Quá trình dịch chuyển ngược chuỗi Hex định dạng CBOR thành cấu trúc đối tượng dữ liệu Cardano có thể đọc được.

## 4. Features

### 4.1 Multi-Network DEX Scanner

**Description:** Core scanning engine. Khi user vào Cleaner page (hoặc switch network), hệ thống tự động fetch liquidity data từ DEX providers tương ứng với network hiện tại. Kết quả được cache trong memory với TTL.

Network → DEX Provider mapping:

| Network | Primary Provider | Fallback |
|---------|-----------------|----------|
| Preprod | Không gọi API — heuristic local (whitelist/blacklist + name pattern) | — |
| Mainnet | Minswap Aggregator API — covers 17+ DEX protocols | Blockfrost UTXO scan tại known pool addresses |

**Functional Requirements:**

#### FR-1: DexService singleton cung cấp interface thống nhất
Hệ thống có `DexService` abstraction với các loại kiểu lỗi `DexServiceError` và kết quả `LiquidityResult`. Implementation được inject dựa trên `walletStore.selectedNetwork`.

#### FR-2: Fetch liquidity real-time từ DEX API khi vào Cleaner page
Khi `cleaner.vue onMounted` (hoặc network switch), gọi `fetchDexLiquidity()` thật, lấy danh sách `assetId` từ wallet UTXOs, batch query và cache kết quả với TTL 5 phút.

#### FR-3: Fallback heuristic khi DEX API unavailable
Nếu tất cả DEX providers cho network hiện tại đều fail, dùng heuristic fallback: name pattern check + whitelist/blacklist, đặt status là `'fallback'`.

#### FR-4: Network switch triggers re-classify
Khi user switch network qua footer, clear cache cũ, khởi tạo lại service và re-fetch cho network mới.

### 4.2 DEX Provider Implementations

#### FR-5: Mainnet — Minswap Aggregator integration
Gửi POST request đến Minswap Aggregator API. Parse response: `tvl > 0` là trusted, `tvl = 0` hoặc không có là suspicious.

#### FR-6: Preprod — Heuristic local (không gọi API ngoài)
Sử dụng whitelist local, name pattern check. Không gọi bất kỳ API nào trên Preprod.

#### FR-7: UTXO scanning fallback (Mainnet)
Nếu Minswap Aggregator không trả về data, quét UTXO tại các địa chỉ pool script của Mainnet bằng Blockfrost API.

### 4.3 Phishing Protection & URL Shielding

#### FR-8: Phishing URL detection pipeline
Kiểm tra metadata URL của NFT. Nếu chứa từ khóa độc hại/phishing, flag `phishingUrlShielded: true` và block render ảnh từ URL này trong UI (`JunkDetector`).

### 4.4 User Whitelist Management

#### FR-9: Whitelist override persist
Lưu whitelist trong localStorage key `adasweep-whitelist-overrides-{network}`.

#### FR-10: Whitelist phân tách theo network
Mỗi network có key whitelist riêng, không dùng chung ví dụ `adasweep-whitelist-overrides-preprod` và `adasweep-whitelist-overrides-mainnet`.

### 4.5 Classification Pipeline (End-to-End)

Mỗi asset đi qua pipeline: Whitelist local $\rightarrow$ System blacklist $\rightarrow$ System whitelist $\rightarrow$ Name pattern $\rightarrow$ DEX check $\rightarrow$ Fallback $\rightarrow$ Default.

---

### 4.6 Data Signing (Eternl Only)

**Description:** Cho phép người dùng kết nối ví Eternl, nhập văn bản thuần túy, hiển thị mã Hex tương ứng của văn bản và sử dụng API ví Eternl để thực hiện ký dữ liệu qua chuẩn CIP-30 `signData`.

**Functional Requirements:**

#### FR-11: Data Sign page inputs
- Cung cấp ô nhập liệu (Textarea) cho phép người dùng gõ văn bản thuần túy (Plain text).
- Tự động mã hóa văn bản thuần túy sang chuỗi Hex (UTF-8 bytes to Hex) và hiển thị đồng thời mã Hex này lên màn hình dưới dạng read-only.

#### FR-12: CIP-30 signData integration (Eternl-only)
- Hệ thống chỉ cho phép thực hiện ký nếu ví đang kết nối có `walletName === 'eternl'`.
- Nếu ví đang kết nối không phải Eternl, hiển thị cảnh báo rõ ràng: "Chức năng này chỉ khả dụng khi kết nối với ví Eternl" và khóa nút "Sign".
- Khi người dùng click nút "Sign", hệ thống lấy địa chỉ change address dạng hex từ ví và gọi API của ví: `walletApi.signData(changeAddressHex, payloadHex)`.
- Hiển thị kết quả trả về từ ví dưới dạng đối tượng chữ ký gồm hai trường: `signature` (mã Hex của COSE_Sign1) và `key` (mã Hex của COSE_Key).
- Cung cấp nút sao chép nhanh (Copy) cho cả hai chuỗi kết quả.

---

### 4.7 Cardano CBOR Deserialization

**Description:** Cho phép người dùng nhập chuỗi CBOR Hex của các thực thể Cardano thông dụng và hiển thị cấu trúc dữ liệu đã giải mã dưới dạng JSON hoặc dạng khối trực quan đồ họa. Tất cả logic giải mã chỉ được sử dụng các gói thư viện `@hydra-sdk` sẵn có (như `@hydra-sdk/cardano-wasm`), không cài thêm bất kỳ thư viện CBOR ngoài nào khác.

**Functional Requirements:**

#### FR-13: CBOR Deserialization Parser
- Cung cấp ô nhập chuỗi CBOR Hex.
- Khi người dùng click "Deserialize", hệ thống thực hiện chuyển đổi Hex sang bytes và cố gắng giải mã lần lượt qua các thực thể Cardano thông dụng bằng `@hydra-sdk/cardano-wasm`:
  1. **Transaction**: `CardanoWASM.Transaction.from_bytes(bytes)`
  2. **UTXO (TransactionUnspentOutput)**: `CardanoWASM.TransactionUnspentOutput.from_bytes(bytes)`
  3. **Address**: `CardanoWASM.Address.from_bytes(bytes)`
  4. **Value**: `CardanoWASM.Value.from_bytes(bytes)`
- Nếu giải mã thành công một thực thể, ghi nhận loại thực thể và chuyển đổi cấu trúc của đối tượng đó sang dạng JSON thân thiện.
- Nếu thất bại ở mọi thực thể, hiển thị thông báo lỗi chi tiết cho người dùng.

#### FR-14: Deserialization Views (JSON & UI Blocks)
- Cho phép người dùng chuyển đổi linh hoạt qua 2 tab hiển thị:
  - **JSON View**: Hiển thị cấu trúc JSON thô được định dạng dễ nhìn (dạng cây có thụt lề).
  - **Block View**: Hiển thị giao diện đồ họa đẹp mắt tùy theo loại thực thể được nhận diện:
    - *Transaction*: Hiển thị danh sách Inputs (TxHash, Index), Outputs (Địa chỉ Bech32, Lovelace/ADA và danh sách Assets), và Fee (ADA).
    - *UTXO*: Hiển thị Input (TxHash, Index) và Output chi tiết của UTXO đó.
    - *Address*: Hiển thị địa chỉ Bech32 tương ứng cùng với Network ID nhận diện được từ địa chỉ.
    - *Value*: Hiển thị số lượng Lovelace/ADA và danh sách Assets đi kèm (Asset Name, Policy ID, số lượng).

## 5. Non-Goals (Explicit)

- Không xây dựng backend server riêng cho DEX scanning hay giải mã CBOR — tất cả chạy client-side (browser gọi API trực tiếp, giải mã hoàn toàn bằng WASM của trình duyệt).
- Không implement community spam reporting / feedback loop trong v1.
- Không support ký dữ liệu bằng các ví khác ngoài Eternl trong phiên bản này.
- Không hỗ trợ giải mã các thực thể CBOR không thông dụng khác ngoài 4 thực thể đã nêu (Transaction, UTXO, Address, Value).
- Không cài thêm bất kỳ thư viện giải mã CBOR bên ngoài nào khác ngoài các bộ công cụ `@hydra-sdk` sẵn có.

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
| **Data Signing page (Eternl only)** | P0 |
| **CBOR Deserialization page (Common Cardano entities, JSON + Block View)** | P0 |

### 6.2 Out of Scope for MVP

| Item | Reason | Defer to |
|------|--------|----------|
| Koios integration | Blockfrost đã có sẵn | v2 |
| UI indicator "DEX check mode" | Nice-to-have | v2 |
| Manual refresh button cho DEX scan | Auto-scan đã đủ | v2 |
| Support other wallets for Data Signing | Ràng buộc yêu cầu hiện tại | v2 |
| Support custom CBOR entities decoding | Tránh quá tải MVP | v2 |

## 7. Success Metrics

**Primary**
- **SM-1**: Classification accuracy $\ge$ 95%.
- **SM-4**: Tỷ lệ giải mã CBOR thành công đạt 100% đối với các mã CBOR hợp lệ của 4 thực thể được hỗ trợ.

**Secondary**
- **SM-2**: DEX scan hoàn thành trong < 10s cho ví có $\le$ 100 UTXOs.
- **SM-3**: Zero crash khi switch network hay khi dán CBOR lỗi.

## 8. Open Questions

1. Minswap Aggregator API có rate-limit cụ thể không? Cần test thực tế.
2. Cấu trúc JSON trả về của một số thực thể phức tạp trong `@hydra-sdk/cardano-wasm` (ví dụ TransactionBody với nhiều trường tùy chọn) có cần một helper chuyển đổi tùy biến để giao diện đồ họa Block View đẹp hơn không?

## 9. Assumptions Index

- `[ASSUMPTION §4.1 FR-2]`: Minswap Aggregator API hỗ trợ batch query hoặc rate-limit đủ cho use case.
- `[ASSUMPTION §4.6 FR-12]`: Ví Eternl hỗ trợ đầy đủ API `signData` tuân thủ chuẩn CIP-30.
- `[ASSUMPTION §4.7 FR-13]`: Các hàm `from_bytes` của `@hydra-sdk/cardano-wasm` đủ để kiểm thử tính hợp lệ của chuỗi CBOR.
