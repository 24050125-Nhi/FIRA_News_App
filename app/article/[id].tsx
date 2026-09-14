import { newsApi } from '@/api/newsApi';
import { Article, Comment, formatDate, getCategoryColor, getCategoryName } from '@/data/news';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<Article | undefined>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentName, setCommentName] = useState(newsApi.getCurrentUser()?.name ?? 'Bạn đọc');
  const [commentText, setCommentText] = useState('');
  const [fontScale, setFontScale] = useState(1);
  const [rating, setRating] = useState({ average: 0, count: 0, userRating: 0 });
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const speechRateRef = useRef<number>(1.0);
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>();
  const speechChunksRef = useRef<string[]>([]);
  const speechChunkIndexRef = useRef(0);
  const pauseRequestedRef = useRef(false);

  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const commentInputRef = useRef<TextInput>(null);
  const bodyYRef = useRef(0);
  const commentSectionYRef = useRef(0);
  const commentInputRowYRef = useRef(0);
  const commentInputRowHeightRef = useRef(0);

  const scrollToCommentSection = (kbHeight?: number) => {
    setTimeout(() => {
      const activeKb = kbHeight || keyboardHeight || 300;
      const visibleHeight = windowHeight - activeKb;
      const inputRowOffset = commentInputRowYRef.current > 0 ? commentInputRowYRef.current : 98;
      const inputRowHeight = commentInputRowHeightRef.current > 0 ? commentInputRowHeightRef.current : 48;
      const inputBottomY =
        (bodyYRef.current || 0) + (commentSectionYRef.current || 0) + inputRowOffset + inputRowHeight;

      if (inputBottomY > 0 && visibleHeight > 200) {
        // Scroll so the entire comment box and send button sit comfortably ~80px above the keyboard
        const desiredScrollY = inputBottomY - (visibleHeight - 80);
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, desiredScrollY),
          animated: true,
        });
      } else if (inputBottomY > 0) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, inputBottomY - 140),
          animated: true,
        });
      }
    }, 120);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const h = e.endCoordinates?.height || 280;
        setKeyboardHeight(h);
        setIsKeyboardVisible(true);
        scrollToCommentSection(h);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [windowHeight, keyboardHeight]);

  const SPEED_LEVELS = [1.0, 1.25, 1.5, 1.75, 2.0, 0.75];

  const articleId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    let mounted = true;
    const user = newsApi.getCurrentUser();
    if (user?.name) setCommentName(user.name);
    Promise.all([newsApi.getArticle(articleId), newsApi.getComments(articleId), newsApi.checkSaved(articleId, user?.id), newsApi.getRating(articleId, user?.id)])
      .then(([articleData, commentData, savedData, ratingData]) => {
        if (!mounted) return;
        setArticle(articleData);
        setComments(commentData);
        setSaved(savedData);
        setRating({ average: ratingData.average, count: ratingData.count, userRating: ratingData.userRating ?? 0 });

        if (articleData) {
          newsApi.logReadingArticle({
            articleId: articleData.id,
            articleTitle: articleData.title,
            category: getCategoryName(articleData.category),
            userId: user?.id ?? 458,
            userName: user?.name ?? 'Lê Đức Tài',
            userRole: user?.role === 'admin' ? 'Phó Trưởng Bộ Môn' : 'Cộng tác viên',
            timeSpent: '65s',
            clicks: 1,
          }).catch(() => undefined);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [articleId]);


  useEffect(() => {
    let mounted = true;
    Speech.getAvailableVoicesAsync()
      .then((availableVoices) => {
        if (!mounted) return;
        const viVoices = availableVoices.filter((voice) =>
          voice.language?.toLowerCase().replace('_', '-').startsWith('vi')
        );
        const googleVoices = viVoices.filter((voice) => /google/i.test(`${voice.name} ${voice.identifier}`));
        const preferred =
          googleVoices[0] ??
          viVoices.find((v) => /linh|vietnam|siri/i.test(`${v.name} ${v.identifier}`)) ??
          viVoices[0];

        setVoices(viVoices);
        // Only set selectedVoice if a genuine Vietnamese voice was found!
        setSelectedVoice(preferred?.identifier);
      })
      .catch((err) => {
        console.warn('Cannot fetch available voices:', err);
      });

    return () => {
      mounted = false;
      Speech.stop();
    };
  }, []);

  const splitSpeechText = (text: string, maxLength = 350) => {
    const clean = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return [] as string[];
    const sentences = clean.split(/(?<=[.!?…\n])\s+/);
    const chunks: string[] = [];
    let current = '';
    sentences.forEach((sentence) => {
      if ((current + ' ' + sentence).trim().length <= maxLength) {
        current = (current + ' ' + sentence).trim();
      } else {
        if (current) chunks.push(current);
        if (sentence.length <= maxLength) {
          current = sentence;
        } else {
          for (let i = 0; i < sentence.length; i += maxLength) {
            chunks.push(sentence.slice(i, i + maxLength));
          }
          current = '';
        }
      }
    });
    if (current) chunks.push(current);
    return chunks;
  };

  const speakChunk = (index: number, retryWithoutVoice = false, rateOverride?: number) => {
    const chunk = speechChunksRef.current[index];
    if (!chunk) {
      setSpeechStatus('idle');
      speechChunkIndexRef.current = 0;
      return;
    }
    speechChunkIndexRef.current = index;

    const voiceToUse = (Platform.OS === 'web' || retryWithoutVoice) ? undefined : selectedVoice;
    const rateToUse = rateOverride ?? speechRateRef.current;

    Speech.speak(chunk, {
      language: 'vi-VN',
      voice: voiceToUse,
      rate: rateToUse,
      pitch: 1.0,
      volume: 1.0,
      useApplicationAudioSession: false,
      onStart: () => setSpeechStatus('speaking'),
      onDone: () => {
        if (pauseRequestedRef.current) return;
        speakChunk(index + 1);
      },
      onStopped: () => {
        if (!pauseRequestedRef.current) setSpeechStatus('idle');
      },
      onError: (err) => {
        console.warn('Speech error at chunk', index, err);
        if (voiceToUse) {
          // If specified voice failed on iOS/Android, retry using system default voice
          console.log('Retrying speech without specific voice identifier...');
          speakChunk(index, true, rateToUse);
        } else {
          setSpeechStatus('idle');
          Alert.alert(
            'Lưu ý âm thanh',
            'Không nghe thấy âm thanh? Vui lòng kiểm tra:\n1. Tắt cần gạt im lặng/rung bên sườn iPhone (gạt sang có tiếng).\n2. Tăng âm lượng loa của máy.'
          );
        }
      },
    });
  };

  const handleCycleSpeechRate = async () => {
    const currentIndex = SPEED_LEVELS.indexOf(speechRate);
    const nextIndex = (currentIndex + 1) % SPEED_LEVELS.length;
    const nextRate = SPEED_LEVELS[nextIndex];
    setSpeechRate(nextRate);
    speechRateRef.current = nextRate;

    // If speech is actively running, immediately apply new rate to current chunk
    if (speechStatus === 'speaking') {
      await Speech.stop();
      speakChunk(speechChunkIndexRef.current, false, nextRate);
    }
  };

  const handleSpeak = async () => {
    if (!article) return;
    if (speechStatus === 'speaking') {
      await handlePauseSpeech();
      return;
    }
    if (speechStatus === 'paused') {
      pauseRequestedRef.current = false;
      speakChunk(speechChunkIndexRef.current);
      return;
    }
    await Speech.stop();
    pauseRequestedRef.current = false;
    speechChunksRef.current = splitSpeechText(`${article.title}. ${article.summary}. ${article.content}`);
    speechChunkIndexRef.current = 0;
    speakChunk(0);
  };

  const handlePauseSpeech = async () => {
    if (speechStatus !== 'speaking') return;
    pauseRequestedRef.current = true;
    await Speech.stop();
    setSpeechStatus('paused');
  };

  const handleStopSpeech = async () => {
    pauseRequestedRef.current = false;
    await Speech.stop();
    speechChunkIndexRef.current = 0;
    setSpeechStatus('idle');
  };

  const cycleVoice = async () => {
    if (voices.length <= 1) {
      Alert.alert(
        'Giọng đọc Tiếng Việt',
        'Thiết bị đang phát bằng giọng Tiếng Việt chuẩn của hệ thống.\n\nĐể thêm nhiều giọng nói tự nhiên, bạn vào:\nCài đặt iOS > Trợ năng > Đọc nội dung > Giọng nói > Tiếng Việt.'
      );
      return;
    }
    const currentIndex = voices.findIndex((voice) => voice.identifier === selectedVoice);
    const nextVoice = voices[(currentIndex + 1) % voices.length];
    setSelectedVoice(nextVoice.identifier);
    Alert.alert('Đổi giọng đọc', `Đang chọn: ${nextVoice.name}`);
    if (speechStatus === 'speaking') {
      await Speech.stop();
      speakChunk(speechChunkIndexRef.current);
    }
  };

  const selectedVoiceName = useMemo(() => {
    if (selectedVoice) {
      const v = voices.find((voice) => voice.identifier === selectedVoice);
      if (v) return `${v.name} (Tiếng Việt)`;
    }
    return voices.length > 0 ? `${voices[0].name} (Tiếng Việt)` : 'Giọng Tiếng Việt chuẩn';
  }, [selectedVoice, voices]);

  const requireLogin = () => {
    const user = newsApi.getCurrentUser();
    if (user) return user;
    Alert.alert('Cần đăng nhập', 'Bạn hãy đăng nhập khách hàng để yêu thích, đánh giá và bình luận bài viết.', [
      { text: 'Để sau' },
      { text: 'Đăng nhập', onPress: () => router.push('/profile') },
    ]);
    return undefined;
  };

  const handleToggleSave = async () => {
    const user = requireLogin();
    if (!user) return;
    const nextSaved = !saved;
    setSaved(nextSaved);
    await newsApi.toggleSave(articleId, nextSaved, user.id);
    Alert.alert(
      nextSaved ? '✅ Đã lưu tin' : 'Đã bỏ lưu',
      nextSaved
        ? 'Bài viết đã được thêm vào mục "Tin đã lưu". Bạn có thể mở lại bất cứ lúc nào.'
        : 'Đã xóa bài viết khỏi mục "Tin đã lưu".'
    );
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      const shareUrl = `https://firanews.vn/article/${article.id}`;
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.summary}\n\nNguồn: ${article.source || 'FIRA News'}\nĐọc tiếp tại: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      Alert.alert('Chia sẻ', 'Không thể mở trình chia sẻ trên thiết bị.');
    }
  };

  const handleLike = async () => {
    const user = requireLogin();
    if (!user || liked) return;
    setLiked(true);
    const updated = await newsApi.likeArticle(articleId);
    if (updated) setArticle(updated);
  };

  const handleRate = async (score: number) => {
    const user = requireLogin();
    if (!user) return;
    const updatedRating = await newsApi.rateArticle(articleId, score, user.id);
    setRating({ average: updatedRating.average, count: updatedRating.count, userRating: updatedRating.userRating ?? score });
    Alert.alert('Đánh giá thành công', `Cảm ơn bạn đã đánh giá ${score} sao cho bài viết!`);
  };

  const handleAddComment = async () => {
    const user = requireLogin();
    if (!user) return;
    const cleanText = commentText.trim();
    if (!cleanText) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận.');
      return;
    }
    const commenterName = user.name || commentName.trim() || 'Bạn đọc';
    const newComment = await newsApi.addComment(articleId, commenterName, cleanText);
    setComments((current) => {
      if (current.some((c) => c.id === newComment.id)) return current;
      return [newComment, ...current];
    });
    setCommentText('');
    Keyboard.dismiss();
    Alert.alert('✅ Gửi bình luận thành công', 'Bình luận của bạn đã được lưu và hiển thị trên cả Web lẫn App.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator color="#E11D48" />
        <Text style={styles.loadingText}>Đang mở bài viết...</Text>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Text style={styles.notFoundTitle}>Không tìm thấy bài viết</Text>
        <Pressable style={styles.backHomeButton} onPress={() => router.back()}>
          <Text style={styles.backHomeText}>Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const categoryColor = getCategoryColor(article.category);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={{
            paddingBottom: isKeyboardVisible ? keyboardHeight + 110 : 60,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Image source={{ uri: article.imageUrl }} style={styles.heroImage} contentFit="cover" />
            <View style={styles.overlay} />
            <View style={styles.topActions}>
              <Pressable style={styles.circleButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="#0F172A" />
              </Pressable>
              <View style={styles.topRightActions}>
                <Pressable style={styles.circleButton} onPress={handleToggleSave}>
                  <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={21} color={saved ? '#E11D48' : '#0F172A'} />
                </Pressable>
                <Pressable style={styles.circleButton} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={21} color="#0F172A" />
                </Pressable>
              </View>
            </View>
            <View style={styles.heroText}>
              <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
                <Text style={styles.category}>{getCategoryName(article.category)}</Text>
              </View>
              <Text style={styles.title}>{article.title}</Text>
              <Text style={styles.summaryInHero} numberOfLines={2}>{article.summary}</Text>
            </View>
          </View>

          <View
            style={styles.body}
            onLayout={(e) => {
              bodyYRef.current = e.nativeEvent.layout.y;
            }}
          >
            <View style={styles.infoRow}>
              <View style={styles.authorAvatar}>
                <Ionicons name="person" size={18} color="#E11D48" />
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.author}>{article.author}</Text>
                <Text style={styles.date}>{article.source ?? 'FIRA News'} • {formatDate(article.publishedAt)}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Ionicons name="time-outline" size={16} color="#64748B" />
                <Text style={styles.metricText}>{article.readTime}</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="eye-outline" size={16} color="#64748B" />
                <Text style={styles.metricText}>{article.views.toLocaleString('vi-VN')} lượt xem</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="chatbubble-outline" size={16} color="#64748B" />
                <Text style={styles.metricText}>{comments.length} bình luận</Text>
              </View>
            </View>

            <View style={styles.readerTools}>
              <View style={styles.readerToolsTop}>
                <Text style={styles.readerToolsTitle}>Công cụ đọc</Text>
                <View style={styles.readerButtons}>
                  <Pressable style={styles.toolButton} onPress={() => setFontScale(1)}>
                    <Text style={styles.toolText}>A</Text>
                  </Pressable>
                  <Pressable style={styles.toolButton} onPress={() => setFontScale(1.12)}>
                    <Text style={styles.toolTextLarge}>A+</Text>
                  </Pressable>
                  <Pressable style={[styles.toolButton, saved && styles.toolButtonActive]} onPress={handleToggleSave}>
                    <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? '#FFFFFF' : '#E11D48'} />
                  </Pressable>
                </View>
              </View>
              <View style={styles.voicePanel}>
                <View style={styles.voiceTitleRow}>
                  <View style={styles.voiceTitleLeft}>
                    <View style={styles.googleBadge}>
                      <Ionicons name="volume-high" size={14} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.voiceTitle}>Đọc báo bằng giọng nói</Text>
                      <Text style={styles.voiceSubtitle} numberOfLines={1}>{selectedVoiceName}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.voiceSwitch} onPress={cycleVoice}>
                    <Ionicons name="swap-horizontal" size={16} color="#E11D48" />
                    <Text style={styles.voiceSwitchText}>Đổi giọng</Text>
                  </Pressable>
                </View>
                <View style={styles.speechControls}>
                  <Pressable style={[styles.speechMainButton, speechStatus === 'speaking' && styles.speechMainButtonActive]} onPress={handleSpeak}>
                    <Ionicons name={speechStatus === 'paused' ? 'play' : speechStatus === 'speaking' ? 'pause' : 'play-circle'} size={20} color="#FFFFFF" />
                    <Text style={styles.speechMainText}>{speechStatus === 'paused' ? 'Tiếp tục' : speechStatus === 'speaking' ? 'Tạm dừng' : 'Đọc bài'}</Text>
                  </Pressable>
                  <Pressable style={[styles.speechIconButton, speechStatus !== 'speaking' && styles.speechIconButtonDisabled]} onPress={handlePauseSpeech} disabled={speechStatus !== 'speaking'}>
                    <Ionicons name="pause" size={20} color={speechStatus === 'speaking' ? '#E11D48' : '#CBD5E1'} />
                  </Pressable>
                  <Pressable style={styles.speechIconButton} onPress={handleStopSpeech}>
                    <Ionicons name="stop" size={19} color="#E11D48" />
                  </Pressable>
                  <Pressable
                    style={[
                      styles.rateButton,
                      speechRate > 1.0 && styles.rateButtonFast,
                    ]}
                    onPress={handleCycleSpeechRate}
                  >
                    <Ionicons
                      name={speechRate > 1.0 ? "play-forward" : "speedometer-outline"}
                      size={12}
                      color={speechRate > 1.0 ? '#FFFFFF' : '#CBD5E1'}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.rateText}>{speechRate === 1.0 ? '1.0x' : `${speechRate}x`}</Text>
                  </Pressable>
                </View>
                <Text style={styles.voiceHint}>
                  {speechRate > 1.0
                    ? `⏩ Đang tua nhanh tốc độ ${speechRate}x. Bấm nút [${speechRate}x] để tăng tiếp mức độ.`
                    : speechRate < 1.0
                    ? `⏪ Đang đọc chậm ${speechRate}x. Bấm nút [${speechRate}x] để về chuẩn 1.0x.`
                    : `💡 Tốc độ chuẩn 1.0x. Bấm nút [1.0x] để tua nhanh từng mức độ (1.25x ➔ 1.5x ➔ 1.75x ➔ 2.0x).`}
                </Text>
              </View>
            </View>

            <Text style={[styles.summary, { fontSize: 18 * fontScale, lineHeight: 27 * fontScale }]}>{article.summary}</Text>
            {article.content.split('\n\n').map((paragraph, index) => (
              <Text key={index} style={[styles.paragraph, { fontSize: 16 * fontScale, lineHeight: 26 * fontScale }]}>
                {paragraph}
              </Text>
            ))}

            {article.tags?.length ? (
              <View style={styles.tagWrap}>
                {article.tags.map((tag) => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <Pressable style={[styles.actionButton, liked && styles.actionButtonActive]} onPress={handleLike}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#FFFFFF' : '#E11D48'} />
                <Text style={[styles.actionText, liked && styles.actionTextActive]}>{Number(article.likes || 0).toLocaleString('vi-VN')}</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, saved && styles.actionButtonActive]} onPress={handleToggleSave}>
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? '#FFFFFF' : '#E11D48'} />
                <Text style={[styles.actionText, saved && styles.actionTextActive]}>{saved ? 'Đã lưu' : 'Lưu tin'}</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color="#E11D48" />
                <Text style={styles.actionText}>Chia sẻ</Text>
              </Pressable>
            </View>

            <View style={styles.ratingBox}>
              <View style={styles.ratingHeader}>
                <View>
                  <Text style={styles.ratingTitle}>Đánh giá bài viết</Text>
                  <Text style={styles.ratingHint}>Đăng nhập khách hàng để chấm sao như app báo thật</Text>
                </View>
                <Text style={styles.ratingAverage}>{rating.average ? rating.average.toFixed(1) : '0.0'}/5</Text>
              </View>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <Pressable key={score} onPress={() => handleRate(score)} hitSlop={8}>
                    <Ionicons name={score <= rating.userRating ? 'star' : 'star-outline'} size={32} color="#F59E0B" />
                  </Pressable>
                ))}
              </View>
              <Text style={styles.ratingCount}>{rating.count} lượt đánh giá • {rating.userRating ? `Bạn đã chấm ${rating.userRating} sao` : 'Bạn chưa đánh giá'}</Text>
            </View>

            <View
              style={styles.commentSection}
              onLayout={(e) => {
                commentSectionYRef.current = e.nativeEvent.layout.y;
              }}
            >
              <Pressable
                style={styles.commentHeader}
                onPress={() => commentInputRef.current?.focus()}
              >
                <Text style={styles.commentTitle}>Bình luận</Text>
                <Text style={styles.commentCount}>{comments.length}</Text>
              </Pressable>
              <TextInput
                value={commentName}
                onChangeText={setCommentName}
                placeholder="Tên của bạn"
                placeholderTextColor="#94A3B8"
                style={styles.nameInput}
                editable={!newsApi.getCurrentUser()}
                onFocus={() => scrollToCommentSection()}
              />
              <View
                style={styles.commentInputRow}
                onLayout={(e) => {
                  commentInputRowYRef.current = e.nativeEvent.layout.y;
                  commentInputRowHeightRef.current = e.nativeEvent.layout.height;
                }}
              >
                <TextInput
                  ref={commentInputRef}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Viết bình luận..."
                  placeholderTextColor="#94A3B8"
                  style={styles.commentInput}
                  multiline
                  onFocus={() => scrollToCommentSection()}
                />
                <Pressable style={styles.sendButton} onPress={handleAddComment}>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </Pressable>
              </View>

              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>{comment.name.trim().slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <Text style={styles.commentName}>{comment.name}</Text>
                    <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerScreen: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontWeight: '800' },
  notFoundTitle: { color: '#0F172A', fontSize: 20, fontWeight: '900' },
  backHomeButton: { backgroundColor: '#E11D48', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  backHomeText: { color: '#FFFFFF', fontWeight: '900' },
  hero: { height: 470, backgroundColor: '#111827' },
  heroImage: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.48)' },
  topActions: { position: 'absolute', top: 18, left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topRightActions: { flexDirection: 'row', gap: 10 },
  circleButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 34, gap: 10 },
  categoryPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  category: { color: '#FFFFFF', fontWeight: '900', textTransform: 'uppercase', fontSize: 12 },
  title: { color: '#FFFFFF', fontSize: 30, lineHeight: 38, fontWeight: '900' },
  summaryInHero: { color: '#E2E8F0', lineHeight: 21, fontWeight: '700' },
  body: { marginTop: -24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 50 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFE4E6', alignItems: 'center', justifyContent: 'center' },
  authorInfo: { flex: 1 },
  author: { color: '#0F172A', fontWeight: '900' },
  date: { color: '#64748B', marginTop: 2, fontSize: 12, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', gap: 13, marginVertical: 18, flexWrap: 'wrap' },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metricText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
  readerTools: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  readerToolsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readerToolsTitle: { color: '#0F172A', fontWeight: '900' },
  readerButtons: { flexDirection: 'row', gap: 8 },
  voicePanel: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#FFE4E6', padding: 12, gap: 10 },
  voiceTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  voiceTitleLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  googleBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  voiceTitle: { color: '#0F172A', fontWeight: '900', fontSize: 14 },
  voiceSubtitle: { color: '#64748B', fontWeight: '700', fontSize: 11, marginTop: 2 },
  voiceSwitch: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999, backgroundColor: '#FFF1F2' },
  voiceSwitchText: { color: '#E11D48', fontSize: 11, fontWeight: '900' },
  speechControls: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  speechMainButton: { minWidth: 112, paddingHorizontal: 14, height: 40, borderRadius: 20, backgroundColor: '#E11D48', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  speechMainButtonActive: { backgroundColor: '#BE123C' },
  speechMainText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  speechIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FFE4E6', alignItems: 'center', justifyContent: 'center' },
  speechIconButtonDisabled: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  rateButton: { height: 40, minWidth: 56, borderRadius: 20, paddingHorizontal: 10, backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  rateButtonFast: { backgroundColor: '#E11D48' },
  rateText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  voiceHint: { color: '#94A3B8', fontSize: 10, lineHeight: 14, fontWeight: '700' },
  toolButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFE4E6' },
  toolButtonActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  toolText: { color: '#E11D48', fontWeight: '900', fontSize: 16 },
  toolTextLarge: { color: '#E11D48', fontWeight: '900', fontSize: 18 },
  summary: { color: '#0F172A', fontWeight: '900', marginBottom: 18 },
  paragraph: { color: '#334155', marginBottom: 16, fontWeight: '500' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 18 },
  tagPill: { backgroundColor: '#FFF1F2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  tagText: { color: '#E11D48', fontWeight: '900', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 24 },
  actionButton: { flex: 1, borderWidth: 1, borderColor: '#FFE4E6', borderRadius: 18, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#FFFFFF' },
  actionButtonActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  actionText: { color: '#E11D48', fontWeight: '900', fontSize: 12 },
  actionTextActive: { color: '#FFFFFF' },
  ratingBox: { backgroundColor: '#FFF7ED', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#FED7AA', marginBottom: 18 },
  ratingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  ratingTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  ratingHint: { color: '#9A3412', fontSize: 12, fontWeight: '700', marginTop: 3 },
  ratingAverage: { color: '#EA580C', fontSize: 20, fontWeight: '900' },
  starRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8 },
  ratingCount: { color: '#9A3412', fontWeight: '800' },
  commentSection: { marginTop: 4 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  commentTitle: { color: '#0F172A', fontSize: 23, fontWeight: '900' },
  commentCount: { color: '#E11D48', fontWeight: '900', backgroundColor: '#FFF1F2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  nameInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 11, color: '#0F172A', fontWeight: '700', marginBottom: 10 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 16 },
  commentInput: { flex: 1, minHeight: 46, maxHeight: 100, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, color: '#0F172A', fontWeight: '700' },
  sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  commentCard: { flexDirection: 'row', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEF2F7' },
  commentAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: '#FFFFFF', fontWeight: '900' },
  commentBody: { flex: 1 },
  commentName: { color: '#0F172A', fontWeight: '900' },
  commentDate: { color: '#94A3B8', fontSize: 11, fontWeight: '700', marginTop: 2 },
  commentContent: { color: '#334155', marginTop: 6, lineHeight: 20, fontWeight: '600' },
});
