/**
 * @file generate_sql.js
 * @description Tự động sinh file script SQL khởi tạo database và seed data từ db.json
 * Dùng cho MySQL 8.0/8.4, MySQL Workbench, phpMyAdmin
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Đường dẫn file dữ liệu nguồn và các đích xuất file
const DB_JSON_PATH = path.join(__dirname, '..', 'database', 'db.json');
const OUTPUT_TARGETS = [
  path.join(__dirname, '..', 'database', 'schema.sql'),
  path.join(__dirname, '..', 'database', 'fira_news_workbench.sql'),
  path.join(__dirname, '..', '..', 'fira_news_database.sql'),
];

/**
 * Thoát ký tự đặc biệt cho câu lệnh SQL
 * @param {any} val - Giá trị cần escape
 * @returns {string} Giá trị đã format an toàn cho SQL
 */
function escapeSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'number') return String(val);

  if (typeof val === 'object') {
    return "'" + JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  }

  return "'" + String(val)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n') + "'";
}

/**
 * Format chuỗi ngày ISO thành dạng chuẩn MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
 * @param {string} iso - Chuỗi ISO date
 * @returns {string}
 */
function formatSqlDateTime(iso) {
  if (!iso) return 'CURRENT_TIMESTAMP';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return escapeSqlValue(iso);

  const pad = (n) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());

  return `'${y}-${m}-${day} ${h}:${min}:${s}'`;
}

/**
 * Tạo khối định nghĩa bảng (DDL)
 * @returns {string}
 */
