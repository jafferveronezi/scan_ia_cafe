import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function CaptureScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const analyzeMutation = trpc.diagnoses.analyze.useMutation();

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const openCamera = async () => {
    if (Platform.OS === "web") {
      await pickFromGallery();
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à câmera para fotografar as folhas.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    startPulse();

    try {
      // Convert image to base64
      let base64Data: string;

      if (Platform.OS === "web") {
        // On web, fetch the blob and convert
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // On native, read the file
        const FileSystem = await import("expo-file-system/legacy");
        const fileInfo = await FileSystem.getInfoAsync(selectedImage);
        if (!fileInfo.exists) throw new Error("File not found");
        base64Data = await FileSystem.readAsStringAsync(selectedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Navigate to processing screen with the data
      router.push({
        pathname: "/processing",
        params: {
          imageUri: selectedImage,
          imageBase64: base64Data,
        },
      });
    } catch (error) {
      console.error("Error preparing image:", error);
      Alert.alert(
        "Erro",
        "Não foi possível processar a imagem. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsAnalyzing(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Fotografar Folha
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {!selectedImage ? (
          <>
            {/* Preview Area */}
            <View style={[styles.previewArea, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewEmoji}>🌿</Text>
                <Text style={[styles.previewTitle, { color: colors.foreground }]}>
                  Fotografe uma folha de café
                </Text>
                <Text style={[styles.previewSubtitle, { color: colors.muted }]}>
                  Certifique-se de que a folha está em foco e bem iluminada
                </Text>
              </View>

              {/* Corner guides */}
              <View style={[styles.cornerTL, { borderColor: colors.primary }]} />
              <View style={[styles.cornerTR, { borderColor: colors.primary }]} />
              <View style={[styles.cornerBL, { borderColor: colors.primary }]} />
              <View style={[styles.cornerBR, { borderColor: colors.primary }]} />
            </View>

            {/* Tips */}
            <View style={[styles.tipsCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tipsTitle, { color: colors.foreground }]}>
                💡 Dicas para melhor diagnóstico
              </Text>
              {[
                "Fotografe apenas uma folha por vez",
                "Use boa iluminação natural",
                "Mantenha a câmera estável e em foco",
                "Inclua toda a folha no enquadramento",
              ].map((tip, i) => (
                <View key={i} style={styles.tipItem}>
                  <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.tipText, { color: colors.muted }]}>{tip}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.cameraButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
                ]}
                onPress={openCamera}
              >
                <IconSymbol name="camera.fill" size={22} color="#FFFFFF" />
                <Text style={styles.cameraButtonText}>Usar Câmera</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.galleryButton,
                  { borderColor: colors.primary, opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={pickFromGallery}
              >
                <IconSymbol name="photo.on.rectangle" size={22} color={colors.primary} />
                <Text style={[styles.galleryButtonText, { color: colors.primary }]}>
                  Escolher da Galeria
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {/* Selected Image Preview */}
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                contentFit="cover"
              />
              <Pressable
                style={[styles.changeImageButton, { backgroundColor: colors.surface }]}
                onPress={() => setSelectedImage(null)}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
                <Text style={[styles.changeImageText, { color: colors.muted }]}>
                  Trocar imagem
                </Text>
              </Pressable>
            </View>

            {/* Analyze Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                style={({ pressed }) => [
                  styles.analyzeButton,
                  {
                    backgroundColor: isAnalyzing ? colors.muted : colors.primary,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                onPress={analyzeImage}
                disabled={isAnalyzing}
              >
                <Text style={styles.analyzeButtonText}>
                  {isAnalyzing ? "Preparando análise..." : "🔬  Analisar com IA"}
                </Text>
              </Pressable>
            </Animated.View>

            <Text style={[styles.analyzeDisclaimer, { color: colors.muted }]}>
              A análise leva alguns segundos. Certifique-se de ter conexão com a internet.
            </Text>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerRight: { width: 40 },

  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },

  previewArea: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: 240,
    maxHeight: 320,
  },
  previewPlaceholder: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  previewEmoji: { fontSize: 56 },
  previewTitle: { fontSize: 17, fontWeight: "600", textAlign: "center" },
  previewSubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18 },

  // Corner guide lines
  cornerTL: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRadius: 4,
  },
  cornerTR: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderRadius: 4,
  },
  cornerBL: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderRadius: 4,
  },
  cornerBR: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderRadius: 4,
  },

  tipsCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  tipsTitle: { fontSize: 14, fontWeight: "600" },
  tipItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3 },
  tipText: { fontSize: 13, flex: 1, lineHeight: 18 },

  actions: { gap: 10 },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  galleryButtonText: { fontSize: 16, fontWeight: "600" },

  selectedImageContainer: {
    flex: 1,
    gap: 12,
    minHeight: 280,
    maxHeight: 380,
  },
  selectedImage: {
    flex: 1,
    borderRadius: 20,
    minHeight: 240,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 8,
  },
  changeImageText: { fontSize: 13, fontWeight: "500" },

  analyzeButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  analyzeDisclaimer: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
