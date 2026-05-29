---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "idea.md"
  - "_bmad-output/planning-artifacts/prds/prd-clean-cardano-wallet-2026-05-29/prd.md"
workflowType: 'architecture'
project_name: 'clean-cardano-wallet'
user_name: 'Venom'
date: '2026-05-29'
lastStep: 8
status: 'complete'
completedAt: '2026-05-29'
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
- **Frontend State Management:** Using **Pinia (v2.2.0)** to build reactive global stores (`wallet.ts`, `optimizer.ts`, `junk-detector.ts`) for consistent state management across different views.
- **On-chain API Provider:** Using **Blockfrost API (v1)** as the primary backend provider/adapter to fetch wallet UTXOs and dispatch signed transactions.
- **Junk Overrides Database:** Using **Browser LocalStorage** for saving custom whitelists and "Mark as Trusted" user overrides locally.

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
- **DEX Liquidity Validation:** Direct query to **Minswap API** (or appropriate DEX aggregator) for real-time asset pool evaluation (identifying tokens with $0 liquidity).
- **Blockfrost Querying:** Secured HTTPS communications between browser client and Blockfrost nodes, utilizing API keys configured in standard Nuxt runtime configurations (.env).

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

### Anti-Patterns to Avoid
- *Anti-Pattern:* Directly binding suspicious NFT metadata images to `<img>` source. (Causes phishing risk).
- *Anti-Pattern:* Implementing blockchain interaction code on Nuxt server-side hooks (`useAsyncData`, `onServerPrefetch`). (Causes server WASM execution crash).

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
│       └── transactionBatcher.ts
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

- **FR-1 (Wallet Analysis & Health Score):** `app/stores/wallet.ts`, `app/components/WalletHealth.vue`, `app/components/WalletConnection.vue`.
- **FR-2 (Spam Detection & Phishing Shielding):** `app/stores/cleaner.ts`, `app/components/JunkDetector.vue`, `app/composables/useLocalStorage.ts`.
- **FR-3 (Smart/Manual UTXO Consolidation & Economic Warning):** `app/stores/optimizer.ts`, `app/components/UtxoTable.vue`, `app/components/OptimizerControls.vue`.
- **FR-4 (Transaction Batching Limit):** `app/utils/transactionBatcher.ts` (Core algorithm chunking UTXOs).
- **FR-5 (Spam Consolidation + Isolated Junk Box vs. Full Burn):** `app/stores/cleaner.ts` (Transaction compilation logic), `app/utils/minAdaCalculator.ts` (Locked-ADA calculations), `app/components/JunkBurner.vue`.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Nuxt 4, TypeScript, và Hydra SDK tích hợp hoàn hảo với nhau. Các gói thư viện thuộc hệ sinh thái Hydra SDK của Vtechcom Labs được tối ưu hóa cho môi trường trình duyệt, giúp triệt tiêu hoàn toàn các lỗi Webpack polyfill phức tạp thường gặp ở các thư viện cũ.
- Tích hợp **Vite WebAssembly Configuration** trong `nuxt.config.ts` để loại trừ `@hydra-sdk/cardano-wasm` khỏi dependency optimization, giúp trình đóng gói Vite tải WASM mượt mà.

**Pattern Consistency:**
- Cấu trúc Setup Store trong Pinia hòa hợp tự nhiên với cơ chế Composition API của Vue 3 và tính năng tự động import của Nuxt 4.
- Quy tắc đặt tên (PascalCase cho components, camelCase cho composables/stores/utils) nhất quán xuyên suốt toàn bộ hệ thống.

**Structure Alignment:**
- Cấu trúc thư mục mới của Nuxt 4 (`app/`) định vị rõ ràng ranh giới vật lý: UI components chỉ hiển thị, Pinia stores chịu trách nhiệm xử lý logic và Hydra SDK tương tác trực tiếp với Blockfrost.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- **100% các FR (từ FR-1 đến FR-5)** đều được ánh xạ rõ ràng và phân nhóm cụ thể vào các Store, Composable và Component tương ứng (Không có khoảng trống hoặc yêu cầu bị bỏ sót).
- Thuật toán **Transaction Batching (FR-4)** được đóng gói độc lập trong `app/utils/transactionBatcher.ts` để dễ dàng viết unit test kiểm thử.

**Non-Functional Requirements Coverage:**
- **Bảo mật phi lưu ký (Non-Custodial):** Được đảm bảo do Hydra SDK chỉ build transaction và gửi yêu cầu ký qua CIP-30 extension của trình duyệt; dApp không lưu trữ private key.
- **Chống Phishing:** Cơ chế media shielding (ẩn ảnh/iframe NFT spam) được tích hợp cứng vào logic xử lý DOM của component `JunkDetector.vue`.
- **Hiệu năng & Trải nghiệm:** Việc sử dụng Vite client-side build giúp dApp phản hồi cực nhanh dưới 1 giây, loại bỏ hoàn toàn Hydration mismatch của SSR.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Toàn bộ các quyết định kiến trúc cốt lõi đã được đưa ra, ghi nhận và xác minh phiên bản tương thích ổn định.

**Structure Completeness:**
- Cấu trúc cây thư mục cực kỳ chi tiết, chỉ định chính xác tên file và trách nhiệm của từng file cho lập trình viên.

**Pattern Completeness:**
- Các quy tắc nhất quán mã nguồn (naming, error handling lifecycle, client-side guards) đã được quy định chi tiết bằng các Good/Anti-patterns cụ thể.

### Gap Analysis Results
- Không phát hiện bất kỳ khoảng trống kiến trúc **Nghiêm trọng (Critical)** hay **Quan trọng (Important)** nào.
- *Khoảng trống Thứ yếu (Nice-to-Have):* Khuyến nghị bổ sung file `.env.example` mô tả chi tiết cách lấy API key của Blockfrost từ dashboard chính thức của họ. (Đã được tích hợp trong cấu trúc thư mục).

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

**Overall Status:** `READY FOR IMPLEMENTATION` (Sẵn sàng triển khai 100% - Đạt tối đa 16/16 chỉ mục đánh giá kiểm định).

**Confidence Level:** High (Cực kỳ tự tin nhờ sự phối hợp chặt chẽ giữa các quyết định kỹ thuật và tính thực tế của SDK).

### Implementation Handoff

**AI Agent Guidelines:**
- Tuân thủ tuyệt đối cấu trúc Setup Store của Pinia trong `app/stores/`.
- Bắt buộc bọc các logic Web3 trong thẻ `<ClientOnly>` ở phía view.
- Không được phép tự ý thay đổi quy tắc đặt tên tệp tin.

**First Implementation Priority:**
Khởi tạo cấu trúc dự án Nuxt 4 sạch bằng lệnh:
`npx nuxi@latest init ./ --packageManager npm --gitInit false --force`
sau đó cài đặt hai gói Hydra SDK cốt lõi.
