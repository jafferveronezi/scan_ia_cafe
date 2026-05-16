import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { RiskLevel } from "@/shared/types";

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; label: string }> = {
  low: { color: "#2E7D32", bg: "#E8F5E9", label: "Baixo" },
  medium: { color: "#F9A825", bg: "#FFF8E1", label: "Médio" },
  high: { color: "#D32F2F", bg: "#FFEBEE", label: "Alto" },
};

export default function HistoryScreen() {
  const colors = useColors();
  const router = useRouter();

  const { data: diagnoses, isLoading, refetch } = trpc.diagnoses.list.useQuery({ limit: 100 });

  const renderItem = ({ item }: { item: NonNullable<typeof diagnoses>[number] }) => {
    const risk = RISK_CONFIG[item.riskLevel as RiskLevel] ?? RISK_CONFIG.low;
    const imageUrl = item.imageUrl?.startsWith("/manus-storage")
      ? `${process.env.EXPO_PUBLIC_API_BASE_URL ?? ""}${item.imageUrl}`
      : item.imageUrl;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
        onPress={() => router.push(`/result/${item.id}`)}
      >
        {/* Image */}
        <View style={[styles.cardImage, { backgroundColor: colors.border }]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.cardImageContent}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.cardImageFallback}>🌿</Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardDisease, { color: colors.foreground }]} numberOfLines={1}>
            {item.disease}
          </Text>
          <Text style={[styles.cardDate, { color: colors.muted }]}>
            {new Date(item.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <View style={styles.cardMeta}>
            <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
              <Text style={[styles.riskBadgeText, { color: risk.color }]}>
                Risco {risk.label}
              </Text>
            </View>
            <Text style={[styles.confidenceText, { color: colors.muted }]}>
              {Math.round(item.confidence * 100)}% confiança
            </Text>
          </View>
        </View>

        {/* Arrow */}
        <IconSymbol name="chevron.right" size={18} color={colors.muted} />
      </Pressable>
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Histórico
        </Text>
        {(diagnoses?.length ?? 0) > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.countBadgeText}>{diagnoses?.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={diagnoses ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Nenhum diagnóstico ainda
              </Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Fotografe uma folha de café para começar a monitorar sua lavoura
              </Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/capture")}
              >
                <Text style={styles.emptyButtonText}>Fazer Primeiro Diagnóstico</Text>
              </Pressable>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countBadgeText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardImageContent: { width: 64, height: 64 },
  cardImageFallback: { fontSize: 28 },

  cardInfo: { flex: 1, gap: 4 },
  cardDisease: { fontSize: 15, fontWeight: "700" },
  cardDate: { fontSize: 12 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  riskBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  riskBadgeText: { fontSize: 11, fontWeight: "700" },
  confidenceText: { fontSize: 11 },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  emptyButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
