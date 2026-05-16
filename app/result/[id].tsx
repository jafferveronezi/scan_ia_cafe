import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { RiskLevel } from "@/shared/types";

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; label: string; emoji: string }> = {
  low: { color: "#2E7D32", bg: "#E8F5E9", label: "Risco Baixo", emoji: "🟢" },
  medium: { color: "#F9A825", bg: "#FFF8E1", label: "Risco Médio", emoji: "🟡" },
  high: { color: "#D32F2F", bg: "#FFEBEE", label: "Risco Alto", emoji: "🔴" },
};

export default function ResultScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { data: diagnosis, isLoading } = trpc.diagnoses.getById.useQuery({
    id: parseInt(id ?? "0"),
  });

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [isLoading]);

  const handleShare = async () => {
    if (!diagnosis) return;

    const message = `🌿 Diagnóstico CaféDiag IA\n\n` +
      `Doença: ${diagnosis.disease}\n` +
      `Confiança: ${Math.round(diagnosis.confidence * 100)}%\n` +
      `Risco: ${RISK_CONFIG[diagnosis.riskLevel as RiskLevel]?.label ?? "N/A"}\n\n` +
      `📋 Recomendações:\n` +
      (diagnosis.recommendations as string[]).map((r, i) => `${i + 1}. ${r}`).join("\n") +
      `\n\nDiagnosticado com CaféDiag IA`;

    try {
      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({ text: message, title: "Diagnóstico CaféDiag IA" });
        } else {
          await navigator.clipboard.writeText(message);
          Alert.alert("Copiado!", "Diagnóstico copiado para a área de transferência.");
        }
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.log("Share cancelled");
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🔍</Text>
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Carregando resultado...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!diagnosis) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>⚠️</Text>
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Diagnóstico não encontrado
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Voltar</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const risk = RISK_CONFIG[diagnosis.riskLevel as RiskLevel] ?? RISK_CONFIG.low;
  const confidencePercent = Math.round(diagnosis.confidence * 100);
  const recommendations = diagnosis.recommendations as string[];

  const imageUrl = diagnosis.imageUrl?.startsWith("/manus-storage")
    ? `${process.env.EXPO_PUBLIC_API_BASE_URL ?? ""}${diagnosis.imageUrl}`
    : diagnosis.imageUrl;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Resultado
        </Text>
        <Pressable
          style={({ pressed }) => [styles.shareButton, { opacity: pressed ? 0.6 : 1 }]}
          onPress={handleShare}
        >
          <IconSymbol name="square.and.arrow.up" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Leaf Image */}
          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.leafImage}
                contentFit="cover"
              />
              <View style={[styles.imageOverlay, { backgroundColor: risk.bg + "88" }]} />
              <View style={[styles.imageBadge, { backgroundColor: risk.bg }]}>
                <Text style={[styles.imageBadgeText, { color: risk.color }]}>
                  {risk.emoji} {risk.label}
                </Text>
              </View>
            </View>
          )}

          {/* Disease Card */}
          <View style={[styles.diseaseCard, { backgroundColor: colors.surface }]}>
            <View style={styles.diseaseHeader}>
              <View style={styles.diseaseInfo}>
                <Text style={[styles.diseaseLabel, { color: colors.muted }]}>
                  Diagnóstico
                </Text>
                <Text style={[styles.diseaseName, { color: colors.foreground }]}>
                  {diagnosis.disease}
                </Text>
              </View>
              {diagnosis.isHealthy ? (
                <View style={[styles.healthyBadge, { backgroundColor: "#E8F5E9" }]}>
                  <Text style={[styles.healthyBadgeText, { color: "#2E7D32" }]}>
                    ✅ Saudável
                  </Text>
                </View>
              ) : (
                <View style={[styles.diseasedBadge, { backgroundColor: risk.bg }]}>
                  <Text style={[styles.diseasedBadgeText, { color: risk.color }]}>
                    ⚠️ Doença
                  </Text>
                </View>
              )}
            </View>

            {/* Confidence */}
            <View style={styles.confidenceSection}>
              <View style={styles.confidenceHeader}>
                <Text style={[styles.confidenceLabel, { color: colors.muted }]}>
                  Confiança da IA
                </Text>
                <Text style={[styles.confidenceValue, { color: colors.primary }]}>
                  {confidencePercent}%
                </Text>
              </View>
              <View style={[styles.confidenceTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      backgroundColor: confidencePercent > 80 ? "#2E7D32" : confidencePercent > 60 ? "#F9A825" : "#D32F2F",
                      width: `${confidencePercent}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Description */}
            {diagnosis.description && (
              <View style={[styles.descriptionBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.descriptionText, { color: colors.foreground }]}>
                  {diagnosis.description}
                </Text>
              </View>
            )}
          </View>

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <View style={[styles.recommendationsCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.recommendationsTitle, { color: colors.foreground }]}>
                📋 Recomendações de Tratamento
              </Text>
              {recommendations.map((rec, i) => (
                <View key={i} style={styles.recommendationItem}>
                  <View style={[styles.recNumber, { backgroundColor: colors.primary }]}>
                    <Text style={styles.recNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.recText, { color: colors.foreground }]}>
                    {rec}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Date */}
          <Text style={[styles.dateText, { color: colors.muted }]}>
            Diagnóstico realizado em{" "}
            {new Date(diagnosis.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.newDiagButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
              ]}
              onPress={() => router.replace("/capture")}
            >
              <IconSymbol name="camera.fill" size={20} color="#FFFFFF" />
              <Text style={styles.newDiagButtonText}>Novo Diagnóstico</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.historyButton,
                { borderColor: colors.primary, opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={() => router.replace("/(tabs)/history")}
            >
              <IconSymbol name="clock.fill" size={20} color={colors.primary} />
              <Text style={[styles.historyButtonText, { color: colors.primary }]}>
                Ver Histórico
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
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
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  shareButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },

  imageContainer: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  leafImage: { width: "100%", height: "100%" },
  imageOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  imageBadge: {
    position: "absolute",
    bottom: 14,
    right: 14,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  imageBadgeText: { fontSize: 13, fontWeight: "700" },

  diseaseCard: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  diseaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  diseaseInfo: { flex: 1, gap: 4 },
  diseaseLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  diseaseName: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  healthyBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  healthyBadgeText: { fontSize: 12, fontWeight: "700" },
  diseasedBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  diseasedBadgeText: { fontSize: 12, fontWeight: "700" },

  confidenceSection: { gap: 8 },
  confidenceHeader: { flexDirection: "row", justifyContent: "space-between" },
  confidenceLabel: { fontSize: 13, fontWeight: "500" },
  confidenceValue: { fontSize: 15, fontWeight: "700" },
  confidenceTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  confidenceFill: { height: "100%", borderRadius: 4 },

  descriptionBox: { borderRadius: 12, padding: 14 },
  descriptionText: { fontSize: 14, lineHeight: 22 },

  recommendationsCard: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  recommendationsTitle: { fontSize: 16, fontWeight: "700" },
  recommendationItem: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  recNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  recNumberText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  recText: { flex: 1, fontSize: 14, lineHeight: 22 },

  dateText: { fontSize: 12, textAlign: "center" },

  actions: { gap: 10 },
  newDiagButton: {
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
  newDiagButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
  },
  historyButtonText: { fontSize: 16, fontWeight: "600" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingEmoji: { fontSize: 48 },
  loadingText: { fontSize: 16 },
  backLink: { fontSize: 16, fontWeight: "600" },
});
