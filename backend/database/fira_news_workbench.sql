-- =====================================================================
-- DATABASE: fira_news
-- Ứng dụng: Báo điện tử FIRA News (Hỗ trợ đọc báo & xem video)
-- Tương thích: MySQL 8.0, MySQL 8.4, MySQL Workbench, phpMyAdmin, MariaDB
-- Bộ mã: utf8mb4 / utf8mb4_unicode_ci (Hỗ trợ tiếng Việt và Emoji đầy đủ)
-- Ngày tạo: 2026-09-14
-- =====================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. KHỞI TẠO DATABASE
CREATE DATABASE IF NOT EXISTS `fira_news` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `fira_news`;

-- 2. XÓA BẢNG CŨ NẾU ĐÃ TỒN TẠI (Đảm bảo chạy lại không bị lỗi foreign key)
DROP TABLE IF EXISTS `admin_logs`;
DROP TABLE IF EXISTS `image_presets`;
DROP TABLE IF EXISTS `reading_history`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `sources`;
DROP TABLE IF EXISTS `ratings`;
DROP TABLE IF EXISTS `bookmarks`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `videos`;
DROP TABLE IF EXISTS `articles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `categories`;

-- =====================================================================
-- 3. TẠO CẤU TRÚC BẢNG (TABLE SCHEMAS)
-- =====================================================================

-- Bảng 1: categories (Chuyên mục báo)
CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL COMMENT 'Mã định danh chuyên mục (slug)',
  `name` VARCHAR(100) NOT NULL COMMENT 'Tên chuyên mục hiển thị',
  `color` VARCHAR(20) DEFAULT '#E11D48' COMMENT 'Mã màu đại diện cho chuyên mục',
  `icon` VARCHAR(60) DEFAULT 'newspaper' COMMENT 'Tên icon Ionicons hiển thị trong app',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục tin tức';

-- Bảng 2: users (Người dùng và Quản trị viên)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của người dùng',
  `name` VARCHAR(120) NOT NULL COMMENT 'Họ và tên người dùng',
  `email` VARCHAR(160) NOT NULL COMMENT 'Địa chỉ email đăng nhập',
  `password` VARCHAR(120) NOT NULL COMMENT 'Mật khẩu đăng nhập',
  `role` ENUM('reader', 'admin') DEFAULT 'reader' COMMENT 'Vai trò: reader (độc giả) hoặc admin (quản trị)',
  `avatar` TEXT DEFAULT NULL COMMENT 'Đường dẫn ảnh đại diện',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản độc giả và admin';

-- Bảng 3: articles (Tin tức / Bài viết)
CREATE TABLE `articles` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của bài viết',
  `title` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề bài viết',
  `summary` TEXT NOT NULL COMMENT 'Tóm tắt bài viết hiển thị ở danh sách',
  `content` LONGTEXT NOT NULL COMMENT 'Nội dung chi tiết đầy đủ của bài báo',
  `category_id` VARCHAR(50) NOT NULL COMMENT 'Khóa ngoại liên kết bảng categories',
  `author` VARCHAR(120) DEFAULT 'Ban biên tập' COMMENT 'Tác giả bài viết',
  `source` VARCHAR(120) DEFAULT 'FIRA News' COMMENT 'Nguồn xuất bản tin tức',
  `image_url` TEXT DEFAULT NULL COMMENT 'Đường dẫn ảnh bìa bài viết',
  `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian xuất bản',
  `read_time` VARCHAR(50) DEFAULT '3 phút đọc' COMMENT 'Thời gian ước tính để đọc',
  `views` INT DEFAULT 0 COMMENT 'Số lượt xem bài viết',
  `likes` INT DEFAULT 0 COMMENT 'Số lượt thích / thả tim',
  `comments` INT DEFAULT 0 COMMENT 'Số lượt bình luận',
  `tags` JSON DEFAULT NULL COMMENT 'Mảng thẻ tags dạng JSON',
  `is_breaking` TINYINT(1) DEFAULT 0 COMMENT 'Đánh dấu tin nóng đặc biệt',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Đánh dấu tin nổi bật trang chủ',
  `is_editor_pick` TINYINT(1) DEFAULT 0 COMMENT 'Đánh dấu tin do ban biên tập đề xuất',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ghi vào database',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_breaking` (`is_breaking`),
  KEY `idx_published_at` (`published_at`),
  CONSTRAINT `fk_articles_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tin tức và bài báo chi tiết';

-- Bảng 4: videos (Danh sách tin video ngắn và phóng sự)
CREATE TABLE `videos` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của video',
  `title` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề video tin tức',
  `duration` VARCHAR(20) DEFAULT '00:00' COMMENT 'Thời lượng phát video (phút:giây)',
  `image_url` TEXT DEFAULT NULL COMMENT 'Ảnh thumbnail video',
  `video_url` TEXT DEFAULT NULL COMMENT 'Đường dẫn luồng video trực tuyến',
  `embed_url` TEXT DEFAULT NULL COMMENT 'Đường dẫn nhúng iframe nếu có',
  `description` TEXT DEFAULT NULL COMMENT 'Mô tả ngắn về nội dung video',
  `category` VARCHAR(100) DEFAULT 'Tin tức' COMMENT 'Chuyên mục video',
  `views` INT DEFAULT 0 COMMENT 'Số lượt xem video',
  `is_live` TINYINT(1) DEFAULT 0 COMMENT '1: Video đang phát trực tiếp, 0: Bình thường',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đăng video',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bản tin video và phóng sự';

-- Bảng 5: comments (Bình luận của bạn đọc trên bài viết)
CREATE TABLE `comments` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của bình luận',
  `article_id` INT NOT NULL COMMENT 'ID bài viết được bình luận',
  `name` VARCHAR(120) NOT NULL COMMENT 'Tên độc giả gửi bình luận',
  `content` TEXT NOT NULL COMMENT 'Nội dung bình luận',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian bình luận',
  PRIMARY KEY (`id`),
  KEY `idx_comment_article` (`article_id`),
  CONSTRAINT `fk_comments_articles` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bình luận của bạn đọc';

-- Bảng 6: bookmarks (Danh sách bài viết đã lưu để đọc sau)
CREATE TABLE `bookmarks` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng',
  `user_id` INT NOT NULL COMMENT 'ID người dùng đã lưu tin',
  `article_id` INT NOT NULL COMMENT 'ID bài viết được lưu',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian lưu tin',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_article_bookmark` (`user_id`, `article_id`),
  KEY `idx_bookmark_user` (`user_id`),
  KEY `idx_bookmark_article` (`article_id`),
  CONSTRAINT `fk_bookmarks_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookmarks_articles` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tin tức đã lưu vào danh sách đọc sau';

