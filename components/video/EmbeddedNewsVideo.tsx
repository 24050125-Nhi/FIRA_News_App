import { VideoNews } from '@/data/news';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import React, { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

declare const require: any;

let NativeWebView: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeWebView = require('react-native-webview').WebView;
  } catch {
    NativeWebView = null;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createVideoHtml(videoUrl: string, poster?: string) {
  const safeUrl = escapeHtml(videoUrl);
  const safePoster = poster ? escapeHtml(poster) : '';
  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden;font-family:Arial,sans-serif;}
    .wrap{position:relative;width:100%;height:100%;background:#000;}
    video{width:100%;height:100%;object-fit:contain;background:#000;display:block;}
    .hint{position:absolute;left:12px;right:12px;bottom:12px;background:rgba(0,0,0,.58);color:#fff;border-radius:12px;padding:8px 10px;font-size:13px;text-align:center;pointer-events:none;}
  </style>
</head>
<body>
  <div class="wrap">
    <video id="newsVideo" controls playsinline webkit-playsinline preload="metadata" poster="${safePoster}" src="${safeUrl}"></video>
    <div class="hint">Bấm ▶ để xem video tin tức</div>
  </div>
  <script>
    const video = document.getElementById('newsVideo');
    video.addEventListener('play', () => {
      const hint = document.querySelector('.hint');
      if (hint) hint.style.display = 'none';
    });
  </script>
</body>
</html>`;
}

function getVideoUrl(video: VideoNews) {
  if (video.localSource) {
    return Asset.fromModule(video.localSource).uri || '';
  }
  return video.videoUrl || video.embedUrl || '';
}

export function EmbeddedNewsVideo({ video, compact = false }: { video: VideoNews; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const videoUrl = getVideoUrl(video);
  const html = useMemo(() => (videoUrl ? createVideoHtml(videoUrl, video.imageUrl) : ''), [video.imageUrl, videoUrl]);

  const openExternal = async () => {
    if (!videoUrl) return;
    await Linking.openURL(videoUrl);
  };

  if (!videoUrl) {
    return (
      <View style={[styles.frame, compact && styles.frameCompact, styles.emptyFrame]}>
        <Ionicons name="videocam-off-outline" size={34} color="#94A3B8" />
        <Text style={styles.emptyTitle}>Video này chưa có link phát</Text>
      </View>
    );
  }

  if (failed) {
    return (
      <View style={[styles.frame, compact && styles.frameCompact, styles.emptyFrame]}>
        <Ionicons name="alert-circle-outline" size={34} color="#F97316" />
        <Text style={styles.emptyTitle}>Không phát được trong khung nhúng</Text>
        <Text style={styles.emptyText}>Bạn vẫn có thể mở video bằng trình phát của thiết bị.</Text>
        <Pressable style={styles.externalButton} onPress={openExternal}>
          <Ionicons name="open-outline" size={17} color="#FFFFFF" />
          <Text style={styles.externalText}>Mở video</Text>
        </Pressable>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.frame, compact && styles.frameCompact]}>
        {React.createElement('video', {
          src: videoUrl,
          poster: video.imageUrl,
          controls: true,
          playsInline: true,
          preload: 'metadata',
          onError: () => setFailed(true),
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000000',
            display: 'block',
          },
        })}
      </View>
    );
  }

  if (!NativeWebView) {
    return (
      <View style={[styles.frame, compact && styles.frameCompact, styles.emptyFrame]}>
        <Ionicons name="download-outline" size={34} color="#0891B2" />
        <Text style={styles.emptyTitle}>Cần cài thư viện video</Text>
        <Text style={styles.emptyText}>Chạy npm install rồi mở lại Expo Go. Nếu gấp, bấm nút dưới để xem video.</Text>
        <Pressable style={styles.externalButton} onPress={openExternal}>
          <Ionicons name="play-circle" size={17} color="#FFFFFF" />
          <Text style={styles.externalText}>Xem video</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.frame, compact && styles.frameCompact]}>
      <NativeWebView
        source={{ html }}
        style={styles.webView}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        androidLayerType="hardware"
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    height: 238,
    backgroundColor: '#000000',
    borderRadius: 18,
    overflow: 'hidden',
  },
  frameCompact: { height: 210, borderRadius: 14 },
  webView: { flex: 1, backgroundColor: '#000000' },
  emptyFrame: { alignItems: 'center', justifyContent: 'center', padding: 18, gap: 8 },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: '#CBD5E1', fontSize: 13, lineHeight: 19, fontWeight: '700', textAlign: 'center' },
  externalButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#009688',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  externalText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
