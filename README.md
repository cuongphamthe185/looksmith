# Looksmith

**Tiếng Việt** · [English](README_EN.md)

Bộ theme cho Claude desktop: chọn theme ngay trên ô nhập, sáng/tối theo hệ điều hành, có chuyển động và kính trong.

![Koi Pond trong Claude desktop](themes/koi-pond/screenshot-dark.webp)

## Theme

| Theme | Sáng | Tối |
| --- | --- | --- |
| **Koi Pond**: ao koi, lá sen, hoa sen; 3 con koi bơi | <img src="themes/koi-pond/swim-day.svg" width="320" alt="Koi Pond, ban ngày"> | <img src="themes/koi-pond/swim-night.svg" width="320" alt="Koi Pond, ban đêm"> |

## Cài đặt

Chạy trong PowerShell, Terminal hoặc cmd (không phải ô chat của Claude), rồi khởi động lại Claude:

```
claude plugin install looksmith --marketplace cuongphamthe185/looksmith
```

**Cập nhật** (rồi khởi động lại Claude):

```
claude plugin marketplace update looksmith
claude plugin update looksmith
```

Muốn tự cập nhật: `/plugin` → **Marketplaces** → **looksmith** → **Enable auto-update**.

## Yêu cầu

- **Windows:** bật 2 mục ở Settings → Accessibility → Visual effects. Windows 11 mặc định bật sẵn.
  - **Animation effects**: để cá bơi. Nếu đã bật mà cá vẫn đứng yên: chạy `SystemPropertiesPerformance.exe` và tick **Animate controls and elements inside windows**.
  - **Transparency effects**: để có kính trong.
- **macOS:** mặc định đã dùng được đủ hiệu ứng. Nếu bạn từng bật *Reduce motion* hoặc *Reduce transparency* (System Settings → Accessibility) thì tắt đi. Chưa thử trên Mac.

Khi thiếu một mục, hàng chọn sẽ báo và có nút mở đúng cài đặt.

## Cách dùng

Hàng chọn trên ô nhập:
- **Theme**: chọn theme, hoặc *Off* để về giao diện gốc.
- **Light / dark**: theo hệ điều hành, luôn sáng hoặc luôn tối.
- **Motion**: *Still* (tĩnh) hoặc *Swim* (chuyển động).
- **Glass**: *Off* hoặc *Clear* (khung chat trong suốt).

Lựa chọn áp cho mọi phiên đang mở. Gõ `/themes` để mở các lựa chọn trong khung riêng.

**Không thấy hàng chọn?** Claude desktop chỉ chạy một số phiên cùng lúc, nên phiên lâu không dùng chưa có plugin. Chờ vài giây khi mở phiên đó, hoặc gửi một tin nhắn bất kỳ.

## Lưu ý

- *Swim* tốn tài nguyên: khoảng 16% CPU và 40–45% GPU trên laptop i7-1065G7 (*Still* chỉ khoảng 3%). Máy yếu nên dùng *Still*.
- Tranh chỉ hiện sau cột hội thoại; thanh bên chỉ đổi màu.
- Bản terminal và tiện ích trong trình soạn thảo không hiện theme.

## Thêm theme

Đặt 2 tranh SVG (sáng, tối) vào `themes/<id>/`, có thể thêm 2 tranh động, rồi khai báo theme trong `hooks/themes.ts`. Mỗi tranh cần `viewBox`, `preserveAspectRatio="xMidYMid slice"`, tối đa 131.072 ký tự, không script.

## Giấy phép

MIT, xem [LICENSE](LICENSE).