-- Bảng 7: ratings (Đánh giá điểm bài viết của độc giả)
CREATE TABLE `ratings` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng',
  `user_id` INT NOT NULL COMMENT 'ID người dùng đánh giá',
  `article_id` INT NOT NULL COMMENT 'ID bài viết được đánh giá',
  `score` TINYINT NOT NULL COMMENT 'Số điểm từ 1 đến 5 sao',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian đánh giá',
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật đánh giá',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_article_rating` (`user_id`, `article_id`),
  CONSTRAINT `fk_ratings_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_articles` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_score_range` CHECK (`score` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đánh giá sao cho bài viết (1-5 sao)';

-- Bảng 8: sources (Nguồn báo và đối tác xuất bản)
CREATE TABLE `sources` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID nguồn tin',
  `name` VARCHAR(160) NOT NULL COMMENT 'Tên đối tác nguồn tin',
  `logo` TEXT DEFAULT NULL COMMENT 'Đường dẫn logo nguồn tin',
  `website` TEXT DEFAULT NULL COMMENT 'Địa chỉ website chính thức',
  `status` VARCHAR(30) DEFAULT 'active' COMMENT 'Trạng thái hoạt động (active / inactive)',
  `articles` INT DEFAULT 0 COMMENT 'Tổng số bài viết từ nguồn này',
  `description` TEXT DEFAULT NULL COMMENT 'Giới thiệu về cơ quan / đối tác',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thêm nguồn',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đối tác báo chí và nguồn tin tức';

-- Bảng 9: notifications (Thông báo đẩy trong app)
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID thông báo',
  `title` VARCHAR(180) NOT NULL COMMENT 'Tiêu đề thông báo',
  `message` TEXT NOT NULL COMMENT 'Nội dung chi tiết thông báo',
  `type` VARCHAR(50) DEFAULT 'general' COMMENT 'Loại: breaking, saved, admin, general',
  `enabled` TINYINT(1) DEFAULT 1 COMMENT '1: Đang kích hoạt, 0: Tạm tắt',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo thông báo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thông báo hệ thống cho độc giả';

-- Bảng 10: reports (Phản hồi, báo cáo lỗi từ người dùng)
CREATE TABLE `reports` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID báo cáo phản hồi',
  `user_id` INT DEFAULT NULL COMMENT 'ID người gửi (nếu đã đăng nhập)',
  `type` VARCHAR(50) DEFAULT 'feedback' COMMENT 'Loại: feedback, bug, content_issue',
  `content` TEXT NOT NULL COMMENT 'Nội dung phản hồi góp ý',
  `status` VARCHAR(30) DEFAULT 'new' COMMENT 'Trạng thái: new, reviewed, resolved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian gửi phản hồi',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_reports_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ý kiến phản hồi và đóng góp từ độc giả';

-- Bảng 11: reading_history (Lịch sử đọc bài của độc giả)
CREATE TABLE `reading_history` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID lịch sử đọc',
  `user_id` INT NOT NULL COMMENT 'ID độc giả',
  `article_id` INT NOT NULL COMMENT 'ID bài viết đã mở đọc',
  `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm mở đọc',
  PRIMARY KEY (`id`),
  KEY `idx_history_user` (`user_id`),
  KEY `idx_history_article` (`article_id`),
  CONSTRAINT `fk_history_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_articles` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký lịch sử bài viết đã đọc';

-- Bảng 12: image_presets (Kho ảnh mẫu định sẵn cho admin đăng bài)
CREATE TABLE `image_presets` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID ảnh mẫu',
  `name` VARCHAR(120) NOT NULL COMMENT 'Tên chủ đề ảnh (Công nghệ, Giáo dục, v.v.)',
  `url` TEXT NOT NULL COMMENT 'Đường dẫn ảnh chất lượng cao',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian thêm',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thư viện ảnh mẫu dùng khi biên tập tin';

-- Bảng 13: admin_logs (Nhật ký hành động của quản trị viên)
CREATE TABLE `admin_logs` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID nhật ký admin',
  `action` TEXT NOT NULL COMMENT 'Nội dung hành động thực hiện',
  `user` VARCHAR(120) DEFAULT 'Admin' COMMENT 'Tài khoản admin thực hiện',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ghi log',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký thao tác của quản trị viên';

