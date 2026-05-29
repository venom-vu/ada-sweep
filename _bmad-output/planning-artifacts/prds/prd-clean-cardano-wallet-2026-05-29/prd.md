---
title: Cardano UTXO Consolidator & Dust Cleaner
status: draft
created: 2026-05-29
updated: 2026-05-29
---

# PRD: Cardano UTXO Consolidator & Dust Cleaner
*Working title — confirm.*

## 0. Document Purpose
Tài liệu PRD này định nghĩa các yêu cầu sản phẩm cho ứng dụng **Cardano UTXO Consolidator & Dust Cleaner**, một công cụ tối ưu hóa cấu trúc ví eUTXO, giải phóng lượng ADA bị khóa do min-ADA requirement và dọn dẹp các token/NFT rác. Tài liệu đóng vai trò làm định hướng phát triển (PRD-driven design) cho các giai đoạn thiết kế UX, kiến trúc kỹ thuật và lập kế hoạch câu chuyện người dùng (epics/stories).

## 1. Vision
Hệ sinh thái Cardano dựa trên mô hình eUTXO mang lại tính bảo mật và tính song song cao, nhưng cũng tạo ra sự phân mảnh lớn (fragmentation) đối với tài sản của người dùng. Sau thời gian dài tham gia DeFi, airdrop, swap và mint NFT, ví người dùng bị chia nhỏ thành hàng trăm UTXO nhỏ chứa token rác và NFT vô giá trị. Mỗi UTXO này bắt buộc phải khóa một lượng **min-ADA** (thường từ 1-2 ADA). Điều này dẫn đến hàng chục đến hàng trăm ADA của người dùng bị "kẹt" không thể sử dụng, đồng thời làm tăng đáng kể phí giao dịch và giảm hiệu năng ví.

**Cardano UTXO Consolidator & Dust Cleaner** ra đời để giải quyết triệt để pain-point này:
- **Tối ưu hóa ví:** Gom các UTXO phân mảnh thành một số ít UTXO lớn hơn để giảm phí giao dịch tương lai.
- **Giải phóng ADA bị khóa:** Nhận diện và cho phép burn (đốt) các token rác, NFT spam để giải phóng (reclaim) lượng min-ADA đi kèm.
- **Trải nghiệm trực quan:** Giúp người dùng phổ thông dễ dàng hiểu được cấu trúc ví eUTXO của mình thông qua giao diện phân tích sức khỏe ví (Wallet Health Analyzer) trực quan và dễ tiếp cận.

## 2. Target User

### 2.1 Jobs To Be Done
- **Giải phóng giá trị ẩn:** "Tôi muốn lấy lại số ADA đang bị khóa trong các token rác và UTXO phân mảnh để có thêm ADA sử dụng." (Reclaim ADA)
- **Tối ưu chi phí:** "Tôi muốn cấu trúc ví của mình gọn gàng nhất có thể để khi thực hiện giao dịch DeFi tiếp theo không bị phí cao hoặc bị lỗi dung lượng giao dịch vượt giới hạn (transaction size limit)."
- **Dọn dẹp không gian ví:** "Tôi muốn dọn sạch các NFT spam, token rác lừa đảo xuất hiện trong ví mà các ví thông thường chỉ có thể ẩn đi chứ không giải quyết tận gốc."
- **Hiểu rõ trạng thái ví:** "Tôi muốn biết tại sao số dư ADA thực tế dùng được của tôi lại thấp hơn nhiều so với tổng số dư hiển thị."

### 2.2 Non-Users (v1)
- Người dùng mới sử dụng Cardano và chỉ có 1-2 UTXO ADA thuần túy (chưa bị phân mảnh hoặc chưa nhận token rác).
- Các tổ chức lớn hoặc sàn giao dịch yêu cầu các hệ thống tối ưu hóa UTXO tự động thông qua API phức tạp quy mô lớn (v1 chỉ tập trung vào ứng dụng Web giao diện người dùng đơn giản cho cá nhân).

### 2.3 Key User Journeys

