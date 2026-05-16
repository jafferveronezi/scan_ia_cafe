import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { RiskLevel } from "@/shared/types";

const RISK_CONFIG: Record<RiskLevel, { color: string; label: string; bg: string }> = {
  low: { color: "#2E7D32", label: "Baixo", bg: "#E8F5E9" },
  medium: { color: "#F9A825", label: "Médio", bg: "#FFF8E1" },
  high: { color: "#D32F2F", label: "Alto", bg: "#FFEBEE" },
};

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: diagnoses, isLoading, refetch } = trpc.diagnoses.list.useQuery({ limit: 5 });
  const { data: stats } = trpc.diagnoses.stats.useQuery();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "Produtor";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: colors.muted }]}>
                {greeting},
              </Text>
              <Text style={[styles.userName, { color: colors.foreground }]}>
                {firstName} 👋
              </Text>
            </View>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Main CTA Card */}
          <Pressable
            style={({ pressed }) => [
              styles.mainCard,
              { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={() => router.push("/capture")}
          >
            <View style={styles.mainCardContent}>
              <View style={styles.mainCardText}>
                <Text style={styles.mainCardTitle}>Diagnosticar Folha</Text>
                <Text style={styles.mainCardSubtitle}>
                  Tire uma foto e receba o diagnóstico em segundos
                </Text>
              </View>
              <View style={styles.mainCardIcon}>
                <Text style={styles.mainCardEmoji}>📸</Text>
              </View>
            </View>
            <View style={styles.mainCardBadge}>
              <Text style={styles.mainCardBadgeText}>IA Ativa</Text>
            </View>
          </Pressable>

          {/* Stats Row */}
          {stats && (
            <View style={styles.statsRow}>
              <StatCard
                value={stats.total}
                label="Diagnósticos"
                color={colors.primary}
                bg={colors.surface}
              />
              <StatCard
                value={stats.healthy}
                label="Saudáveis"
                color="#2E7D32"
                bg="#E8F5E9"
              />
              <StatCard
                value={stats.diseased}
                label="Com Doença"
                color="#D32F2F"
                bg="#FFEBEE"
              />
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Ações Rápidas
            </Text>
            <View style={styles.quickActions}>
              <QuickAction
                icon="clock.fill"
                label="Histórico"
                color={colors.primary}
                onPress={() => router.push("/(tabs)/history")}
              />
              <QuickAction
                icon="chart.bar.fill"
                label="Estatísticas"
                color="#6D4C41"
                onPress={() => router.push("/(tabs)/profile")}
              />
              <QuickAction
                icon="leaf.fill"
                label="Doenças"
                color="#388E3C"
                onPress={() => router.push("/(tabs)/history")}
              />
            </View>
          </View>

          {/* Recent Diagnoses */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Diagnósticos Recentes
              </Text>
              {(diagnoses?.length ?? 0) > 0 && (
                <Pressable onPress={() => router.push("/(tabs)/history")}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>
                    Ver todos
                  </Text>
                </Pressable>
              )}
            </View>

            {isLoading ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  Carregando...
                </Text>
              </View>
            ) : !diagnoses || diagnoses.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                <Text style={styles.emptyEmoji}>🌿</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  Nenhum diagnóstico ainda
                </Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  Fotografe uma folha de café para começar
                </Text>
              </View>
            ) : (
              diagnoses.slice(0, 5).map((item) => {
                const risk = RISK_CONFIG[item.riskLevel as RiskLevel] ?? RISK_CONFIG.low;
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.diagnosisItem,
                      { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={() => router.push(`/result/${item.id}`)}
                  >
                    <View style={[styles.diagnosisImageContainer, { backgroundColor: colors.border }]}>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl.startsWith("/manus-storage")
                            ? `${process.env.EXPO_PUBLIC_API_BASE_URL ?? ""}${item.imageUrl}`
                            : item.imageUrl
                          }}
                          style={styles.diagnosisImage}
                          contentFit="cover"
                        />
                      ) : (
                        <Text style={styles.diagnosisImageFallback}>🌿</Text>
                      )}
                    </View>
                    <View style={styles.diagnosisInfo}>
                      <Text style={[styles.diagnosisDisease, { color: colors.foreground }]} numberOfLines={1}>
                        {item.disease}
                      </Text>
                      <Text style={[styles.diagnosisDate, { color: colors.muted }]}>
                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>
                    <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                      <Text style={[styles.riskBadgeText, { color: risk.color }]}>
                        {risk.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({
  value,
  label,
  color,
  bg,
}: {
  value: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickActionItem,
        { opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}18` }]}>
        <IconSymbol name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerLeft: { gap: 2 },
  greeting: { fontSize: 14, fontWeight: "500" },
  userName: { fontSize: 22, fontWeight: "700" },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },

  mainCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  mainCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainCardText: { flex: 1, gap: 6 },
  mainCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  mainCardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 18,
  },
  mainCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  mainCardEmoji: { fontSize: 32 },
  mainCardBadge: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  mainCardBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", opacity: 0.8 },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "600" },

  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  quickActionItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  diagnosisItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 12,
  },
  diagnosisImageContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  diagnosisImage: { width: 52, height: 52 },
  diagnosisImageFallback: { fontSize: 24 },
  diagnosisInfo: { flex: 1, gap: 3 },
  diagnosisDisease: { fontSize: 14, fontWeight: "600" },
  diagnosisDate: { fontSize: 12 },
  riskBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  riskBadgeText: { fontSize: 12, fontWeight: "700" },
});
