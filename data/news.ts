export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Article = {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  publishedAt: string;
  readTime: string;
  views: number;
  likes?: number;
  comments?: number;
  source?: string;
  tags?: string[];
  isBreaking?: boolean;
  isFeatured?: boolean;
  isEditorPick?: boolean;
};

export type VideoNews = {
  id: number;
  title: string;
  duration: string;
  imageUrl: string;
  category: string;
  views: number;
  isLive?: boolean;
  videoUrl?: string;
  embedUrl?: string;
  description?: string;
  localSource?: any;
};

export type Comment = {
  id: number;
  articleId: number;
  name: string;
  content: string;
  createdAt: string;
};

export type NewsStats = {
  totalArticles: number;
  totalCategories: number;
  totalVideos: number;
  totalComments: number;
  totalBookmarks?: number;
  totalRatings?: number;
  totalUsers?: number;
  totalSources?: number;
  totalNotifications?: number;
  totalReports?: number;
  statsByCategory: { category: string; name: string; total: number }[];
};

export const categories: Category[] = [
  {
    "id": "all",
    "name": "Tất cả",
    "color": "#E11D48",
    "icon": "grid"
  },
  {
    "id": "thoi-su",
    "name": "Thời sự",
    "color": "#F97316",
    "icon": "newspaper"
  },
  {
    "id": "kinh-te",
    "name": "Kinh tế",
    "color": "#16A34A",
    "icon": "trending-up"
  },
  {
    "id": "cong-nghe",
    "name": "Công nghệ",
    "color": "#2563EB",
    "icon": "hardware-chip"
  },
  {
    "id": "giao-duc",
    "name": "Giáo dục",
    "color": "#7C3AED",
    "icon": "school"
  },
  {
    "id": "giai-tri",
    "name": "Giải trí",
    "color": "#DB2777",
    "icon": "musical-notes"
  },
  {
    "id": "the-thao",
    "name": "Thể thao",
    "color": "#0891B2",
    "icon": "football"
  },
  {
    "id": "doi-song",
    "name": "Đời sống",
    "color": "#0D9488",
    "icon": "leaf"
  }
];

