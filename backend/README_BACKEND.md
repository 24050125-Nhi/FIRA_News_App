# FIRA News Backend

Backend local chạy bằng Node.js thuần, không cần cài Express. Dữ liệu mẫu nằm trong `backend/database/db.json`.

## Chạy backend

```bat
cd backend
npm install
npm start
```

Hoặc bấm file `run_backend.bat` ở thư mục gốc.

## API chính

- `GET /api/health`
- `GET /api/articles`
- `GET /api/articles?category=cong-nghe`
- `GET /api/articles?search=video`
- `GET /api/articles?sort=popular`
- `GET /api/articles?featured=1`
- `GET /api/articles?breaking=1`
- `GET /api/articles/:id`
- `POST /api/articles/:id/like`
- `GET /api/categories`
- `GET /api/videos`
- `GET /api/comments?articleId=1`
- `POST /api/comments`
- `GET /api/bookmarks?userId=1`
- `POST /api/bookmarks`
- `DELETE /api/bookmarks/:articleId?userId=1`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/stats`

Tài khoản mẫu:

```text
reader@firanews.local / 123456
admin@firanews.local / 123456
```

## Ghi chú khi chạy bằng điện thoại thật

Nếu quét QR bằng Expo Go trên điện thoại, `localhost` trên điện thoại không phải máy tính. Hãy đổi file `.env`:

```env
EXPO_PUBLIC_API_URL=http://IP_MAY_TINH_CUA_BAN:4000/api
```

Ví dụ:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:4000/api
```

Nếu chưa đổi, app vẫn có dữ liệu mẫu để không bị trắng màn hình.
