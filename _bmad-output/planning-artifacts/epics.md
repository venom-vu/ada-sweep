---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "idea.md"
  - "_bmad-output/planning-artifacts/prds/prd-clean-cardano-wallet-2026-05-29/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
lastStep: 4
status: 'complete'
completedAt: '2026-05-29'
---

# clean-cardano-wallet - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for clean-cardano-wallet, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- **FR-1 (Wallet Analysis & Health Score):** Hệ thống phải kết nối qua ví CIP-30 để tải toàn bộ danh sách UTXO, tính toán chính xác: tổng số lượng UTXO, tổng ADA, Locked ADA, ADA khả dụng thực tế, và chấm điểm sức khỏe ví (Wallet Health Score từ 0-100%).
- **FR-2 (Spam Detection & Phishing Shielding):** Hệ thống phải phân loại tài sản thành Trusted và Suspicious dựa trên Whitelist, Blacklist và DEX Liquidity Check động (kiểm tra pool $0 thanh khoản). Các Suspicious assets bắt buộc phải ẩn media NFT chống phishing, không được tự động chọn cho Smart Consolidate, và cung cấp ghi đè 'Mark as Trusted' lưu cục bộ ở LocalStorage.
- **FR-3 (Smart/Manual UTXO Consolidation & Economic Warning):** Hệ thống phải cung cấp chế độ gom bụi tự động (Smart Consolidate) cho ADA trống và token cùng loại, và gom thủ công (Manual Selection). Tích hợp cảnh báo màu vàng khi Phí giao dịch / ADA thu hồi > 30%.
- **FR-4 (Transaction Batching Limit):** Khi số lượng UTXO cần gom lớn vượt kích thước giới hạn 16KB của Cardano, hệ thống phải tự động chia thành nhiều batch giao dịch tối ưu để người dùng thực hiện lần lượt.
- **FR-5 (Spam Consolidation + Isolated Junk Box vs. Full Burn):** Hệ thống phải cung cấp cơ chế mặc định 'Spam Consolidation + Isolated Junk Box' (gom toàn bộ token rác chọn vào 1 UTXO duy nhất để giải phóng 90%+ min-ADA khóa); cung cấp tùy chọn nâng cao 'Full Burn' gửi UTXO rác này sang địa chỉ unspendable.

### NonFunctional Requirements

- **NFR-1 (Non-Custodial Security):** Toàn bộ private key được bảo vệ ở ví người dùng; dApp chỉ build transaction và yêu cầu người dùng ký qua CIP-30.
- **NFR-2 (Client-Side Heavy Architecture):** Logic xử lý UTXO, build transaction, và tính toán min-ADA chạy hoàn toàn ở trình duyệt để bảo vệ riêng tư và tăng hiệu năng.
- **NFR-3 (Performance & Responsiveness):** Tốc độ quét ví và tải dữ liệu thanh khoản từ DEX API dưới 3 giây.
- **NFR-4 (Strict Size Constraint Compliance):** 100% các giao dịch build ra phải dưới 16KB và đủ min-ADA yêu cầu để tránh lỗi node từ chối.

### Additional Requirements

- **ADD-1 (Nuxt 4 + TS + Hydra SDK Starter):** Thiết lập cấu trúc dự án Nuxt 4, TypeScript, và Hydra SDK làm nền tảng kỹ thuật cơ bản (Tác vụ đầu tiên của Epic 1 Story 1).
- **ADD-2 (Pinia Setup Store):** Triển khai Store Pinia theo Setup Store syntax để quản lý trạng thái ví, tối ưu hóa và dọn dẹp.
- **ADD-3 (Nuxt Web3 SSR Guard):** Bọc các module giao dịch và kết kết ví trong `<ClientOnly>` hoặc check `process.client` để tránh Hydration mismatches.
- **ADD-4 (Vite WASM Optimization Exclude):** Thiết lập config `optimizeDeps.exclude` trong `nuxt.config.ts` để loại trừ `@hydra-sdk/cardano-wasm` cho Vite đóng gói WASM mượt mà.
- **ADD-5 (LocalStorage Override Persistence):** Tích hợp LocalStorage để lưu giữ mảng whitelist token ghi đè cục bộ của người dùng.

### UX Design Requirements

- **UX-DR (No Document):** Không có tài liệu UX Thiết kế riêng biệt. Giao diện Web responsive với chế độ Dark Mode sẽ được thiết kế trực quan dựa theo cấu trúc UI của các nhóm tính năng PRD.

