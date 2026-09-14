import { Article, articles, categories, Category, Comment, demoComments, NewsStats, VideoNews, videos } from '@/data/news';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  const lanHost = typeof hostUri === 'string' ? hostUri.split(':')[0] : '';
  if (Platform.OS !== 'web' && lanHost) return `http://${lanHost}:4000/api`;
  return envUrl ?? 'http://localhost:4000/api';
}

const API_URL = resolveApiUrl();
const REQUEST_TIMEOUT_MS = 4000;
const DEFAULT_USER_ID = 1;
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

type LoginPayload = { email: string; password: string; name?: string };
export type UserRole = 'reader' | 'admin';
export type UserProfile = { id: number; name: string; email: string; role: UserRole | string; avatar?: string };
export type RatingSummary = { average: number; count: number; userRating?: number };
export type ArticleInput = Partial<Article> & {
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  source?: string;
  author?: string;
};
export type SourceProfile = {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  status?: string;
  articles?: number;
  description?: string;
};
export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type?: string;
  enabled?: boolean;
  createdAt?: string;
};
export type ImagePreset = { id: number; name: string; url: string };
export type LogEntry = {
  ma_log: number;
  timestamp: string;
  ma_tai_khoan: number;
  loai: string;
  hanh_dong: string;
  mo_ta: string;
  mo_ta_json?: {
    ho_va_ten?: string;
    user_role?: string;
    device_id?: string;
    device_info?: string;
    article_id?: number;
    bai_bao?: string;
    chuyen_muc?: string;
    stats?: { module: string; clicks: number; timeSpent: string; range: string }[];
  };
  bai_bao?: string;
  article_id?: number;
  chuyen_muc?: string;
  ho_va_ten?: string;
  user_role?: string;
  device_info?: string;
  phut_truoc?: number;
  bao_nhieu_phut_truoc?: string;
};

export type LogReadingPayload = {
  articleId: number;
  articleTitle: string;
  category?: string;
  userId?: number;
  userName?: string;
  userRole?: string;
  deviceInfo?: string;
  timeSpent?: string;
  clicks?: number;
};

export type BackendDashboard = {
  stats: NewsStats;
  topArticles: Article[];
  latestArticles: Article[];
  latestComments: Comment[];
  sources: SourceProfile[];
  notifications: NotificationItem[];
  reports?: { id: number; type: string; content: string; status: string; createdAt: string }[];
};

export const DEFAULT_USER: UserProfile = {
  id: 458,
  name: 'Lê Đức Tài',
  email: 'reader@firanews.local',
  role: 'reader',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
};

function loadStoredUser(): UserProfile {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem('fira_user_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    }
  } catch {}
  return DEFAULT_USER;
}

function saveStoredUser(user?: UserProfile) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) window.localStorage.setItem('fira_user_session', JSON.stringify(user));
      else window.localStorage.removeItem('fira_user_session');
    }
  } catch {}
}

let currentUser: UserProfile = loadStoredUser();

const BOOKMARKS_STORAGE_KEY = 'fira_saved_bookmarks';

function loadStoredBookmarks(): Set<number> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed.map(Number));
      }
    }
  } catch {}
  return new Set<number>([1, 2]);
}

function saveStoredBookmarks(ids: Set<number>) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    }
  } catch {}
}

const localSavedIds: Set<number> = loadStoredBookmarks();

const COMMENTS_STORAGE_KEY = 'fira_saved_comments';

function loadStoredComments(): Comment[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {}
  return [];
}

function saveStoredComments(list: Comment[]) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
    }
  } catch {}
}

const localComments: Comment[] = loadStoredComments();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timeout = setTimeout(() => controller?.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller?.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.message || `API error ${response.status}`);
    }

    const payload = await response.json();
    return payload.data ?? payload;
  } finally {
    clearTimeout(timeout);
  }
}

function activeUserId(userId?: number) {
  return userId ?? currentUser?.id ?? DEFAULT_USER_ID;
}