export const articles: Article[] = [
  {
    "id": 1,
    "title": "Ứng dụng đọc báo mới ra mắt với giao diện hiện đại như app thật",
    "summary": "Trang chủ được thiết kế lại với tin nóng, chuyên mục, video, lưu tin, bình luận và tìm kiếm bằng kính lúp nổi bật.",
    "content": "Phiên bản mới của ứng dụng đọc báo tập trung vào trải nghiệm sử dụng trên điện thoại. Màn hình đầu tiên có thanh tin nóng, ô tìm kiếm rõ ràng, các chuyên mục dạng chip và khối tin nổi bật giống những ứng dụng báo điện tử phổ biến hiện nay. Người dùng có thể đọc nhanh tiêu đề, xem ảnh đại diện, mở chi tiết bài viết và theo dõi số lượt xem của từng tin.\n\nNgoài giao diện, ứng dụng còn được chuẩn bị backend API và database mẫu để sinh viên có thể chạy thử ngay. Dữ liệu bài viết, chuyên mục, video, bình luận, tài khoản và tin đã lưu được đặt trong thư mục backend/database. Khi backend đang chạy, app gọi dữ liệu từ API; khi chưa mở backend, app vẫn có dữ liệu mẫu để tránh trắng màn hình.\n\nCác chức năng chính gồm tìm kiếm tin tức, lọc theo chuyên mục, xem tin nổi bật, xem video, lưu bài viết, thả tim, gửi bình luận và xem trang cá nhân mẫu.",
    "category": "cong-nghe",
    "author": "Ban biên tập",
    "source": "FIRA News",
    "imageUrl": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T08:30:00+07:00",
    "readTime": "4 phút đọc",
    "views": 12840,
    "likes": 420,
    "comments": 8,
    "tags": [
      "app đọc báo",
      "React Native",
      "backend"
    ],
    "isBreaking": true,
    "isFeatured": true,
    "isEditorPick": true
  },
  {
    "id": 2,
    "title": "Xu hướng học công nghệ thông tin qua dự án thực tế",
    "summary": "Làm sản phẩm hoàn chỉnh giúp sinh viên hiểu rõ frontend, backend, database và cách kết nối API.",
    "content": "Học qua dự án thực tế đang trở thành cách tiếp cận hiệu quả trong ngành công nghệ thông tin. Khi xây dựng một ứng dụng hoàn chỉnh, sinh viên không chỉ viết giao diện mà còn hiểu cách dữ liệu được lưu trữ, xử lý và trả về cho người dùng.\n\nVới dự án đọc báo, sinh viên có thể luyện tập các kỹ năng quan trọng như thiết kế màn hình, gọi API, lọc dữ liệu, tìm kiếm bài viết, tạo trang chi tiết và xây dựng backend quản lý nội dung.",
    "category": "giao-duc",
    "author": "Minh Anh",
    "source": "Giáo dục trẻ",
    "imageUrl": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T09:15:00+07:00",
    "readTime": "5 phút đọc",
    "views": 8562,
    "likes": 238,
    "comments": 5,
    "tags": [
      "học lập trình",
      "dự án",
      "sinh viên"
    ],
    "isFeatured": true
  },
  {
    "id": 3,
    "title": "Kinh tế số tạo thêm nhiều cơ hội việc làm mới",
    "summary": "Các doanh nghiệp đang cần nhân sự biết phân tích dữ liệu, vận hành nền tảng số và phát triển sản phẩm trực tuyến.",
    "content": "Kinh tế số tiếp tục mở rộng trong nhiều lĩnh vực như thương mại điện tử, giáo dục trực tuyến, tài chính số và truyền thông. Điều này tạo ra nhu cầu lớn về nhân sự có kỹ năng công nghệ, tư duy sản phẩm và khả năng làm việc với dữ liệu.\n\nNgười học có thể bắt đầu bằng các dự án nhỏ như website bán hàng, app đọc tin, hệ thống quản lý thư viện hoặc ứng dụng IoT để tích lũy kinh nghiệm thực tế.",
    "category": "kinh-te",
    "author": "Hoàng Nam",
    "source": "Kinh tế hôm nay",
    "imageUrl": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-14T18:00:00+07:00",
    "readTime": "3 phút đọc",
    "views": 6420,
    "likes": 171,
    "comments": 3,
    "tags": [
      "kinh tế số",
      "việc làm"
    ]
  },
  {
    "id": 4,
    "title": "Đội tuyển trẻ gây ấn tượng ở giải thể thao sinh viên",
    "summary": "Tinh thần thi đấu bền bỉ và chiến thuật hợp lý giúp đội tuyển giành kết quả tích cực.",
    "content": "Giải thể thao sinh viên năm nay thu hút nhiều đội tham gia với chất lượng chuyên môn tốt. Các trận đấu diễn ra sôi nổi, tạo sân chơi lành mạnh và giúp sinh viên rèn luyện thể chất sau giờ học.\n\nBan tổ chức cho biết các hoạt động thể thao sẽ tiếp tục được mở rộng trong thời gian tới nhằm khuyến khích sinh viên tham gia nhiều hơn.",
    "category": "the-thao",
    "author": "Thể thao 24h",
    "source": "Sport Campus",
    "imageUrl": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-14T15:45:00+07:00",
    "readTime": "2 phút đọc",
    "views": 4281,
    "likes": 92,
    "comments": 2,
    "tags": [
      "thể thao",
      "sinh viên"
    ]
  },
  {
    "id": 5,
    "title": "Nhiều hoạt động văn hóa thu hút giới trẻ dịp cuối tuần",
    "summary": "Các sự kiện âm nhạc, triển lãm và workshop sáng tạo mang đến không gian giải trí mới mẻ.",
    "content": "Cuối tuần là thời điểm nhiều bạn trẻ tìm kiếm các hoạt động giải trí, học hỏi và giao lưu. Những chương trình văn hóa như triển lãm ảnh, đêm nhạc acoustic và workshop thiết kế đang được quan tâm nhờ tính gần gũi và chi phí hợp lý.\n\nKhông gian sáng tạo cũng giúp người trẻ thể hiện cá tính, rèn luyện kỹ năng mềm và mở rộng mối quan hệ.",
    "category": "giai-tri",
    "author": "Hà My",
    "source": "Nhịp sống trẻ",
    "imageUrl": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-13T20:10:00+07:00",
    "readTime": "3 phút đọc",
    "views": 5310,
    "likes": 154,
    "comments": 6,
    "tags": [
      "giải trí",
      "cuối tuần"
    ]
  },
  {
    "id": 6,
    "title": "Thời sự trong ngày: giao thông đô thị cần thêm giải pháp thông minh",
    "summary": "Các đô thị lớn đang tăng cường ứng dụng công nghệ để giảm ùn tắc và nâng cao trải nghiệm di chuyển.",
    "content": "Giao thông đô thị là một trong những vấn đề được quan tâm tại nhiều thành phố. Việc ứng dụng camera thông minh, dữ liệu thời gian thực và bản đồ số có thể giúp cơ quan quản lý theo dõi tình hình tốt hơn.\n\nNgười dân cũng được khuyến khích sử dụng phương tiện công cộng, theo dõi thông tin tuyến đường và sắp xếp thời gian di chuyển hợp lý.",
    "category": "thoi-su",
    "author": "Bảo An",
    "source": "Thời sự nhanh",
    "imageUrl": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T06:45:00+07:00",
    "readTime": "4 phút đọc",
    "views": 9744,
    "likes": 301,
    "comments": 9,
    "tags": [
      "giao thông",
      "đô thị"
    ],
    "isBreaking": true
  },
  {
    "id": 7,
    "title": "Mẹo đọc tin hiệu quả: lưu bài hay và chọn nguồn đáng tin cậy",
    "summary": "Thói quen đọc tin có chọn lọc giúp người dùng tiết kiệm thời gian và tránh bỏ lỡ nội dung quan trọng.",
    "content": "Người dùng hiện nay tiếp nhận rất nhiều tin tức mỗi ngày. Vì vậy, việc chọn lọc nguồn tin, đọc tiêu đề cẩn thận, xem phần tóm tắt và lưu lại bài viết quan trọng là thói quen cần thiết.\n\nTrong ứng dụng, chức năng lưu tin giúp người dùng đánh dấu bài viết để đọc lại sau. Tính năng bình luận cũng tạo không gian trao đổi ý kiến sau khi đọc bài.",
    "category": "doi-song",
    "author": "Lan Chi",
    "source": "Đời sống số",
    "imageUrl": "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T10:20:00+07:00",
    "readTime": "3 phút đọc",
    "views": 7712,
    "likes": 206,
    "comments": 4,
    "tags": [
      "đời sống",
      "đọc tin"
    ],
    "isEditorPick": true
  },
  {
    "id": 8,
    "title": "Video ngắn trở thành xu hướng truyền tải tin tức trên di động",
    "summary": "Các bản tin ngắn, dễ xem giúp người dùng cập nhật nhanh thông tin khi không có nhiều thời gian.",
    "content": "Video ngắn ngày càng được sử dụng nhiều trong các nền tảng nội dung. Với thời lượng từ một đến năm phút, người xem có thể nắm bắt nội dung chính mà không cần đọc quá dài.\n\nApp đọc báo mới bổ sung khu vực video để mô phỏng cách các ứng dụng tin tức hiện đại kết hợp bài viết, hình ảnh và video trong cùng một trải nghiệm.",
    "category": "cong-nghe",
    "author": "Quốc Huy",
    "source": "Tech Daily",
    "imageUrl": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T11:05:00+07:00",
    "readTime": "4 phút đọc",
    "views": 11240,
    "likes": 357,
    "comments": 7,
    "tags": [
      "video",
      "mobile"
    ],
    "isBreaking": true
  },
  {
    "id": 9,
    "title": "Cú hích từ siêu dự án đường sắt tốc độ cao và đô thị thông minh",
    "summary": "Các dự án hạ tầng lớn mở ra cơ hội phát triển kinh tế, kết nối vùng và dịch vụ số.",
    "content": "Các dự án giao thông quy mô lớn được kỳ vọng tạo động lực mới cho nhiều địa phương. Khi hệ thống vận tải hiện đại được hoàn thiện, thời gian di chuyển sẽ rút ngắn, hoạt động logistics thuận lợi hơn và người dân có thêm lựa chọn đi lại.\n\nBên cạnh đó, đô thị thông minh cũng cần nền tảng dữ liệu tốt để kết nối giao thông, y tế, giáo dục và dịch vụ công. Đây là lĩnh vực sinh viên công nghệ có thể tìm hiểu thông qua các dự án phần mềm thực tế.",
    "category": "thoi-su",
    "author": "Nhật Minh",
    "source": "Tiền phong",
    "imageUrl": "https://images.unsplash.com/photo-1555217851-6141535bd771?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T13:42:00+07:00",
    "readTime": "3 phút đọc",
    "views": 16290,
    "likes": 503,
    "comments": 12,
    "tags": [
      "đường sắt",
      "hạ tầng",
      "thời sự"
    ],
    "isBreaking": true
  },
  {
    "id": 10,
    "title": "Châu Á tiếp tục bất bại ở vòng loại World Cup",
    "summary": "Các đội bóng khu vực có màn trình diễn giàu năng lượng và tạo nên nhiều bất ngờ.",
    "content": "Vòng loại World Cup chứng kiến sự tiến bộ rõ rệt của nhiều đội bóng châu Á. Lối chơi kỷ luật, tốc độ và khả năng tận dụng cơ hội giúp các đội tạo dấu ấn trước những đối thủ mạnh.\n\nNgười hâm mộ kỳ vọng phong độ này sẽ tiếp tục được duy trì trong các lượt trận tới, đặc biệt khi các đội tuyển đang trẻ hóa lực lượng.",
    "category": "the-thao",
    "author": "Hải Đăng",
    "source": "ZNEWS",
    "imageUrl": "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T02:38:00+07:00",
    "readTime": "4 phút đọc",
    "views": 23810,
    "likes": 711,
    "comments": 19,
    "tags": [
      "World Cup 2026",
      "bóng đá",
      "thể thao"
    ],
    "isBreaking": true
  },
  {
    "id": 11,
    "title": "Từ 1/7, thêm một loại giấy tờ quan trọng được cập nhật trên ứng dụng định danh",
    "summary": "Nhiều dịch vụ số đang được tích hợp để người dân thao tác nhanh hơn trên điện thoại.",
    "content": "Các nền tảng định danh số đang ngày càng quan trọng trong quá trình chuyển đổi số. Việc bổ sung giấy tờ và dịch vụ mới giúp người dân giảm thời gian đi lại, đồng thời tạo cơ sở để các cơ quan liên thông dữ liệu.\n\nNgười dùng nên kiểm tra thông tin cá nhân, cập nhật ứng dụng thường xuyên và bảo mật tài khoản bằng mật khẩu mạnh.",
    "category": "cong-nghe",
    "author": "Hoàng Phúc",
    "source": "ZNEWS",
    "imageUrl": "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T07:45:00+07:00",
    "readTime": "3 phút đọc",
    "views": 14330,
    "likes": 322,
    "comments": 9,
    "tags": [
      "ứng dụng",
      "định danh",
      "công nghệ"
    ]
  },
  {
    "id": 12,
    "title": "Giá vàng ngày 15/6: thị trường trong nước tiếp tục biến động",
    "summary": "Nhà đầu tư theo dõi sát diễn biến quốc tế và chính sách tiền tệ trước khi đưa ra quyết định.",
    "content": "Giá vàng trong nước tiếp tục được quan tâm khi thị trường quốc tế biến động. Các chuyên gia khuyến nghị người mua nên theo dõi nhiều nguồn thông tin, so sánh mức chênh lệch mua bán và tránh quyết định theo tâm lý đám đông.\n\nTrong ứng dụng, nhóm có thể nâng cấp thêm mục tiện ích giá vàng để cập nhật dữ liệu nhanh cho người dùng.",
    "category": "kinh-te",
    "author": "Thu Hà",
    "source": "Vietnam+",
    "imageUrl": "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T08:05:00+07:00",
    "readTime": "3 phút đọc",
    "views": 11980,
    "likes": 245,
    "comments": 7,
    "tags": [
      "giá vàng",
      "kinh tế"
    ]
  },
  {
    "id": 13,
    "title": "Nữ ca sĩ Việt được mời hát đám cưới, chia sẻ câu chuyện phía sau sân khấu",
    "summary": "Câu chuyện hậu trường thu hút sự chú ý nhờ cách kể gần gũi và tích cực.",
    "content": "Những câu chuyện hậu trường của nghệ sĩ thường được khán giả quan tâm vì mang lại góc nhìn đời thường hơn. Bên cạnh ánh đèn sân khấu, việc chuẩn bị tiết mục, chọn trang phục và giao lưu với khán giả đều góp phần tạo nên trải nghiệm trọn vẹn.\n\nNội dung giải trí trong app được bố trí theo dạng danh sách dễ đọc, có hình ảnh lớn và có thể mở chi tiết ngay khi chạm vào tiêu đề.",
    "category": "giai-tri",
    "author": "Thanh Vy",
    "source": "SAOstar",
    "imageUrl": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T05:10:00+07:00",
    "readTime": "2 phút đọc",
    "views": 9802,
    "likes": 401,
    "comments": 11,
    "tags": [
      "ca sĩ",
      "giải trí",
      "video"
    ]
  },
  {
    "id": 14,
    "title": "Người mẹ nuôi 3 con gái sinh 3 cùng trúng tuyển lớp 10 trường chuyên",
    "summary": "Câu chuyện gia đình truyền cảm hứng học tập và nghị lực vượt khó.",
    "content": "Kết quả học tập của ba chị em sinh ba khiến nhiều người xúc động. Đằng sau thành tích là sự đồng hành bền bỉ của gia đình, thầy cô và tinh thần tự học của các em.\n\nGiáo dục luôn là chuyên mục được nhiều độc giả quan tâm, đặc biệt vào mùa thi và tuyển sinh.",
    "category": "giao-duc",
    "author": "Phương Linh",
    "source": "Vietnamnet",
    "imageUrl": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T03:28:00+07:00",
    "readTime": "4 phút đọc",
    "views": 15320,
    "likes": 654,
    "comments": 22,
    "tags": [
      "tuyển sinh",
      "giáo dục"
    ]
  },
  {
    "id": 15,
    "title": "Vợ chồng chênh lệch bao nhiêu tuổi là lý tưởng? Góc nhìn từ chuyên gia",
    "summary": "Sự đồng cảm, tôn trọng và khả năng chia sẻ quan trọng hơn khoảng cách tuổi tác.",
    "content": "Trong các mối quan hệ, khoảng cách tuổi tác không phải yếu tố quyết định duy nhất. Điều quan trọng là sự thấu hiểu, cách giao tiếp và mục tiêu sống có phù hợp hay không.\n\nCác chuyên gia cho rằng mỗi cặp đôi cần xây dựng sự tôn trọng và ranh giới lành mạnh để duy trì mối quan hệ bền vững.",
    "category": "doi-song",
    "author": "Mai Chi",
    "source": "Góc nhìn pháp lý",
    "imageUrl": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T09:20:00+07:00",
    "readTime": "3 phút đọc",
    "views": 7320,
    "likes": 198,
    "comments": 5,
    "tags": [
      "đời sống",
      "gia đình"
    ]
  },
  {
    "id": 16,
    "title": "Chiến sự Nga-Ukraine 15/6: nhiều khu vực tiếp tục căng thẳng",
    "summary": "Các bên kêu gọi tăng cường ngoại giao và bảo vệ dân thường trong vùng xung đột.",
    "content": "Tình hình xung đột vẫn diễn biến phức tạp tại một số khu vực. Các tổ chức quốc tế nhấn mạnh nhu cầu hỗ trợ nhân đạo và duy trì kênh đối thoại nhằm giảm thiểu tác động tới dân thường.\n\nKhi đọc tin quốc tế, người dùng nên kiểm tra nguồn tin đáng tin cậy và tránh chia sẻ thông tin chưa xác minh.",
    "category": "thoi-su",
    "author": "Quang Huy",
    "source": "Pháp luật",
    "imageUrl": "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T06:18:00+07:00",
    "readTime": "5 phút đọc",
    "views": 20110,
    "likes": 277,
    "comments": 17,
    "tags": [
      "quốc tế",
      "thời sự"
    ],
    "isBreaking": true
  },
  {
    "id": 17,
    "title": "AI hỗ trợ giáo viên soạn bài và cá nhân hóa nội dung học tập",
    "summary": "Công cụ thông minh giúp tiết kiệm thời gian nhưng vẫn cần người dạy kiểm tra chất lượng.",
    "content": "Trí tuệ nhân tạo đang được ứng dụng trong giáo dục để gợi ý nội dung, tạo câu hỏi luyện tập và hỗ trợ đánh giá. Tuy nhiên, giáo viên vẫn giữ vai trò quan trọng trong việc kiểm chứng, điều chỉnh và truyền cảm hứng cho học sinh.\n\nSinh viên có thể khai thác AI để học lập trình, viết tài liệu và lên kế hoạch dự án, nhưng cần hiểu bản chất thay vì sao chép máy móc.",
    "category": "giao-duc",
    "author": "Minh Thư",
    "source": "Giáo dục trẻ",
    "imageUrl": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T11:30:00+07:00",
    "readTime": "4 phút đọc",
    "views": 12700,
    "likes": 430,
    "comments": 10,
    "tags": [
      "AI",
      "giáo dục",
      "công nghệ"
    ],
    "isFeatured": true
  },
  {
    "id": 18,
    "title": "Ứng dụng mobile cần chú ý khoảng cách nút bấm để người dùng thao tác dễ hơn",
    "summary": "Thiết kế phù hợp màn hình điện thoại giúp giảm bấm nhầm và tăng trải nghiệm đọc tin.",
    "content": "Trên thiết bị di động, nút bấm cần có vùng chạm đủ rộng, chữ dễ đọc và khoảng cách rõ ràng. Những thành phần như menu, kính lúp, tài khoản, tab trên cùng và thanh điều hướng dưới nên được kiểm tra trên nhiều kích thước màn hình.\n\nBản giao diện mới đã tối ưu lại header, danh sách tin, nút đóng tin, chuyên mục và thanh tab dưới để thao tác tốt hơn trên điện thoại Android lẫn iOS.",
    "category": "cong-nghe",
    "author": "Ban sản phẩm",
    "source": "FIRA News",
    "imageUrl": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T12:20:00+07:00",
    "readTime": "4 phút đọc",
    "views": 18440,
    "likes": 802,
    "comments": 24,
    "tags": [
      "mobile",
      "UI UX",
      "React Native"
    ],
    "isFeatured": true,
    "isEditorPick": true
  },
  {
    "id": 19,
    "title": "HLV công bố danh sách đội tuyển Việt Nam: nhiều gương mặt trẻ được gọi",
    "summary": "Sự xuất hiện của cầu thủ trẻ tạo thêm cạnh tranh trong đội hình trước giải đấu quan trọng.",
    "content": "Danh sách tập trung mới có nhiều thay đổi đáng chú ý. Ban huấn luyện muốn thử nghiệm thêm phương án chiến thuật và tạo cơ hội cho những cầu thủ đang có phong độ tốt ở câu lạc bộ.\n\nNgười hâm mộ kỳ vọng đội tuyển sẽ có sự chuẩn bị tốt và thi đấu tự tin trong các trận sắp tới.",
    "category": "the-thao",
    "author": "Thành Long",
    "source": "Tiền phong",
    "imageUrl": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-15T10:02:00+07:00",
    "readTime": "3 phút đọc",
    "views": 21900,
    "likes": 610,
    "comments": 18,
    "tags": [
      "bóng đá VN",
      "đội tuyển",
      "World Cup 2026"
    ],
    "isBreaking": true
  },
  {
    "id": 20,
    "title": "Mô hình học thực hành giúp sinh viên tự tin hơn khi làm đồ án",
    "summary": "Tự chạy backend, database và app mobile là bước quan trọng để hiểu hệ thống hoàn chỉnh.",
    "content": "Một đồ án có tính thực tế nên bao gồm giao diện, API, database và hướng dẫn chạy rõ ràng. Khi sinh viên tự thao tác từ cài đặt thư viện đến kiểm tra dữ liệu, kiến thức sẽ vững hơn và dễ trình bày với giảng viên.\n\nDự án app đọc báo này được đóng gói kèm file chạy nhanh trên Windows để người mới bắt đầu cũng có thể mở và kiểm thử.",
    "category": "giao-duc",
    "author": "Bảo Trân",
    "source": "FIRA News",
    "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    "publishedAt": "2026-06-14T21:30:00+07:00",
    "readTime": "5 phút đọc",
    "views": 9001,
    "likes": 312,
    "comments": 8,
    "tags": [
      "đồ án",
      "backend",
      "database"
    ]
  }
];