### FR Coverage Map

- **FR-1 (Wallet Analysis & Health Score):** Epic 1 & Epic 2 - Wallet Integration & Analysis Dashboard
- **FR-2 (Spam Detection & Phishing Shielding):** Epic 2 - Spam Detection & Media Shielding
- **FR-3 (Smart/Manual UTXO Consolidation):** Epic 3 - UTXO Consolidation & Economic Alert
- **FR-4 (Transaction Batching Limit):** Epic 3 - UTXO Consolidation (Batching Engine)
- **FR-5 (Spam Consolidation vs. Full Burn):** Epic 4 - Junk Cleaner & Reclaim Engine
- **ADD-1 (Nuxt 4 + TS + Hydra SDK Starter):** Epic 1 - Scaffold
- **ADD-2 (Pinia Setup Store):** Epic 1, 2, 3, 4 - Centralized State Management
- **ADD-3 (Nuxt Web3 SSR Guard):** Epic 1, 2, 3, 4 - Client-side Execution
- **ADD-4 (Vite WASM Optimization Exclude):** Epic 1 - Scaffolding Config
- **ADD-5 (LocalStorage Override Persistence):** Epic 2 - User Trust Local Overrides

## Epic List

### Epic 1: Scaffold & Wallet Integration (Kết nối và Đồng bộ Ví)
- **Goal:** Người dùng có thể truy cập dApp Web Nuxt 4 sạch, kết nối ví Cardano bất kỳ (chuẩn CIP-30) một cách an toàn, và xem chính xác thông tin số dư ADA khả dụng cơ bản. Thiết lập toàn bộ nền tảng kỹ thuật và cấu hình WebAssembly.
- **FRs covered:** FR-1 (phần kết nối và tải số dư), ADD-1, ADD-2 (phần store ví), ADD-3, ADD-4.

### Epic 2: Wallet Health Analysis & Spam Detection (Phân tích Ví & Nhận diện Spam)
- **Goal:** Người dùng có thể xem báo cáo chi tiết về sức khỏe ví (Wallet Health Score, tổng số lượng UTXO, số ADA bị khóa). Hệ thống tự động phân loại token rác bằng whitelist, blacklist và kiểm tra thanh khoản DEX động; ẩn ảnh NFT rác để chống phishing và hỗ trợ nút "Mark as Trusted" ghi đè tin cậy lưu cục bộ.
- **FRs covered:** FR-1 (Health score & Locked ADA), FR-2, ADD-5.

### Epic 3: UTXO Optimizer & Consolidation (Gom ví & Tối ưu hóa eUTXO)
- **Goal:** Người dùng có thể xem danh sách UTXO phân mảnh, thực hiện gom UTXO tự động (Smart Consolidate) hoặc gom thủ công (Manual Selection). Hệ thống tự động ước tính phí mạng lưới, hiển thị cảnh báo hiệu quả kinh tế nếu phí mạng lưới chiếm > 30% ADA gom, và tự động chia nhỏ lô giao dịch (batching) khi số lượng UTXO vượt giới hạn 16KB.
- **FRs covered:** FR-3, FR-4.

### Epic 4: Junk Cleaner & Asset Burner (Dọn dẹp Token rác & Giải phóng ADA)
- **Goal:** Người dùng có thể cách ly và gom hàng chục token rác/NFT spam được chỉ định vào một UTXO duy nhất để giải phóng 90%+ lượng min-ADA bị khóa (mặc định là Spam Consolidation + Isolated Junk Box). Cung cấp tùy chọn nâng cao "Full Burn" gửi UTXO rác này sang địa chỉ unspendable để làm sạch ví hoàn toàn.
- **FRs covered:** FR-5.

## Epic 1: Scaffold & Wallet Integration (Kết nối và Đồng bộ Ví)

### Epic Goal
Người dùng có thể truy cập dApp Web Nuxt 4 sạch, kết nối ví Cardano bất kỳ (chuẩn CIP-30) một cách an toàn, và xem chính xác thông tin số dư ADA khả dụng cơ bản. Thiết lập toàn bộ nền tảng kỹ thuật và cấu hình WebAssembly.

### Story 1.1: Khởi tạo mã nguồn dự án Nuxt 4 & Cấu hình WebAssembly (Scaffold & WASM Polyfills)

