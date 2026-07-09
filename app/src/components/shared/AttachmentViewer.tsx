import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import PdfPreview from "./PdfPreview";

interface Attachment {
  _id?: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
}

interface AttachmentViewerProps {
  attachments: Attachment[];
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  attachments,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ fileName: string; fileUrl: string } | null>(null);

  const openFile = async (filePath: string, fileName: string) => {
    try {
      const fileExtension = filePath.split(".").pop()?.toLowerCase() || "";
      
      // If it is a PDF file, open it using native PdfPreview modal
      if (fileExtension === "pdf") {
        setSelectedDoc({ fileName, fileUrl: filePath });
        setViewerVisible(true);
        return;
      }

      // Other document and media files
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_FILEURL || 
                      process.env.EXPO_PUBLIC_API_BASE_URL?.replace("/api", "") || 
                      "http://192.168.31.144:5000";
      const url = filePath.startsWith("http") ? filePath : `${baseUrl}/${filePath}`;
      
      let fileUrlToOpen = url;
      if (fileExtension && ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension)) {
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

  const getIcon = (fileType?: string) => {
    if (!fileType) return "document-outline";

    if (fileType.includes("pdf")) return "document-text-outline";
    if (fileType.includes("image")) return "image-outline";
    if (fileType.includes("video")) return "videocam-outline";

    return "document-outline";
  };

  if (!attachments?.length) return null;

  return (
    <View className="mt-1">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between bg-slate-50 border border-slate-100 rounded-lg p-2 mb-1.5"
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons
            name="document-attach-outline"
            size={14}
            color="#1E88E5"
          />
          <Text className="text-xs font-semibold text-blue-600">
            {attachments.length} Attachment
            {attachments.length > 1 ? "s" : ""}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color="#6B7280"
        />
      </TouchableOpacity>

      {isExpanded && (
        <FlatList
          data={attachments}
          keyExtractor={(item, index) =>
            item._id || `${item.fileName}-${index}`
          }
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openFile(item.fileUrl, item.fileName)}
              className="flex-row items-center justify-between bg-white border border-slate-100 rounded-lg p-2.5 mb-1.5 ml-2"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name={getIcon(item.fileType)}
                  size={16}
                  color="#1E88E5"
                />

                <Text
                  numberOfLines={1}
                  className="ml-2 flex-1 text-slate-600 text-xs"
                >
                  {item.fileName}
                </Text>
              </View>

              <Ionicons
                name="open-outline"
                size={14}
                color="#6B7280"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Render the controlled PDF Preview modal */}
      {viewerVisible && selectedDoc && (
        <PdfPreview
          visible={viewerVisible}
          onRequestClose={() => {
            setViewerVisible(false);
            setSelectedDoc(null);
          }}
          fileUrl={selectedDoc.fileUrl.startsWith("http") ? selectedDoc.fileUrl : (() => {
            const baseUrl = process.env.EXPO_PUBLIC_API_BASE_FILEURL || 
                            process.env.EXPO_PUBLIC_API_BASE_URL?.replace("/api", "") || 
                            "http://192.168.31.144:5000";
            return `${baseUrl}/${selectedDoc.fileUrl}`;
          })()}
          fileName={selectedDoc.fileName}
        />
      )}
    </View>
  );
};

export default AttachmentViewer;