function buildSchemaDDL() {
  return `-- =====================================================================
-- 3. TẠO CẤU TRÚC BẢNG (TABLE SCHEMAS)
-- =====================================================================

-- Bảng 1: categories (Chuyên mục báo)
CREATE TABLE \`categories\` (
  \`id\` VARCHAR(50) NOT NULL COMMENT 'Mã định danh chuyên mục (slug)',
  \`name\` VARCHAR(100) NOT NULL COMMENT 'Tên chuyên mục hiển thị',
  \`color\` VARCHAR(20) DEFAULT '#E11D48' COMMENT 'Mã màu đại diện cho chuyên mục',
  \`icon\` VARCHAR(60) DEFAULT 'newspaper' COMMENT 'Tên icon Ionicons hiển thị trong app',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục tin tức';

-- Bảng 2: users (Người dùng và Quản trị viên)
CREATE TABLE \`users\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của người dùng',
  \`name\` VARCHAR(120) NOT NULL COMMENT 'Họ và tên người dùng',
  \`email\` VARCHAR(160) NOT NULL COMMENT 'Địa chỉ email đăng nhập',
  \`password\` VARCHAR(120) NOT NULL COMMENT 'Mật khẩu đăng nhập',
  \`role\` ENUM('reader', 'admin') DEFAULT 'reader' COMMENT 'Vai trò: reader (độc giả) hoặc admin (quản trị)',
  \`avatar\` TEXT DEFAULT NULL COMMENT 'Đường dẫn ảnh đại diện',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`unique_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản độc giả và admin';

-- Bảng 3: articles (Tin tức / Bài viết)
CREATE TABLE \`articles\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của bài viết',
  \`title\` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề bài viết',
  \`summary\` TEXT NOT NULL COMMENT 'Tóm tắt bài viết hiển thị ở danh sách',
  \`content\` LONGTEXT NOT NULL COMMENT 'Nội dung chi tiết đầy đủ của bài báo',
  \`category_id\` VARCHAR(50) NOT NULL COMMENT 'Khóa ngoại liên kết bảng categories',
  \`author\` VARCHAR(120) DEFAULT 'Ban biên tập' COMMENT 'Tác giả bài viết',
  \`source\` VARCHAR(120) DEFAULT 'FIRA News' COMMENT 'Nguồn xuất bản tin tức',
  \`image_url\` TEXT DEFAULT NULL COMMENT 'Đường dẫn ảnh bìa bài viết',
  \`published_at\` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian xuất bản',
  \`read_time\` VARCHAR(50) DEFAULT '3 phút đọc' COMMENT 'Thời gian ước tính để đọc',
  \`views\` INT DEFAULT 0 COMMENT 'Số lượt xem bài viết',
  \`likes\` INT DEFAULT 0 COMMENT 'Số lượt thích / thả tim',
  \`comments\` INT DEFAULT 0 COMMENT 'Số lượt bình luận',
  \`tags\` JSON DEFAULT NULL COMMENT 'Mảng thẻ tags dạng JSON',
  \`is_breaking\` TINYINT(1) DEFAULT 0 COMMENT 'Đánh dấu tin nóng đặc biệt',
  \`is_featured\` TINYINT(1) DEFAULT 0 COMMENT 'Đánh dấu tin nổi bật trang chủ',
  \`is_editor_pick\` TINYINT(1) DEFAULT 0 COMMENT 'Đánh dấu tin do ban biên tập đề xuất',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ghi vào database',
  PRIMARY KEY (\`id\`),
  KEY \`idx_category\` (\`category_id\`),
  KEY \`idx_featured\` (\`is_featured\`),
  KEY \`idx_breaking\` (\`is_breaking\`),
  KEY \`idx_published_at\` (\`published_at\`),
  CONSTRAINT \`fk_articles_categories\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tin tức và bài báo chi tiết';

-- Bảng 4: videos (Danh sách tin video ngắn và phóng sự)
CREATE TABLE \`videos\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của video',
  \`title\` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề video tin tức',
  \`duration\` VARCHAR(20) DEFAULT '00:00' COMMENT 'Thời lượng phát video (phút:giây)',
  \`image_url\` TEXT DEFAULT NULL COMMENT 'Ảnh thumbnail video',
  \`video_url\` TEXT DEFAULT NULL COMMENT 'Đường dẫn luồng video trực tuyến',
  \`embed_url\` TEXT DEFAULT NULL COMMENT 'Đường dẫn nhúng iframe nếu có',
  \`description\` TEXT DEFAULT NULL COMMENT 'Mô tả ngắn về nội dung video',
  \`category\` VARCHAR(100) DEFAULT 'Tin tức' COMMENT 'Chuyên mục video',
  \`views\` INT DEFAULT 0 COMMENT 'Số lượt xem video',
  \`is_live\` TINYINT(1) DEFAULT 0 COMMENT '1: Video đang phát trực tiếp, 0: Bình thường',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đăng video',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bản tin video và phóng sự';

-- Bảng 5: comments (Bình luận của bạn đọc trên bài viết)
CREATE TABLE \`comments\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng của bình luận',
  \`article_id\` INT NOT NULL COMMENT 'ID bài viết được bình luận',
  \`name\` VARCHAR(120) NOT NULL COMMENT 'Tên độc giả gửi bình luận',
  \`content\` TEXT NOT NULL COMMENT 'Nội dung bình luận',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian bình luận',
  PRIMARY KEY (\`id\`),
  KEY \`idx_comment_article\` (\`article_id\`),
  CONSTRAINT \`fk_comments_articles\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bình luận của bạn đọc';

-- Bảng 6: bookmarks (Danh sách bài viết đã lưu để đọc sau)
CREATE TABLE \`bookmarks\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng',
  \`user_id\` INT NOT NULL COMMENT 'ID người dùng đã lưu tin',
  \`article_id\` INT NOT NULL COMMENT 'ID bài viết được lưu',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian lưu tin',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`unique_user_article_bookmark\` (\`user_id\`, \`article_id\`),
  KEY \`idx_bookmark_user\` (\`user_id\`),
  KEY \`idx_bookmark_article\` (\`article_id\`),
  CONSTRAINT \`fk_bookmarks_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_bookmarks_articles\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tin tức đã lưu vào danh sách đọc sau';

-- Bảng 7: ratings (Đánh giá điểm bài viết của độc giả)
CREATE TABLE \`ratings\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID tự tăng',
  \`user_id\` INT NOT NULL COMMENT 'ID người dùng đánh giá',
  \`article_id\` INT NOT NULL COMMENT 'ID bài viết được đánh giá',
  \`score\` TINYINT NOT NULL COMMENT 'Số điểm từ 1 đến 5 sao',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian đánh giá',
  \`updated_at\` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật đánh giá',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`unique_user_article_rating\` (\`user_id\`, \`article_id\`),
  CONSTRAINT \`fk_ratings_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_ratings_articles\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`chk_score_range\` CHECK (\`score\` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đánh giá sao cho bài viết (1-5 sao)';

-- Bảng 8: sources (Nguồn báo và đối tác xuất bản)
CREATE TABLE \`sources\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID nguồn tin',
  \`name\` VARCHAR(160) NOT NULL COMMENT 'Tên đối tác nguồn tin',
  \`logo\` TEXT DEFAULT NULL COMMENT 'Đường dẫn logo nguồn tin',
  \`website\` TEXT DEFAULT NULL COMMENT 'Địa chỉ website chính thức',
  \`status\` VARCHAR(30) DEFAULT 'active' COMMENT 'Trạng thái hoạt động (active / inactive)',
  \`articles\` INT DEFAULT 0 COMMENT 'Tổng số bài viết từ nguồn này',
  \`description\` TEXT DEFAULT NULL COMMENT 'Giới thiệu về cơ quan / đối tác',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thêm nguồn',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Đối tác báo chí và nguồn tin tức';

-- Bảng 9: notifications (Thông báo đẩy trong app)
CREATE TABLE \`notifications\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID thông báo',
  \`title\` VARCHAR(180) NOT NULL COMMENT 'Tiêu đề thông báo',
  \`message\` TEXT NOT NULL COMMENT 'Nội dung chi tiết thông báo',
  \`type\` VARCHAR(50) DEFAULT 'general' COMMENT 'Loại: breaking, saved, admin, general',
  \`enabled\` TINYINT(1) DEFAULT 1 COMMENT '1: Đang kích hoạt, 0: Tạm tắt',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo thông báo',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thông báo hệ thống cho độc giả';

-- Bảng 10: reports (Phản hồi, báo cáo lỗi từ người dùng)
CREATE TABLE \`reports\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID báo cáo phản hồi',
  \`user_id\` INT DEFAULT NULL COMMENT 'ID người gửi (nếu đã đăng nhập)',
  \`type\` VARCHAR(50) DEFAULT 'feedback' COMMENT 'Loại: feedback, bug, content_issue',
  \`content\` TEXT NOT NULL COMMENT 'Nội dung phản hồi góp ý',
  \`status\` VARCHAR(30) DEFAULT 'new' COMMENT 'Trạng thái: new, reviewed, resolved',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian gửi phản hồi',
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_reports_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ý kiến phản hồi và đóng góp từ độc giả';

-- Bảng 11: reading_history (Lịch sử đọc bài của độc giả)
CREATE TABLE \`reading_history\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID lịch sử đọc',
  \`user_id\` INT NOT NULL COMMENT 'ID độc giả',
  \`article_id\` INT NOT NULL COMMENT 'ID bài viết đã mở đọc',
  \`read_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm mở đọc',
  PRIMARY KEY (\`id\`),
  KEY \`idx_history_user\` (\`user_id\`),
  KEY \`idx_history_article\` (\`article_id\`),
  CONSTRAINT \`fk_history_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_history_articles\` FOREIGN KEY (\`article_id\`) REFERENCES \`articles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký lịch sử bài viết đã đọc';

-- Bảng 12: image_presets (Kho ảnh mẫu định sẵn cho admin đăng bài)
CREATE TABLE \`image_presets\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID ảnh mẫu',
  \`name\` VARCHAR(120) NOT NULL COMMENT 'Tên chủ đề ảnh (Công nghệ, Giáo dục, v.v.)',
  \`url\` TEXT NOT NULL COMMENT 'Đường dẫn ảnh chất lượng cao',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian thêm',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thư viện ảnh mẫu dùng khi biên tập tin';

-- Bảng 13: admin_logs (Nhật ký hành động của quản trị viên)
CREATE TABLE \`admin_logs\` (
  \`id\` INT AUTO_INCREMENT NOT NULL COMMENT 'ID nhật ký admin',
  \`action\` TEXT NOT NULL COMMENT 'Nội dung hành động thực hiện',
  \`user\` VARCHAR(120) DEFAULT 'Admin' COMMENT 'Tài khoản admin thực hiện',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm ghi log',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký thao tác của quản trị viên';

-- Bảng 14: log (Nhật ký hành động và đọc báo của người dùng - Khớp màn hình MySQL trong hình chụp)
CREATE TABLE \`log\` (
  \`ma_log\` BIGINT AUTO_INCREMENT NOT NULL COMMENT 'Mã nhật ký tự tăng',
  \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thực hiện hành động',
  \`ma_tai_khoan\` BIGINT NOT NULL COMMENT 'Mã tài khoản người dùng',
  \`loai\` VARCHAR(100) NOT NULL COMMENT 'Loại nhật ký (usage_statistics, user_status, v.v.)',
  \`hanh_dong\` VARCHAR(100) NOT NULL COMMENT 'Tên hành động (read_article, core_function_usage, online, offline)',
  \`mo_ta\` LONGTEXT NOT NULL COMMENT 'Chi tiết JSON chứa ho_va_ten, user_role, device_id, device_info, stats, bài báo...',
  PRIMARY KEY (\`ma_log\`),
  KEY \`idx_log_user\` (\`ma_tai_khoan\`),
  KEY \`idx_log_timestamp\` (\`timestamp\`),
  KEY \`idx_log_action\` (\`hanh_dong\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký thao tác và thống kê đọc báo';
`;
}