- **UJ-1. Venom giải phóng ADA bị khóa từ các token spam lừa đảo**
  - **Persona + context:** Venom là một nhà giao dịch DeFi Cardano lâu năm, ví anh chứa hơn 80 loại token spam và NFT rác từ các đợt airdrop lừa đảo, khóa hơn 120 ADA.
  - **Entry state:** Đã kết nối ví CIP-30 (như Vespr hoặc Nami) thông qua ứng dụng web.
  - **Path:** Venom truy cập dashboard "Junk Token Detector", hệ thống tự động quét và phân loại các token có nguy cơ là spam. Anh chọn 50 token lừa đảo muốn xóa bỏ, hệ thống tính toán lượng ADA thu hồi được (khoảng 75 ADA) sau khi trừ phí burn. Venom nhấn "Burn & Reclaim", ví hiển thị pop-up yêu cầu ký giao dịch tiêu hủy token.
  - **Climax:** Giao dịch thành công, ví của Venom sạch bóng token spam và số dư ADA khả dụng tăng thêm ~73.5 ADA thực tế.
  - **Resolution:** Venom nhìn thấy thông báo chúc mừng kèm số ADA đã giải phóng, và Wallet Health Score tăng từ 35% lên 85%.
  - **Edge case:** Nếu giao dịch burn chứa quá nhiều token vượt quá kích thước transaction limit của Cardano, hệ thống sẽ tự động đề xuất chia thành 2 batch nhỏ để thực hiện lần lượt.

- **UJ-2. Venom gom UTXO bụi (dust) để giảm phí giao dịch**
  - **Persona + context:** Venom có ví bị phân mảnh thành 150 UTXO nhỏ sau hàng trăm giao dịch swap trên DEX.
  - **Entry state:** Kết nối ví qua trình duyệt web.
  - **Path:** Venom mở tab "UTXO Optimizer", thấy biểu đồ trực quan hóa các UTXO phân mảnh của mình. Hệ thống cảnh báo "High Fragmentation" và đề xuất gom ví. Venom chọn chế độ "Smart Consolidate", hệ thống tự động build giao dịch gom 150 UTXO nhỏ này thành 2 UTXO lớn tối ưu.
  - **Climax:** Anh ký giao dịch gom, phí mạng lưới tiêu tốn chỉ khoảng 0.2 ADA nhưng giải phóng hiệu năng đáng kể cho ví.
  - **Resolution:** Trạng thái ví chuyển sang "Optimized", Venom có thể thực hiện giao dịch DeFi tiếp theo cực kỳ mượt mà không lo bị lỗi transaction size.

## 3. Glossary
- **eUTXO (Extended Unspent Transaction Output)** — Mô hình kế toán mở rộng của Cardano, trong đó tài sản được lưu trữ dưới dạng các đầu ra chưa chi tiêu độc lập thay vì một tài khoản số dư duy nhất.
- **Min-ADA Requirement** — Lượng ADA tối thiểu bắt buộc phải đi kèm trong một UTXO khi chứa bất kỳ native asset (token/NFT) nào nhằm ngăn chặn tình trạng spam lưu trữ trên sổ cái Cardano.
- **Dust UTXO (UTXO Bụi)** — Các UTXO có giá trị rất nhỏ (ví dụ dưới 1.5 ADA) và không chứa native asset quan trọng, gây lãng phí dung lượng ví và tăng phí giao dịch.
- **Junk/Spam Token** — Các native token được gửi tự động (airdrop) đến ví người dùng mà không có tính thanh khoản, thường mang tính chất quảng cáo hoặc lừa đảo.
- **Token Burning** — Thao tác gửi token rác vào một minting policy đặc biệt hoặc tiêu hủy thông qua giao dịch để giải phóng hoàn toàn lượng ADA tối thiểu đi kèm trở lại ví người dùng.
- **CIP-30** — Tiêu chuẩn giao tiếp giữa dApp và ví Cardano trên trình duyệt (Chrome/Brave Extension hoặc mobile wallet dApp browser).

## 4. Features

### 4.1 Wallet Analysis (Phân tích Sức khỏe Ví)
**Description:** Hệ thống quét toàn bộ các UTXO hiện có của ví đã kết nối và hiển thị báo cáo chi tiết về tình trạng phân mảnh, lượng ADA khả dụng thực tế so với ADA bị khóa, và đề xuất hành động.