export const videos: VideoNews[] = [
  {
    id: 101,
    title: "Bản tin giáo dục và hoạt động trường học",
    duration: "05:19",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80",
    category: "Giáo dục",
    views: 1540,
    localSource: require('../assets/videos/VIDEO_DOWNLOAD_1788091436044_1788783536295.mp4'),
    description: "Video tin tức giáo dục được lưu trực tiếp trong ứng dụng để phục vụ demo."
  },
  {
    id: 102,
    title: "Nhịp sống và những câu chuyện xã hội đáng chú ý",
    duration: "00:56",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
    category: "Đời sống",
    views: 2380,
    localSource: require('../assets/videos/VIDEO_DOWNLOAD_1788091436471_1788783529379.mp4'),
    description: "Video đời sống - xã hội được chọn từ bộ video của dự án."
  },
  {
    id: 103,
    title: "Bản tin thời sự: sự việc đáng chú ý qua camera",
    duration: "02:06",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80",
    category: "Thời sự",
    views: 3890,
    isLive: true,
    localSource: require('../assets/videos/VIDEO_DOWNLOAD_1788091436718_1788783522603.mp4'),
    description: "Video thời sự ngắn phục vụ mục Video của FIRA News."
  },
  {
    id: 104,
    title: "Thông tin y tế và chăm sóc sức khỏe",
    duration: "02:56",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
    category: "Sức khỏe",
    views: 2760,
    localSource: require('../assets/videos/VIDEO_DOWNLOAD_1788091437812_1788783512085.mp4'),
    description: "Video thuộc nhóm nội dung y tế - sức khỏe."
  },
  {
    id: 105,
    title: "Cảnh báo thông tin và xu hướng tiêu dùng trên mạng",
    duration: "02:56",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80",
    category: "Tiêu dùng",
    views: 3180,
    localSource: require('../assets/videos/VIDEO_DOWNLOAD_1788091438006_1788783511102.mp4'),
    description: "Video đời sống - tiêu dùng giúp nội dung ứng dụng đa dạng hơn."
  }
];

