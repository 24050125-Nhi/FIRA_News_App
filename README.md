# FIRA News - bản video xem được

Bản này đã sửa tab Video để bấm là xem được như app báo:

- Tab Video có màn phát video ngay phía trên.
- Bấm ảnh video sẽ đổi video đang phát.
- Bấm nút **Xem** hoặc **Mở màn xem lớn** sẽ mở trang xem video riêng.
- Web dùng thẻ video HTML5.
- Điện thoại Expo Go dùng WebView nhúng video.
- Nếu thiết bị không phát được trong khung nhúng, app có nút mở video bằng trình phát của máy.
- Backend có API tăng lượt xem video: `POST /api/videos/:id/view`.

## Chạy dự án

Mở 2 cửa sổ terminal/CMD trong thư mục `FIRA_News_Full`.

Cửa sổ 1 chạy backend:

```bat
run_backend.bat
```

Cửa sổ 2 chạy app:

```bat
run_app.bat
```

Hoặc gõ thủ công:

```bat
npx expo start --clear --lan
```

Sau đó quét QR bằng Expo Go. Nếu đang mở bản cũ, hãy tắt hẳn Expo Go rồi quét lại QR mới.

## Tài khoản mẫu

Khách hàng:

```txt
reader@firanews.local
123456
```

Admin:

```txt
admin@firanews.local
123456
```
