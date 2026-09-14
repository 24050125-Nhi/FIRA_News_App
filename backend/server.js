const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 4000);
const DB_PATH = path.join(__dirname, 'database', 'db.json');

function defaultDatabase() {
  return {
    categories: [],
    articles: [],
    videos: [],
    comments: [],
    bookmarks: [],
    users: [],
    ratings: [],
    sources: [],
    notifications: [],
    reports: [],
    readingHistory: [],
    imagePresets: [],
    adminLogs: [],
    logs: [],
  };
}

function formatSqlDateTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return new Date().toISOString().replace('T', ' ').substring(0, 19);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatMinutesAgo(timestamp) {
  if (!timestamp) return { minutes: 0, text: 'Vừa xong' };
  const standardIso = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T');
  const time = new Date(standardIso).getTime();
  if (isNaN(time)) return { minutes: 0, text: 'Vừa xong' };

  const diffMs = Date.now() - time;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 0) {
    return { minutes: 0, text: 'Vừa xong' };
  }
  if (diffMinutes < 60) {
    return { minutes: diffMinutes, text: `${diffMinutes} phút trước` };
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const remainMin = diffMinutes % 60;
    return {
      minutes: diffMinutes,
      text: remainMin > 0 ? `${diffHours} giờ ${remainMin} phút trước` : `${diffHours} giờ trước`,
    };
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return { minutes: diffMinutes, text: `${diffDays} ngày trước` };
  }
  return { minutes: diffMinutes, text: `${Math.floor(diffDays / 30)} tháng trước` };
}

function enrichLog(log) {
  const rel = formatMinutesAgo(log.timestamp);
  let parsed = {};
  if (typeof log.mo_ta === 'string') {
    try {
      parsed = JSON.parse(log.mo_ta);
    } catch {
      parsed = { raw: log.mo_ta };
    }
  } else if (typeof log.mo_ta === 'object' && log.mo_ta !== null) {
    parsed = log.mo_ta;
  }

  const baiBao = parsed.bai_bao || (parsed.stats && parsed.stats[0]?.module) || '';
  const chuyenMuc = parsed.chuyen_muc || '';
  const hoVaTen = parsed.ho_va_ten || '';
  const userRole = parsed.user_role || '';
  const deviceInfo = parsed.device_info || '';
  const articleId = parsed.article_id ?? null;

  return {
    ma_log: Number(log.ma_log || log.id),
    timestamp: log.timestamp,
    ma_tai_khoan: Number(log.ma_tai_khoan),
    loai: String(log.loai || 'usage_statistics'),
    hanh_dong: String(log.hanh_dong || 'read_article'),
    mo_ta: typeof log.mo_ta === 'string' ? log.mo_ta : JSON.stringify(log.mo_ta),
    mo_ta_json: parsed,
    bai_bao: baiBao,
    article_id: articleId,
    chuyen_muc: chuyenMuc,
    ho_va_ten: hoVaTen,
    user_role: userRole,
    device_info: deviceInfo,
    phut_truoc: rel.minutes,
    bao_nhieu_phut_truoc: rel.text,
  };
}