**Functional Requirements:**
#### FR-1: Quét và Phân tích UTXO
Hệ thống có thể tải toàn bộ danh sách UTXO của ví qua giao diện kết nối CIP-30 và tính toán các chỉ số sức khỏe ví.
**Consequences (testable):**
- Hiển thị chính xác tổng số lượng UTXO hiện có.
- Tính toán và hiển thị riêng biệt: Tổng ADA trong ví, Số ADA thực tế khả dụng, và Số ADA đang bị khóa trong các UTXO (Locked ADA).
- Tính điểm sức khỏe ví (Wallet Health Score từ 0-100%) dựa trên mức độ phân mảnh UTXO và lượng ADA bị khóa.

#### FR-2: Nhận diện Asset Spam/Junk
Hệ thống tự động phân loại các native asset trong ví thành "Trusted" (Token uy tín, có thanh khoản) và "Suspicious/Spam" (Meme token rác, NFT lừa đảo) thông qua cơ chế kết hợp:
1. **Whitelist:** Danh sách các token uy tín và phổ biến trong hệ sinh thái Cardano.
2. **Blacklist:** Danh sách đen các token và NFT lừa đảo đã biết, được cập nhật liên tục.
3. **DEX Liquidity Check:** Kiểm tra động tính thanh khoản trên các sàn DEX lớn (như Minswap). Nếu một token không có thanh khoản ($0) và không nằm trong whitelist, nó sẽ được tự động xếp vào nhóm "Suspicious" (Nghi ngờ là rác) để người dùng xem xét.

**Consequences (testable):**
- Đánh dấu chính xác các token rác dựa trên trạng thái thanh khoản thực tế tại thời điểm quét và blacklist.
- **Bảo vệ chống thao tác nhầm (Manual Opt-In for Suspicious):** Hệ thống tuyệt đối **không tự động tích chọn** bất kỳ asset nào thuộc danh mục "Suspicious" cho các tác vụ gom bụi hay dọn dẹp hàng loạt (như nút Smart Consolidate). Người dùng bắt buộc phải tích chọn thủ công các token rác này nếu muốn gom/đốt.
- **Đè ghi nhận tin cậy (Mark as Trusted):** Cung cấp nút hành động nhanh giúp người dùng thủ công đánh dấu một asset là tin cậy. Trạng thái này được lưu trữ cục bộ tại LocalStorage của trình duyệt, giúp hệ thống tự động nhận diện asset này là "Trusted" trong các lần quét tiếp theo.
- **Bảo vệ người dùng khỏi Phishing:** Đối với các NFT hoặc token bị đánh dấu là "Suspicious", hệ thống **tự động ẩn hoàn toàn hình ảnh/media** của chúng trên giao diện, chỉ hiển thị tên dưới dạng text thuần túy kèm theo một cảnh báo nguy hiểm rõ ràng nhằm ngăn ngừa việc người dùng click vào các đường link lừa đảo ẩn trong ảnh/metadata.



### 4.2 UTXO Consolidation (Gom ví thông minh)
**Description:** Cho phép người dùng gom nhiều UTXO nhỏ thành một UTXO lớn hơn để giảm số lượng UTXO phân mảnh mà không cần tiêu hủy token.

**Functional Requirements:**
#### FR-3: Tạo giao dịch gom UTXO
Hệ thống cung cấp hai chế độ gom linh hoạt nhằm giúp người dùng build một giao dịch gửi lại toàn bộ tài sản về chính địa chỉ ví của mình dưới dạng các UTXO đã được tối ưu hóa cấu trúc:
1. **Smart Consolidate (Gom tự động thông minh):** Hệ thống tự động chọn toàn bộ các UTXO chỉ chứa ADA thuần túy có giá trị nhỏ (bụi) và gộp chung các UTXO chứa native asset cùng loại để tạo giao dịch tối ưu chỉ bằng một cú click.
2. **Manual Selection (Gom thủ công):** Hiển thị danh sách toàn bộ UTXO dưới dạng bảng trực quan (kèm thông tin lượng ADA, token, NFT trong từng UTXO) cho phép người dùng tự tick chọn những UTXO cụ thể mong muốn để đưa vào giao dịch gom.

