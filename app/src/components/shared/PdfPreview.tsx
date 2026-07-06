import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Pdf from "react-native-pdf";
import { Ionicons } from "@expo/vector-icons";

interface PdfPreviewProps {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  visible?: boolean;
  onRequestClose?: () => void;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  fileUrl,
  fileName,
  fileSize,
  visible,
  onRequestClose,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trackWidth, setTrackWidth] = useState(0);
  const pdfRef = useRef<React.ComponentRef<typeof Pdf>>(null);

  const isControlled = visible !== undefined;
  const showModal = isControlled ? visible : modalVisible;
  const closeModal = isControlled ? onRequestClose : () => setModalVisible(false);

  const source = {
    uri: fileUrl,
    cache: true,
  };

  const handleSliderTouch = (event: any) => {
    if (trackWidth > 0 && totalPages > 1) {
      const { locationX } = event.nativeEvent;
      const pct = Math.max(0, Math.min(1, locationX / trackWidth));
      const targetPage = Math.max(1, Math.min(totalPages, Math.round(pct * (totalPages - 1)) + 1));
      if (targetPage !== page) {
        pdfRef.current?.setPage(targetPage);
      }
    }
  };

  if (isControlled) {
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={closeModal}
      >
        {showModal && (
          <SafeAreaView style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
              >
                <Ionicons name="arrow-back" size={24} color="#1e293b" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {fileName || "PDF Viewer"}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Fullscreen PDF component */}
            <View style={styles.pdfContainer}>
              <Pdf
                ref={pdfRef}
                source={source}
                horizontal={true}
                enablePaging={true}
                style={styles.pdfFullscreen}
                trustAllCerts={false}
                renderActivityIndicator={() => (
                  <ActivityIndicator size="large" color="#1E88E5" />
                )}
                onLoadComplete={(numberOfPages) => {
                  setTotalPages(numberOfPages);
                }}
                onPageChanged={(p) => {
                  setPage(p);
                }}
                onError={(error) => {
                  console.log("PDF fullscreen error with url:", fileUrl, error);
                }}
              />
            </View>

            {/* Footer controls with page indicator and seek slider */}
            <View style={styles.footer}>
              <Text style={styles.pageIndicatorText}>
                Page {page} of {totalPages}
              </Text>

              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => {
                    if (page > 1) {
                      pdfRef.current?.setPage(page - 1);
                    }
                  }}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={page <= 1 ? "#cbd5e1" : "#1E88E5"}
                  />
                </TouchableOpacity>

                <View
                  style={styles.sliderTrack}
                  onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                  onTouchStart={handleSliderTouch}
                  onTouchMove={handleSliderTouch}
                >
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${totalPages > 0 ? (page / totalPages) * 100 : 0}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderKnob,
                      {
                        left: `${totalPages > 1 ? ((page - 1) / (totalPages - 1)) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  disabled={page >= totalPages}
                  onPress={() => {
                    if (page < totalPages) {
                      pdfRef.current?.setPage(page + 1);
                    }
                  }}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={page >= totalPages ? "#cbd5e1" : "#1E88E5"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      {/* Clickable inline preview that renders a premium static PDF card */}
      <TouchableOpacity
        style={styles.previewButton}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.previewCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={40} color="#1E88E5" />
          </View>
          <Text style={styles.previewTitle} numberOfLines={2}>
            {fileName || "PDF Document"}
          </Text>
          {fileSize && fileSize > 0 ? (
            <Text style={styles.previewSize}>
              {(fileSize / (1024 * 1024)).toFixed(2)} MB
            </Text>
          ) : null}
          <View style={styles.viewBadge}>
            <Ionicons name="eye-outline" size={14} color="#1E88E5" />
            <Text style={styles.viewBadgeText}>Tap to View PDF</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Fullscreen PDF Viewer Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        {modalVisible && (
          <SafeAreaView style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="arrow-back" size={24} color="#1e293b" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {fileName || "PDF Viewer"}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Fullscreen PDF component */}
            <View style={styles.pdfContainer}>
              <Pdf
                ref={pdfRef}
                source={source}
                horizontal={true}
                enablePaging={true}
                style={styles.pdfFullscreen}
                trustAllCerts={false}
                renderActivityIndicator={() => (
                  <ActivityIndicator size="large" color="#1E88E5" />
                )}
                onLoadComplete={(numberOfPages) => {
                  setTotalPages(numberOfPages);
                }}
                onPageChanged={(p) => {
                  setPage(p);
                }}
                onError={(error) => {
                  console.log("PDF fullscreen error with url:", fileUrl, error);
                }}
              />
            </View>

            {/* Footer controls with page indicator and seek slider */}
            <View style={styles.footer}>
              <Text style={styles.pageIndicatorText}>
                Page {page} of {totalPages}
              </Text>

              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => {
                    if (page > 1) {
                      pdfRef.current?.setPage(page - 1);
                    }
                  }}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={page <= 1 ? "#cbd5e1" : "#1E88E5"}
                  />
                </TouchableOpacity>

                <View
                  style={styles.sliderTrack}
                  onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                  onTouchStart={handleSliderTouch}
                  onTouchMove={handleSliderTouch}
                >
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${totalPages > 0 ? (page / totalPages) * 100 : 0}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderKnob,
                      {
                        left: `${
                          totalPages > 1
                            ? ((page - 1) / (totalPages - 1)) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  disabled={page >= totalPages}
                  onPress={() => {
                    if (page < totalPages) {
                      pdfRef.current?.setPage(page + 1);
                    }
                  }}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={page >= totalPages ? "#cbd5e1" : "#1E88E5"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
};

export default PdfPreview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewButton: {
    width: "100%",
    height: "100%",
  },
  previewCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  previewSize: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 12,
  },
  viewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  viewBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E88E5",
  },
  pdfPreview: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#f8fafc",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    textAlign: "center",
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: "#525659",
  },
  pdfFullscreen: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: "100%",
  },
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  pageIndicatorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  navButton: {
    padding: 4,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    marginHorizontal: 12,
    position: "relative",
    justifyContent: "center",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#1E88E5",
    borderRadius: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
  sliderKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#1E88E5",
    position: "absolute",
    marginLeft: -7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});