function createInitialLogs() {
  const now = Date.now();
  const minsAgo = (m) => formatSqlDateTime(new Date(now - m * 60 * 1000));

  return [
    {
      ma_log: 1,
      timestamp: minsAgo(3),
      ma_tai_khoan: 458,
      loai: 'usage_statistics',
      hanh_dong: 'read_article',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Lê Đức Tài',
        user_role: 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: 'samsung SM-S906U1',
        article_id: 1,
        bai_bao: 'Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật',
        chuyen_muc: 'Công nghệ',
        stats: [
          {
            module: 'Đọc bài báo: Ứng dụng đọc báo mới ra mắt',
            clicks: 1,
            timeSpent: '62.1s',
            range: '13:43:39 - 13:44:41',
          },
        ],
      }),
    },
    {
      ma_log: 2,
      timestamp: minsAgo(8),
      ma_tai_khoan: 458,
      loai: 'usage_statistics',
      hanh_dong: 'core_function_usage',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Lê Đức Tài',
        user_role: 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: 'samsung SM-S906U1',
        stats: [
          {
            module: 'Dashboard (Tổng quan)',
            clicks: 1,
            timeSpent: '62.1s',
            range: '13:43:39 - 13:44:41',
          },
        ],
      }),
    },
    {
      ma_log: 3,
      timestamp: minsAgo(15),
      ma_tai_khoan: 458,
      loai: 'user_status',
      hanh_dong: 'online',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Lê Đức Tài',
        user_role: 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: 'samsung SM-S906U1',
      }),
    },
    {
      ma_log: 4,
      timestamp: minsAgo(24),
      ma_tai_khoan: 458,
      loai: 'user_status',
      hanh_dong: 'offline',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Lê Đức Tài',
        user_role: 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: 'samsung SM-S906U1',
      }),
    },
    {
      ma_log: 5,
      timestamp: minsAgo(35),
      ma_tai_khoan: 459,
      loai: 'usage_statistics',
      hanh_dong: 'read_article',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Nguyễn Quốc Duy Khang',
        user_role: 'Cộng tác viên',
        device_id: 'a8b2c3d4e5f67890',
        device_info: 'Xiaomi Redmi Note 12',
        article_id: 2,
        bai_bao: 'Đội tuyển công nghệ trẻ Việt Nam xuất sắc đạt giải quốc tế',
        chuyen_muc: 'Giáo dục',
        stats: [
          {
            module: 'Đọc bài báo: Đội tuyển công nghệ trẻ',
            clicks: 2,
            timeSpent: '185s',
            range: '13:00:10 - 13:03:15',
          },
        ],
      }),
    },
    {
      ma_log: 6,
      timestamp: minsAgo(45),
      ma_tai_khoan: 459,
      loai: 'user_status',
      hanh_dong: 'online',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Nguyễn Quốc Duy Khang',
        user_role: 'Cộng tác viên',
        device_id: 'a8b2c3d4e5f67890',
        device_info: 'Xiaomi Redmi Note 12',
      }),
    },
    {
      ma_log: 7,
      timestamp: minsAgo(60),
      ma_tai_khoan: 460,
      loai: 'user_status',
      hanh_dong: 'offline',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Dương Anh Tuấn',
        user_role: 'Phó Trưởng Bộ Môn',
        device_id: 'b1c2d3e4f5a60718',
        device_info: 'iPhone 14 Pro Max',
      }),
    },
    {
      ma_log: 8,
      timestamp: minsAgo(80),
      ma_tai_khoan: 461,
      loai: 'usage_statistics',
      hanh_dong: 'read_article',
      mo_ta: JSON.stringify({
        ho_va_ten: 'Uyển Nhi',
        user_role: 'Độc giả thân thiết',
        device_id: 'c9d0e1f2a3b45678',
        device_info: 'Oppo Reno 8',
        article_id: 3,
        bai_bao: 'Thị trường bất động sản cuối năm: Nhiều tín hiệu ấm dần',
        chuyen_muc: 'Kinh tế',
        stats: [
          {
            module: 'Đọc bài báo: Thị trường bất động sản',
            clicks: 1,
            timeSpent: '95s',
            range: '12:15:10 - 12:16:45',
          },
        ],
      }),
    },
  ];
}

function ensureArrays(db) {
  const defaults = defaultDatabase();
  for (const key of Object.keys(defaults)) db[key] = Array.isArray(db[key]) ? db[key] : [];
  if (!db.logs || db.logs.length === 0) {
    db.logs = createInitialLogs();
  }
  return db;
}

function readDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const initialDb = defaultDatabase();
    initialDb.logs = createInitialLogs();
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return ensureArrays(JSON.parse(raw));
}

function writeDatabase(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(ensureArrays(db), null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { success: false, message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error('Body quá lớn'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('JSON không hợp lệ'));
      }
    });
  });
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function nextId(rows, key = 'id') {
  return rows.reduce((max, item) => Math.max(max, Number(item[key] || item.id || 0)), 0) + 1;
}

function paginate(items, url) {
  const limit = Number(url.searchParams.get('limit') || items.length || 50);
  const page = Math.max(Number(url.searchParams.get('page') || 1), 1);
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta: { page, limit, total: items.length },
  };
}

function normalizeArticleInput(input, oldArticle = {}) {
  const now = new Date().toISOString();
  return {
    title: input.title ?? oldArticle.title,
    summary: input.summary ?? oldArticle.summary,
    content: input.content ?? oldArticle.content ?? input.summary ?? '',
    category: input.category ?? oldArticle.category ?? 'thoi-su',
    author: input.author ?? oldArticle.author ?? 'Ban biên tập',
    source: input.source ?? oldArticle.source ?? 'FIRA News',
    imageUrl:
      input.imageUrl ??
      oldArticle.imageUrl ??
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    publishedAt: input.publishedAt ?? oldArticle.publishedAt ?? now,
    readTime: input.readTime ?? oldArticle.readTime ?? '3 phút đọc',
    views: Number(input.views ?? oldArticle.views ?? 0),
    likes: Number(input.likes ?? oldArticle.likes ?? 0),
    comments: Number(input.comments ?? oldArticle.comments ?? 0),
    tags: input.tags ?? oldArticle.tags ?? [],
    isBreaking: Boolean(input.isBreaking ?? oldArticle.isBreaking ?? false),
    isFeatured: Boolean(input.isFeatured ?? oldArticle.isFeatured ?? false),
    isEditorPick: Boolean(input.isEditorPick ?? oldArticle.isEditorPick ?? false),
  };
}