**Consequences (testable):**
- Cho phép người dùng chuyển đổi mượt mà giữa chế độ Smart và Manual.
- Tự động gộp các native asset cùng loại từ các UTXO được chọn vào một UTXO đầu ra duy nhất để giảm diện tích lưu trữ.
- **Economic Viability Alert (Cảnh báo Hiệu quả Kinh tế):** Hệ thống liên tục tính toán tỷ lệ giữa `Phí giao dịch ước tính / Lượng ADA thu hồi được (reclaimed ADA)`. Nếu tỷ lệ này vượt quá 30% (tức phí chiếm hơn 30% giá trị ADA giải phóng), hệ thống sẽ hiển thị cảnh báo màu vàng: *"Việc gom các UTXO này có thể không tối ưu về kinh tế do phí mạng lưới chiếm tỷ trọng lớn (>30%). Bạn có muốn tiếp tục?"* kèm đề xuất giải pháp tối ưu hơn.


#### FR-4: Tự động chia nhỏ giao dịch (Transaction Batching)
Khi số lượng UTXO cần gom vượt quá giới hạn kích thước giao dịch tối đa của Cardano mạng lưới (max transaction size limit ~16KB), hệ thống tự động chia nhỏ thành các batch giao dịch tối ưu để người dùng thực hiện lần lượt.
**Consequences (testable):**
- Cảnh báo và tự động chia 150 UTXO thành nhiều giao dịch (ví dụ: gom mỗi đợt tối đa 50 UTXO) để tránh lỗi giao dịch quá lớn.

### 4.3 Junk Token & NFT Burner (Dọn dẹp & Giải phóng ADA từ Token Rác)
**Description:** Cung cấp công cụ mạnh mẽ giúp người dùng xử lý các token rác và NFT spam trong ví nhằm thu hồi tối đa lượng min-ADA bị khóa bằng cơ chế tối ưu hóa.

**Functional Requirements:**
#### FR-5: Xử lý và Giải phóng ADA từ Token Rác
Hệ thống cho phép người dùng chọn danh sách các token rác và áp dụng một trong hai cơ chế xử lý để thu hồi ADA:
1. **Spam Consolidation + Isolated Junk Box (Mặc định):** Hệ thống build giao dịch gom toàn bộ các token rác được chọn vào một UTXO duy nhất (Multi-asset UTXO). Nhờ quy tắc tính min-ADA của Cardano, lượng ADA bị khóa cho toàn bộ số token rác này sẽ được giảm thiểu tối đa (chỉ còn khoảng ~3-5 ADA cho hàng chục token rác). Lượng ADA chênh lệch lớn (90%+) sẽ được giải phóng ngay lập tức về số dư khả dụng của ví. UTXO rác duy nhất này sẽ được gắn nhãn "Isolated Junk Box" ở đáy ví người dùng và hệ thống sẽ cách ly nó để tránh các thuật toán chọn input (coin selection) sau này vô tình đụng vào.
2. **Full Burn (Tùy chọn nâng cao):** Cho phép người dùng thực hiện gửi toàn bộ UTXO rác đã gom (chứa tất cả token rác và lượng min-ADA tối thiểu ~3-5 ADA đi kèm) đến một địa chỉ chết (unspendable address) để làm sạch ví hoàn toàn 100%. Người dùng chấp nhận hy sinh lượng min-ADA tối thiểu này để đổi lấy ví hoàn toàn không còn rác.

**Consequences (testable):**
- Hiển thị ước tính chính xác lượng ADA sẽ thu hồi (reclaimed ADA) cho từng tùy chọn xử lý trước khi người dùng ký giao dịch.
- Xây dựng giao dịch gom multi-asset thành công theo đúng tiêu chuẩn mạng lưới và chuyển đổi trạng thái ví người dùng sau khi ký.


