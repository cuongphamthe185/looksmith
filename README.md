# Looksmith

**Tiếng Việt** · [English](README_EN.md)

Bộ theme cho ứng dụng Claude desktop. Chọn theme từ một ô chọn; chế độ sáng/tối tự theo hệ điều hành (Windows, macOS, GNOME), hoặc cố định một chế độ.

Theme đầu tiên là **Koi Pond**: ao cá koi vẽ phẳng, có lá sen và hoa sen. Chế độ sáng là ao ban ngày, chế độ tối là ao đêm có trăng và đom đóm; toàn bộ app đổi sang bảng màu xanh ngọc tương ứng. Khi bật chuyển động, 3 con koi bơi, ánh sáng trôi trên mặt nước, gợn nước lan quanh hoa sen, hoa sen đung đưa và đom đóm nhấp nháy.

## Cài đặt

Trong một phiên Claude Code, chạy:

```
/plugin install looksmith --marketplace cuongphamthe185/looksmith
```

Trả lời `y` để thêm marketplace, rồi chọn phạm vi cài. Mở phiên mới (hoặc khởi động lại Claude), hàng chọn theme sẽ hiện ngay trên ô nhập.

Cần bản Claude desktop có hỗ trợ theme cho mod (đã thử trên Claude desktop 5.11 cho Windows). Bản terminal và tiện ích trong trình soạn thảo không hiển thị theme.

## Cách dùng

- Hàng chọn trên ô nhập có 3 ô:
  - **Theme**: chọn theme, hoặc *Off* để về giao diện gốc.
  - **Light / dark**: *Follow OS* (theo hệ điều hành), *Always light* (luôn sáng), *Always dark* (luôn tối).
  - **Motion**: *Still* (tĩnh) hoặc *Swim* (cá bơi).
- Gõ `/themes` để mở cùng các lựa chọn trong một khung riêng, kèm tuỳ chọn ẩn/hiện hàng chọn.
- Hoặc gõ nhanh: `/themes koi-pond`, `/themes off`, `/themes auto|light|dark`, `/themes motion off|swim`, `/themes bar on|off`.

Lựa chọn được nhớ giữa các phiên. Ở chế độ *Follow OS*, theme tự đổi trong khoảng 10 giây sau khi hệ điều hành đổi sáng/tối.

## Chuyển động

Chuyển động do chính trình duyệt chạy (CSS/SMIL trong tranh SVG) ở tốc độ khung hình của màn hình, nên cá bơi mượt và màu theme được giữ nguyên.

Claude desktop **tự dừng nền động khi hệ điều hành yêu cầu giảm chuyển động**:
- **Windows:** ô **"Animate controls and elements inside windows"** trong Performance Options (`SystemPropertiesPerformance.exe`). Chế độ "Adjust for best performance" tắt ô này.
- **macOS:** mục **Reduce motion**.

Khi bạn chọn *Swim* mà hệ điều hành đang giảm chuyển động, hàng chọn sẽ báo **"Paused"** kèm nút mở đúng cài đặt đó. Plugin không bao giờ tự đổi cài đặt hệ thống.

**Chi phí**, đo trên laptop tầm trung (i7-1065G7, card đồ hoạ tích hợp, cửa sổ 2760 × 1792): hễ có chuyển động là app vẽ lại cả cửa sổ mỗi khung hình, nên chi phí phụ thuộc độ chi tiết của cảnh chứ không phải lượng chuyển động.

| Motion | Chuyển động | CPU | GPU |
| --- | --- | --- | --- |
| Still | không | ~3% | ~3% |
| Swim | 3 koi, ánh sáng trôi, gợn nước, hoa sen đung đưa, đom đóm (ban đêm) | ~16% | ~40–45% |

Máy yếu có thể bị lag khi bật *Swim*; khi đó hãy chọn *Still*.

## Giới hạn (đo trên Claude desktop 5.11)

- Tranh nền chỉ hiện sau cột hội thoại; thanh bên và panel nhận màu của theme thay vì tranh.
- Không dùng hiệu ứng kính mờ: khi hệ điều hành tắt hiệu ứng trong suốt, app tô kính thành khối đặc che mất tranh.
- Chuột không tương tác được với tranh nền.
- Sau khi đổi theme, app mất vài giây mới vẽ tranh.
- Bản terminal và tiện ích trong trình soạn thảo không hiển thị theme.

## Thêm theme mới

1. Đặt 2 tranh SVG tĩnh vào `themes/<id>/`, một cho chế độ sáng, một cho chế độ tối. Mỗi tranh cần có `viewBox` và `preserveAspectRatio="xMidYMid slice"`, tối đa 131.072 ký tự, không chứa script hay file bên ngoài. Nên để phần tranh nhiều chi tiết tránh khỏi vùng giữa, nơi có chữ.
2. Thêm một mục vào `hooks/themes.ts` gồm `id`, `label`, màu gốc cho `light` và `dark`, đường dẫn 2 tranh, và (tuỳ chọn) màu `dock` cho khung chứa ô nhập theo từng chế độ. Nên chọn màu nước ở mép dưới tranh.
3. (Tuỳ chọn) thêm `motion.swim`: một tranh SVG động cho chế độ sáng và một cho chế độ tối. Tạo chuyển động bằng CSS hoặc SMIL bên trong SVG, và tránh bộ lọc làm mờ (blur) vì nó bị vẽ lại mỗi khung hình.

Bảng màu được tạo bằng `makeColors`, có kiểm tra độ tương phản. Plugin tự bỏ màu nền trang của bảng màu tối để tranh hiện ra, và bỏ qua màu `dock` nào mà app sẽ từ chối vì thiếu tương phản (kèm thông báo), thay vì làm hỏng cả bảng màu.

## Giấy phép

MIT, xem [LICENSE](LICENSE).
