---
title: 'Design Tokens and Mobile UTXO List Optimization'
type: 'feature'
created: '2026-05-31'
status: 'done'
baseline_commit: 'db589c94d61a066dc6aafc75bafa1d58d632bc62'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Giao diện ADASweep hiện tại chưa có sự đồng bộ nhất quán về phong cách (màu sắc, bo góc, phông chữ) trên toàn bộ dApp. Đồng thời, danh sách hiển thị UTXO trên di động gặp lỗi co ép layout khi có nhiều phần tử và gây giật lag do render quá nhiều DOM cùng lúc.

**Approach:** Đồng bộ hóa hệ thống quy chuẩn thiết kế (Design Tokens) trong Tailwind và CSS, nâng cấp widget báo cáo sức khỏe ví (Wallet Health Report) thành vòng đo điểm số game hóa kèm 3 thẻ insight rút gọn, và tối ưu hóa bảng UTXO thành dạng thẻ xếp chồng (Stacked Card List) trên thiết bị di động có hỗ trợ cuộn ảo/lazy loading bằng thuộc tính CSS hiện đại để đạt hiệu năng 60fps mượt mà.

## Boundaries & Constraints

**Always:**
- Mọi thuộc tính màu sắc trạng thái, bo góc, và font chữ bắt buộc phải lấy từ cấu hình `tailwind.config.ts` mở rộng hoặc CSS variables chung để đảm bảo tính đồng nhất tuyệt đối.
- Toàn bộ logic giao dịch và tương tác Web3 phải chạy client-side, được bọc trong `<ClientOnly>` của Nuxt để tránh lỗi Hydration mismatch.
- Trải nghiệm di động phải hiển thị đầy đủ và rõ ràng các thông tin blockchain cốt lõi (TxHash rút gọn, ADA, các tài sản đính kèm) để đảm bảo tính minh bạch.

**Ask First:**
- Thay đổi hoặc đổi tên các class/biến CSS hiện có nếu nó ảnh hưởng trực tiếp đến layout của các trang khác ngoài landing và dashboard.

**Never:**
- Nghiêm cấm sử dụng các mã màu tùy ý (ví dụ: `bg-[#1a233a]`) hoặc các lớp bo góc ngẫu nhiên trong codebase.
- Không cài đặt các thư viện cuộn ảo cồng kềnh từ bên thứ ba (như `vue-virtual-scroller`) mà tận dụng các thuộc tính CSS bản địa hiện đại (`content-visibility`) và logic Vue tinh gọn để giữ mã nguồn sạch sẽ.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_THEME | Người dùng mở trang dApp | Mọi card đều đồng bộ bo góc 16px, nút bấm 12px, font Outfit cho tiêu đề, Space Mono cho con số, hiệu ứng hover nhấc nhẹ phản quang. | N/A |
| HAPPY_PATH_MOBILE_SCROLL | Người dùng có 100+ UTXO mở trên di động | Bảng UTXO chuyển sang Stacked Card List cuộn mượt mà 60fps trong khung 320px, sử dụng `content-visibility` để lazy-render DOM. | N/A |
| EMPTY_OR_ERROR_STATE | Không có UTXO hoặc lỗi kết nối | Vòng tròn điểm sức khỏe hiển thị 0% màu xám và bảng UTXO hiển thị thông báo rỗng thân thiện theo đúng style rule. | Bắt lỗi kết nối API và hiển thị fallback an toàn. |

</frozen-after-approval>

## Code Map

- `tailwind.config.ts` -- Cấu hình Tailwind trung tâm của dự án, mở rộng bảng màu trạng thái sức khỏe, phông chữ và bo góc kép.
- `app/assets/css/app.css` -- Tệp CSS toàn cục, nhập phông chữ Space Mono và cập nhật font reset cho các tiêu đề/nội dung.
- `app/assets/css/tailwind.css` -- Tệp tiện ích Tailwind, định nghĩa lớp `.fintech-card` với các quy tắc kính mờ (glassmorphism) và hiệu ứng hover phản quang thủy tinh mịn.
- `app/components/WalletHealth.vue` -- Component báo cáo sức khỏe ví chính trên Dashboard. Cải tiến thành đồng hồ đo điểm sức khỏe game hóa màu sắc sinh động, so sánh chỉ số tăng trưởng và 3 cảnh báo ngắn gọn.
- `app/components/UtxoTable.vue` -- Bảng hiển thị danh sách UTXO của trang Optimizer. Tích hợp giao diện di động dạng thẻ xếp chồng xếp gọn trong khung cuộn 320px và lazy render bằng `content-visibility`.

