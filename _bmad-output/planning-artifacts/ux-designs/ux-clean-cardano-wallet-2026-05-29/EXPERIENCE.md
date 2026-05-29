---
name: CleanCardano
status: final
sources:
  - {planning_artifacts}/prds/prd-clean-cardano-wallet-2026-05-29/prd.md
updated: 2026-05-29
---

# CleanCardano — Experience Spine

Bản đặc tả trải nghiệm người dùng (UX Experience Spine) này định nghĩa cấu trúc thông tin, hành vi tương tác, các trạng thái hệ thống, khả năng tiếp cận và các luồng hành trình người dùng chính cho ứng dụng **Cardano UTXO Consolidator & Dust Cleaner**. Paired với `DESIGN.md` sở hữu các mã thông báo trực quan `{colors.*}`, `{rounded.*}`, và `{components.*}`.

---

## Foundation

* **Hệ nền tảng:** Ứng dụng Web đơn trang (Single-page dApp) responsive, được xây dựng trên khung phát triển Nuxt 4 (Vue 3, Pinia) và mã hóa kiểu dáng thông qua hệ thống Vanilla CSS tùy biến cao cấp.
* **Hệ thống ví tích hợp:** Tương tác trực tiếp với các ví trình duyệt (Extension) hoặc ví di động thông qua tiêu chuẩn **CIP-30** (Nami, Vespr, Eternl, Flint, Lace).
* **Kiến trúc dữ liệu:** Hoạt động hoàn toàn ở phía máy khách (Client-side). Trạng thái đáng tin cậy của tài sản ("Marked as Trusted") được lưu trữ trực tiếp tại `LocalStorage` của trình duyệt người dùng để tối ưu hóa tính riêng tư và tốc độ tải.
* **Tài liệu tham chiếu thiết kế:** Toàn bộ ngôn ngữ thiết kế và mã thông báo trực quan được kế thừa từ [DESIGN.md](file:///Users/huy_vq/Desktop/clean-cardano-wallet/_bmad-output/planning-artifacts/ux-designs/ux-clean-cardano-wallet-2026-05-29/DESIGN.md).

---

## Information Architecture

Cấu trúc phân bổ không gian và thông tin của trang dApp đơn lẻ `cleaner.vue`:

```
+--------------------------------------------------------------------------+
|  [Logo & Brand]                                    [Connect Wallet Button] |
+--------------------------------------------------------------------------+
|  [Wallet Health Analyzer - Banner Sức Khỏe Ví]                            |
|  - Health Score (% Gauge) | Total ADA | Usable ADA | Locked ADA          |
+--------------------------------------------------------------------------+
|  [Detector Panel - Left 60%]          | [Burner Panel - Right 40%]        |
|  - Tabs: Tokens | NFTs                 | - Sweep Action Summary            |
|  - Filters: All | Spam | Trusted      |   * Selected count: N assets       |
|  - Asset Table Checklist               |   * Estimated Network Fee: N ADA  |
|    * Checkbox                          |   * Reclaimed ADA: N ADA (Net)    |
|    * Asset Name (Hidden img if spam)  | - Option A: Isolated Junk Box     |
|    * Liquidity ($0 / Blacklist)       | - Option B: Full Burn (Advanced)  |
|    * Reclaimable ADA value            | - Button: [Burn & Reclaim]        |
|    * Action: Mark Trusted             | - Economic Alert (if Fee > 30%)   |
+--------------------------------------------------------------------------+
```

### Các bề mặt chức năng chính (Surfaces):

1. **Disconnected View (Trạng thái chưa kết nối):**
   * **Mục tiêu:** Giới thiệu giá trị sản phẩm và kích thích hành động kết nối ví.
   * **Bố cục:** Căn giữa màn hình, thẻ gương `{components.card-glass}` lớn mô tả tính năng quét spam & giải phóng ADA. Nút bấm chính `{components.btn-primary}` kết nối ví hoặc mở chế độ Sandbox Demo.
2. **Wallet Health Analyzer (Banner phân tích sức khỏe):**
   * **Mục tiêu:** Cung cấp phản hồi tức thì về tình trạng ví của người dùng.
   * **Thành phần:**
     * **Điểm Sức Khỏe (Health Score Gauge):** Vòng tròn đo lường phần trăm (0-100%) chuyển đổi màu sắc linh hoạt từ Đỏ `{colors.color-danger}` (nếu <40%), Vàng `{colors.color-warning}` (40-79%) đến Xanh `{colors.color-success}` (>=80%).
     * **Thông số tài sản:** Bảng so sánh trực quan giữa Tổng số ADA hiện có (Total Balance), Số ADA thực tế sử dụng được (Usable ADA) và Số ADA đang bị khóa trong các UTXO rác (Locked ADA).
3. **Detector Panel (Khung phân loại tài sản - 60% bên trái):**
   * **Mục tiêu:** Giúp người dùng phân loại và tích chọn chính xác các token/NFT muốn xử lý.
   * **Thành phần:**
     * **Bộ lọc phân loại:** Chuyển đổi tab linh hoạt giữa "Tokens" và "NFTs", kèm các nút lọc trạng thái "All", "Suspicious" (Rác nghi ngờ), "Trusted" (Đáng tin cậy).
     * **Bảng danh sách tài sản (Sleek Table):** Chứa các cột: Checkbox chọn (`.checkbox-custom`), Tên tài sản (được ẩn media nếu là Suspicious), Trạng thái thanh khoản DEX, và Số ADA ước tính sẽ được giải phóng cho UTXO đó.
     * **Nút hành động nhanh:** Nút "Mark as Trusted" để chuyển trạng thái tài sản rác thành tài sản uy tín, ghi nhận vào `LocalStorage`.
4. **Burner Panel (Khung hành động và tính toán - 40% bên phải):**
   * **Mục tiêu:** Tổng hợp kết quả kinh tế và thực hiện giao dịch tối ưu hóa.
   * **Thành phần:**
     * **Bảng tóm tắt tài chính:** Hiển thị số lượng tài sản đã chọn, Phí giao dịch mạng ước tính, và Lượng ADA thực tế thu hồi ròng (Reclaimed ADA = Locked ADA - Phí).
     * **Lựa chọn phương thức:**
       * **Isolated Junk Box (Mặc định - Khuyên dùng):** Gom toàn bộ token rác được chọn vào một UTXO duy nhất để giải phóng 90%+ ADA bị khóa mà không mất phí burn nâng cao.
       * **Full Burn (Tùy chọn nâng cao):** Tiêu hủy hoàn toàn 100% token rác bằng cách gửi đến địa chỉ unspendable, chấp nhận mất một lượng min-ADA nhỏ để ví sạch hoàn toàn.
     * **Nút xác nhận hành động:** Nút bấm lớn (`{components.btn-danger}`) để thực hiện build giao dịch và ký ví CIP-30.

---

## Voice and Tone

Microcopy trong CleanCardano giao tiếp một cách rõ ràng, trung thực, mang tính hướng dẫn kỹ thuật nhưng dễ tiếp cận, tuyệt đối không dùng ngôn ngữ quảng cáo hoặc cường điệu.

| Do (Nên nói) | Don't (Không nên nói) |
|---|---|
| "Tìm thấy 45 token rác. Giải phóng khoảng 68.2 ADA." | "Ví của bạn có rất nhiều rác! Hãy dọn ngay để nhận quà! 🚀" |
| "Isolated Junk Box: Gom toàn bộ token rác được chọn vào một UTXO duy nhất để thu hồi 90% ADA tối đa." | "Tự động xóa sạch mọi thứ biến mất khỏi thế giới này!" |
| "Ví của bạn đang ở trạng thái Tối ưu (Health Score: 95%)." | "Chúc mừng! Bạn đã sở hữu chiếc ví hoàn hảo nhất hệ sinh thái!" |
| "Không thể kết nối ví. Xin vui lòng kiểm tra xem ví trình duyệt đã được mở khóa chưa." | "Lỗi kết nối nghiêm trọng! Hãy thử lại sau." |
| "Cảnh báo: Phí giao dịch chiếm hơn 30% lượng ADA thu hồi được." | "Giao dịch không kinh tế, cấm thực hiện." |

---

## Component Patterns

Mô tả hành vi tương tác động của các thành phần giao diện chính:

### 1. Bảng danh sách tài sản (`asset-row`)
* **Hành vi hover:** Dòng tài sản sáng nhẹ nền, hiển thị nút ẩn/hiện "Mark as Trusted" ở cuối dòng.
* **Hành vi bảo vệ (Suspicious Asset):** Nếu tài sản bị đánh dấu Suspicious, **tuyệt đối không hiển thị ảnh thumbnail** để tránh phishing. Click vào dòng chỉ hiển thị cảnh báo văn bản tĩnh, không mở bất kỳ liên kết ngoài nào.
* **Cập nhật trạng thái:** Khi người dùng nhấn "Mark as Trusted", dòng tài sản ngay lập tức trượt nhẹ (slide out) ra khỏi tab "Suspicious" và chuyển sang tab "Trusted" với hiệu ứng chuyển động mượt mà.

### 2. Cảnh báo hiệu quả kinh tế (`economic-viability-alert`)
* **Kích hoạt:** Hệ thống liên tục theo dõi tỷ lệ `Phí mạng ước tính / Tổng ADA thu hồi`. Nếu tỷ lệ này vượt quá `30%`, một biểu ngữ màu vàng `{colors.color-warning}` sẽ trượt xuống ngay trên nút bấm chính với nội dung:
  > ⚠️ **Hiệu quả kinh tế thấp:** Phí giao dịch mạng ước tính chiếm {N}% lượng ADA thu hồi được từ các UTXO này. Hãy cân nhắc chọn thêm nhiều tài sản rác hơn trong một lần xử lý để tối ưu phí mạng.

### 3. Vòng đo sức khỏe (`wallet-health-gauge`)
* **Hành vi:** Khi dữ liệu ví được tải hoặc sau khi giao dịch gom/đốt thành công, vòng đo sức khỏe sẽ chạy hiệu ứng tăng dần (spin & count-up) từ 0% đến mức phần trăm thực tế nhằm tạo sự phấn khích trực quan cho người dùng.

---

## State Patterns

Các trạng thái đặc thù của giao diện người dùng:

* **Cold App Load (Tải ví ban đầu):** Banner sức khỏe và danh sách tài sản hiển thị hiệu ứng Shimmer mờ (xem `.shimmer` trong thiết kế) để mô phỏng cấu trúc lưới dữ liệu đang được tải từ blockchain thông qua CIP-30.
* **Empty Wallet State (Ví sạch):** Nếu ví người dùng không có UTXO phân mảnh hoặc token rác, Detector Panel hiển thị thông báo trống kèm icon tích xanh lá cây `{colors.color-success}`: *"Ví của bạn hoàn toàn sạch sẽ! Không tìm thấy token rác hay sự phân mảnh UTXO."*
* **High Fragmentation Warning (Ví phân mảnh nặng):** Nếu số lượng UTXO vượt quá 80, Banner sức khỏe sẽ hiển thị cảnh báo đỏ nhấp nháy mờ: *"Ví của bạn đang bị phân mảnh nghiêm trọng (Health Score < 40%). Hãy sử dụng Smart Consolidate để giảm phí giao dịch tương lai."*
* **Transaction Batching (Trạng thái chia nhỏ giao dịch):** Khi số lượng tài sản gom > 50, giao diện nút bấm chuyển thành: *"Thực hiện Batch 1 / {N} (Chọn 50 tài sản đầu tiên)"* kèm thanh tiến trình hoàn thành từng batch để tránh lỗi vượt hạn mức giao dịch mạng Cardano (~16KB).

---

## Interaction Primitives

* **Thao tác chuột:**
  * Click chọn checkbox ở đầu hàng để chọn tài sản đơn lẻ.
  * Click nút "Select All Suspicious" ở tiêu đề bảng để chọn nhanh toàn bộ token rác đã lọc.
  * Click nút "Mark as Trusted" để loại trừ tài sản khỏi danh sách quét rác.
* **Thao tác bàn phím (Power-user shortcuts):**
  * `Esc` — Đóng mọi hộp thoại xác nhận hoặc pop-up đang hiển thị.
  * `Space` — Khi đang di chuyển qua danh sách bảng bằng phím mũi tên `Up/Down`, phím `Space` dùng để bật/tắt (toggle) chọn checkbox của tài sản đó.
  * `Enter` — Kích hoạt nhanh nút bấm chính (gom hoặc đốt) khi hộp thoại xác nhận đang được focus.

---

## Accessibility Floor

Đảm bảo dApp tuân thủ đầy đủ các tiêu chuẩn tiếp cận Web cơ bản (WCAG 2.2 AA):

* **Điều hướng bàn phím:** Người dùng có thể sử dụng hoàn toàn phím `Tab` để di chuyển qua các thành phần tương tác theo thứ tự đọc tự nhiên từ trái sang phải, từ trên xuống dưới.
* **Hỗ trợ Screen Reader:**
  * Các hàng tài sản chứa thuộc tính `aria-label` mô tả rõ ràng: *"Token {Tên token}, Giá trị ADA bị khóa {N} ADA, Trạng thái: Nghi ngờ là rác"*.
  * Vòng đo sức khỏe cập nhật thuộc tính `aria-valuenow` và thông báo tự động cho trình đọc màn hình thông qua thuộc tính `aria-live="polite"` khi điểm số thay đổi.
* **Độ tương phản cao:** Toàn bộ văn bản hiển thị trên nền tối tuân thủ nghiêm ngặt tỷ lệ tương phản WCAG AA tối thiểu là 4.5:1. Đường viền focus rõ ràng bằng màu Cyber Cyan `{colors.accent-cyan}` khi người dùng tab đến phần tử tương tác.

---

## Inspiration & Anti-patterns

* **Nguồn cảm hứng thiết kế:**
  * **Linear:** Triết lý tối giản, tập trung vào hiệu năng tương tác và điều hướng bàn phím mượt mà.
  * **Minswap / Vespr Wallet:** Cách thức tổ chức thông tin tài sản gọn gàng và hiển thị phí mạng minh bạch, rõ ràng.
* **Các phản mẫu bị loại bỏ (Anti-patterns Rejected):**
  * **Không tự động ký giao dịch (No Auto-Sign):** Tuyệt đối không tích hợp bất kỳ cơ chế tự động ký ví nào mà không thông qua cửa sổ pop-up hiển thị chi tiết của ví CIP-30.
  * **Không tự chọn sẵn Spam (No Auto-check Suspicious):** Hệ thống không tự động tích chọn sẵn các tài sản bị nghi ngờ là rác để tránh trường hợp người dùng vô tình burn nhầm tài sản họ muốn giữ. Người dùng phải tự tay đưa ra quyết định chọn.
  * **Không hiển thị Pop-up liên tục (No Modal Stacking):** Hạn chế tối đa việc mở nhiều tầng hộp thoại chồng chéo lên nhau. Tất cả giao dịch chỉ thực hiện qua một hộp thoại xác nhận duy nhất hoặc trực tiếp trên panel bên phải.

---

## Key Flows

### Flow 1 — Venom xử lý cô lập token rác bằng Isolated Junk Box

1. **Bắt đầu:** Venom kết nối ví Vespr của mình với dApp. Banner Analyzer quét và hiển thị điểm sức khỏe ví của anh là **35% (Fragmentation nặng)** với 120 ADA bị khóa trong 80 token rác.
2. **Chọn tài sản:** Anh chuyển sang tab "Tokens" -> Click nút "Select All Suspicious". Hệ thống tự động tích chọn 80 token rác (không chọn các token DeFi uy tín trong ví).
3. **Xem kết quả ước tính:** Panel bên phải lập tức tính toán:
   * *Số lượng đã chọn:* 80 tokens.
   * *Phí giao dịch ước tính:* 0.25 ADA.
   * *ADA giải phóng ròng:* 118.5 ADA.
4. **Chọn phương thức & Kích hoạt:** Anh chọn chế độ mặc định **Isolated Junk Box** -> Nhấn nút `{components.btn-danger}` ("Burn & Reclaim").
5. **Climax (Ký giao dịch):** Một cửa sổ xác nhận giao dịch xuất hiện, giải thích rõ giao dịch sẽ gom 80 token rác này vào 1 UTXO duy nhất để trả 118.5 ADA về ví chính. Venom nhấn nút xác nhận trên ví Vespr của mình và nhập mật khẩu ký.
6. **Kết quả:** Giao dịch thành công. Màn hình hiển thị hiệu ứng chúc mừng tinh tế kèm thông báo: *"Thành công! Bạn đã thu hồi được 118.5 ADA về ví chính và cô lập hoàn toàn 80 token rác."* Điểm sức khỏe ví của Venom lập tức tăng lên **88%**.

### Flow 2 — Venom tối ưu hóa cấu trúc ví thông qua Smart Consolidate

1. **Bắt đầu:** Ví của Venom chứa 150 UTXO nhỏ từ các giao dịch swap DeFi liên tục.
2. **Kích hoạt:** Venom mở tab "UTXO Optimizer" trên banner và click nút `{components.btn-primary}` ("Smart Consolidate").
3. **Phân tích:** Hệ thống tự động quét và lọc ra 148 UTXO ADA thuần túy có giá trị nhỏ hơn 2 ADA. Panel bên phải ước tính phí giao dịch gom là 0.18 ADA.
4. **Climax:** Hệ thống tự động chia 148 UTXO này thành 3 batch giao dịch nhỏ để tránh lỗi dung lượng. Venom ký lần lượt 3 giao dịch trên cửa sổ ví CIP-30.
5. **Kết quả:** Tất cả 148 UTXO nhỏ đã được gom gọn gàng thành 2 UTXO lớn tối ưu. Điểm số sức khỏe ví chuyển sang màu xanh lá cây đạt **98% (Optimized)**. Venom hoàn toàn yên tâm thực hiện các giao dịch DeFi tiếp theo mà không sợ bị lỗi transaction size.

**Kịch bản thất bại (Failure path):** Nếu một trong các batch giao dịch bị người dùng hủy ký nửa chừng hoặc mạng Cardano bị lỗi nghẽn giao dịch, hệ thống sẽ giữ nguyên trạng thái chưa gom của các batch còn lại, hiển thị Toast cảnh báo màu đỏ: *"Giao dịch gom bị dừng ở batch {X}/{N}. Các UTXO chưa gom được bảo toàn."* kèm nút bấm "Thử lại batch này" để người dùng không phải làm lại từ đầu.
