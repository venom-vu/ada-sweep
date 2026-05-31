# ADASweep — Cardano UTXO Consolidator & Dust Cleaner 🧹✨

[![Cardano](https://img.shields.io/badge/Cardano-ADA-blue?logo=cardano)](https://cardano.org/)
[![Framework](https://img.shields.io/badge/Framework-Nuxt_4-00DC82?logo=nuxt.js)](https://nuxt.com/)

**ADASweep** là một ứng dụng dApp Web3 chạy hoàn toàn phía Client-side, giúp người dùng hệ sinh thái Cardano giải quyết triệt để tình trạng phân mảnh eUTXO, giải phóng (reclaim) lượng ADA bị khóa do yêu cầu min-ADA từ các token rác và NFT spam, đồng thời tối ưu hóa cấu trúc ví để nâng cao hiệu năng giao dịch.

---

## 📖 Bối cảnh & Tầm nhìn (Vision)

Mô hình kế toán eUTXO của Cardano mang lại sự bảo mật và khả năng xử lý song song vượt trội. Tuy nhiên, sau thời gian dài tham gia DeFi, nhận airdrop, swap và mint NFT, ví của người dùng thường bị phân mảnh thành hàng trăm UTXO nhỏ chứa token rác và NFT vô giá trị. 

Theo cơ chế **Min-ADA Requirement** của Cardano, mỗi UTXO chứa token/NFT bắt buộc phải khóa từ 1 - 2 ADA để ngăn ngừa hành vi spam lưu trữ trên sổ cái. Điều này vô tình khiến hàng chục đến hàng trăm ADA của người dùng bị "kẹt" không thể sử dụng. Đồng thời, việc phân mảnh quá nhiều UTXO (Dust UTXOs) làm tăng đáng kể phí giao dịch trong tương lai và có thể dẫn đến lỗi vượt quá giới hạn kích thước giao dịch (transaction size limit ~16KB).

**ADASweep** ra đời như một chiếc chổi quét thông minh:
- **Tối ưu hóa ví:** Gom các UTXO nhỏ, lẻ thành các UTXO lớn tối ưu.
- **Giải phóng ADA bị khóa:** Gom hoặc đốt các token rác/NFT spam, trả lại lượng ADA bị khóa về ví.
- **Trực quan hóa eUTXO:** Giúp người dùng phổ thông dễ dàng theo dõi sức khỏe ví qua chỉ số *Wallet Health Score*.

---

## 🚀 Tính năng nổi bật (Core Features)

### 📊 1. Phân tích Sức khỏe Ví (Wallet Health Analyzer)
- **Quét & Phân tích UTXO:** Hệ thống kết nối qua cổng CIP-30 (Nami, Eternl, Lace, Vespr,...) để tự động quét toàn bộ UTXO.
- **Thống kê chi tiết:** Hiển thị rõ ràng:
  - Tổng số dư ADA.
  - Số dư ADA khả dụng thực tế.
  - Lượng ADA đang bị khóa trong các UTXO (Locked ADA).
- **Điểm sức khỏe (Wallet Health Score):** Đánh giá tình trạng phân mảnh và lượng ADA bị khóa từ 0% đến 100%.
- **Nhận diện Spam Token tự động:** Tích hợp bộ lọc đa tầng gồm Whitelist, Blacklist và cơ chế kiểm tra động tính thanh khoản trên các sàn DEX lớn (như Minswap).
  - *Bảo vệ người dùng khỏi Phishing:* Ẩn hoàn toàn hình ảnh/media của các NFT hoặc token bị đánh dấu nguy hại, chỉ hiển thị dạng văn bản thuần kèm cảnh báo để tránh người dùng click vào các đường link lừa đảo ẩn giấu.
  - *Quyền kiểm soát thuộc về bạn (Manual Opt-In):* Hệ thống tuyệt đối không tự động tích chọn các asset thuộc danh mục "Suspicious" cho các tác vụ gom bụi hay dọn dẹp hàng loạt, tránh việc thao tác nhầm gây mất mát tài sản.
  - *Đánh dấu tin cậy (Mark as Trusted):* Cho phép người dùng tự đánh dấu thủ công một token/NFT là an toàn, trạng thái này được lưu tại LocalStorage để bỏ qua cảnh báo trong các lần quét sau.

### 🔄 2. Gom ví thông minh (UTXO Consolidator)
- **Smart Consolidate (Gom tự động):** Chỉ với 1 click, dApp tự động gom toàn bộ các UTXO chứa ADA thuần túy hoặc gom các UTXO chứa native asset cùng loại.
- **Manual Selection (Gom thủ công):** Cung cấp giao diện bảng trực quan cho phép chọn từng UTXO cụ thể để đưa vào giao dịch gom.
- **Cảnh báo Hiệu quả Kinh tế (Economic Viability Alert):** Hiển thị cảnh báo màu vàng nếu phí giao dịch ước tính chiếm >30% lượng ADA thu hồi được từ đợt gom.
- **Tự động chia nhỏ giao dịch (Transaction Batching):** Tự động tách nhóm giao dịch nếu số lượng UTXO cần gom vượt quá giới hạn kích thước tối đa của Cardano, giúp người dùng ký tuần tự mượt mà không lo bị lỗi mạng.

### 🔥 3. Dọn dẹp & Giải phóng ADA (Spam Burner)
- **Spam Consolidation + Isolated Junk Box (Mặc định):** Gộp toàn bộ token rác được chọn vào một UTXO duy nhất để tận dụng quy tắc tính min-ADA của Cardano (giúp giảm tối đa lượng ADA bị khóa xuống chỉ còn ~3-5 ADA cho hàng chục token rác, giải phóng ngay lập tức hơn 90% lượng ADA bị khóa còn lại về ví). UTXO rác này sẽ được cô lập ở đáy ví để tránh các thuật toán chọn input (coin selection) thông thường đụng vào.
- **Full Burn (Tùy chọn nâng cao):** Gửi toàn bộ UTXO rác đã gom đến một địa chỉ chết (unspendable address) để làm sạch ví hoàn toàn 100% (chấp nhận hy sinh lượng min-ADA tối thiểu đi kèm).

---

## 🏗️ Hydra SDK & Kiến trúc Giao dịch (Hydra SDK Integration)

ADASweep tương tác trực tiếp với mạng lưới Cardano hoàn toàn từ client-side bằng cách tích hợp sâu bộ công cụ **Hydra SDK** (bao gồm `@hydra-sdk/core`, `@hydra-sdk/cardano-wasm` và `@hydra-sdk/transaction`). Dưới đây là cách kiến trúc này hoạt động:

### 1. Tải WASM Động trên Trình duyệt (Dynamic WASM Loading)
Do Nuxt 4 sử dụng cơ chế Server-Side Rendering (SSR) trong khi các thư viện WebAssembly (WASM) của Cardano chỉ hoạt động trong môi trường trình duyệt, ADASweep áp dụng mô hình tải động (Lazy Dynamic Import) để tránh lỗi crash ứng dụng ở phía Server:
```typescript
let loadedWasm: any = null;
const loadWasm = async () => {
  if (loadedWasm) return loadedWasm;
  if (typeof window !== "undefined") {
    const m = await import("@hydra-sdk/cardano-wasm");
    loadedWasm = m.CardanoWASM;
    return loadedWasm;
  }
  throw new Error("WASM can only be loaded in a browser context.");
};
```
Đồng thời, cấu hình đóng gói trong `nuxt.config.ts` loại trừ `@hydra-sdk/cardano-wasm` khỏi dependency optimization của Vite để đảm bảo tệp WASM được trình duyệt tải lên chuẩn xác:
```typescript
vite: {
  optimizeDeps: {
    exclude: ['@hydra-sdk/cardano-wasm']
  }
}
```

### 2. Giải mã UTXO (CIP-30 CBOR Deserialization)
Khi người dùng kết nối ví, cổng CIP-30 (`getUtxos()`) trả về danh sách các chuỗi Hex-encoded CBOR đại diện cho các UTXO. ADASweep sử dụng `@hydra-sdk/cardano-wasm` để giải mã các chuỗi này thành các đối tượng JavaScript dễ xử lý:
- Sử dụng `TransactionUnspentOutput.from_bytes()` chuyển đổi mảng byte Hex sang các thông tin giao dịch.
- Trích xuất thông tin: `txHash`, `index` (đầu ra), `lovelace` (số lượng ADA), và `multiasset` (tập hợp danh sách policyId, assetName, quantity của các native asset kèm theo).

### 3. Xây dựng Giao dịch Tự chọn Input (Granular Transaction Building)
Để tối ưu hóa cấu trúc ví một cách chính xác nhất, hệ thống cần chỉ định trực tiếp các UTXO làm input đầu vào giao dịch thay vì để thuật toán tự động chọn coin (Coin Selection) của ví tự thực hiện. ADASweep sử dụng `TxBuilder` từ `@hydra-sdk/transaction` kết hợp trực tiếp với các class từ `@hydra-sdk/cardano-wasm`:
- **Nạp Input cụ thể:** Duyệt qua danh sách UTXO do người dùng chọn, chuyển đổi thành `TransactionInput` và nạp vào builder thông qua phương thức `txBuilder.add_regular_input(address, input, value)`.
- **Đóng gói Output tối ưu:** Đóng gói toàn bộ tài sản được chọn gửi lại chính địa chỉ người dùng thông qua `TransactionOutput.new()`. Các native asset cùng loại được gộp chung để giảm thiểu kích thước UTXO.
- **Tính toán Phí & Cân bằng:** Sử dụng `txBuilder.add_change_if_needed(targetAddress)` của Hydra SDK để tự động tính lượng Lovelace làm phí mạng lưới và tạo UTXO change trả về ví.
- **Ký và Gửi giao dịch:** Build giao dịch bằng `.build_tx()`, chuyển sang mã Hex và gửi lệnh yêu cầu ví ký qua `.signTx()`, sau đó nộp lên blockchain thông qua `.submitTx()`.

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

- **Framework:** [Nuxt 4](https://nuxt.com/) (Vue 3, Pinia) mang lại hiệu năng cao và SSR tối ưu.
- **Cardano Integration:** `@hydra-sdk/core`, `@hydra-sdk/cardano-wasm` & `@hydra-sdk/transaction` để tương tác trực tiếp với node Cardano, giải mã UTXO và build giao dịch eUTXO an toàn.
- **Styling:** Tailwind CSS & Vanilla CSS cho giao diện Web3 Glassmorphism tương lai, hỗ trợ tối đa Responsive trên di động và Dark Mode.
- **State Management:** Pinia, kết hợp LocalStorage/SessionStorage lưu trữ cục bộ trạng thái custom whitelist, thông tin session kết nối ví và lựa chọn mạng của người dùng.

---

## 🛡️ Cam kết An toàn (Security Commitments)

- **Client-Side Only:** Ứng dụng chạy hoàn toàn trên trình duyệt của bạn. Chúng tôi không thu thập, lưu trữ, hoặc có quyền truy cập vào Seed Phrase hay Private Key của bạn.
- **Quyền quyết định 100% của bạn:** Mọi giao dịch tối ưu hóa, gom ví hay tiêu hủy token đều yêu cầu chữ ký số xác thực rõ ràng thông qua ví CIP-30 extension/mobile của người dùng. Không có bất kỳ giao dịch tự động ngầm nào.

---

## 💻 Hướng dẫn Cài đặt & Chạy dưới local (Installation & Setup)

### Yêu cầu hệ thống
- Node.js >= 18.x
- npm / pnpm / yarn / bun

### Bước 1: Cài đặt dependencies
```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Bước 2: Khởi chạy Development Server
```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```
Truy cập ứng dụng tại `http://localhost:3000`.

### Bước 3: Build Production
```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Xem trước bản build production tại local:
```bash
# npm
npm run preview

# pnpm
pnpm preview
```

### Chạy Unit/Integration Tests
Dự án sử dụng Vitest để chạy bộ test kiểm thử:
```bash
npm run test
```

---

## 🎯 Chỉ số Thành công (Success Metrics)

- **Reclaimed ADA Volume:** Tổng số lượng ADA được giải phóng thành công cho toàn bộ cộng đồng người dùng.
- **Wallet Health Improvement Rate:** Mức độ cải thiện điểm sức khỏe ví trung bình tăng hơn 50% sau khi tối ưu hóa.
- **Active Optimizations:** Số lượt giao dịch gom UTXO và dọn dẹp thành công.
- **Transaction Failure Rate:** Tỷ lệ giao dịch lỗi được giữ ở mức dưới 1%.