As a Developer,
I want to scaffold a new Nuxt 4 project with TypeScript and configure Vite to support WebAssembly bundling without SSR errors,
So that I can safely import `@hydra-sdk/core` and `@hydra-sdk/cardano-wasm` on client-side.

**Acceptance Criteria:**

**Given** Thư mục dự án trống.
**When** Tôi chạy lệnh khởi tạo `npx nuxi@latest init ./ --packageManager npm --gitInit false --force` và cài đặt `@hydra-sdk/core` & `@hydra-sdk/cardano-wasm`.
**Then** Khung dự án Nuxt 4 được thiết lập đúng cấu trúc.
**And** Tệp `nuxt.config.ts` được cấu hình `future: { compatibilityVersion: 4 }` và Vite `optimizeDeps.exclude: ['@hydra-sdk/cardano-wasm']`.
**And** Dự án chạy dev server thành công bằng lệnh `npm run dev` không phát sinh bất kỳ lỗi biên dịch hay WASM import nào.

### Story 1.2: Thiết lập Wallet Connection Store & Composable kết nối CIP-30 (Wallet Store & Composable)

As a user Venom,
I want to connect my Cardano browser extension wallet (Nami, Eternl, Lace, Vespr, Flint) via CIP-30,
So that the application can access my wallet state reactively.

**Acceptance Criteria:**

**Given** Dự án Nuxt 4 chạy ổn định.
**When** Tôi kích hoạt kết nối ví trong ứng dụng.
**Then** Vue Composable `app/composables/useCardanoWallet.ts` kích hoạt API chuẩn CIP-30 `window.cardano[walletName].enable()`.
**And** Pinia Store `app/stores/wallet.ts` (viết theo Setup Store syntax) lưu trữ reactive các biến: `walletAddress` (địa chỉ ví), `activeWalletApi` (wallet API instance), và `networkId`.
**And** Tất cả logic Web3 này được chạy an toàn trên client-side (được bảo vệ bởi kiểm tra `process.client` để tránh lỗi SSR sập node).

### Story 1.3: Giao diện kết nối Ví phi tập trung (Wallet Connection Interface)

As a user Venom,
I want a premium responsive Web interface with a unified connect wallet button, listing installed Cardano wallets,
So that I can easily click and select the wallet I want to connect.

**Acceptance Criteria:**

**Given** Wallet store `app/stores/wallet.ts` đã được khởi tạo.
**When** Tôi mở dApp trên trình duyệt.
**Then** Một thanh Navigation header thiết kế bằng Vanilla CSS hiển thị nút "Connect Wallet".
**And** Bấm nút mở ra Modal/Dropdown danh sách các ví extension được cài đặt (Nami, Eternl, Lace, Vespr, Flint) kèm logo SVG tương ứng.
**And** Chọn một ví sẽ kích hoạt hàm kết nối. Khi kết nối thành công, nút chuyển trạng thái hiển thị logo ví kèm địa chỉ rút gọn (Ví dụ: `addr...x9z`).
**And** Toàn bộ phần UI tương tác này bắt buộc bọc trong thẻ `<ClientOnly>` của Nuxt để triệt tiêu hoàn toàn lỗi Hydration mismatch.

### Story 1.4: Tải và hiển thị số dư ADA khả dụng cơ bản (Fetch Basic Wallet UTXO Balance)

As a user Venom,
I want the dApp to query Blockfrost and display my basic wallet balance in ADA,
So that I can immediately confirm the app sees my correct wallet funds.

**Acceptance Criteria:**

**Given** Kết nối ví thành công và đã lưu API instance.
**When** Trạng thái kết nối ví chuyển sang `isConnected`.
**Then** Store `wallet.ts` gọi Blockfrost adapter thông qua Hydra SDK để fetch toàn bộ UTXO của ví.
**And** Tính toán tổng số lượng ADA nằm trong các UTXO này (format hiển thị đẹp, ví dụ: `520.45 ADA`).
**And** Hiển thị trực quan số dư ADA này tại giao diện Dashboard chính.

## Epic 2: Wallet Health Analysis & Spam Detection (Phân tích Ví & Nhận diện Spam)

### Epic Goal
Người dùng có thể xem báo cáo chi tiết về sức khỏe ví (Wallet Health Score, tổng số lượng UTXO, số ADA bị khóa). Hệ thống tự động phân loại token rác bằng whitelist, blacklist và kiểm tra thanh khoản DEX động; ẩn ảnh NFT rác để chống phishing và hỗ trợ nút "Mark as Trusted" ghi đè tin cậy lưu cục bộ.