## 5. Non-Goals (Explicit)
- Không trở thành một ví Cardano độc lập (như Nami, Vespr, Eternl). Ứng dụng hoạt động thuần túy dưới dạng dApp kết nối qua CIP-30.
- Không tự động thực hiện bất kỳ giao dịch nào mà không có sự đồng ý và ký số rõ ràng từ phía người dùng thông qua ví extension/mobile.
- Không tích hợp sàn giao dịch phi tập trung (DEX) trực tiếp để swap token rác lấy ADA trong phiên bản v1 (chỉ tập trung vào dọn dẹp và burn giải phóng ADA).

## 6. MVP Scope

### 6.1 In Scope
- **Giao diện Web responsive** phong cách hiện đại, trực quan, hỗ trợ chế độ Dark Mode cao cấp.
- **Kết nối ví Cardano** qua chuẩn CIP-30 (Nami, Eternl, Flint, Vespr, Lace).
- **Module Phân tích (Wallet Analyzer):** Thống kê số UTXO, số ADA khóa, điểm Health Score.
- **Module Gom UTXO (Consolidator):** Gom các UTXO chứa ADA thuần túy hoặc các UTXO nhỏ chứa token thường dùng để tối ưu cấu trúc ví.
- **Module Dọn dẹp (Spam Burner):** Đốt/xóa các token rác cơ bản để thu hồi min-ADA.

### 6.2 Out of Scope for MVP
- Auto-optimization tự động quét và đề xuất gom định kỳ mà không cần người dùng truy cập web (dành cho Phase 3).
- Phân tích sâu NFT spam dựa trên thị giác máy tính hoặc AI quét hình ảnh NFT (v1 chỉ quét dựa trên metadata text và blacklist).
- Hỗ trợ ví cứng Ledger/Trezor thông qua kết nối trực tiếp (chỉ hỗ trợ thông qua ví phần mềm trung gian như Eternl/Lace đã kết nối Ledger).
- **Hệ thống Báo cáo Cộng đồng (Community Feedback Loop / Report as Spam):** Thu thập báo cáo từ nhiều người dùng khác nhau để tự động đưa token vào blacklist chung hệ thống (hoãn lại sang các giai đoạn sau để tránh việc xây dựng cơ sở dữ liệu backend phức tạp trong bản MVP v1).


## 7. Success Metrics
- **SM-1 (Reclaimed ADA Volume):** Tổng số ADA được giải phóng thành công cho toàn bộ người dùng thông qua công cụ.
- **SM-2 (Wallet Health Improvement Rate):** Tỷ lệ cải thiện điểm sức khỏe ví trung bình của người dùng sau khi sử dụng công cụ đạt trên 50%.
- **SM-3 (Active Optimizations):** Số lượng giao dịch gom UTXO và burn spam được thực hiện thành công qua dApp.
- **SM-C1 (Transaction Failure Rate - Counter-metric):** Tỷ lệ giao dịch lỗi khi gom/burn do kích thước quá hạn hoặc min-ADA sai lệch phải dưới 1%.

## 8. Open Questions
1. Thuật toán phân loại spam tự động có khả năng nhận diện nhầm các token DeFi mới chưa có thanh khoản lớn hay không? Chúng ta cần cơ chế Whitelist/Blacklist phối hợp với ý kiến người dùng như thế nào để an toàn nhất?

## 9. Assumptions Index
- `[ASSUMPTION: CIP-30-COMPATIBILITY]` - Toàn bộ các ví Cardano phổ biến hiện nay đều tuân thủ đầy đủ chuẩn CIP-30 và trả về dữ liệu UTXO dưới dạng HEX hợp lệ cho dApp giải mã.
- `[ASSUMPTION: MIN-ADA-FORMULA]` - Công thức tính lượng min-ADA yêu cầu cho mỗi UTXO là ổn định và nhất quán giữa các ví và nút Cardano trên mạng lưới (Babbage/Conway era).
- `[ASSUMPTION: JUNK-BOX-ISOLATION]` - Các ví CIP-30 thông thường không tự ý gộp "Isolated Junk Box UTXO" vào các giao dịch khác khi người dùng chi tiêu bình thường (coin selection logic không đụng vào multi-asset UTXO có cấu trúc lạ trừ khi được chỉ định).