/**
 * Tạo các câu lệnh chèn dữ liệu mẫu (Seed Data)
 * @param {object} db - Object dữ liệu đọc từ db.json
 * @returns {string}
 */
function buildSeedDataDML(db) {
  let dml = `-- =====================================================================
-- 4. DỮ LIỆU MẪU ĐẦY ĐỦ (SEED DATA)
-- =====================================================================
`;

  // Categories
  dml += `\n-- Chèn dữ liệu: categories (${db.categories.length} danh mục)\n`;
  dml += 'INSERT INTO `categories` (`id`, `name`, `color`, `icon`) VALUES\n';
  dml += db.categories.map((c) => `  (${escapeSqlValue(c.id)}, ${escapeSqlValue(c.name)}, ${escapeSqlValue(c.color)}, ${escapeSqlValue(c.icon)})`).join(',\n') + ';\n';

  // Users
  dml += `\n-- Chèn dữ liệu: users (${db.users.length} tài khoản)\n`;
  dml += 'INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`) VALUES\n';
  dml += db.users.map((u) => `  (${escapeSqlValue(u.id)}, ${escapeSqlValue(u.name)}, ${escapeSqlValue(u.email)}, ${escapeSqlValue(u.password)}, ${escapeSqlValue(u.role)}, ${escapeSqlValue(u.avatar || null)})`).join(',\n') + ';\n';

  // Articles
  dml += `\n-- Chèn dữ liệu: articles (${db.articles.length} bài viết chi tiết)\n`;
  dml += 'INSERT INTO `articles` (`id`, `title`, `summary`, `content`, `category_id`, `author`, `source`, `image_url`, `published_at`, `read_time`, `views`, `likes`, `comments`, `tags`, `is_breaking`, `is_featured`, `is_editor_pick`) VALUES\n';
  dml += db.articles.map((a) => {
    return `  (${escapeSqlValue(a.id)}, ${escapeSqlValue(a.title)}, ${escapeSqlValue(a.summary)}, ${escapeSqlValue(a.content)}, ${escapeSqlValue(a.category)}, ${escapeSqlValue(a.author)}, ${escapeSqlValue(a.source)}, ${escapeSqlValue(a.imageUrl)}, ${formatSqlDateTime(a.publishedAt)}, ${escapeSqlValue(a.readTime)}, ${escapeSqlValue(a.views)}, ${escapeSqlValue(a.likes || 0)}, ${escapeSqlValue(a.comments || 0)}, ${escapeSqlValue(a.tags || [])}, ${escapeSqlValue(a.isBreaking || false)}, ${escapeSqlValue(a.isFeatured || false)}, ${escapeSqlValue(a.isEditorPick || false)})`;
  }).join(',\n') + ';\n';

  // Videos
  dml += `\n-- Chèn dữ liệu: videos (${db.videos.length} tin video)\n`;
  dml += 'INSERT INTO `videos` (`id`, `title`, `duration`, `image_url`, `video_url`, `embed_url`, `description`, `category`, `views`, `is_live`) VALUES\n';
  dml += db.videos.map((v) => {
    return `  (${escapeSqlValue(v.id)}, ${escapeSqlValue(v.title)}, ${escapeSqlValue(v.duration)}, ${escapeSqlValue(v.imageUrl)}, ${escapeSqlValue(v.videoUrl || null)}, ${escapeSqlValue(v.embedUrl || null)}, ${escapeSqlValue(v.description)}, ${escapeSqlValue(v.category)}, ${escapeSqlValue(v.views || 0)}, ${escapeSqlValue(v.isLive || false)})`;
  }).join(',\n') + ';\n';

  // Comments
  dml += `\n-- Chèn dữ liệu: comments (${db.comments.length} bình luận)\n`;
  dml += 'INSERT INTO `comments` (`id`, `article_id`, `name`, `content`, `created_at`) VALUES\n';
  dml += db.comments.map((c) => `  (${escapeSqlValue(c.id)}, ${escapeSqlValue(c.articleId)}, ${escapeSqlValue(c.name)}, ${escapeSqlValue(c.content)}, ${formatSqlDateTime(c.createdAt)})`).join(',\n') + ';\n';

  // Bookmarks
  dml += `\n-- Chèn dữ liệu: bookmarks (${db.bookmarks.length} tin đã lưu)\n`;
  dml += 'INSERT INTO `bookmarks` (`id`, `user_id`, `article_id`, `created_at`) VALUES\n';
  dml += db.bookmarks.map((b) => `  (${escapeSqlValue(b.id)}, ${escapeSqlValue(b.userId)}, ${escapeSqlValue(b.articleId)}, ${formatSqlDateTime(b.createdAt)})`).join(',\n') + ';\n';

  // Ratings
  dml += `\n-- Chèn dữ liệu: ratings (${db.ratings.length} đánh giá)\n`;
  dml += 'INSERT INTO `ratings` (`id`, `user_id`, `article_id`, `score`, `created_at`, `updated_at`) VALUES\n';
  dml += db.ratings.map((r) => `  (${escapeSqlValue(r.id)}, ${escapeSqlValue(r.userId)}, ${escapeSqlValue(r.articleId)}, ${escapeSqlValue(r.score)}, ${formatSqlDateTime(r.createdAt)}, ${r.updatedAt ? formatSqlDateTime(r.updatedAt) : 'NULL'})`).join(',\n') + ';\n';

  // Sources
  dml += `\n-- Chèn dữ liệu: sources (${db.sources.length} nguồn tin)\n`;
  dml += 'INSERT INTO `sources` (`id`, `name`, `logo`, `website`, `status`, `articles`, `description`) VALUES\n';
  dml += db.sources.map((s) => `  (${escapeSqlValue(s.id)}, ${escapeSqlValue(s.name)}, ${escapeSqlValue(s.logo)}, ${escapeSqlValue(s.website)}, ${escapeSqlValue(s.status)}, ${escapeSqlValue(s.articles || 0)}, ${escapeSqlValue(s.description)})`).join(',\n') + ';\n';

  // Notifications
  dml += `\n-- Chèn dữ liệu: notifications (${db.notifications.length} thông báo)\n`;
  dml += 'INSERT INTO `notifications` (`id`, `title`, `message`, `type`, `enabled`, `created_at`) VALUES\n';
  dml += db.notifications.map((n) => `  (${escapeSqlValue(n.id)}, ${escapeSqlValue(n.title)}, ${escapeSqlValue(n.message)}, ${escapeSqlValue(n.type)}, ${escapeSqlValue(n.enabled ?? true)}, ${formatSqlDateTime(n.createdAt)})`).join(',\n') + ';\n';

  // Reports
  dml += `\n-- Chèn dữ liệu: reports (${db.reports.length} phản hồi độc giả)\n`;
  dml += 'INSERT INTO `reports` (`id`, `user_id`, `type`, `content`, `status`, `created_at`) VALUES\n';
  dml += db.reports.map((rep) => `  (${escapeSqlValue(rep.id)}, ${escapeSqlValue(rep.userId)}, ${escapeSqlValue(rep.type)}, ${escapeSqlValue(rep.content)}, ${escapeSqlValue(rep.status)}, ${formatSqlDateTime(rep.createdAt)})`).join(',\n') + ';\n';

  // Reading History
  dml += `\n-- Chèn dữ liệu: reading_history (${db.readingHistory.length} lịch sử đọc tin)\n`;
  dml += 'INSERT INTO `reading_history` (`id`, `user_id`, `article_id`, `read_at`) VALUES\n';
  dml += db.readingHistory.map((rh) => `  (${escapeSqlValue(rh.id)}, ${escapeSqlValue(rh.userId)}, ${escapeSqlValue(rh.articleId)}, ${formatSqlDateTime(rh.readAt)})`).join(',\n') + ';\n';

  // Image Presets
  dml += `\n-- Chèn dữ liệu: image_presets (${db.imagePresets.length} ảnh định sẵn)\n`;
  dml += 'INSERT INTO `image_presets` (`id`, `name`, `url`) VALUES\n';
  dml += db.imagePresets.map((ip) => `  (${escapeSqlValue(ip.id)}, ${escapeSqlValue(ip.name)}, ${escapeSqlValue(ip.url)})`).join(',\n') + ';\n';

  // Admin Logs
  dml += `\n-- Chèn dữ liệu: admin_logs (${db.adminLogs.length} nhật ký hệ thống)\n`;
  dml += 'INSERT INTO `admin_logs` (`id`, `action`, `user`, `created_at`) VALUES\n';
  dml += db.adminLogs.map((al) => `  (${escapeSqlValue(al.id)}, ${escapeSqlValue(al.action)}, ${escapeSqlValue(al.user)}, ${formatSqlDateTime(al.createdAt)})`).join(',\n') + ';\n';

  // Log (Bảng log khớp hình chụp)
  const logList = Array.isArray(db.logs) && db.logs.length > 0 ? db.logs : [];
  if (logList.length > 0) {
    dml += `\n-- Chèn dữ liệu: log (${logList.length} dòng nhật ký thao tác và đọc báo khớp màn hình MySQL)\n`;
    dml += 'INSERT INTO `log` (`ma_log`, `timestamp`, `ma_tai_khoan`, `loai`, `hanh_dong`, `mo_ta`) VALUES\n';
    dml += logList.map((l) => {
      return `  (${escapeSqlValue(l.ma_log || l.id)}, ${formatSqlDateTime(l.timestamp)}, ${escapeSqlValue(l.ma_tai_khoan)}, ${escapeSqlValue(l.loai)}, ${escapeSqlValue(l.hanh_dong)}, ${escapeSqlValue(l.mo_ta)})`;
    }).join(',\n') + ';\n';
  }

  return dml;
}