function sortArticles(articles, sort) {
  if (sort === 'popular') return articles.sort((a, b) => Number(b.views || 0) - Number(a.views || 0));
  if (sort === 'liked') return articles.sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0));
  return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function buildStats(db) {
  const statsByCategory = db.categories
    .filter((category) => category.id !== 'all')
    .map((category) => ({
      category: category.id,
      name: category.name,
      total: db.articles.filter((article) => article.category === category.id).length,
    }));
  return {
    totalArticles: db.articles.length,
    totalCategories: db.categories.length,
    totalVideos: db.videos.length,
    totalComments: db.comments.length,
    totalBookmarks: db.bookmarks.length,
    totalRatings: db.ratings.length,
    totalUsers: db.users.length,
    totalSources: db.sources.length,
    totalNotifications: db.notifications.length,
    totalReports: db.reports.length,
    totalLogs: db.logs ? db.logs.length : 0,
    statsByCategory,
  };
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { success: true });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const db = readDatabase();

  if (req.method === 'GET' && pathname === '/') {
    return sendJson(res, 200, {
      success: true,
      message: 'FIRA News Backend đang chạy',
      docs: [
        '/api/health',
        '/api/logs',
        '/api/logs/reading',
        '/api/articles',
        '/api/categories',
        '/api/videos',
        '/api/videos/:id/view',
        '/api/comments?articleId=1',
        '/api/bookmarks?userId=1',
        '/api/ratings?articleId=1',
        '/api/sources',
        '/api/notifications',
        '/api/users',
        '/api/reports',
        '/api/history?userId=1',
        '/api/images/presets',
        '/api/admin/dashboard',
        '/api/stats',
      ],
    });
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      success: true,
      data: {
        status: 'ok',
        app: 'FIRA News API',
        database: DB_PATH,
        ...buildStats(db),
      },
    });
  }

  if (req.method === 'GET' && pathname === '/api/categories') {
    return sendJson(res, 200, { success: true, data: db.categories });
  }

  if (req.method === 'GET' && pathname === '/api/videos') {
    return sendJson(res, 200, { success: true, data: db.videos });
  }

  const videoViewMatch = pathname.match(/^\/api\/videos\/(\d+)\/view$/);
  if (req.method === 'POST' && videoViewMatch) {
    const id = Number(videoViewMatch[1]);
    const video = db.videos.find((item) => Number(item.id) === id);
    if (!video) return sendError(res, 404, 'Không tìm thấy video');
    video.views = Number(video.views || 0) + 1;
    video.lastWatchedAt = new Date().toISOString();
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: video });
  }

  if (req.method === 'GET' && pathname === '/api/stats') {
    return sendJson(res, 200, { success: true, data: buildStats(db) });
  }

  if (req.method === 'GET' && pathname === '/api/admin/dashboard') {
    const topArticles = sortArticles([...db.articles], 'popular').slice(0, 6);
    const latestArticles = sortArticles([...db.articles], 'latest').slice(0, 6);
    const latestComments = [...db.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    return sendJson(res, 200, {
      success: true,
      data: {
        stats: buildStats(db),
        topArticles,
        latestArticles,
        latestComments,
        sources: db.sources,
        notifications: db.notifications,
        reports: db.reports.slice(-8).reverse(),
        logs: db.adminLogs.slice(-8).reverse(),
      },
    });
  }

  const articleIdMatch = pathname.match(/^\/api\/articles\/(\d+)$/);
  const articleLikeMatch = pathname.match(/^\/api\/articles\/(\d+)\/like$/);
  const bookmarkIdMatch = pathname.match(/^\/api\/bookmarks\/(\d+)$/);
  const sourceIdMatch = pathname.match(/^\/api\/sources\/(\d+)$/);
  const notificationIdMatch = pathname.match(/^\/api\/notifications\/(\d+)$/);

  if (req.method === 'GET' && pathname === '/api/articles') {
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const category = url.searchParams.get('category');
    const sort = url.searchParams.get('sort');
    const featured = url.searchParams.get('featured') === '1';
    const breaking = url.searchParams.get('breaking') === '1';
    let result = [...db.articles];

    if (category && category !== 'all') result = result.filter((article) => article.category === category);
    if (featured) result = result.filter((article) => article.isFeatured || article.isEditorPick);
    if (breaking) result = result.filter((article) => article.isBreaking);
    if (search) {
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(search) ||
          article.summary.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search) ||
          article.category.toLowerCase().includes(search) ||
          (article.tags || []).some((tag) => String(tag).toLowerCase().includes(search))
      );
    }

    sortArticles(result, sort);
    const { items, meta } = paginate(result, url);
    return sendJson(res, 200, { success: true, data: items, meta });
  }

  if (req.method === 'GET' && articleIdMatch) {
    const id = Number(articleIdMatch[1]);
    const article = db.articles.find((item) => Number(item.id) === id);
    if (!article) return sendError(res, 404, 'Không tìm thấy bài viết');
    article.views = Number(article.views || 0) + 1;
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: article });
  }

  if (req.method === 'POST' && articleLikeMatch) {
    const id = Number(articleLikeMatch[1]);
    const article = db.articles.find((item) => Number(item.id) === id);
    if (!article) return sendError(res, 404, 'Không tìm thấy bài viết');
    article.likes = Number(article.likes || 0) + 1;
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: article });
  }

  if (req.method === 'POST' && pathname === '/api/articles') {
    const input = await parseBody(req);
    if (!input.title || !input.summary) return sendError(res, 400, 'Vui lòng nhập title và summary');
    const article = { id: nextId(db.articles), ...normalizeArticleInput(input) };
    db.articles.unshift(article);
    db.adminLogs.push({ id: nextId(db.adminLogs), action: `Đăng tin: ${article.title}`, user: input.author || 'Admin', createdAt: new Date().toISOString() });
    writeDatabase(db);
    return sendJson(res, 201, { success: true, data: article });
  }

  if (req.method === 'PUT' && articleIdMatch) {
    const id = Number(articleIdMatch[1]);
    const index = db.articles.findIndex((item) => Number(item.id) === id);
    if (index === -1) return sendError(res, 404, 'Không tìm thấy bài viết để cập nhật');
    const input = await parseBody(req);
    db.articles[index] = { ...db.articles[index], ...normalizeArticleInput(input, db.articles[index]), id };
    db.adminLogs.push({ id: nextId(db.adminLogs), action: `Cập nhật tin #${id}`, user: input.author || 'Admin', createdAt: new Date().toISOString() });
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: db.articles[index] });
  }

  if (req.method === 'DELETE' && articleIdMatch) {
    const id = Number(articleIdMatch[1]);
    const index = db.articles.findIndex((item) => Number(item.id) === id);
    if (index === -1) return sendError(res, 404, 'Không tìm thấy bài viết để xóa');
    const [deleted] = db.articles.splice(index, 1);
    db.bookmarks = db.bookmarks.filter((item) => Number(item.articleId) !== id);
    db.comments = db.comments.filter((item) => Number(item.articleId) !== id);
    db.ratings = db.ratings.filter((item) => Number(item.articleId) !== id);
    db.readingHistory = db.readingHistory.filter((item) => Number(item.articleId) !== id);
    db.adminLogs.push({ id: nextId(db.adminLogs), action: `Xóa tin #${id}`, user: 'Admin', createdAt: new Date().toISOString() });
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: deleted });
  }

  if (req.method === 'GET' && pathname === '/api/ratings') {
    const articleId = Number(url.searchParams.get('articleId'));
    const userId = Number(url.searchParams.get('userId') || 1);
    const rows = articleId ? db.ratings.filter((item) => Number(item.articleId) === articleId) : db.ratings;
    const total = rows.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const userRating = rows.find((item) => Number(item.userId) === userId)?.score;
    return sendJson(res, 200, {
      success: true,
      data: {
        average: rows.length ? Number((total / rows.length).toFixed(1)) : 0,
        count: rows.length,
        userRating: userRating ? Number(userRating) : 0,
      },
    });
  }

  if (req.method === 'POST' && pathname === '/api/ratings') {
    const input = await parseBody(req);
    const articleId = Number(input.articleId);
    const userId = Number(input.userId || 1);
    const score = Math.min(5, Math.max(1, Number(input.score || 0)));
    if (!articleId || !score) return sendError(res, 400, 'Thiếu articleId hoặc score');
    const existing = db.ratings.find((item) => Number(item.articleId) === articleId && Number(item.userId) === userId);
    if (existing) {
      existing.score = score;
      existing.updatedAt = new Date().toISOString();
    } else {
      db.ratings.push({ id: nextId(db.ratings), articleId, userId, score, createdAt: new Date().toISOString() });
    }
    writeDatabase(db);

    // Lưu log đánh giá bài viết
    const article = db.articles.find((item) => Number(item.id) === articleId);
    const user = db.users.find((u) => Number(u.id) === userId);
    const nowStr = formatSqlDateTime();
    const rateLog = {
      ma_log: nextId(db.logs, 'ma_log'),
      timestamp: nowStr,
      ma_tai_khoan: userId,
      loai: 'usage_statistics',
      hanh_dong: 'rate_article',
      mo_ta: JSON.stringify({
        ho_va_ten: user ? user.name : 'Lê Đức Tài',
        user_role: user && user.role === 'admin' ? 'Quản trị viên' : 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: 'samsung SM-S906U1',
        article_id: articleId,
        bai_bao: article ? article.title : `Bài viết #${articleId}`,
        chuyen_muc: article ? article.category : 'Tin tức',
        stats: [{
          module: `Đánh giá ${score} sao: ${article ? article.title : ''}`,
          clicks: 1,
          timeSpent: '10s',
          range: `${nowStr.slice(11, 16)} - ${nowStr.slice(11, 16)}`,
        }],
      }),
    };
    db.logs.unshift(rateLog);
    writeDatabase(db);

    const rows = db.ratings.filter((item) => Number(item.articleId) === articleId);
    const total = rows.reduce((sum, item) => sum + Number(item.score || 0), 0);
    return sendJson(res, 201, { success: true, data: { average: rows.length ? Number((total / rows.length).toFixed(1)) : 0, count: rows.length, userRating: score } });
  }

  if (req.method === 'GET' && pathname === '/api/comments') {
    const articleId = Number(url.searchParams.get('articleId'));
    const result = articleId ? db.comments.filter((comment) => Number(comment.articleId) === articleId) : db.comments;
    return sendJson(res, 200, { success: true, data: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  }

  if (req.method === 'POST' && pathname === '/api/comments') {
    const input = await parseBody(req);
    if (!input.articleId || !input.name || !input.content) return sendError(res, 400, 'Thiếu articleId, name hoặc content');
    const comment = {
      id: nextId(db.comments),
      articleId: Number(input.articleId),
      userId: Number(input.userId || 1),
      name: String(input.name).trim(),
      content: String(input.content).trim(),
      createdAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    const article = db.articles.find((item) => Number(item.id) === Number(input.articleId));
    if (article) article.comments = Number(article.comments || 0) + 1;
    writeDatabase(db);
    return sendJson(res, 201, { success: true, data: comment });
  }

  if (req.method === 'GET' && pathname === '/api/bookmarks') {
    const userId = Number(url.searchParams.get('userId') || 1);
    const savedIds = db.bookmarks.filter((item) => Number(item.userId) === userId).map((item) => Number(item.articleId));
    let savedArticles = db.articles.filter((article) => savedIds.includes(Number(article.id)));
    if (savedArticles.length === 0) {
      savedArticles = db.articles.filter((article) => [1, 2].includes(Number(article.id)));
    }
    return sendJson(res, 200, { success: true, data: savedArticles });
  }

  if (req.method === 'GET' && bookmarkIdMatch) {
    const articleId = Number(bookmarkIdMatch[1]);
    const userId = Number(url.searchParams.get('userId') || 1);
    const saved = db.bookmarks.some((item) => Number(item.userId) === userId && Number(item.articleId) === articleId);
    return sendJson(res, 200, { success: true, data: { saved } });
  }

  if (req.method === 'POST' && pathname === '/api/bookmarks') {
    const input = await parseBody(req);
    const userId = Number(input.userId || 1);
    const articleId = Number(input.articleId);
    if (!articleId) return sendError(res, 400, 'Thiếu articleId');
    const exists = db.bookmarks.some((item) => Number(item.userId) === userId && Number(item.articleId) === articleId);
    if (!exists) {
      db.bookmarks.push({ id: nextId(db.bookmarks), userId, articleId, createdAt: new Date().toISOString() });
      writeDatabase(db);
    }
    return sendJson(res, 201, { success: true, data: { saved: true } });
  }

  if (req.method === 'DELETE' && bookmarkIdMatch) {
    const articleId = Number(bookmarkIdMatch[1]);
    const userId = Number(url.searchParams.get('userId') || 1);
    db.bookmarks = db.bookmarks.filter((item) => !(Number(item.userId) === userId && Number(item.articleId) === articleId));
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: { saved: false } });
  }

  if (req.method === 'GET' && pathname === '/api/history') {
    const userId = Number(url.searchParams.get('userId') || 1);
    const ids = db.readingHistory
      .filter((item) => Number(item.userId) === userId)
      .sort((a, b) => new Date(b.readAt) - new Date(a.readAt))
      .map((item) => Number(item.articleId));
    const uniqueIds = [...new Set(ids)];
    const result = uniqueIds.map((id) => db.articles.find((article) => Number(article.id) === id)).filter(Boolean);
    return sendJson(res, 200, { success: true, data: result });
  }

  if (req.method === 'POST' && pathname === '/api/history') {
    const input = await parseBody(req);
    const userId = Number(input.userId || 1);
    const articleId = Number(input.articleId);
    if (!articleId) return sendError(res, 400, 'Thiếu articleId');
    db.readingHistory.push({ id: nextId(db.readingHistory), userId, articleId, readAt: new Date().toISOString() });
    writeDatabase(db);
    return sendJson(res, 201, { success: true, data: { saved: true } });
  }

  if (req.method === 'GET' && pathname === '/api/sources') {
    return sendJson(res, 200, { success: true, data: db.sources });
  }

  if (req.method === 'POST' && pathname === '/api/sources') {
    const input = await parseBody(req);
    if (!input.name) return sendError(res, 400, 'Vui lòng nhập tên nguồn báo');
    const source = {
      id: nextId(db.sources),
      name: String(input.name).trim(),
      logo: input.logo || '',
      website: input.website || '',
      status: input.status || 'active',
      articles: Number(input.articles || 0),
      description: input.description || '',
    };
    db.sources.push(source);
    db.adminLogs.push({ id: nextId(db.adminLogs), action: `Thêm nguồn báo: ${source.name}`, user: 'Admin', createdAt: new Date().toISOString() });
    writeDatabase(db);
    return sendJson(res, 201, { success: true, data: source });
  }

  if (req.method === 'PUT' && sourceIdMatch) {
    const id = Number(sourceIdMatch[1]);
    const input = await parseBody(req);
    const index = db.sources.findIndex((item) => Number(item.id) === id);
    if (index === -1) return sendError(res, 404, 'Không tìm thấy nguồn báo');
    db.sources[index] = { ...db.sources[index], ...input, id };
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: db.sources[index] });
  }

  if (req.method === 'DELETE' && sourceIdMatch) {
    const id = Number(sourceIdMatch[1]);
    db.sources = db.sources.filter((item) => Number(item.id) !== id);
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: { deleted: true } });
  }

  if (req.method === 'GET' && pathname === '/api/notifications') {
    return sendJson(res, 200, { success: true, data: db.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  }

  if (req.method === 'POST' && pathname === '/api/notifications') {
    const input = await parseBody(req);
    if (!input.title || !input.message) return sendError(res, 400, 'Vui lòng nhập title và message');
    const notification = {
      id: nextId(db.notifications),
      title: String(input.title).trim(),
      message: String(input.message).trim(),
      type: input.type || 'general',
      enabled: input.enabled !== false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.push(notification);
    db.adminLogs.push({ id: nextId(db.adminLogs), action: `Tạo thông báo: ${notification.title}`, user: 'Admin', createdAt: new Date().toISOString() });
    writeDatabase(db);
    return sendJson(res, 201, { success: true, data: notification });
  }

  if (req.method === 'PUT' && notificationIdMatch) {
    const id = Number(notificationIdMatch[1]);
    const input = await parseBody(req);
    const index = db.notifications.findIndex((item) => Number(item.id) === id);
    if (index === -1) return sendError(res, 404, 'Không tìm thấy thông báo');
    db.notifications[index] = { ...db.notifications[index], ...input, id };
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: db.notifications[index] });
  }

  if (req.method === 'DELETE' && notificationIdMatch) {
    const id = Number(notificationIdMatch[1]);
    db.notifications = db.notifications.filter((item) => Number(item.id) !== id);
    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: { deleted: true } });
  }

  if (req.method === 'GET' && pathname === '/api/users') {
    return sendJson(res, 200, { success: true, data: db.users.map(publicUser) });
  }

  if (req.method === 'GET' && pathname === '/api/images/presets') {
    return sendJson(res, 200, { success: true, data: db.imagePresets });
  }

  if (req.method === 'GET' && pathname === '/api/reports') {
    return sendJson(res, 200, { success: true, data: db.reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  }

  if (req.method === 'POST' && pathname === '/api/reports') {
    const input = await parseBody(req);
    const report = {
      id: nextId(db.reports),
      userId: Number(input.userId || 1),
      type: input.type || 'feedback',
      content: String(input.content || '').trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    if (!report.content) return sendError(res, 400, 'Vui lòng nhập nội dung góp ý');
    db.reports.push(report);
    writeDatabase(db);
    return sendJson(res, 201, { success: true, data: report });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const input = await parseBody(req);
    const emailStr = String(input.email || '').trim().toLowerCase();
    let user = db.users.find((item) => String(item.email).toLowerCase() === emailStr);

    // Hỗ trợ đăng nhập trực tiếp bằng Gmail bất kỳ
    if (!user) {
      if (emailStr.includes('@')) {
        const rawName = emailStr.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = rawName.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Độc giả';
        user = {
          id: nextId(db.users),
          name: input.name || formattedName,
          email: emailStr,
          password: String(input.password || '123456'),
          role: emailStr.includes('admin') ? 'admin' : 'reader',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        };
        db.users.push(user);
      } else {
        return sendError(res, 401, 'Email không hợp lệ. Vui lòng nhập địa chỉ Gmail');
      }
    }

    const nowStr = formatSqlDateTime();
    const minsAgo = (m) => formatSqlDateTime(new Date(Date.now() - m * 60 * 1000));

    // Lưu log người dùng online
    const loginLog = {
      ma_log: nextId(db.logs, 'ma_log'),
      timestamp: nowStr,
      ma_tai_khoan: user.id,
      loai: 'user_status',
      hanh_dong: 'online',
      mo_ta: JSON.stringify({
        ho_va_ten: user.name,
        user_role: user.role === 'admin' ? 'Quản trị viên' : 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: input.device_info || 'samsung SM-S906U1',
        email: user.email,
      }),
    };
    db.logs.unshift(loginLog);

    // Gắn sẵn lịch sử đọc tin mẫu để người dùng mới cũng hiện thông tin đã đọc
    const userReadLogs = db.logs.filter((l) => Number(l.ma_tai_khoan) === user.id && l.hanh_dong === 'read_article');
    if (userReadLogs.length === 0) {
      const sampleArticle1 = db.articles[0] || { id: 1, title: 'Ứng dụng đọc báo mới ra mắt với giao diện hiện đại', category: 'cong-nghe' };
      const sampleArticle2 = db.articles[1] || { id: 2, title: 'Đội tuyển công nghệ trẻ Việt Nam xuất sắc', category: 'giao-duc' };

      db.logs.push(
        {
          ma_log: nextId(db.logs, 'ma_log'),
          timestamp: minsAgo(6),
          ma_tai_khoan: user.id,
          loai: 'usage_statistics',
          hanh_dong: 'read_article',
          mo_ta: JSON.stringify({
            ho_va_ten: user.name,
            user_role: user.role === 'admin' ? 'Quản trị viên' : 'Cộng tác viên',
            device_id: '7f5cfe24af715c01',
            device_info: 'samsung SM-S906U1',
            article_id: sampleArticle1.id,
            bai_bao: sampleArticle1.title,
            chuyen_muc: sampleArticle1.category || 'Công nghệ',
            stats: [
              {
                module: `Đọc bài báo: ${sampleArticle1.title}`,
                clicks: 1,
                timeSpent: '85s',
                range: `${minsAgo(7).slice(11, 16)} - ${minsAgo(6).slice(11, 16)}`,
              },
            ],
          }),
        },
        {
          ma_log: nextId(db.logs, 'ma_log') + 1,
          timestamp: minsAgo(18),
          ma_tai_khoan: user.id,
          loai: 'usage_statistics',
          hanh_dong: 'read_article',
          mo_ta: JSON.stringify({
            ho_va_ten: user.name,
            user_role: user.role === 'admin' ? 'Quản trị viên' : 'Cộng tác viên',
            device_id: '7f5cfe24af715c01',
            device_info: 'samsung SM-S906U1',
            article_id: sampleArticle2.id,
            bai_bao: sampleArticle2.title,
            chuyen_muc: sampleArticle2.category || 'Giáo dục',
            stats: [
              {
                module: `Đọc bài báo: ${sampleArticle2.title}`,
                clicks: 2,
                timeSpent: '120s',
                range: `${minsAgo(20).slice(11, 16)} - ${minsAgo(18).slice(11, 16)}`,
              },
            ],
          }),
        }
      );

      db.readingHistory.push(
        { id: nextId(db.readingHistory), userId: user.id, articleId: sampleArticle1.id, readAt: minsAgo(6) },
        { id: nextId(db.readingHistory) + 1, userId: user.id, articleId: sampleArticle2.id, readAt: minsAgo(18) }
      );
    }

    writeDatabase(db);
    return sendJson(res, 200, { success: true, data: publicUser(user) });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const input = await parseBody(req);
    if (!input.name || !input.email || !input.password) return sendError(res, 400, 'Vui lòng nhập họ tên, email và mật khẩu');
    const emailStr = String(input.email).trim().toLowerCase();
    let user = db.users.find((item) => String(item.email).toLowerCase() === emailStr);
    if (user) {
      user.name = String(input.name).trim();
      user.password = String(input.password);
    } else {
      user = {
        id: nextId(db.users),
        name: String(input.name).trim(),
        email: emailStr,
        password: String(input.password),
        role: 'reader',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      };
      db.users.push(user);
    }

    const nowStr = formatSqlDateTime();
    const minsAgo = (m) => formatSqlDateTime(new Date(Date.now() - m * 60 * 1000));

    // Log online
    db.logs.unshift({
      ma_log: nextId(db.logs, 'ma_log'),
      timestamp: nowStr,
      ma_tai_khoan: user.id,
      loai: 'user_status',
      hanh_dong: 'online',
      mo_ta: JSON.stringify({
        ho_va_ten: user.name,
        user_role: 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: 'samsung SM-S906U1',
        email: user.email,
      }),
    });

    const sampleArticle = db.articles[0] || { id: 1, title: 'Ứng dụng đọc báo mới ra mắt', category: 'cong-nghe' };
    db.logs.push({
      ma_log: nextId(db.logs, 'ma_log'),
      timestamp: minsAgo(5),
      ma_tai_khoan: user.id,
      loai: 'usage_statistics',
      hanh_dong: 'read_article',
      mo_ta: JSON.stringify({
        ho_va_ten: user.name,
        user_role: 'Cộng tác viên',
        device_id: '7f5cfe24af715c01',
        device_info: 'samsung SM-S906U1',
        article_id: sampleArticle.id,
        bai_bao: sampleArticle.title,
        chuyen_muc: sampleArticle.category || 'Công nghệ',
        stats: [
          {
            module: `Đọc bài báo: ${sampleArticle.title}`,
            clicks: 1,
            timeSpent: '70s',
            range: `${minsAgo(6).slice(11, 16)} - ${minsAgo(5).slice(11, 16)}`,
          },
        ],
      }),
    });

    writeDatabase(db);
    return sendJson(res, 201, { success: true, data: publicUser(user) });
  }

  const logIdMatch = pathname.match(/^\/api\/logs?\/(\d+)$/);

  // GET /api/logs/reading - Endpoint xem lịch sử đọc báo ở bài báo nào, bao nhiêu phút trước
  if (req.method === 'GET' && pathname === '/api/logs/reading') {
    const maTaiKhoan = url.searchParams.get('ma_tai_khoan') || url.searchParams.get('userId');
    let logs = [...db.logs];
    if (maTaiKhoan) logs = logs.filter((l) => Number(l.ma_tai_khoan) === Number(maTaiKhoan));
    const enriched = logs.map(enrichLog);
    const readingOnly = enriched.filter((l) => l.hanh_dong === 'read_article' || Boolean(l.bai_bao));

    return sendJson(res, 200, {
      success: true,
      total: readingOnly.length,
      table: 'log',
      message: 'Danh sách log người dùng đọc báo ở bài báo nào, bao nhiêu phút trước',
      data: readingOnly,
    });
  }

  // GET /api/logs hoặc /api/log - Danh sách nhật ký khớp cấu trúc bảng MySQL trong hình chụp
  if (req.method === 'GET' && (pathname === '/api/logs' || pathname === '/api/log')) {
    const maTaiKhoan = url.searchParams.get('ma_tai_khoan') || url.searchParams.get('userId');
    const hanhDong = url.searchParams.get('hanh_dong');
    const loai = url.searchParams.get('loai');
    const articleId = url.searchParams.get('article_id') || url.searchParams.get('articleId');
    const limit = Number(url.searchParams.get('limit') || 50);

    let list = [...db.logs];
    if (maTaiKhoan) list = list.filter((l) => Number(l.ma_tai_khoan) === Number(maTaiKhoan));
    if (hanhDong) list = list.filter((l) => String(l.hanh_dong).toLowerCase() === hanhDong.toLowerCase());
    if (loai) list = list.filter((l) => String(l.loai).toLowerCase() === loai.toLowerCase());

    const enriched = list.map(enrichLog);
    const filtered = articleId ? enriched.filter((l) => Number(l.article_id) === Number(articleId)) : enriched;

    return sendJson(res, 200, {
      success: true,
      total: filtered.length,
      table: 'log',
      columns: ['ma_log', 'timestamp', 'ma_tai_khoan', 'loai', 'hanh_dong', 'mo_ta'],
      message: 'Danh sách nhật ký thao tác và đọc báo khớp cơ sở dữ liệu MySQL',
      postman_sample: {
        get_all_logs: 'GET http://localhost:4000/api/logs',
        get_reading_logs: 'GET http://localhost:4000/api/logs/reading',
        create_log: 'POST http://localhost:4000/api/logs',
      },
      data: filtered.slice(0, limit),
    });
  }

  // POST /api/logs hoặc /api/log - Lưu log đọc báo hoặc thao tác từ Postman / App
  if (req.method === 'POST' && (pathname === '/api/logs' || pathname === '/api/log')) {
    const input = await parseBody(req);
    const nowStr = formatSqlDateTime();
    const timeRange = `${nowStr.slice(11, 16)} - ${nowStr.slice(11, 16)}`;

    let moTaString = '';
    if (typeof input.mo_ta === 'string' && input.mo_ta.trim()) {
      moTaString = input.mo_ta;
    } else {
      const baiBao = input.bai_bao || input.article_title || input.title || '';
      const chuyenMuc = input.chuyen_muc || input.category || '';
      const timeSpent = input.timeSpent || input.time_spent || '60s';
      const clicks = Number(input.clicks || 1);

      const moTaObj = {
        ho_va_ten: input.ho_va_ten || input.userName || 'Lê Đức Tài',
        user_role: input.user_role || input.role || 'Cộng tác viên',
        device_id: input.device_id || '7f5cfe24af715c01',
        device_info: input.device_info || 'samsung SM-S906U1',
      };

      if (baiBao || input.article_id || input.articleId) {
        moTaObj.article_id = Number(input.article_id || input.articleId || 1);
        moTaObj.bai_bao = baiBao;
        moTaObj.chuyen_muc = chuyenMuc;
      }

      moTaObj.stats = [
        {
          module: baiBao ? `Đọc bài báo: ${baiBao}` : (input.module || 'Dashboard (Tổng quan)'),
          clicks,
          timeSpent,
          range: input.range || timeRange,
        },
      ];

      moTaString = JSON.stringify(moTaObj);
    }

    const newLog = {
      ma_log: nextId(db.logs, 'ma_log'),
      timestamp: input.timestamp || nowStr,
      ma_tai_khoan: Number(input.ma_tai_khoan || input.userId || 458),
      loai: input.loai || 'usage_statistics',
      hanh_dong: input.hanh_dong || (input.bai_bao || input.article_id ? 'read_article' : 'core_function_usage'),
      mo_ta: moTaString,
    };

    db.logs.unshift(newLog);
    writeDatabase(db);

    return sendJson(res, 201, {
      success: true,
      message: 'Lưu log thành công',
      data: enrichLog(newLog),
    });
  }

  // GET /api/logs/:id hoặc /api/log/:id
  if (req.method === 'GET' && logIdMatch) {
    const id = Number(logIdMatch[1]);
    const found = db.logs.find((l) => Number(l.ma_log || l.id) === id);
    if (!found) return sendError(res, 404, 'Không tìm thấy log');
    return sendJson(res, 200, { success: true, data: enrichLog(found) });
  }

  // DELETE /api/logs/:id hoặc /api/log/:id
  if (req.method === 'DELETE' && logIdMatch) {
    const id = Number(logIdMatch[1]);
    db.logs = db.logs.filter((l) => Number(l.ma_log || l.id) !== id);
    writeDatabase(db);
    return sendJson(res, 200, { success: true, message: `Đã xoá log ${id}` });
  }

  // DELETE /api/logs - Xoá toàn bộ logs (tiện ích kiểm thử)
  if (req.method === 'DELETE' && (pathname === '/api/logs' || pathname === '/api/log')) {
    db.logs = [];
    writeDatabase(db);
    return sendJson(res, 200, { success: true, message: 'Đã làm trống bảng log' });
  }

  return sendError(res, 404, 'API không tồn tại');
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    sendError(res, 500, error.message || 'Lỗi server');
  });
});

server.listen(PORT, () => {
  console.log(`FIRA News Backend chạy tại http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('API mới: /api/sources, /api/notifications, /api/users, /api/reports, /api/history, /api/videos/:id/view, /api/admin/dashboard');
  console.log('Tài khoản mẫu: reader@firanews.local / 123456 | admin@firanews.local / 123456');
});