export const demoComments: Comment[] = [
  {
    "id": 1,
    "articleId": 1,
    "name": "Ngọc Ánh",
    "content": "Giao diện mới nhìn giống app báo thật, dễ dùng hơn nhiều.",
    "createdAt": "2026-06-15T09:10:00+07:00"
  },
  {
    "id": 2,
    "articleId": 1,
    "name": "Minh Khang",
    "content": "Có backend và database mẫu như này rất tiện để nộp đồ án.",
    "createdAt": "2026-06-15T09:32:00+07:00"
  },
  {
    "id": 3,
    "articleId": 6,
    "name": "Bảo Trân",
    "content": "Tin giao thông nên có thêm bản đồ nữa là đẹp.",
    "createdAt": "2026-06-15T07:21:00+07:00"
  },
  {
    "id": 4,
    "articleId": 18,
    "name": "Uyển Nhi",
    "content": "Nút bấm rõ hơn và nhìn giống app báo thật hơn rồi.",
    "createdAt": "2026-06-15T12:40:00+07:00"
  },
  {
    "id": 5,
    "articleId": 10,
    "name": "Độc giả bóng đá",
    "content": "Mục Bóng đá VN bấm lọc ra tin thể thao rất tiện.",
    "createdAt": "2026-06-15T12:58:00+07:00"
  }
];

export const formatDate = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getCategoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? id;

export const getCategoryColor = (id: string) => categories.find((item) => item.id === id)?.color ?? '#E11D48';