function fallbackFilter(params?: { search?: string; category?: string; limit?: number; sort?: string; featured?: boolean; breaking?: boolean }) {
  let result = [...articles];
  if (params?.featured) result = result.filter((item) => item.isFeatured || item.isEditorPick);
  if (params?.breaking) result = result.filter((item) => item.isBreaking);
  if (params?.category && params.category !== 'all') result = result.filter((item) => item.category === params.category);
  if (params?.search) {
    const keyword = params.search.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(keyword))
    );
  }
  if (params?.sort === 'popular') result.sort((a, b) => b.views - a.views);
  else result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return typeof params?.limit === 'number' ? result.slice(0, params.limit) : result;
}

const fallbackSources: SourceProfile[] = [
  { id: 1, name: 'FIRA News', status: 'active', articles: articles.length, description: 'Nguồn tin nội bộ của dự án', logo: DEFAULT_IMAGE },
  { id: 2, name: 'Tiền phong', status: 'active', articles: 4, description: 'Đối tác tin tức mô phỏng', logo: DEFAULT_IMAGE },
  { id: 3, name: 'ZNews', status: 'active', articles: 3, description: 'Nguồn báo điện tử mô phỏng', logo: DEFAULT_IMAGE },
];

const fallbackNotifications: NotificationItem[] = [
  { id: 1, title: 'Tin nóng trong ngày', message: 'Ứng dụng vừa cập nhật danh sách tin nóng mới nhất.', type: 'breaking', enabled: true, createdAt: new Date().toISOString() },
  { id: 2, title: 'Nhắc đọc tin đã lưu', message: 'Mở mục Tin đã lưu để đọc lại các bài yêu thích.', type: 'saved', enabled: true, createdAt: new Date().toISOString() },
];

/* =========================================================================
 * 🟢 NHÓM 1: CÁC API [GET] - LẤY DỮ LIỆU TỪ SERVER (DATABASE)
 * ========================================================================= */
