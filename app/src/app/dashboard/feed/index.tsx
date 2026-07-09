import React, { useState, useRef } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/redux/hooks";
import { useGetAllFeedPostQuery, useGetFeedPostByIdQuery } from "@/redux/api/feed";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import FeedMedia from "@/components/feed/FeedMedia";
import Skeleton from "@/components/shared/Skeleton";

const { width } = Dimensions.get("window");

const formatDistanceToNowCustom = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      const d = new Date(dateStr);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  } catch {
    return "";
  }
};

const formatDateFull = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  } catch {
    return dateStr;
  }
};

export default function Feed() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Redirect href="/" />;
  }

  const role = (user as any)?.role || "parent";

  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: feedData, isLoading, refetch } = useGetAllFeedPostQuery({ page: 1, limit: 100 });


  const feedList = feedData?.feed || [];

  const sortedFeeds = [...feedList].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const [activePostId, setActivePostId] = useState<string | null>(null);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      const firstViewable = viewableItems[0];
      if (firstViewable && firstViewable.isViewable) {
        setActivePostId(firstViewable.item._id);
      }
    }
  });

  const getAttachmentUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_FILEURL ||
      process.env.EXPO_PUBLIC_API_BASE_URL?.replace("/api", "") ||
      "http://192.168.31.144:5000";
    return `${baseUrl}/${path}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <View className="bg-[#1E88E5] px-5 py-4 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <View className="bg-white/20 p-2 rounded-xl">
            <Ionicons name="megaphone" size={20} color="white" />
          </View>
          <View>
            <Text className="text-white font-bold text-lg leading-tight">School Feed</Text>
            <Text className="text-blue-100 text-xs mt-0.5">Official announcements & news</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        >
          {[1, 2].map((key) => (
            <View
              key={key}
              className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm overflow-hidden"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2.5 flex-1">
                  <Skeleton width={32} height={32} borderRadius={16} />
                  <View className="flex-1 gap-1.5">
                    <Skeleton width="40%" height={10} />
                    <Skeleton width="25%" height={8} />
                  </View>
                </View>
                <Skeleton width={50} height={10} />
              </View>
              <View className="gap-2 mb-3">
                <Skeleton width="60%" height={14} />
                <Skeleton width="95%" height={11} />
                <Skeleton width="90%" height={11} />
                <Skeleton width="70%" height={11} />
              </View>
              <Skeleton width="100%" height={160} borderRadius={12} />
            </View>
          ))}
        </ScrollView>
      ) : sortedFeeds.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#1E88E5"]} />}
        >
          <View className="p-5 bg-white rounded-full mb-3 shadow-2xs">
            <Ionicons name="megaphone-outline" size={40} color="#94A3B8" />
          </View>
          <Text className="text-slate-700 font-bold text-base">No announcements found</Text>
          <Text className="text-slate-500 text-xs text-center max-w-[250px] mt-1 leading-normal">
            There are no updates or feed announcements posted for you at the moment.
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={sortedFeeds}
          keyExtractor={(item) => item._id}
          renderItem={({ item: feed }) => {
            const isPinned = !!feed.isPinned;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm overflow-hidden"
              >
                {isPinned && (
                  <View className="flex-row items-center gap-1 bg-amber-50 self-start px-2 py-0.5 rounded-md border border-amber-200/50 mb-3">
                    <Ionicons name="pin" size={10} color="#D97706" />
                    <Text className="text-amber-700 font-bold text-[9px] uppercase tracking-wider">Pinned</Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2.5">
                    <View className="h-8 w-8 rounded-full bg-slate-100 items-center justify-center border border-slate-200 overflow-hidden">
                      {feed.createdBy?.profilePhoto ? (
                        <Image
                          source={{ uri: getAttachmentUrl(feed.createdBy.profilePhoto) }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Ionicons name="person" size={14} color="#94A3B8" />
                      )}
                    </View>
                    <View>
                      <Text className="text-slate-800 font-bold text-xs leading-none">
                        {feed.createdBy?.name || "School Staff"}
                      </Text>
                      <Text className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide font-medium">
                        {feed.createdBy?.role || "Management"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[10px] text-slate-500 font-medium">
                    {formatDistanceToNowCustom(feed.createdAt)}
                  </Text>
                </View>

                {/* Body Content */}
                <View className="space-y-1 mb-2">
                  <Text className="text-slate-800 font-bold text-sm leading-snug">
                    {feed.title}
                  </Text>
                  <Text numberOfLines={3} className="text-slate-600 text-xs leading-normal">
                    {feed.description}
                  </Text>
                </View>

                <FeedMedia
                  attachments={feed.attachments}
                  isActive={activePostId === feed._id}
                />

  
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#1E88E5"]} />}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
        />
      )}

    </SafeAreaView>
  );
}