-- Bảng 14: log (Nhật ký hành động và đọc báo của người dùng - Khớp màn hình MySQL trong hình chụp)
CREATE TABLE `log` (
  `ma_log` BIGINT AUTO_INCREMENT NOT NULL COMMENT 'Mã nhật ký tự tăng',
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thực hiện hành động',
  `ma_tai_khoan` BIGINT NOT NULL COMMENT 'Mã tài khoản người dùng',
  `loai` VARCHAR(100) NOT NULL COMMENT 'Loại nhật ký (usage_statistics, user_status, v.v.)',
  `hanh_dong` VARCHAR(100) NOT NULL COMMENT 'Tên hành động (read_article, core_function_usage, online, offline)',
  `mo_ta` LONGTEXT NOT NULL COMMENT 'Chi tiết JSON chứa ho_va_ten, user_role, device_id, device_info, stats, bài báo...',
  PRIMARY KEY (`ma_log`),
  KEY `idx_log_user` (`ma_tai_khoan`),
  KEY `idx_log_timestamp` (`timestamp`),
  KEY `idx_log_action` (`hanh_dong`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký thao tác và thống kê đọc báo';

-- =====================================================================
-- 4. DỮ LIỆU MẪU ĐẦY ĐỦ (SEED DATA)
-- =====================================================================

-- Chèn dữ liệu: categories (8 danh mục)
INSERT INTO `categories` (`id`, `name`, `color`, `icon`) VALUES
  ('all', 'Tất cả', '#E11D48', 'grid'),
  ('thoi-su', 'Thời sự', '#F97316', 'newspaper'),
  ('kinh-te', 'Kinh tế', '#16A34A', 'trending-up'),
  ('cong-nghe', 'Công nghệ', '#2563EB', 'hardware-chip'),
  ('giao-duc', 'Giáo dục', '#7C3AED', 'school'),
  ('giai-tri', 'Giải trí', '#DB2777', 'musical-notes'),
  ('the-thao', 'Thể thao', '#0891B2', 'football'),
  ('doi-song', 'Đời sống', '#0D9488', 'leaf');

-- Chèn dữ liệu: users (3 tài khoản)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`) VALUES
  (1, 'Bạn đọc FIRA', 'reader@firanews.local', '123456', 'reader', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'),
  (2, 'Admin', 'admin@firanews.local', '123456', 'admin', NULL),
  (3, 'Lê Đức Tài (Gmail)', 'ductai.developer@gmail.com', 'password123', 'reader', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');

-- Chèn dữ liệu: articles (20 bài viết chi tiết)
INSERT INTO `articles` (`id`, `title`, `summary`, `content`, `category_id`, `author`, `source`, `image_url`, `published_at`, `read_time`, `views`, `likes`, `comments`, `tags`, `is_breaking`, `is_featured`, `is_editor_pick`) VALUES
  (1, 'Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật', 'Trang chủ được thiết kế lại với tin nóng, chuyên mục, video, lưu tin, bình luận và tìm kiếm bằng kính lúp nổi bật.', 'Phiên bản mới của ứng dụng đọc báo tập trung vào trải nghiệm sử dụng trên điện thoại. Màn hình đầu tiên có thanh tin nóng, ô tìm kiếm rõ ràng, các chuyên mục dạng chip và khối tin nổi bật giống những ứng dụng báo điện tử phổ biến hiện nay. Người dùng có thể đọc nhanh tiêu đề, xem ảnh đại diện, mở chi tiết bài viết và theo dõi số lượt xem của từng tin.\n\nNgoài giao diện, ứng dụng còn được chuẩn bị backend API và database mẫu để sinh viên có thể chạy thử ngay. Dữ liệu bài viết, chuyên mục, video, bình luận, tài khoản và tin đã lưu được đặt trong thư mục backend/database. Khi backend đang chạy, app gọi dữ liệu từ API; khi chưa mở backend, app vẫn có dữ liệu mẫu để tránh trắng màn hình.\n\nCác chức năng chính gồm tìm kiếm tin tức, lọc theo chuyên mục, xem tin nổi bật, xem video, lưu bài viết, thả tim, gửi bình luận và xem trang cá nhân mẫu.', 'cong-nghe', 'Ban biên tập', 'FIRA News', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80', '2026-06-15 08:30:00', '4 phút đọc', 12840, 420, 8, '["app đọc báo","React Native","backend"]', 1, 1, 1),
  (2, 'Xu hướng học công nghệ thông tin qua dự án thực tế', 'Làm sản phẩm hoàn chỉnh giúp sinh viên hiểu rõ frontend, backend, database và cách kết nối API.', 'Học qua dự án thực tế đang trở thành cách tiếp cận hiệu quả trong ngành công nghệ thông tin. Khi xây dựng một ứng dụng hoàn chỉnh, sinh viên không chỉ viết giao diện mà còn hiểu cách dữ liệu được lưu trữ, xử lý và trả về cho người dùng.\n\nVới dự án đọc báo, sinh viên có thể luyện tập các kỹ năng quan trọng như thiết kế màn hình, gọi API, lọc dữ liệu, tìm kiếm bài viết, tạo trang chi tiết và xây dựng backend quản lý nội dung.', 'giao-duc', 'Minh Anh', 'Giáo dục trẻ', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', '2026-06-15 09:15:00', '5 phút đọc', 8562, 238, 5, '["học lập trình","dự án","sinh viên"]', 0, 1, 0),
  (3, 'Kinh tế số tạo thêm nhiều cơ hội việc làm mới', 'Các doanh nghiệp đang cần nhân sự biết phân tích dữ liệu, vận hành nền tảng số và phát triển sản phẩm trực tuyến.', 'Kinh tế số tiếp tục mở rộng trong nhiều lĩnh vực như thương mại điện tử, giáo dục trực tuyến, tài chính số và truyền thông. Điều này tạo ra nhu cầu lớn về nhân sự có kỹ năng công nghệ, tư duy sản phẩm và khả năng làm việc với dữ liệu.\n\nNgười học có thể bắt đầu bằng các dự án nhỏ như website bán hàng, app đọc tin, hệ thống quản lý thư viện hoặc ứng dụng IoT để tích lũy kinh nghiệm thực tế.', 'kinh-te', 'Hoàng Nam', 'Kinh tế hôm nay', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80', '2026-06-14 18:00:00', '3 phút đọc', 6420, 171, 3, '["kinh tế số","việc làm"]', 0, 0, 0),
  (4, 'Đội tuyển trẻ gây ấn tượng ở giải thể thao sinh viên', 'Tinh thần thi đấu bền bỉ và chiến thuật hợp lý giúp đội tuyển giành kết quả tích cực.', 'Giải thể thao sinh viên năm nay thu hút nhiều đội tham gia với chất lượng chuyên môn tốt. Các trận đấu diễn ra sôi nổi, tạo sân chơi lành mạnh và giúp sinh viên rèn luyện thể chất sau giờ học.\n\nBan tổ chức cho biết các hoạt động thể thao sẽ tiếp tục được mở rộng trong thời gian tới nhằm khuyến khích sinh viên tham gia nhiều hơn.', 'the-thao', 'Thể thao 24h', 'Sport Campus', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80', '2026-06-14 15:45:00', '2 phút đọc', 4281, 92, 2, '["thể thao","sinh viên"]', 0, 0, 0),
  (5, 'Nhiều hoạt động văn hóa thu hút giới trẻ dịp cuối tuần', 'Các sự kiện âm nhạc, triển lãm và workshop sáng tạo mang đến không gian giải trí mới mẻ.', 'Cuối tuần là thời điểm nhiều bạn trẻ tìm kiếm các hoạt động giải trí, học hỏi và giao lưu. Những chương trình văn hóa như triển lãm ảnh, đêm nhạc acoustic và workshop thiết kế đang được quan tâm nhờ tính gần gũi và chi phí hợp lý.\n\nKhông gian sáng tạo cũng giúp người trẻ thể hiện cá tính, rèn luyện kỹ năng mềm và mở rộng mối quan hệ.', 'giai-tri', 'Hà My', 'Nhịp sống trẻ', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80', '2026-06-13 20:10:00', '3 phút đọc', 5310, 154, 6, '["giải trí","cuối tuần"]', 0, 0, 0),
  (6, 'Thời sự trong ngày: giao thông đô thị cần thêm giải pháp thông minh', 'Các đô thị lớn đang tăng cường ứng dụng công nghệ để giảm ùn tắc và nâng cao trải nghiệm di chuyển.', 'Giao thông đô thị là một trong những vấn đề được quan tâm tại nhiều thành phố. Việc ứng dụng camera thông minh, dữ liệu thời gian thực và bản đồ số có thể giúp cơ quan quản lý theo dõi tình hình tốt hơn.\n\nNgười dân cũng được khuyến khích sử dụng phương tiện công cộng, theo dõi thông tin tuyến đường và sắp xếp thời gian di chuyển hợp lý.', 'thoi-su', 'Bảo An', 'Thời sự nhanh', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80', '2026-06-15 06:45:00', '4 phút đọc', 9744, 301, 9, '["giao thông","đô thị"]', 1, 0, 0),
  (7, 'Mẹo đọc tin hiệu quả: lưu bài hay và chọn nguồn đáng tin cậy', 'Thói quen đọc tin có chọn lọc giúp người dùng tiết kiệm thời gian và tránh bỏ lỡ nội dung quan trọng.', 'Người dùng hiện nay tiếp nhận rất nhiều tin tức mỗi ngày. Vì vậy, việc chọn lọc nguồn tin, đọc tiêu đề cẩn thận, xem phần tóm tắt và lưu lại bài viết quan trọng là thói quen cần thiết.\n\nTrong ứng dụng, chức năng lưu tin giúp người dùng đánh dấu bài viết để đọc lại sau. Tính năng bình luận cũng tạo không gian trao đổi ý kiến sau khi đọc bài.', 'doi-song', 'Lan Chi', 'Đời sống số', 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80', '2026-06-15 10:20:00', '3 phút đọc', 7712, 206, 4, '["đời sống","đọc tin"]', 0, 0, 1),
  (8, 'Video ngắn trở thành xu hướng truyền tải tin tức trên di động', 'Các bản tin ngắn, dễ xem giúp người dùng cập nhật nhanh thông tin khi không có nhiều thời gian.', 'Video ngắn ngày càng được sử dụng nhiều trong các nền tảng nội dung. Với thời lượng từ một đến năm phút, người xem có thể nắm bắt nội dung chính mà không cần đọc quá dài.\n\nApp đọc báo mới bổ sung khu vực video để mô phỏng cách các ứng dụng tin tức hiện đại kết hợp bài viết, hình ảnh và video trong cùng một trải nghiệm.', 'cong-nghe', 'Quốc Huy', 'Tech Daily', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80', '2026-06-15 11:05:00', '4 phút đọc', 11240, 357, 7, '["video","mobile"]', 1, 0, 0),
  (9, 'Cú hích từ siêu dự án đường sắt tốc độ cao và đô thị thông minh', 'Các dự án hạ tầng lớn mở ra cơ hội phát triển kinh tế, kết nối vùng và dịch vụ số.', 'Các dự án giao thông quy mô lớn được kỳ vọng tạo động lực mới cho nhiều địa phương. Khi hệ thống vận tải hiện đại được hoàn thiện, thời gian di chuyển sẽ rút ngắn, hoạt động logistics thuận lợi hơn và người dân có thêm lựa chọn đi lại.\n\nBên cạnh đó, đô thị thông minh cũng cần nền tảng dữ liệu tốt để kết nối giao thông, y tế, giáo dục và dịch vụ công. Đây là lĩnh vực sinh viên công nghệ có thể tìm hiểu thông qua các dự án phần mềm thực tế.', 'thoi-su', 'Nhật Minh', 'Tiền phong', 'https://images.unsplash.com/photo-1555217851-6141535bd771?auto=format&fit=crop&w=1200&q=80', '2026-06-15 13:42:00', '3 phút đọc', 16290, 503, 12, '["đường sắt","hạ tầng","thời sự"]', 1, 0, 0),
  (10, 'Châu Á tiếp tục bất bại ở vòng loại World Cup', 'Các đội bóng khu vực có màn trình diễn giàu năng lượng và tạo nên nhiều bất ngờ.', 'Vòng loại World Cup chứng kiến sự tiến bộ rõ rệt của nhiều đội bóng châu Á. Lối chơi kỷ luật, tốc độ và khả năng tận dụng cơ hội giúp các đội tạo dấu ấn trước những đối thủ mạnh.\n\nNgười hâm mộ kỳ vọng phong độ này sẽ tiếp tục được duy trì trong các lượt trận tới, đặc biệt khi các đội tuyển đang trẻ hóa lực lượng.', 'the-thao', 'Hải Đăng', 'ZNEWS', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80', '2026-06-15 02:38:00', '4 phút đọc', 23810, 711, 19, '["World Cup 2026","bóng đá","thể thao"]', 1, 0, 0),
  (11, 'Từ 1/7, thêm một loại giấy tờ quan trọng được cập nhật trên ứng dụng định danh', 'Nhiều dịch vụ số đang được tích hợp để người dân thao tác nhanh hơn trên điện thoại.', 'Các nền tảng định danh số đang ngày càng quan trọng trong quá trình chuyển đổi số. Việc bổ sung giấy tờ và dịch vụ mới giúp người dân giảm thời gian đi lại, đồng thời tạo cơ sở để các cơ quan liên thông dữ liệu.\n\nNgười dùng nên kiểm tra thông tin cá nhân, cập nhật ứng dụng thường xuyên và bảo mật tài khoản bằng mật khẩu mạnh.', 'cong-nghe', 'Hoàng Phúc', 'ZNEWS', 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80', '2026-06-15 07:45:00', '3 phút đọc', 14330, 322, 9, '["ứng dụng","định danh","công nghệ"]', 0, 0, 0),
  (12, 'Giá vàng ngày 15/6: thị trường trong nước tiếp tục biến động', 'Nhà đầu tư theo dõi sát diễn biến quốc tế và chính sách tiền tệ trước khi đưa ra quyết định.', 'Giá vàng trong nước tiếp tục được quan tâm khi thị trường quốc tế biến động. Các chuyên gia khuyến nghị người mua nên theo dõi nhiều nguồn thông tin, so sánh mức chênh lệch mua bán và tránh quyết định theo tâm lý đám đông.\n\nTrong ứng dụng, nhóm có thể nâng cấp thêm mục tiện ích giá vàng để cập nhật dữ liệu nhanh cho người dùng.', 'kinh-te', 'Thu Hà', 'Vietnam+', 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80', '2026-06-15 08:05:00', '3 phút đọc', 11980, 245, 7, '["giá vàng","kinh tế"]', 0, 0, 0),
  (13, 'Nữ ca sĩ Việt được mời hát đám cưới, chia sẻ câu chuyện phía sau sân khấu', 'Câu chuyện hậu trường thu hút sự chú ý nhờ cách kể gần gũi và tích cực.', 'Những câu chuyện hậu trường của nghệ sĩ thường được khán giả quan tâm vì mang lại góc nhìn đời thường hơn. Bên cạnh ánh đèn sân khấu, việc chuẩn bị tiết mục, chọn trang phục và giao lưu với khán giả đều góp phần tạo nên trải nghiệm trọn vẹn.\n\nNội dung giải trí trong app được bố trí theo dạng danh sách dễ đọc, có hình ảnh lớn và có thể mở chi tiết ngay khi chạm vào tiêu đề.', 'giai-tri', 'Thanh Vy', 'SAOstar', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80', '2026-06-15 05:10:00', '2 phút đọc', 9802, 401, 11, '["ca sĩ","giải trí","video"]', 0, 0, 0),
  (14, 'Người mẹ nuôi 3 con gái sinh 3 cùng trúng tuyển lớp 10 trường chuyên', 'Câu chuyện gia đình truyền cảm hứng học tập và nghị lực vượt khó.', 'Kết quả học tập của ba chị em sinh ba khiến nhiều người xúc động. Đằng sau thành tích là sự đồng hành bền bỉ của gia đình, thầy cô và tinh thần tự học của các em.\n\nGiáo dục luôn là chuyên mục được nhiều độc giả quan tâm, đặc biệt vào mùa thi và tuyển sinh.', 'giao-duc', 'Phương Linh', 'Vietnamnet', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80', '2026-06-15 03:28:00', '4 phút đọc', 15320, 654, 22, '["tuyển sinh","giáo dục"]', 0, 0, 0),
  (15, 'Vợ chồng chênh lệch bao nhiêu tuổi là lý tưởng? Góc nhìn từ chuyên gia', 'Sự đồng cảm, tôn trọng và khả năng chia sẻ quan trọng hơn khoảng cách tuổi tác.', 'Trong các mối quan hệ, khoảng cách tuổi tác không phải yếu tố quyết định duy nhất. Điều quan trọng là sự thấu hiểu, cách giao tiếp và mục tiêu sống có phù hợp hay không.\n\nCác chuyên gia cho rằng mỗi cặp đôi cần xây dựng sự tôn trọng và ranh giới lành mạnh để duy trì mối quan hệ bền vững.', 'doi-song', 'Mai Chi', 'Góc nhìn pháp lý', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80', '2026-06-15 09:20:00', '3 phút đọc', 7320, 198, 5, '["đời sống","gia đình"]', 0, 0, 0),
  (16, 'Chiến sự Nga-Ukraine 15/6: nhiều khu vực tiếp tục căng thẳng', 'Các bên kêu gọi tăng cường ngoại giao và bảo vệ dân thường trong vùng xung đột.', 'Tình hình xung đột vẫn diễn biến phức tạp tại một số khu vực. Các tổ chức quốc tế nhấn mạnh nhu cầu hỗ trợ nhân đạo và duy trì kênh đối thoại nhằm giảm thiểu tác động tới dân thường.\n\nKhi đọc tin quốc tế, người dùng nên kiểm tra nguồn tin đáng tin cậy và tránh chia sẻ thông tin chưa xác minh.', 'thoi-su', 'Quang Huy', 'Pháp luật', 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=80', '2026-06-15 06:18:00', '5 phút đọc', 20110, 277, 17, '["quốc tế","thời sự"]', 1, 0, 0),
  (17, 'AI hỗ trợ giáo viên soạn bài và cá nhân hóa nội dung học tập', 'Công cụ thông minh giúp tiết kiệm thời gian nhưng vẫn cần người dạy kiểm tra chất lượng.', 'Trí tuệ nhân tạo đang được ứng dụng trong giáo dục để gợi ý nội dung, tạo câu hỏi luyện tập và hỗ trợ đánh giá. Tuy nhiên, giáo viên vẫn giữ vai trò quan trọng trong việc kiểm chứng, điều chỉnh và truyền cảm hứng cho học sinh.\n\nSinh viên có thể khai thác AI để học lập trình, viết tài liệu và lên kế hoạch dự án, nhưng cần hiểu bản chất thay vì sao chép máy móc.', 'giao-duc', 'Minh Thư', 'Giáo dục trẻ', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80', '2026-06-15 11:30:00', '4 phút đọc', 12701, 430, 10, '["AI","giáo dục","công nghệ"]', 0, 1, 0),
  (18, 'Ứng dụng mobile cần chú ý khoảng cách nút bấm để người dùng thao tác dễ hơn', 'Thiết kế phù hợp màn hình điện thoại giúp giảm bấm nhầm và tăng trải nghiệm đọc tin.', 'Trên thiết bị di động, nút bấm cần có vùng chạm đủ rộng, chữ dễ đọc và khoảng cách rõ ràng. Những thành phần như menu, kính lúp, tài khoản, tab trên cùng và thanh điều hướng dưới nên được kiểm tra trên nhiều kích thước màn hình.\n\nBản giao diện mới đã tối ưu lại header, danh sách tin, nút đóng tin, chuyên mục và thanh tab dưới để thao tác tốt hơn trên điện thoại Android lẫn iOS.', 'cong-nghe', 'Ban sản phẩm', 'FIRA News', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80', '2026-06-15 12:20:00', '4 phút đọc', 18440, 802, 24, '["mobile","UI UX","React Native"]', 0, 1, 1),
  (19, 'HLV công bố danh sách đội tuyển Việt Nam: nhiều gương mặt trẻ được gọi', 'Sự xuất hiện của cầu thủ trẻ tạo thêm cạnh tranh trong đội hình trước giải đấu quan trọng.', 'Danh sách tập trung mới có nhiều thay đổi đáng chú ý. Ban huấn luyện muốn thử nghiệm thêm phương án chiến thuật và tạo cơ hội cho những cầu thủ đang có phong độ tốt ở câu lạc bộ.\n\nNgười hâm mộ kỳ vọng đội tuyển sẽ có sự chuẩn bị tốt và thi đấu tự tin trong các trận sắp tới.', 'the-thao', 'Thành Long', 'Tiền phong', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', '2026-06-15 10:02:00', '3 phút đọc', 21900, 610, 18, '["bóng đá VN","đội tuyển","World Cup 2026"]', 1, 0, 0),
  (20, 'Mô hình học thực hành giúp sinh viên tự tin hơn khi làm đồ án', 'Tự chạy backend, database và app mobile là bước quan trọng để hiểu hệ thống hoàn chỉnh.', 'Một đồ án có tính thực tế nên bao gồm giao diện, API, database và hướng dẫn chạy rõ ràng. Khi sinh viên tự thao tác từ cài đặt thư viện đến kiểm tra dữ liệu, kiến thức sẽ vững hơn và dễ trình bày với giảng viên.\n\nDự án app đọc báo này được đóng gói kèm file chạy nhanh trên Windows để người mới bắt đầu cũng có thể mở và kiểm thử.', 'giao-duc', 'Bảo Trân', 'FIRA News', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', '2026-06-14 21:30:00', '5 phút đọc', 9001, 312, 8, '["đồ án","backend","database"]', 0, 0, 0);

-- Chèn dữ liệu: videos (5 tin video)
INSERT INTO `videos` (`id`, `title`, `duration`, `image_url`, `video_url`, `embed_url`, `description`, `category`, `views`, `is_live`) VALUES
  (101, 'Bản tin giáo dục và hoạt động trường học', '05:19', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1000&q=80', NULL, NULL, 'Video local được lưu trong assets/videos và phát trực tiếp trong ứng dụng.', 'Giáo dục', 2100, 1),
  (102, 'Nhịp sống và những câu chuyện xã hội đáng chú ý', '00:56', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80', NULL, NULL, 'Video local được lưu trong assets/videos và phát trực tiếp trong ứng dụng.', 'Đời sống', 1540, 0),
  (103, 'Bản tin thời sự: sự việc đáng chú ý qua camera', '02:06', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80', NULL, NULL, 'Video local được lưu trong assets/videos và phát trực tiếp trong ứng dụng.', 'Thời sự', 3890, 0),
  (104, 'Thông tin y tế và chăm sóc sức khỏe', '02:56', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1000&q=80', NULL, NULL, 'Video local được lưu trong assets/videos và phát trực tiếp trong ứng dụng.', 'Sức khỏe', 2760, 0),
  (105, 'Cảnh báo thông tin và xu hướng tiêu dùng trên mạng', '02:56', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80', NULL, NULL, 'Video local được lưu trong assets/videos và phát trực tiếp trong ứng dụng.', 'Tiêu dùng', 5020, 1);

-- Chèn dữ liệu: comments (5 bình luận)
INSERT INTO `comments` (`id`, `article_id`, `name`, `content`, `created_at`) VALUES
  (1, 1, 'Ngọc Ánh', 'Giao diện mới nhìn giống app báo thật, dễ dùng hơn nhiều.', '2026-06-15 09:10:00'),
  (2, 1, 'Minh Khang', 'Có backend và database mẫu như này rất tiện để nộp đồ án.', '2026-06-15 09:32:00'),
  (3, 6, 'Bảo Trân', 'Tin giao thông nên có thêm bản đồ nữa là đẹp.', '2026-06-15 07:21:00'),
  (4, 18, 'Uyển Nhi', 'Nút bấm rõ hơn và nhìn giống app báo thật hơn rồi.', '2026-06-15 12:40:00'),
  (5, 10, 'Độc giả bóng đá', 'Mục Bóng đá VN bấm lọc ra tin thể thao rất tiện.', '2026-06-15 12:58:00');

-- Chèn dữ liệu: bookmarks (2 tin đã lưu)
INSERT INTO `bookmarks` (`id`, `user_id`, `article_id`, `created_at`) VALUES
  (1, 1, 1, '2026-06-15 10:00:00'),
  (2, 1, 7, '2026-06-15 10:30:00');

-- Chèn dữ liệu: ratings (3 đánh giá)
INSERT INTO `ratings` (`id`, `user_id`, `article_id`, `score`, `created_at`, `updated_at`) VALUES
  (1, 1, 1, 5, '2026-06-15 13:00:00', '2026-06-15 19:48:50'),
  (2, 1, 2, 4, '2026-06-15 13:10:00', NULL),
  (3, 3, 1, 5, '2026-09-14 09:13:54', NULL);

-- Chèn dữ liệu: sources (3 nguồn tin)
INSERT INTO `sources` (`id`, `name`, `logo`, `website`, `status`, `articles`, `description`) VALUES
  (1, 'FIRA News', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=80', 'https://firanews.local', 'active', 8, 'Nguồn tin nội bộ của dự án'),
  (2, 'Tiền phong', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80', 'https://tienphong.vn', 'active', 4, 'Đối tác tin tức mô phỏng'),
  (3, 'ZNews', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80', 'https://znews.vn', 'active', 3, 'Nguồn báo điện tử mô phỏng');

-- Chèn dữ liệu: notifications (3 thông báo)
INSERT INTO `notifications` (`id`, `title`, `message`, `type`, `enabled`, `created_at`) VALUES
  (1, 'Tin nóng trong ngày', 'Ứng dụng vừa cập nhật danh sách tin nóng mới nhất.', 'breaking', 1, '2026-06-15 09:00:00'),
  (2, 'Nhắc đọc tin đã lưu', 'Bạn có thể mở mục Tin đã lưu để đọc lại các bài yêu thích.', 'saved', 1, '2026-06-15 10:00:00'),
  (3, 'Admin đăng tin', 'Admin có thể đăng và cập nhật bài viết trực tiếp từ trang tài khoản.', 'admin', 1, '2026-06-15 11:00:00');

-- Chèn dữ liệu: reports (1 phản hồi độc giả)
INSERT INTO `reports` (`id`, `user_id`, `type`, `content`, `status`, `created_at`) VALUES
  (1, 1, 'feedback', 'Giao diện giống app báo, các nút dễ bấm hơn.', 'new', '2026-06-15 12:00:00');

-- Chèn dữ liệu: reading_history (5 lịch sử đọc tin)
INSERT INTO `reading_history` (`id`, `user_id`, `article_id`, `read_at`) VALUES
  (1, 1, 1, '2026-06-15 13:00:00'),
  (2, 1, 2, '2026-06-15 13:20:00'),
  (3, 1, 17, '2026-09-14 09:04:50'),
  (4, 3, 1, '2026-09-14 09:07:54'),
  (5, 3, 2, '2026-09-14 08:55:54');

-- Chèn dữ liệu: image_presets (4 ảnh định sẵn)
INSERT INTO `image_presets` (`id`, `name`, `url`) VALUES
  (1, 'Công nghệ', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'),
  (2, 'Tin tức', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'),
  (3, 'Giáo dục', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'),
  (4, 'Kinh tế', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80');

-- Chèn dữ liệu: admin_logs (1 nhật ký hệ thống)
INSERT INTO `admin_logs` (`id`, `action`, `user`, `created_at`) VALUES
  (1, 'Khởi tạo hệ thống backend', 'Admin', '2026-06-15 08:00:00');

-- Chèn dữ liệu: log (14 dòng nhật ký thao tác và đọc báo khớp màn hình MySQL)
INSERT INTO `log` (`ma_log`, `timestamp`, `ma_tai_khoan`, `loai`, `hanh_dong`, `mo_ta`) VALUES
  (14, '2026-09-14 09:13:54', 3, 'usage_statistics', 'rate_article', '{"ho_va_ten":"Lê Đức Tài (Gmail)","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","article_id":1,"bai_bao":"Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật","chuyen_muc":"cong-nghe","stats":[{"module":"Đánh giá 5 sao: Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật","clicks":1,"timeSpent":"10s","range":"09:13 - 09:13"}]}'),
  (11, '2026-09-14 09:13:54', 3, 'user_status', 'online', '{"ho_va_ten":"Lê Đức Tài (Gmail)","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","email":"ductai.developer@gmail.com"}'),
  (10, '2026-09-14 09:04:51', 458, 'usage_statistics', 'read_article', '{"ho_va_ten":"Lê Đức Tài","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","article_id":1,"bai_bao":"Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật","chuyen_muc":"Công nghệ","stats":[{"module":"Đọc bài báo: Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật","clicks":1,"timeSpent":"75s","range":"09:04 - 09:04"}]}'),
  (9, '2026-09-14 09:04:50', 458, 'usage_statistics', 'read_article', '{"ho_va_ten":"Lê Đức Tài","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","article_id":17,"bai_bao":"AI hỗ trợ giáo viên soạn bài và cá nhân hóa nội dung học tập","chuyen_muc":"Giáo dục","stats":[{"module":"Đọc bài báo: AI hỗ trợ giáo viên soạn bài và cá nhân hóa nội dung học tập","clicks":1,"timeSpent":"65s","range":"09:04 - 09:04"}]}'),
  (1, '2026-09-14 09:00:38', 458, 'usage_statistics', 'read_article', '{"ho_va_ten":"Lê Đức Tài","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","article_id":1,"bai_bao":"Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật","chuyen_muc":"Công nghệ","stats":[{"module":"Đọc bài báo: Ứng dụng đọc báo mới ra mắt","clicks":1,"timeSpent":"62.1s","range":"13:43:39 - 13:44:41"}]}'),
  (2, '2026-09-14 08:52:38', 458, 'usage_statistics', 'core_function_usage', '{"ho_va_ten":"Lê Đức Tài","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","stats":[{"module":"Dashboard (Tổng quan)","clicks":1,"timeSpent":"62.1s","range":"13:43:39 - 13:44:41"}]}'),
  (3, '2026-09-14 08:46:38', 458, 'user_status', 'online', '{"ho_va_ten":"Lê Đức Tài","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1"}'),
  (4, '2026-09-14 08:39:38', 458, 'user_status', 'offline', '{"ho_va_ten":"Lê Đức Tài","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1"}'),
  (5, '2026-09-14 08:29:38', 459, 'usage_statistics', 'read_article', '{"ho_va_ten":"Nguyễn Quốc Duy Khang","user_role":"Cộng tác viên","device_id":"a8b2c3d4e5f67890","device_info":"Xiaomi Redmi Note 12","article_id":2,"bai_bao":"Đội tuyển công nghệ trẻ Việt Nam xuất sắc đạt giải quốc tế","chuyen_muc":"Giáo dục","stats":[{"module":"Đọc bài báo: Đội tuyển công nghệ trẻ","clicks":2,"timeSpent":"185s","range":"13:00:10 - 13:03:15"}]}'),
  (6, '2026-09-14 08:19:38', 459, 'user_status', 'online', '{"ho_va_ten":"Nguyễn Quốc Duy Khang","user_role":"Cộng tác viên","device_id":"a8b2c3d4e5f67890","device_info":"Xiaomi Redmi Note 12"}'),
  (7, '2026-09-14 07:59:38', 460, 'user_status', 'offline', '{"ho_va_ten":"Dương Anh Tuấn","user_role":"Phó Trưởng Bộ Môn","device_id":"b1c2d3e4f5a60718","device_info":"iPhone 14 Pro Max"}'),
  (8, '2026-09-14 07:39:38', 461, 'usage_statistics', 'read_article', '{"ho_va_ten":"Uyển Nhi","user_role":"Độc giả thân thiết","device_id":"c9d0e1f2a3b45678","device_info":"Oppo Reno 8","article_id":3,"bai_bao":"Thị trường bất động sản cuối năm: Nhiều tín hiệu ấm dần","chuyen_muc":"Kinh tế","stats":[{"module":"Đọc bài báo: Thị trường bất động sản","clicks":1,"timeSpent":"95s","range":"12:15:10 - 12:16:45"}]}'),
  (12, '2026-09-14 09:07:54', 3, 'usage_statistics', 'read_article', '{"ho_va_ten":"Lê Đức Tài (Gmail)","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","article_id":1,"bai_bao":"Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật","chuyen_muc":"cong-nghe","stats":[{"module":"Đọc bài báo: Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật","clicks":1,"timeSpent":"85s","range":"09:06 - 09:07"}]}'),
  (13, '2026-09-14 08:55:54', 3, 'usage_statistics', 'read_article', '{"ho_va_ten":"Lê Đức Tài (Gmail)","user_role":"Cộng tác viên","device_id":"7f5cfe24af715c01","device_info":"samsung SM-S906U1","article_id":2,"bai_bao":"Xu hướng học công nghệ thông tin qua dự án thực tế","chuyen_muc":"giao-duc","stats":[{"module":"Đọc bài báo: Xu hướng học công nghệ thông tin qua dự án thực tế","clicks":2,"timeSpent":"120s","range":"08:53 - 08:55"}]}');


-- =====================================================================
-- 5. CÁC VIEW HỖ TRỢ TRUY VẤN TIỆN DỤNG (VIEWS)
-- =====================================================================

-- View chi tiết bài viết kèm tên chuyên mục và mã màu
CREATE OR REPLACE VIEW `v_article_details` AS
SELECT 
  a.id,
  a.title,
  a.summary,
  a.content,
  a.category_id,
  c.name AS category_name,
  c.color AS category_color,
  c.icon AS category_icon,
  a.author,
  a.source,
  a.image_url,
  a.published_at,
  a.read_time,
  a.views,
  a.likes,
  a.comments,
  a.tags,
  a.is_breaking,
  a.is_featured,
  a.is_editor_pick
FROM `articles` a
LEFT JOIN `categories` c ON a.category_id = c.id;

-- View danh sách tin đã lưu kèm thông tin bài viết và độc giả
CREATE OR REPLACE VIEW `v_user_bookmarks` AS
SELECT 
  b.id AS bookmark_id,
  b.user_id,
  u.name AS user_name,
  u.email AS user_email,
  b.article_id,
  a.title AS article_title,
  a.category_id,
  a.image_url,
  a.published_at,
  b.created_at AS bookmarked_at
FROM `bookmarks` b
JOIN `users` u ON b.user_id = u.id
JOIN `articles` a ON b.article_id = a.id;

-- =====================================================================
-- 6. KIỂM TRA SỐ LƯỢNG DÒNG CỦA CÁC BẢNG SAU KHI KHỞI TẠO XONG
-- =====================================================================
SET FOREIGN_KEY_CHECKS = 1;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

SELECT 'categories' AS `ten_bang`, COUNT(*) AS `so_ban_ghi` FROM `categories`
UNION ALL SELECT 'users', COUNT(*) FROM `users`
UNION ALL SELECT 'articles', COUNT(*) FROM `articles`
UNION ALL SELECT 'videos', COUNT(*) FROM `videos`
UNION ALL SELECT 'comments', COUNT(*) FROM `comments`
UNION ALL SELECT 'bookmarks', COUNT(*) FROM `bookmarks`
UNION ALL SELECT 'ratings', COUNT(*) FROM `ratings`
UNION ALL SELECT 'sources', COUNT(*) FROM `sources`
UNION ALL SELECT 'notifications', COUNT(*) FROM `notifications`
UNION ALL SELECT 'reports', COUNT(*) FROM `reports`
UNION ALL SELECT 'reading_history', COUNT(*) FROM `reading_history`
UNION ALL SELECT 'image_presets', COUNT(*) FROM `image_presets`
UNION ALL SELECT 'admin_logs', COUNT(*) FROM `admin_logs`;
