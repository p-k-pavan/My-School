import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Pdf from "react-native-pdf";

interface PdfPreviewProps {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  fileUrl,
  fileName,
  fileSize,
}) => {
  const source = {
    uri: fileUrl,
    cache: true,
  };

  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        style={styles.pdf}
        trustAllCerts={false}
        renderActivityIndicator={() => (
          <ActivityIndicator size="large" />
        )}
        onLoadComplete={(numberOfPages: number, filePath?: string) => {
          console.log("PDF Loaded");
          console.log("Pages:", numberOfPages);
          console.log("Path:", filePath);
        }}
        onPageChanged={(page: number, numberOfPages: number) => {
          console.log(`Page ${page}/${numberOfPages}`);
        }}
        onError={(error) => {
          console.log("PDF Error:", error);
        }}
        onPressLink={(uri: string) => {
          console.log("Pressed:", uri);
        }}
      />
    </View>
  );
};

export default PdfPreview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});