export const GET_METHODS = {
  /** [GET /api/articles] Lấy danh sách bài viết có hỗ trợ lọc, tìm kiếm, phân trang */
  async getArticles(params?: { search?: string; category?: string; limit?: number; sort?: string; featured?: boolean; breaking?: boolean }): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.featured) query.set('featured', '1');
    if (params?.breaking) query.set('breaking', '1');

    try {
      return await request<Article[]>(`/articles${query.toString() ? `?${query}` : ''}`);
    } catch {
      return fallbackFilter(params);
    }
  },

  /** [GET /api/articles/:id] Lấy chi tiết một bài viết theo ID */
  async getArticle(id: number): Promise<Article | undefined> {
    try {
      const article = await request<Article>(`/articles/${id}`);
      await request('/history', { method: 'POST', body: JSON.stringify({ userId: activeUserId(), articleId: id }) }).catch(() => undefined);
      return article;
    } catch {
      return articles.find((item) => item.id === id);
    }
  },

  /** [GET /api/categories] Lấy danh sách các chuyên mục tin tức */
  async getCategories(): Promise<Category[]> {
    try {
      return await request<Category[]>('/categories');
    } catch {
      return categories;
    }
  },

  /** [GET /api/videos] Lấy danh sách video tin tức ngắn */
  async getVideos(): Promise<VideoNews[]> {
    try {
      return await request<VideoNews[]>('/videos');
    } catch {
      return videos;
    }
  },

  /** [GET /api/stats] Lấy tổng số liệu thống kê bài viết, danh mục, bình luận */
  async getStats(): Promise<NewsStats> {
    try {
      return await request<NewsStats>('/stats');
    } catch {
      return {
        totalArticles: articles.length,
        totalCategories: categories.length,
        totalVideos: videos.length,
        totalComments: demoComments.length,
        totalBookmarks: 0,
        totalRatings: 0,
        totalUsers: 2,
        totalSources: fallbackSources.length,
        totalNotifications: fallbackNotifications.length,
        totalReports: 0,
        statsByCategory: categories
          .filter((category) => category.id !== 'all')
          .map((category) => ({ category: category.id, name: category.name, total: articles.filter((article) => article.category === category.id).length })),
      };
    }
  },

  /** [GET /api/comments?articleId=...] Lấy danh sách bình luận của bài viết */
  async getComments(articleId: number): Promise<Comment[]> {
    const id = Number(articleId);
    try {
      const serverComments = await request<Comment[]>(`/comments?articleId=${id}`);
      if (Array.isArray(serverComments)) {
        const relevantLocal = localComments.filter((c) => Number(c.articleId) === id);
        const map = new Map<number, Comment>();
        [...serverComments, ...relevantLocal].forEach((c) => map.set(c.id, c));
        return Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch {}
    const all = [...localComments, ...demoComments];
    const map = new Map<number, Comment>();
    all.forEach((c) => map.set(c.id, c));
    return Array.from(map.values())
      .filter((c) => Number(c.articleId) === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** [GET /api/ratings?articleId=...] Lấy điểm đánh giá trung bình và số lượt vote */
  async getRating(articleId: number, userId?: number): Promise<RatingSummary> {
    try {
      return await request<RatingSummary>(`/ratings?articleId=${articleId}&userId=${activeUserId(userId)}`);
    } catch {
      return { average: 0, count: 0 };
    }
  },

  /** [GET /api/bookmarks?userId=...] Lấy danh sách bài viết đã lưu của độc giả */
  async getSavedArticles(userId?: number): Promise<Article[]> {
    try {
      const serverArticles = await request<Article[]>(`/bookmarks?userId=${activeUserId(userId)}`);
      if (Array.isArray(serverArticles) && serverArticles.length > 0) {
        serverArticles.forEach((a) => localSavedIds.add(Number(a.id)));
        saveStoredBookmarks(localSavedIds);
        return serverArticles;
      }
    } catch {}
    const saved = articles.filter((item) => localSavedIds.has(Number(item.id)));
    return saved.length > 0 ? saved : articles.filter((item) => item.isFeatured).slice(0, 2);
  },

  /** [GET /api/bookmarks/:articleId] Kiểm tra bài viết đã được lưu hay chưa */
  async checkSaved(articleId: number, userId?: number): Promise<boolean> {
    const id = Number(articleId);
    try {
      const data = await request<{ saved: boolean }>(`/bookmarks/${id}?userId=${activeUserId(userId)}`);
      if (typeof data?.saved === 'boolean') {
        if (data.saved) localSavedIds.add(id);
        else localSavedIds.delete(id);
        saveStoredBookmarks(localSavedIds);
        return data.saved;
      }
    } catch {}
    return localSavedIds.has(id);
  },

  /** [GET /api/history?userId=...] Lấy danh sách bài viết người dùng đã đọc gần đây */
  async getHistory(userId?: number): Promise<Article[]> {
    try {
      return await request<Article[]>(`/history?userId=${activeUserId(userId)}`);
    } catch {
      return articles.slice(0, 3);
    }
  },

  /** [GET /api/sources] Lấy danh sách đối tác nguồn báo điện tử */
  async getSources(): Promise<SourceProfile[]> {
    try {
      return await request<SourceProfile[]>('/sources');
    } catch {
      return fallbackSources;
    }
  },

  /** [GET /api/notifications] Lấy danh sách các thông báo hệ thống */
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await request<NotificationItem[]>('/notifications');
    } catch {
      return fallbackNotifications;
    }
  },

  /** [GET /api/images/presets] Lấy danh sách hình ảnh mẫu có sẵn */
  async getImagePresets(): Promise<ImagePreset[]> {
    try {
      return await request<ImagePreset[]>('/images/presets');
    } catch {
      return [
        { id: 1, name: 'Tin tức', url: DEFAULT_IMAGE },
        { id: 2, name: 'Công nghệ', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
        { id: 3, name: 'Giáo dục', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80' },
      ];
    }
  },

  /** [GET /api/users] Lấy danh sách toàn bộ tài khoản người dùng */
  async getUsers(): Promise<UserProfile[]> {
    try {
      return await request<UserProfile[]>('/users');
    } catch {
      return [
        { id: 1, name: 'Bạn đọc FIRA', email: 'reader@firanews.local', role: 'reader' },
        { id: 2, name: 'Admin', email: 'admin@firanews.local', role: 'admin' },
      ];
    }
  },

  /** [GET /api/logs] Lấy danh sách nhật ký hệ thống (toàn bộ log) */
  async getLogs(params?: { userId?: number; articleId?: number; limit?: number }): Promise<LogEntry[]> {
    try {
      const query = new URLSearchParams();
      if (params?.userId) query.append('ma_tai_khoan', String(params.userId));
      if (params?.articleId) query.append('article_id', String(params.articleId));
      if (params?.limit) query.append('limit', String(params.limit));
      const qs = query.toString();
      return await request<LogEntry[]>(`/logs${qs ? `?${qs}` : ''}`);
    } catch {
      return [];
    }
  },

  /** [GET /api/logs/reading] Lấy nhật ký đọc báo hiển thị số phút trước giống như app */
  async getReadingLogs(): Promise<LogEntry[]> {
    try {
      return await request<LogEntry[]>('/logs/reading');
    } catch {
      return [];
    }
  },

  /** [GET /api/admin/dashboard] Lấy dữ liệu thống kê tổng hợp cho Admin Dashboard */
  async getDashboard(): Promise<BackendDashboard> {
    try {
      return await request<BackendDashboard>('/admin/dashboard');
    } catch {
      const stats: NewsStats = {
        totalArticles: articles.length,
        totalCategories: categories.length,
        totalVideos: videos.length,
        totalComments: demoComments.length,
        totalBookmarks: 0,
        totalRatings: 0,
        totalUsers: 2,
        totalSources: fallbackSources.length,
        totalNotifications: fallbackNotifications.length,
        totalReports: 0,
        statsByCategory: categories
          .filter((category) => category.id !== 'all')
          .map((category) => ({ category: category.id, name: category.name, total: articles.filter((article) => article.category === category.id).length })),
      };
      return {
        stats,
        topArticles: fallbackFilter({ sort: 'popular', limit: 5 }),
        latestArticles: fallbackFilter({ sort: 'latest', limit: 5 }),
        latestComments: demoComments.slice(0, 4),
        sources: fallbackSources,
        notifications: fallbackNotifications,
        reports: [],
      };
    }
  },
};

/* =========================================================================
 * 🔴 NHÓM 2: CÁC API [POST / PUT / DELETE] - GỬI / TẠO / CẬP NHẬT DỮ LIỆU
 * ========================================================================= */
export const POST_METHODS = {
  /** [POST /api/auth/login] Đăng nhập tài khoản bằng Email/Gmail */
  async login(payload: LoginPayload): Promise<UserProfile> {
    try {
      const user = await request<UserProfile>('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
      currentUser = user;
      saveStoredUser(user);
      return user;
    } catch {
      const email = payload.email || 'reader@firanews.local';
      const name = payload.name || (email.includes('@') ? email.split('@')[0] : 'Bạn đọc');
      const fallbackUser: UserProfile = {
        id: email.toLowerCase().includes('admin') ? 2 : 458,
        name: email.toLowerCase().includes('admin') ? 'Admin FIRA' : name,
        email: email,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'reader',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      };
      currentUser = fallbackUser;
      saveStoredUser(fallbackUser);
      return fallbackUser;
    }
  },

  /** [POST /api/auth/register] Đăng ký tài khoản Email/Gmail mới */
  async register(payload: LoginPayload): Promise<UserProfile> {
    try {
      const user = await request<UserProfile>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      currentUser = user;
      saveStoredUser(user);
      return user;
    } catch {
      const email = payload.email || 'reader@gmail.com';
      const name = payload.name || email.split('@')[0] || 'Bạn đọc mới';
      const fallbackUser: UserProfile = {
        id: Date.now(),
        name,
        email,
        role: 'reader',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      };
      currentUser = fallbackUser;
      saveStoredUser(fallbackUser);
      return fallbackUser;
    }
  },

  /** [POST /api/logs] Đăng xuất tài khoản và ghi log offline */
  logout() {
    if (currentUser) {
      const u = currentUser;
      request('/logs', {
        method: 'POST',
        body: JSON.stringify({
          ma_tai_khoan: u.id,
          ho_va_ten: u.name,
          user_role: u.role,
          loai: 'user_status',
          hanh_dong: 'offline',
          device_id: '7f5cfe24af715c01',
          device_info: Platform.OS === 'web' ? 'Web Chrome Client' : 'samsung SM-S906U1',
        }),
      }).catch(() => undefined);
    }
    currentUser = DEFAULT_USER;
    saveStoredUser(DEFAULT_USER);
  },

  /** [POST /api/comments] Viết bình luận mới cho bài viết */
  async addComment(articleId: number, name: string, content: string): Promise<Comment> {
    const id = Number(articleId);
    const newComment: Comment = {
      id: Date.now(),
      articleId: id,
      name: name.trim() || 'Bạn đọc',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    localComments.unshift(newComment);
    demoComments.unshift(newComment);
    saveStoredComments(localComments);

    try {
      const serverComment = await request<Comment>('/comments', {
        method: 'POST',
        body: JSON.stringify({ articleId: id, name: newComment.name, content: newComment.content, userId: currentUser?.id }),
      });
      if (serverComment && serverComment.id) {
        const index = localComments.findIndex((c) => c.id === newComment.id);
        if (index !== -1) localComments[index] = serverComment;
        saveStoredComments(localComments);
        return serverComment;
      }
      return newComment;
    } catch {
      return newComment;
    }
  },

  /** [POST /api/ratings] Chấm điểm đánh giá sao bài viết (1 - 5 sao) */
  async rateArticle(articleId: number, score: number, userId?: number): Promise<RatingSummary> {
    try {
      return await request<RatingSummary>('/ratings', {
        method: 'POST',
        body: JSON.stringify({ articleId, score, userId: activeUserId(userId) }),
      });
    } catch {
      return { average: score, count: 1, userRating: score };
    }
  },

  /** [POST /api/articles/:id/like] Thả tim thích bài viết */
  async likeArticle(articleId: number): Promise<Article | undefined> {
    try {
      return await request<Article>(`/articles/${articleId}/like`, { method: 'POST', body: JSON.stringify({ userId: currentUser?.id }) });
    } catch {
      const found = articles.find((item) => item.id === articleId);
      return found ? { ...found, likes: Number(found.likes || 0) + 1 } : undefined;
    }
  },

  /** [POST /api/bookmarks] hoặc [DELETE /api/bookmarks/:id] Bật / Tắt lưu bài viết */
  async toggleSave(articleId: number, shouldSave: boolean, userId?: number): Promise<boolean> {
    const id = Number(articleId);
    if (shouldSave) {
      localSavedIds.add(id);
    } else {
      localSavedIds.delete(id);
    }
    saveStoredBookmarks(localSavedIds);

    try {
      if (shouldSave) {
        await request('/bookmarks', { method: 'POST', body: JSON.stringify({ userId: activeUserId(userId), articleId: id }) });
        return true;
      }
      await request(`/bookmarks/${id}?userId=${activeUserId(userId)}`, { method: 'DELETE' });
      return false;
    } catch {
      return shouldSave;
    }
  },

  /** [POST /api/logs] Ghi nhận nhật ký người dùng đọc báo */
  async logReadingArticle(payload: LogReadingPayload): Promise<LogEntry | null> {
    try {
      const user = currentUser;
      const res = await request<LogEntry>('/logs', {
        method: 'POST',
        body: JSON.stringify({
          ma_tai_khoan: payload.userId ?? user?.id ?? 458,
          ho_va_ten: payload.userName ?? user?.name ?? 'Lê Đức Tài',
          user_role: payload.userRole ?? (user?.role === 'admin' ? 'Phó Trưởng Bộ Môn' : 'Cộng tác viên'),
          device_id: '7f5cfe24af715c01',
          device_info: payload.deviceInfo ?? (Platform.OS === 'web' ? 'Web Chrome Client' : 'samsung SM-S906U1'),
          loai: 'usage_statistics',
          hanh_dong: 'read_article',
          article_id: payload.articleId,
          bai_bao: payload.articleTitle,
          chuyen_muc: payload.category ?? 'Tin tức',
          timeSpent: payload.timeSpent ?? '65s',
          clicks: payload.clicks ?? 1,
        }),
      });
      return res;
    } catch (err) {
      console.warn('logReadingArticle offline fallback:', err);
      return null;
    }
  },

  /** [POST /api/history] Lưu bài viết vào danh sách lịch sử đọc */
  async addHistory(articleId: number, userId?: number): Promise<boolean> {
    try {
      await request('/history', { method: 'POST', body: JSON.stringify({ userId: activeUserId(userId), articleId }) });
      return true;
    } catch {
      return true;
    }
  },

  /** [POST /api/videos/:id/view] Tăng lượt xem cho video */
  async watchVideo(id: number): Promise<VideoNews | undefined> {
    try {
      return await request<VideoNews>(`/videos/${id}/view`, { method: 'POST' });
    } catch {
      const found = videos.find((item) => item.id === id);
      return found ? { ...found, views: Number(found.views || 0) + 1 } : undefined;
    }
  },

  /** [POST /api/articles] Đăng một bài viết mới */
  async createArticle(input: ArticleInput): Promise<Article> {
    try {
      return await request<Article>('/articles', { method: 'POST', body: JSON.stringify(input) });
    } catch {
      return {
        id: Date.now(),
        title: input.title,
        summary: input.summary,
        content: input.content || input.summary,
        category: input.category || 'thoi-su',
        author: input.author || currentUser?.name || 'Admin',
        source: input.source || 'FIRA News',
        imageUrl: input.imageUrl || DEFAULT_IMAGE,
        publishedAt: new Date().toISOString(),
        readTime: input.readTime || '3 phút đọc',
        views: 0,
        likes: 0,
        comments: 0,
        tags: input.tags || ['moi-dang'],
        isBreaking: Boolean(input.isBreaking),
        isFeatured: Boolean(input.isFeatured),
        isEditorPick: Boolean(input.isEditorPick),
      };
    }
  },

  /** [PUT /api/articles/:id] Cập nhật nội dung bài viết */
  async updateArticle(id: number, input: Partial<ArticleInput>): Promise<Article | undefined> {
    try {
      return await request<Article>(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(input) });
    } catch {
      const found = articles.find((item) => item.id === id);
      return found ? ({ ...found, ...input } as Article) : undefined;
    }
  },

  /** [DELETE /api/articles/:id] Xóa bài viết khỏi cơ sở dữ liệu */
  async deleteArticle(id: number): Promise<boolean> {
    try {
      await request<Article>(`/articles/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },

  /** [POST /api/sources] Tạo đối tác nguồn báo mới */
  async createSource(input: Partial<SourceProfile>): Promise<SourceProfile> {
    try {
      return await request<SourceProfile>('/sources', { method: 'POST', body: JSON.stringify(input) });
    } catch {
      return { id: Date.now(), name: input.name || 'Nguồn báo mới', status: 'active', articles: 0, ...input };
    }
  },

  /** [PUT /api/sources/:id] Cập nhật thông tin nguồn báo */
  async updateSource(id: number, input: Partial<SourceProfile>): Promise<SourceProfile | undefined> {
    try {
      return await request<SourceProfile>(`/sources/${id}`, { method: 'PUT', body: JSON.stringify(input) });
    } catch {
      return { id, name: input.name || 'Nguồn báo', ...input };
    }
  },

  /** [DELETE /api/sources/:id] Xóa đối tác nguồn báo */
  async deleteSource(id: number): Promise<boolean> {
    try {
      await request(`/sources/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },

  /** [POST /api/notifications] Tạo một thông báo mới */
  async createNotification(input: Partial<NotificationItem>): Promise<NotificationItem> {
    try {
      return await request<NotificationItem>('/notifications', { method: 'POST', body: JSON.stringify(input) });
    } catch {
      return { id: Date.now(), title: input.title || 'Thông báo mới', message: input.message || 'Nội dung thông báo', enabled: true, createdAt: new Date().toISOString() };
    }
  },

  /** [PUT /api/notifications/:id] Bật / Tắt trạng thái thông báo */
  async toggleNotification(id: number, enabled: boolean): Promise<NotificationItem | undefined> {
    try {
      return await request<NotificationItem>(`/notifications/${id}`, { method: 'PUT', body: JSON.stringify({ enabled }) });
    } catch {
      return fallbackNotifications.find((item) => item.id === id);
    }
  },

  /** [DELETE /api/users/:id] Xóa tài khoản người dùng */
  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      await request<{ success: boolean }>(`/users/${userId}`, { method: 'DELETE' });
      return { success: true, message: 'Đã xóa người dùng thành công' };
    } catch {
      return { success: true, message: 'Đã xóa người dùng thành công' };
    }
  },

  /** [PUT /api/users/:id/role] Cập nhật quyền người dùng (reader / admin) */
  async updateUserRole(userId: number, role: 'reader' | 'admin'): Promise<UserProfile | null> {
    try {
      return await request<UserProfile>(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    } catch {
      return { id: userId, name: 'Người dùng', email: 'user@firanews.local', role };
    }
  },

  /** [POST /api/reports] Gửi ý kiến phản hồi, báo lỗi từ người dùng */
  async submitFeedback(content: string, type = 'feedback'): Promise<{ id: number; content: string; status: string }> {
    try {
      return await request<{ id: number; content: string; status: string }>('/reports', {
        method: 'POST',
        body: JSON.stringify({ userId: activeUserId(), type, content }),
      });
    } catch {
      return { id: Date.now(), content, status: 'new' };
    }
  },
};

/* =========================================================================
 * 🟡 NHÓM 3: TIỆN ÍCH CLIENT & QUẢN LÝ SESSION
 * ========================================================================= */
export const SESSION_METHODS = {
  /** Lấy thông tin tài khoản đang đăng nhập trong phiên làm việc */
  getCurrentUser(): UserProfile {
    return currentUser || DEFAULT_USER;
  },

  /** Cập nhật thông tin tài khoản đăng nhập và lưu vào bộ nhớ trình duyệt */
  setCurrentUser(user?: UserProfile) {
    currentUser = user || DEFAULT_USER;
    saveStoredUser(currentUser);
  },
};

/* =========================================================================
 * 🌟 EXPORT TỔNG HỢP: newsApi (HỖ TRỢ ĐẦY ĐỦ CÁCH GỌI CŨ VÀ MỚI)
 * ========================================================================= */
export const newsApi = {
  // Quản lý phiên tài khoản
  ...SESSION_METHODS,

  // Các phương thức GET
  ...GET_METHODS,

  // Các phương thức POST / PUT / DELETE
  ...POST_METHODS,

  // Nhóm phân tách riêng biệt cho bạn tiện gọi hoặc tham chiếu
  GET: GET_METHODS,
  POST: POST_METHODS,
  SESSION: SESSION_METHODS,
};

// Export riêng biệt hai nhóm GET và POST
export const GET_API = GET_METHODS;
export const POST_API = POST_METHODS;

