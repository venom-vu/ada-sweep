---
name: CleanCardano
description: Hệ thống đặc tả thiết kế trực quan (Visual Design) cho ứng dụng Cardano UTXO Consolidator & Dust Cleaner. Tích hợp trực tiếp với hệ thống biến CSS hiện tại.
colors:
  bg-primary: '#07090e'
  bg-secondary: '#0d121f'
  bg-tertiary: '#141b2d'
  accent-cyan: '#00f2fe'
  accent-blue: '#4facfe'
  color-success: '#00e676'
  color-warning: '#ffb300'
  color-danger: '#ff1744'
  text-primary: '#ffffff'
  text-secondary: '#94a3b8'
  text-muted: '#4e5d78'
typography:
  display:
    fontFamily: 'Outfit'
    fontSize: 26px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: '-0.02em'
  display-sm:
    fontFamily: 'Outfit'
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.25'
  body:
    fontFamily: 'Inter'
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  sm: '8px'
  md: '14px'
  lg: '24px'
  full: '9999px'
spacing:
  gutter: '24px'
  gap-panel: '32px'
components:
  btn-primary:
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    foreground: '#000000'
    radius: '{rounded.sm}'
    shadow: '0 0 20px rgba(0, 242, 254, 0.3)'
  btn-danger:
    background: '{colors.color-danger}'
    foreground: '#ffffff'
    radius: '{rounded.sm}'
    shadow: '0 0 15px rgba(255, 23, 68, 0.2)'
  card-glass:
    background: 'rgba(13, 18, 31, 0.7)'
    backdrop-filter: 'blur(12px)'
    border: '1px solid rgba(255, 255, 255, 0.08)'
    radius: '{rounded.md}'
  isolated-junk-box:
    background: 'rgba(255, 23, 68, 0.05)'
    border: '1px dashed {colors.color-danger}'
    radius: '{rounded.sm}'
---

# CleanCardano — Visual Specification

Bản đặc tả thiết kế trực quan này định hình phong cách, ngôn ngữ thẩm mỹ và hệ thống token cấu hình cho ứng dụng **Cardano UTXO Consolidator & Dust Cleaner** phiên bản đại chúng (consumer-facing dApp).

## Brand & Style

CleanCardano mang phong cách **Sci-Fi Cyberpunk/DeFi cao cấp** với nền tối sâu (`bg-primary`), kết hợp với chất liệu kính gương (Glassmorphic) mượt mà và các hiệu ứng phát quang Neon cực kỳ bắt mắt. 
* **Cảm xúc mang lại:** Tinh tế, mạnh mẽ, an toàn và minh bạch tuyệt đối. Người dùng cảm nhận dApp như một "cỗ máy dọn dẹp" công nghệ cao, biến những tài sản rác vô giá trị thành lợi ích kinh tế thực tế một cách đầy hào hứng.
* **Nguyên tắc cốt lõi:**
  * **Trực quan hóa dữ liệu:** Sử dụng các thành phần đo lường trực quan (như đồ thị vòng sức khỏe, thanh tiến trình) để đơn giản hóa khái niệm eUTXO kỹ thuật.
  * **Độ tương phản cao:** Đảm bảo trải nghiệm dễ đọc và nhấn mạnh các thông điệp cảnh báo quan trọng bằng các màu sắc cảnh báo rực rỡ nhưng hòa hợp.
  * **Chuyển động vi mô (Micro-animations):** Tích hợp các hiệu ứng chuyển đổi mượt mà và hiệu ứng hover phản hồi ngay lập tức để giao diện có cảm giác "sống động".

## Colors

Hệ màu của CleanCardano được xây dựng trên một bảng màu tối có chủ đích, sử dụng các dải màu phát quang neon để tạo điểm nhấn tương tác:

* **Màu nền chủ đạo:**
  * **Deep Space (`bg-primary` - `#07090e`):** Nền không gian sâu thẳm của ứng dụng, kết hợp với hai dải màu tỏa phát quang mờ ở hai góc màn hình tạo độ sâu thị giác.
  * **Glass Container (`bg-secondary` - `#0d121f`):** Màu nền của các thẻ hộp chứa tài sản, tạo ranh giới rõ ràng nhưng không thô cứng.