/**
 * Tạo Views và các câu lệnh kiểm thử cuối script
 * @returns {string}
 */
function buildViewsAndVerification() {
  return `\n-- =====================================================================
-- 5. CÁC VIEW HỖ TRỢ TRUY VẤN TIỆN DỤNG (VIEWS)
-- =====================================================================

-- View chi tiết bài viết kèm tên chuyên mục và mã màu
CREATE OR REPLACE VIEW \`v_article_details\` AS
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
FROM \`articles\` a
LEFT JOIN \`categories\` c ON a.category_id = c.id;

-- View danh sách tin đã lưu kèm thông tin bài viết và độc giả
CREATE OR REPLACE VIEW \`v_user_bookmarks\` AS
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
FROM \`bookmarks\` b
JOIN \`users\` u ON b.user_id = u.id
JOIN \`articles\` a ON b.article_id = a.id;

-- =====================================================================
-- 6. KIỂM TRA SỐ LƯỢNG DÒNG CỦA CÁC BẢNG SAU KHI KHỞI TẠO XONG
-- =====================================================================
SET FOREIGN_KEY_CHECKS = 1;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

SELECT 'categories' AS \`ten_bang\`, COUNT(*) AS \`so_ban_ghi\` FROM \`categories\`
UNION ALL SELECT 'users', COUNT(*) FROM \`users\`
UNION ALL SELECT 'articles', COUNT(*) FROM \`articles\`
UNION ALL SELECT 'videos', COUNT(*) FROM \`videos\`
UNION ALL SELECT 'comments', COUNT(*) FROM \`comments\`
UNION ALL SELECT 'bookmarks', COUNT(*) FROM \`bookmarks\`
UNION ALL SELECT 'ratings', COUNT(*) FROM \`ratings\`
UNION ALL SELECT 'sources', COUNT(*) FROM \`sources\`
UNION ALL SELECT 'notifications', COUNT(*) FROM \`notifications\`
UNION ALL SELECT 'reports', COUNT(*) FROM \`reports\`
UNION ALL SELECT 'reading_history', COUNT(*) FROM \`reading_history\`
UNION ALL SELECT 'image_presets', COUNT(*) FROM \`image_presets\`
UNION ALL SELECT 'admin_logs', COUNT(*) FROM \`admin_logs\`;
`;
}

