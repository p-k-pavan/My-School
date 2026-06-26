import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

const { width } = Dimensions.get("window");

interface Attachment {
  _id?: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  mimeType?: string;
}

interface FeedMediaCarouselProps {
  attachments: Attachment[];
  isActive?: boolean;
}

interface Slide {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  slideType: "image" | "video" | "document_page";
  pageNumber?: number;
  totalPages?: number;
  originalAttachment: Attachment;
}


const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentPreviewCard: React.FC<{ slide: Slide; itemWidth: number }> = ({ slide }) => {
  const fileExtension = slide.fileUrl.split(".").pop()?.toLowerCase() || "";
  const fileType = slide.fileType?.toLowerCase() || "";

  const isExcel = ["xls", "xlsx"].includes(fileExtension) || ["xls", "xlsx", "csv"].includes(fileType);
  const isWord = ["doc", "docx"].includes(fileExtension) || ["doc", "docx", "word"].includes(fileType);
  const isPpt = ["ppt", "pptx"].includes(fileExtension) || fileType === "ppt" || fileType === "pptx";
  const isPdf = fileExtension === "pdf" || fileType === "pdf";

  let iconName: any = "document-text";
  let iconBg = "#EF4444";
  let labelText = "PDF";
  let labelBg = "#FEE2E2";
  let labelColor = "#B91C1C";

  if (isExcel) {
    iconName = "grid";
    iconBg = "#16A34A";
    labelText = "EXCEL";
    labelBg = "#DCFCE7";
    labelColor = "#15803D";
  } else if (isWord) {
    iconName = "document";
    iconBg = "#2563EB";
    labelText = "WORD";
    labelBg = "#DBEAFE";
    labelColor = "#1D4ED8";
  } else if (isPpt) {
    iconName = "easel";
    iconBg = "#D97706";
    labelText = "PPT";
    labelBg = "#FEF3C7";
    labelColor = "#B45309";
  }

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View
        style={{ backgroundColor: iconBg, width: 72, height: 72, borderRadius: 36 }}
        className="items-center justify-center mb-5 shadow-sm"
      >
        <Ionicons name={iconName} size={34} color="white" />
      </View>

      <View
        style={{ backgroundColor: labelBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 12 }}
      >
        <Text style={{ color: labelColor, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>
          {labelText}
        </Text>
      </View>

      <Text
        className="text-slate-800 font-bold text-center mb-1"
        style={{ fontSize: 13, lineHeight: 18 }}
        numberOfLines={3}
      >
        {slide.fileName}
      </Text>

      {!!slide.fileSize && (
        <Text className="text-slate-400 font-medium" style={{ fontSize: 11, marginTop: 2 }}>
          {formatFileSize(slide.fileSize)}
        </Text>
      )}

      <View className="flex-row items-center gap-1 mt-5 bg-slate-100 px-4 py-2 rounded-full">
        <Ionicons name="open-outline" size={13} color="#64748B" />
        <Text className="text-slate-500 font-semibold" style={{ fontSize: 11 }}>Tap to open</Text>
      </View>
    </View>
  );
};

const VideoPlayerItem: React.FC<{
  videoUrl: string;
  isActive: boolean;
  isCarouselActive: boolean;
  itemWidth: number;
}> = ({ videoUrl, isActive, isCarouselActive, itemWidth }) => {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (isActive && isCarouselActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isCarouselActive, player]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handlePlayPause = (e: any) => {
    e.stopPropagation();
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeekForward = (e: any) => {
    e.stopPropagation();
    player.seekBy(10);
  };

  const handleSeekBackward = (e: any) => {
    e.stopPropagation();
    player.seekBy(-10);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleControls}
      style={{ width: itemWidth, height: 350 }}
      className="mr-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 justify-center items-center shadow-sm relative"
    >
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        nativeControls={false}
        contentFit="contain"
      />

      {showControls && (
        <View className="absolute inset-0 bg-black/40 flex-row items-center justify-center gap-8 z-30">
          <TouchableOpacity
            onPress={handleSeekBackward}
            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/10 active:bg-white/40"
          >
            <Ionicons name="play-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            className="w-16 h-16 rounded-full bg-white/30 items-center justify-center border border-white/20 active:bg-white/50"
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" style={!isPlaying ? { marginLeft: 4 } : {}} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSeekForward}
            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center border border-white/10 active:bg-white/40"
          >
            <Ionicons name="play-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {!showControls && !isPlaying && (
        <View className="absolute bg-black/60 px-3 py-1.5 rounded-full bottom-4 flex-row items-center gap-1.5 pointer-events-none">
          <Ionicons name="play-circle" size={14} color="white" />
          <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
            Tap to Play / Controls
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const FeedMediaCarousel: React.FC<FeedMediaCarouselProps> = ({ attachments, isActive = false }) => {
  if (!attachments || attachments.length === 0) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const cardWidth = width - 32;
  const gap = 12;

  const slides: Slide[] = [];
  attachments.forEach((file, index) => {
    const fileType = file.fileType?.toLowerCase() || "";
    const fileExtension = file.fileUrl.split(".").pop()?.toLowerCase() || "";
    const isDoc = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension) || 
                  ["pdf", "doc", "docx", "xlsx", "xls"].includes(fileType);

    if (isDoc) {
      slides.push({
        id: `${index}-doc`,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: fileType,
        fileSize: file.fileSize,
        slideType: "document_page",
        originalAttachment: file
      });
    } else if (fileType === "video" || fileExtension === "mp4") {
      slides.push({
        id: `${index}-video`,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: "video",
        fileSize: file.fileSize,
        slideType: "video",
        originalAttachment: file
      });
    } else {
      slides.push({
        id: `${index}-image`,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: "image",
        fileSize: file.fileSize,
        slideType: "image",
        originalAttachment: file
      });
    }
  });

  const isSingle = slides.length === 1;
  const finalItemWidth = isSingle ? cardWidth - 32 : cardWidth - 56;

  const getAttachmentUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_FILEURL || 
                    process.env.EXPO_PUBLIC_API_BASE_URL?.replace("/api", "") || 
                    "http://192.168.31.144:5000";
    return `${baseUrl}/${path}`;
  };

  const openFile = async (filePath: string) => {
    try {
      const url = getAttachmentUrl(filePath);
      
      let fileUrlToOpen = url;
      const fileExtension = filePath.split(".").pop()?.toLowerCase();
      if (fileExtension && ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension)) {
        fileUrlToOpen = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
      }
      
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.open(url, "_blank");
        } else {
          await Linking.openURL(url);
        }
      } else {
        try {
          await WebBrowser.openBrowserAsync(fileUrlToOpen);
        } catch {
          await Linking.openURL(fileUrlToOpen);
        }
      }
    } catch {
      Alert.alert("Error", "Unable to open this file.");
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (finalItemWidth + gap));
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      scrollViewRef.current?.scrollTo({
        x: index * (finalItemWidth + gap),
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  const renderSlideItem = (slide: Slide, index: number) => {
    if (slide.slideType === "image") {
      const imageUrl = getAttachmentUrl(slide.fileUrl);
      return (
        <TouchableOpacity
          key={slide.id}
          onPress={() => openFile(slide.fileUrl)}
          activeOpacity={0.9}
          style={{ width: finalItemWidth, height: 350 }}
          className="mr-3 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 shadow-sm relative"
        >


          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            style={{ resizeMode: "cover" }}
          />


        </TouchableOpacity>
      );
    }

    if (slide.slideType === "video") {
      const videoUrl = getAttachmentUrl(slide.fileUrl);
      return (
        <VideoPlayerItem
          key={slide.id}
          videoUrl={videoUrl}
          isActive={isActive}
          isCarouselActive={activeIndex === index}
          itemWidth={finalItemWidth}
        />
      );
    }

    return (
      <TouchableOpacity
        key={slide.id}
        onPress={() => openFile(slide.fileUrl)}
        activeOpacity={0.95}
        style={{ width: finalItemWidth, height: 350 }}
        className="mr-3 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden relative"
      >
        <View className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded-full z-10 flex-row items-center gap-1 shadow-sm">
          <Ionicons name="document-text" size={10} color="white" />
          <Text className="text-[9px] font-bold text-white max-w-[150px]" numberOfLines={1}>
            {slide.fileName}
          </Text>
        </View>

        <DocumentPreviewCard slide={slide} itemWidth={finalItemWidth} />


      </TouchableOpacity>
    );
  };

  return (
    <View className="mt-3 mb-1.5 relative" style={{ marginHorizontal: -16 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={finalItemWidth + gap}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {slides.map((slide, index) => renderSlideItem(slide, index))}
      </ScrollView>

      {!isSingle && activeIndex < slides.length - 1 && (
        <TouchableOpacity
          onPress={() => scrollToSlide(activeIndex + 1)}
          activeOpacity={0.8}
          className="absolute right-4 bg-black/60 w-8 h-8 rounded-full items-center justify-center z-20 border border-slate-700 shadow-sm"
          style={{ top: "50%", marginTop: -16 }}
        >
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      )}

      {!isSingle && activeIndex > 0 && (
        <TouchableOpacity
          onPress={() => scrollToSlide(activeIndex - 1)}
          activeOpacity={0.8}
          className="absolute left-4 bg-black/60 w-8 h-8 rounded-full items-center justify-center z-20 border border-slate-700 shadow-sm"
          style={{ top: "50%", marginTop: -16 }}
        >
          <Ionicons name="chevron-back" size={16} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FeedMediaCarousel;