### Story 2.1: Giao diện Phân tích Sức khỏe Ví & Thống kê ADA Bị khóa (eUTXO Health Dashboard)

As a user Venom,
I want to view a detailed reactive dashboard analyzing my eUTXO fragmentation, listing total UTXO count, total ADA, actual usable ADA, and locked ADA,
So that I can clearly understand how much ADA is trapped in my fragmented wallet.

**Acceptance Criteria:**

**Given** Kết nối ví thành công và đã tải xong danh sách UTXO.
**When** Tôi truy cập trang chủ dApp.
**Then** Một dashboard thiết kế bằng Vanilla CSS hiển thị trực quan các thẻ số liệu:
- Tổng số lượng UTXO (Ví dụ: `120 UTXOs`).
- Tổng số dư ADA, ADA khả dụng thực tế, và Số ADA bị khóa (Locked ADA) kèm tooltip giải thích chi tiết luật min-ADA.
- **Điểm sức khỏe ví (Wallet Health Score - 0-100%):** Tính dựa trên tỷ lệ phân mảnh và lượng ADA bị khóa.
**And** Toàn bộ số liệu tự động cập nhật khi người dùng chuyển đổi tài khoản ví.

### Story 2.2: Phân loại Tài sản động (Trusted vs Suspicious Heuristics via DEX API)

As a user Venom,
I want the dApp to automatically categorize my wallet's native assets (tokens and NFTs) into "Trusted" or "Suspicious" categories using whitelist, blacklist, and dynamic DEX liquidity checks,
So that I can easily identify spam and scam assets without manual sorting.

**Acceptance Criteria:**

**Given** Danh sách UTXO chứa các native assets khác nhau.
**When** Hệ thống quét và phân tích ví.
**Then** Pinia store `cleaner.ts` tự động phân loại:
- `Trusted Assets`: Asset nằm trong Whitelist hệ thống hoặc có pool thanh khoản hoạt động (DEX Liquidity > $0) trên sàn Minswap API.
- `Suspicious Assets`: Asset nằm trong Blacklist, hoặc không có thanh khoản ($0) trên sàn DEX và đồng thời không nằm trong whitelist.
**And** Việc gọi DEX API để kiểm tra thanh khoản là bất đồng bộ (non-blocking) và có cơ chế fallback xử lý lỗi nếu API DEX bị timeout để không làm treo giao diện.

### Story 2.3: Ẩn hình ảnh & Media NFT rác chống Phishing (Phishing Shielding Interface)

As a user Venom,
I want the media files (images, descriptions, external links) of Suspicious assets to be automatically hidden and replaced with clear warnings,
So that I am protected from phishing URLs embedded in spam assets.

**Acceptance Criteria:**

**Given** Danh sách token rác hiển thị tại tab "Suspicious Assets" trong component `JunkDetector.vue`.
**When** Giao diện hiển thị danh sách rác này cho người dùng.
**Then** Hệ thống **chặn hoàn toàn việc load các URL hình ảnh/iframe** từ metadata của các asset nghi ngờ này.
**And** Thay thế bằng một SVG Placeholder màu vàng cảnh báo rõ ràng: *"⚠️ Nội dung nghi ngờ lừa đảo đã ẩn"* kèm theo hiển thị chuỗi Policy ID và tên Text trơn để an toàn 100% cho trình duyệt.

### Story 2.4: Ghi đè tin cậy thủ công lưu LocalStorage (Local Whitelist Overrides)

As a user Venom,
I want to manually mark a suspicious asset as "Trusted",
So that it is no longer flagged as spam in future scans.

**Acceptance Criteria:**

**Given** Một token nằm trong danh sách Suspicious.
**When** Tôi click nút "Mark as Trusted" (Tin cậy) ở dòng token đó.
**Then** Token lập tức được chuyển sang tab "Trusted Assets" và điểm sức khỏe ví được cập nhật lại tương ứng.
**And** Mã định danh độc nhất của token đó (`policyId.assetName`) được lưu trữ vào LocalStorage trình duyệt qua composable `useLocalStorage.ts`.
**And** Reload dApp sẽ bỏ qua việc quét DEX thanh khoản đối với token này và mặc định phân loại là Trusted.

## Epic 3: UTXO Optimizer & Consolidation (Gom ví & Tối ưu hóa eUTXO)