/**
 * Hàm điều phối chính
 */
function main() {
  try {
    if (!fs.existsSync(DB_JSON_PATH)) {
      throw new Error(`Không tìm thấy file nguồn db.json tại: ${DB_JSON_PATH}`);
    }

    const rawData = fs.readFileSync(DB_JSON_PATH, 'utf8');
    const db = JSON.parse(rawData);

    const header = `-- =====================================================================
-- DATABASE: fira_news
-- Ứng dụng: Báo điện tử FIRA News (Hỗ trợ đọc báo & xem video)
-- Tương thích: MySQL 8.0, MySQL 8.4, MySQL Workbench, phpMyAdmin, MariaDB
-- Bộ mã: utf8mb4 / utf8mb4_unicode_ci (Hỗ trợ tiếng Việt và Emoji đầy đủ)
-- Ngày tạo: ${new Date().toISOString().slice(0, 10)}
-- =====================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. KHỞI TẠO DATABASE
CREATE DATABASE IF NOT EXISTS \`fira_news\` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE \`fira_news\`;

-- 2. XÓA BẢNG CŨ NẾU ĐÃ TỒN TẠI (Đảm bảo chạy lại không bị lỗi foreign key)
DROP TABLE IF EXISTS \`admin_logs\`;
DROP TABLE IF EXISTS \`image_presets\`;
DROP TABLE IF EXISTS \`reading_history\`;
DROP TABLE IF EXISTS \`reports\`;
DROP TABLE IF EXISTS \`notifications\`;
DROP TABLE IF EXISTS \`sources\`;
DROP TABLE IF EXISTS \`ratings\`;
DROP TABLE IF EXISTS \`bookmarks\`;
DROP TABLE IF EXISTS \`comments\`;
DROP TABLE IF EXISTS \`videos\`;
DROP TABLE IF EXISTS \`articles\`;
DROP TABLE IF EXISTS \`users\`;
DROP TABLE IF EXISTS \`categories\`;
`;

    const fullSql = header + '\n' + buildSchemaDDL() + '\n' + buildSeedDataDML(db) + '\n' + buildViewsAndVerification();

    OUTPUT_TARGETS.forEach((targetPath) => {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, fullSql, 'utf8');
      console.log(`✓ Đã tạo thành công: ${targetPath}`);
    });

    console.log('\nHoàn tất tạo cơ sở dữ liệu SQL sạch sẽ!');
  } catch (err) {
    console.error('Lỗi khi sinh SQL:', err.message);
    process.exit(1);
  }
}

main();