* **Màu tương tác & Nhấn mạnh:**
  * **Cyber Cyan (`accent-cyan` - `#00f2fe`):** Màu đại diện cho năng lượng sạch, sự tối ưu hóa và công nghệ eUTXO. Sử dụng cho các checkbox được tick chọn, các liên kết, và các điểm nhấn biểu đồ.
  * **Cosmic Blue (`accent-blue` - `#4facfe`):** Màu hỗ trợ chuyển sắc, phối hợp với Cyan để tạo nên dải màu chuyển sắc (`gradient-accent`) đặc trưng cho các nút bấm hành động chính.
* **Màu trạng thái (Semantic Colors):**
  * **Safe Green (`color-success` - `#00e676`):** Chỉ thị trạng thái ví tốt, tài sản đáng tin cậy (Trusted) và các hành động an toàn.
  * **Caution Amber (`color-warning` - `#ffb300`):** Cảnh báo hiệu quả kinh tế kém hoặc các UTXO nhỏ cần lưu ý.
  * **Burn Red (`color-danger` - `#ff1744`):** Sử dụng cho hành động hủy diệt (Burn), nhận diện token rác lừa đảo (Spam/Phishing) và các lỗi nghiêm trọng.

## Typography

Hệ thống phông chữ kết hợp giữa hai phông chữ hiện đại từ Google Fonts:

1. **Outfit (Display & Headings):** Dành cho tiêu đề màn hình lớn và tiêu đề thẻ. Thiết kế tròn trịa, hiện đại mang hơi hướng công nghệ cao.
   * `display`: Tiêu đề trang chính (26px, Extra Bold).
   * `display-sm`: Tiêu đề các nhóm chức năng/thẻ card (18px, Bold).
2. **Inter (Body & Labels):** Dành cho tất cả các văn bản thông tin, nhãn, dữ liệu bảng và mô tả. Mang lại độ sắc nét và tính dễ đọc tối đa trên nền tối.
   * `body`: Chữ nội dung thông thường (15px, Normal, lineHeight 1.6).

## Layout & Spacing

* **Chiều rộng tối đa:** `1400px` với khoảng đệm hai bên (`padding: 0 24px`) giúp nội dung hiển thị cân đối trên màn hình lớn.
* **Lưới phân trang chính:** Sử dụng cấu trúc lưới 2 cột (`grid-2`) bất đối xứng khi ở màn hình máy tính:
  * **Cột trái ( Detector Panel - 60%):** Hiển thị danh sách các tài sản được phân loại, cho phép tương tác duyệt và tích chọn.
  * **Cột phải ( Burner Panel - 40%):** Bảng tính toán kinh tế, các nút bấm hành động gom/đốt và hiển thị kết quả Reclaim thực tế.
* **Khoảng cách đệm (`spacing.gap-panel` - `32px`):** Khoảng cách đồng nhất giữa các thẻ lớn trên dashboard, tạo nhịp thở trực quan hợp lý.

## Elevation & Depth

* **Chất liệu Kính gương (Glassmorphism):** Áp dụng hiệu ứng `backdrop-filter: blur(12px)` kết hợp với viền gương mờ (`border-glass` - `1px solid rgba(255, 255, 255, 0.08)`) để tạo cảm giác các khối nội dung đang bay lơ lửng trên nền không gian.
* **Hiệu ứng Phát quang (Neon Glow & Layering):**
  * Khi người dùng hover vào các thẻ card, viền card sẽ sáng lên (`1px solid rgba(255, 255, 255, 0.15)`) kèm theo đổ bóng neon xanh dịu ở phía sau (`box-shadow: 0 0 15px rgba(0, 242, 254, 0.15)`).
  * Điều này tạo ra một phân cấp chiều sâu động, hướng sự chú ý của người dùng vào khu vực đang tương tác.

## Shapes

CleanCardano sử dụng ngôn ngữ góc cạnh bo tròn có hệ thống để thể hiện tính chất hiện đại, thân thiện:

* **`rounded.sm` (8px):** Áp dụng cho các nút bấm (`.btn`), các ô nhập liệu và các thẻ tag nhỏ. Giúp các phần tử tương tác trông sắc sảo và gọn gàng.
* **`rounded.md` (14px):** Áp dụng cho các thẻ hộp chứa lớn (`.card`). Đây là mức bo chuẩn mang lại sự cân bằng, hiện đại.
* **`rounded.lg` (24px):** Áp dụng cho biểu đồ vòng hoặc các hộp thoại modal lớn, tạo điểm nhấn mềm mại, tinh tế.

## Components

Đặc tả các thành phần giao diện tùy chỉnh trong ứng dụng:

### 1. Nút bấm chính (`btn-primary`)
* **Mô tả:** Nút bấm kích hoạt các tác vụ chính (ví dụ: "Launch Sandbox", "Smart Consolidate").
* **Trực quan:** Sử dụng dải màu gradient `{components.btn-primary.background}`, chữ đen, hiệu ứng bóng mờ phát sáng Cyber Cyan.
* **Hành vi hover:** Phóng to nhẹ `scale(1.02)` và tăng cường độ sáng bóng mờ neon.

### 2. Nút hành động hủy diệt (`btn-danger`)
* **Mô tả:** Sử dụng cho các tác vụ Burn tài sản rác để giải phóng ADA.
* **Trực quan:** Nền đỏ `{colors.color-danger}`, chữ trắng, bóng mờ đỏ dịu.
* **Hành vi hover:** Phóng to nhẹ `scale(1.02)` và tăng độ phát sáng đỏ.

### 3. Thẻ Glassmorphic (`card-glass`)
* **Mô tả:** Khung chứa tiêu chuẩn cho tất cả các khu vực chức năng trên trang.
* **Trực quan:** `{components.card-glass.background}`, viền gương mờ, bo góc `{rounded.md}`. Tự động dịch chuyển nhẹ lên trên `translateY(-2px)` khi hover.

### 4. Hộp cách ly rác (`isolated-junk-box`)
* **Mô tả:** Khu vực hiển thị đại diện cho UTXO rác đã gom (Junk Box) ở đáy danh sách ví.
* **Trực quan:** Nền đỏ nhạt rất mờ, viền nét đứt màu đỏ `{colors.color-danger}`, tạo cảm giác khu vực bị phong tỏa, cách ly an toàn khỏi các giao dịch chi tiêu thông thường.

### 5. Dòng tài sản (`asset-row`)
* **Mô tả:** Hàng hiển thị thông tin chi tiết của từng token hoặc NFT trong danh sách.
* **Trực quan:** Nếu tài sản bị nghi ngờ là rác (Suspicious), **ẩn hoàn toàn hình ảnh/media**, chỉ hiển thị tên text màu đỏ nhạt kèm biểu tượng cảnh báo ⚠️ nhằm ngăn chặn người dùng click vào ảnh chứa link lừa đảo.

## Do's and Don'ts

| Do (Nên làm) | Don't (Không nên làm) |
|---|---|
| Sử Bo góc nhất quán theo đúng ramp (`8px` / `14px` / `24px`) | Bo góc tùy tiện không đồng nhất (như dùng 4px xen lẫn 20px) |
| Ẩn toàn bộ ảnh của các NFT Suspicious, chỉ hiện text thuần kèm cảnh báo | Hiển thị thumbnail của NFT spam vì có thể chứa link phishing |
| Tự động tắt tính năng tự động chọn (no auto-check) đối với token Suspicious | Tự động chọn sẵn token Suspicious khi người dùng ấn gom tự động |
| Hiển thị rõ ràng số ADA Reclaimed ước tính và phí mạng trước khi ký | Giấu phí hoặc không hiển thị số ADA thực tế thu hồi được |
| Chỉ dùng màu `{colors.color-danger}` cho các tác vụ hủy hoặc cảnh báo lừa đảo | Lạm dụng màu đỏ cho các nút bấm phụ hoặc các thông tin thông thường |