## Tasks & Acceptance

**Execution:**
- [x] `tailwind.config.ts` -- Cập nhật cấu hình Tailwind để tích hợp các Design Tokens (màu sắc health, bo góc kép `card`/`btn`, font Outfit & Space Mono).
- [x] `app/assets/css/app.css` -- Nhập phông chữ `Space Mono` từ Google Fonts vào CSS toàn cục.
- [x] `app/assets/css/tailwind.css` -- Đồng bộ hóa quy chuẩn lớp `.fintech-card` và `.fintech-card-hover` trong tầng utilities của Tailwind CSS.
- [x] `app/components/WalletHealth.vue` -- Tái cấu trúc widget hiển thị Health Gauge dạng game hóa, so sánh chỉ số cải thiện tiềm năng và hiển thị đúng 3 thẻ insight cảnh báo tinh gọn.
- [x] `app/components/UtxoTable.vue` -- Bổ sung layout di động (`block md:hidden`) dạng thẻ xếp chồng (Stacked Card List), giới hạn chiều cao khung cuộn trong `max-h-80 overflow-y-auto`, tích hợp `content-visibility: auto` cho danh sách thẻ UTXO để tối ưu hóa hiệu năng render 60fps.

**Acceptance Criteria:**
- **Given** Người dùng kết nối ví có 10+ UTXO phân mảnh trên di động.
- **When** Người dùng truy cập trang Dashboard và Optimizer.
- **Then** Trang Dashboard hiển thị widget Sức khỏe ví game hóa sinh động chuyển màu Đỏ/Vàng/Emerald tương ứng, cùng chỉ số tăng điểm tiềm năng trực quan (ví dụ: `42 -> 91`).
- **And** Trang Optimizer hiển thị danh sách UTXO dạng thẻ xếp chồng cuộn cực kỳ mượt mà 60fps, không làm vỡ layout hay co giật màn hình di động.
- **And** Mọi thẻ thông tin, nút bấm, tiêu đề và số liệu trên toàn hệ thống đều tuân thủ chính xác bộ Design Tokens quy chuẩn (bo góc 16px/12px, font Outfit/Space Mono).

## Design Notes

**Tailwind Custom Tokens:**
```typescript
colors: {
  health: {
    rose: { bg: 'rgba(244, 63, 94, 0.05)', border: 'rgba(244, 63, 94, 0.1)', text: '#fb7185' },
    amber: { bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24' },
    emerald: { bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.1)', text: '#34d399' }
  }
},
borderRadius: {
  'card': '16px',
  'btn': '12px'
}
```

**Mobile Card Item Content-Visibility Rule:**
```css
.mobile-utxo-item {
  content-visibility: auto;
  contain-intrinsic-size: 60px;
}
```

## Verification

**Commands:**
- `npm run dev` -- dev server chạy thành công không có lỗi biên dịch
- `npx nuxi typecheck` -- biên dịch TypeScript thành công không có lỗi kiểu dữ liệu

**Manual checks (if no CLI):**
- Co màn hình về kích thước 375px (mobile view) trên Chrome DevTools, xác nhận bảng UTXO biến mất và thay thế hoàn toàn bằng danh sách thẻ xếp chồng cuộn mượt mà.
- Kiểm tra các góc của card xem có đồng bộ bo tròn 16px, nút bấm bo tròn 12px, và font Space Mono hiển thị cho toàn bộ chỉ số con số.

## Suggested Review Order

**Design Tokens & Styles**

- Cấu hình theme Tailwind chung mở rộng màu health, border-radius và phông chữ.
  [`tailwind.config.ts:24`](../../tailwind.config.ts#L24)

- Nhập font Space Mono để phục vụ hiển thị chữ số monospaced.
  [`app.css:1`](../../app/assets/css/app.css#L1)

- Đồng bộ lớp `.fintech-card` với các quy tắc glassmorphism và bo góc.
  [`tailwind.css:18`](../../app/assets/css/tailwind.css#L18)

**Wallet Health Dashboard**

- Tái cấu trúc widget Sức khỏe ví game hóa sinh động và 3 thẻ insight.
  [`WalletHealth.vue:34`](../../app/components/WalletHealth.vue#L34)

**Responsive & Performance**

- Bổ sung cấu trúc thẻ di động xếp chồng và lazy rendering qua `content-visibility`.
  [`UtxoTable.vue:210`](../../app/components/UtxoTable.vue#L210)