### Epic Goal
Người dùng có thể xem danh sách UTXO phân mảnh, thực hiện gom UTXO tự động (Smart Consolidate) hoặc gom thủ công (Manual Selection). Hệ thống tự động ước tính phí mạng lưới, hiển thị cảnh báo hiệu quả kinh tế nếu phí mạng lưới chiếm > 30% ADA gom, và tự động chia nhỏ lô giao dịch (batching) khi số lượng UTXO vượt giới hạn 16KB.

### Story 3.1: Giao diện hiển thị danh sách UTXO phân mảnh & Chọn lựa thủ công (UTXO Selection Interface)

As a user Venom,
I want to view a table of all my unspent transaction outputs (UTXOs) with checkboxes,
So that I can manually choose which specific UTXOs to merge.

**Acceptance Criteria:**

**Given** Kết nối ví thành công và đã tải xong danh sách UTXO thô.
**When** Tôi truy cập trang "UTXO Optimizer".
**Then** Một bảng dữ liệu thiết kế bằng Vanilla CSS hiển thị danh sách UTXO, bao gồm: Transaction Hash, Output Index, lượng ADA, các Native Asset đi kèm.
**And** Mỗi dòng UTXO có 1 checkbox cho phép chọn thủ công, đi kèm nút "Select All" (Chọn tất cả) ở header.
**And** Tổng số lượng UTXO đã chọn và tổng số ADA trong các UTXO đó được cập nhật reactive ngay trên giao diện (Ví dụ: `Selected: 15 UTXOs, 45.2 ADA`).

### Story 3.2: Bộ lọc Cảnh báo Hiệu quả Kinh tế (>30% Fee Alert)

As a user Venom,
I want a warning alert if the estimated network fee for my consolidation transaction exceeds 30% of the total ADA I will recover,
So that I do not waste ADA on economically inefficient transactions.

**Acceptance Criteria:**

**Given** Tôi đã tick chọn danh sách các UTXO muốn gom.
**When** Hệ thống ước tính lượng ADA giải phóng được và phí mạng lưới (transaction fee).
**Then** Nếu tỷ lệ `Phí giao dịch ước tính / Lượng ADA thu hồi` lớn hơn 30%.
**And** Một hộp cảnh báo màu vàng hiển thị rõ ràng trên giao diện: *"Việc gom các UTXO này có thể không tối ưu về mặt kinh tế do phí giao dịch chiếm tỷ trọng lớn (>30%). Khuyên dùng: Hãy chọn thêm các UTXO khác hoặc thực hiện vào lúc khác."*
**And** Nút "Consolidate" vẫn cho phép người dùng click tiếp tục nếu họ chủ động đồng ý vượt qua cảnh báo.

### Story 3.3: Thuật toán Gom UTXO & Ký giao dịch (Consolidation Engine & Tx Signing)

As a user Venom,
I want to execute the consolidation transaction, merging selected UTXOs into a single output sent back to myself,
So that my wallet structure is optimized.

**Acceptance Criteria:**

**Given** Danh sách UTXO đã chọn hợp lệ (đáp ứng min-ADA và vượt qua pre-flight validation).
**When** Tôi bấm nút "Smart Consolidate" hoặc "Consolidate Selected".
**Then** Pinia store `optimizer.ts` sử dụng Hydra SDK để build một Cardano transaction gửi toàn bộ tài sản được chọn về chính địa chỉ ví của tôi dưới dạng một UTXO đầu ra duy nhất (hoặc gom gọn nhất).
**And** Trình duyệt gọi pop-up của ví extension (ví dụ: Nami/Eternl) yêu cầu tôi ký giao dịch.
**And** Giao dịch được gửi lên mạng lưới thành công qua Blockfrost, hệ thống hiển thị thông báo chúc mừng kèm link mã băm giao dịch (Tx Hash) dẫn tới Cardano scan.

### Story 3.4: Thuật toán Tự động chia nhỏ giao dịch (Transaction Batching Engine)

As a user Venom,
I want the system to automatically split my consolidation into multiple separate transaction batches if the number of selected UTXOs exceeds Cardano's max transaction size limit (~16KB),
So that the transactions compile and submit successfully without node size rejection.

**Acceptance Criteria:**

