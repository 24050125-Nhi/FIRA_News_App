# Hướng dẫn Database cho ứng dụng FIRA News

Thư mục này chứa toàn bộ cấu trúc và dữ liệu của cơ sở dữ liệu ứng dụng FIRA News.

## 1. Các file trong thư mục

- `schema.sql`: Script SQL chuẩn tạo database, 13 bảng, quan hệ khóa ngoại (Foreign Keys), Views và nạp toàn bộ dữ liệu mẫu (Seed Data).
- `fira_news_workbench.sql`: Bản sao tương đương của file script SQL dùng cho MySQL Workbench.
- `db.json`: File dữ liệu JSON dùng cho Backend Node.js chạy offline / local.
- `../fira_news_database.sql`: File SQL đặt ở thư mục gốc của dự án để dễ mở từ Workbench.

## 2. Danh sách 13 bảng trong Database `fira_news`

1. `categories`: Danh mục chuyên mục tin tức (8 chuyên mục).
2. `users`: Tài khoản độc giả và quản trị viên (Admin & Reader).
3. `articles`: Tin tức và bài viết chi tiết (20 bài viết đầy đủ nội dung, ảnh, tags).
4. `videos`: Bản tin video ngắn và phóng sự.
5. `comments`: Bình luận của độc giả trên bài viết (khóa ngoại `article_id` -> `articles.id`).
6. `bookmarks`: Bài viết đã lưu để đọc sau (quan hệ `user_id` và `article_id`).
7. `ratings`: Đánh giá số sao (1-5 sao) cho từng bài viết.
8. `sources`: Đối tác báo chí và nguồn tin (FIRA News, ZNews, Tiền phong,...).
9. `notifications`: Thông báo hệ thống gửi đến ứng dụng.
10. `reports`: Ý kiến đóng góp, phản hồi từ độc giả.
11. `reading_history`: Lịch sử bài viết người dùng đã đọc.
12. `image_presets`: Kho ảnh mẫu gợi ý theo chủ đề khi biên soạn tin.
13. `admin_logs`: Nhật ký thao tác của quản trị viên.

## 3. Cách mở và chạy trong MySQL Workbench

1. Mở **MySQL Workbench**.
2. Bấm vào kết nối MySQL cục bộ của bạn (ví dụ: `Local instance MySQL84` hoặc `localhost:3306`).
3. Nhấn tổ hợp phím **Ctrl + O** (hoặc vào menu **File -> Open SQL Script...**).
4. Chọn file `fira_news_database.sql` (ở thư mục gốc) hoặc `backend/database/schema.sql`.
5. Bấm vào biểu tượng **Tia sét ⚡** (Execute) hoặc nhấn **Ctrl + Shift + Enter** để thực thi toàn bộ script.
6. Ở cột bên trái trong khung **SCHEMAS**, click chuột phải và chọn **Refresh All**. Bạn sẽ thấy schema `fira_news` xuất hiện với đầy đủ 13 bảng và 2 Views.

## 4. Xem Sơ đồ quan hệ thực thể (EER Diagram) trong Workbench

1. Vào menu **Database** -> **Reverse Engineer...** (hoặc phím tắt **Ctrl + R**).
2. Chọn kết nối MySQL và nhấn **Next**.
3. Tích chọn database `fira_news` -> nhấn **Next** -> **Execute** -> **Finish**.
4. MySQL Workbench sẽ tự động vẽ sơ đồ quan hệ thực thể ERD trực quan rất đẹp để dùng cho báo cáo / đồ án.