**Given** Tôi chọn số lượng UTXO cực lớn (ví dụ: 150 UTXO) vượt quá giới hạn dung lượng 16KB của Cardano.
**When** Tôi thực hiện gom ví.
**Then** Thuật toán chia nhỏ lô `app/utils/transactionBatcher.ts` tự động phân chia 150 UTXO này thành các lô nhỏ tối ưu (Ví dụ: 3 lô, mỗi lô tối đa 50 UTXO).
**And** Giao diện hiển thị quy trình tiến độ trực quan: *"Lô 1/3 sẵn sàng ký..."*, *"Lô 2/3..."*.
**And** Hệ thống yêu cầu người dùng ký tuần tự từng lô giao dịch, đảm bảo không có giao dịch nào bị lỗi vượt quá 16KB limit.

## Epic 4: Junk Cleaner & Asset Burner (Dọn dẹp Token rác & Giải phóng ADA)

### Epic Goal
Người dùng có thể cách ly và gom hàng chục token rác/NFT spam được chỉ định vào một UTXO duy nhất để giải phóng 90%+ lượng min-ADA bị khóa (mặc định là Spam Consolidation + Isolated Junk Box). Cung cấp tùy chọn nâng cao "Full Burn" gửi UTXO rác này sang địa chỉ unspendable để làm sạch ví hoàn toàn.

### Story 4.1: Công thức tính toán min-ADA chính xác cho Multi-asset UTXO (Min-ADA Calculation Engine)

As a Developer,
I want a precise client-side utility function that calculates the required min-ADA for any multi-asset bundle according to Cardano ledger rules (Babbage/Conway era),
So that my transaction outputs are built with perfectly exact min-ADA requirements, preventing ledger validation failure.

**Acceptance Criteria:**

**Given** Một mảng các native asset (gồm Policy ID và độ dài ký tự của Asset Name).
**When** Hệ thống gọi tệp tiện ích `app/utils/minAdaCalculator.ts`.
**Then** Hàm trả về lượng min-ADA chính xác tuyệt đối tính bằng Lovelace theo đúng công thức của kỷ nguyên sổ cái hiện tại (Babbage/Conway era).
**And** Hàm xử lý mượt mà và chính xác khi số lượng tài sản trong mảng cực lớn (Ví dụ: 30-50 token rác gộp chung).

### Story 4.2: Thuật toán Gom cách ly Token rác (Spam Consolidation & Isolated Junk Box - Default Mode)

As a user Venom,
I want to pack my selected spam tokens into a single multi-asset UTXO at the bottom of my wallet,
So that I can immediately recover 90%+ of my locked min-ADA while isolating the junk.

**Acceptance Criteria:**

**Given** Tôi đã chọn 30 token rác muốn xử lý trong tab Junk Cleaner.
**When** Tôi bấm nút "Consolidate to Junk Box" (Phương pháp mặc định).
**Then** Store `cleaner.ts` build một giao dịch gom toàn bộ 30 UTXO chứa token rác này làm đầu vào (inputs), tạo ra đúng 1 UTXO đầu ra duy nhất (output) chứa tất cả 30 token đó gửi lại ví.
**And** Lượng min-ADA tối thiểu cho UTXO gộp này được tính chính xác (Ví dụ: chỉ tốn ~3.8 ADA thay vì 42 ADA như trước), giúp hoàn lại ngay lập tức ~38.2 ADA sạch về số dư khả dụng của ví.
**And** UTXO gộp này được lưu trạng thái trong Store dưới dạng "Isolated", thuật toán chọn tiền (coin selection) bình thường sẽ luôn bỏ qua và cách ly nó hoàn toàn, ngăn việc người dùng vô tình tiêu vào.

### Story 4.3: Tiêu hủy hoàn toàn Token rác (Full Burn Advanced Option)

As a user Venom,
I want the option to fully discard my consolidated junk UTXO by sending it to an unspendable dead address,
So that my wallet is completely clean of spam assets.

**Acceptance Criteria:**

**Given** Ví của tôi đang chứa UTXO rác đã được gom gọn (chứa 30 token rác và ~3.8 ADA khóa đi kèm).
**When** Tôi chọn tab nâng cao "Full Burn" và xác nhận ký giao dịch gửi đi.
**Then** Hệ thống build một giao dịch gửi toàn bộ UTXO rác này (bao gồm 30 token rác và ~3.8 ADA) đến một địa chỉ chết (unspendable dead address) đã được kiểm chứng.
**And** Giao dịch thành công, ví của người dùng được dọn sạch hoàn toàn 100% không còn dấu vết của token rác, người dùng chấp nhận hy sinh ~3.8 ADA để đổi lấy sự sạch sẽ tuyệt đối.





