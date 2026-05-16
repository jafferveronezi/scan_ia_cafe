import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { trpc } from "@/lib/trpc";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colorScheme, setColorScheme } = useThemeContext();

  const { data: stats } = trpc.diagnoses.stats.useQuery();

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const toggleTheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Perfil</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? "Usuário"}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
          </View>
        </View>

        {/* Stats */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Estatísticas
            </Text>
            <View style={styles.statsGrid}>
              <StatItem
                value={stats.total}
                label="Total de\nDiagnósticos"
                color={colors.primary}
                bg={colors.surface}
              />
              <StatItem
                value={stats.healthy}
                label="Folhas\nSaudáveis"
                color="#2E7D32"
                bg="#E8F5E9"
              />
              <StatItem
                value={stats.diseased}
                label="Doenças\nDetectadas"
                color="#D32F2F"
                bg="#FFEBEE"
              />
            </View>
          </View>
        )}

        {/* Quick Action */}
        <Pressable
          style={({ pressed }) => [
            styles.diagButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={() => router.push("/capture")}
        >
          <Text style={styles.diagButtonText}>📸  Novo Diagnóstico</Text>
        </Pressable>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Configurações
          </Text>

          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="moon.fill"
              label="Tema Escuro"
              value={colorScheme === "dark" ? "Ativado" : "Desativado"}
              onPress={toggleTheme}
              color={colors.foreground}
              iconColor="#6D4C41"
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow
              icon="bell.fill"
              label="Notificações"
              value="Em breve"
              onPress={() => {}}
              color={colors.foreground}
              iconColor="#F9A825"
              disabled
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow
              icon="info.circle.fill"
              label="Sobre o App"
              value="v1.0.0"
              onPress={() => Alert.alert(
                "CaféDiag IA",
                "Versão 1.0.0\n\nAplicativo de diagnóstico de doenças em folhas de café utilizando inteligência artificial.\n\nDesenvolvido para auxiliar produtores rurais no diagnóstico precoce de doenças."
              )}
              color={colors.foreground}
              iconColor={colors.primary}
            />
          </View>
        </View>

        {/* Diseases Reference */}
        <View style={styles.diseasesSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Doenças Detectáveis
          </Text>
          <View style={[styles.diseasesCard, { backgroundColor: colors.surface }]}>
            {[
              { name: "Ferrugem do Cafeeiro", emoji: "🟠", risk: "Alto" },
              { name: "Cercosporiose", emoji: "🟡", risk: "Médio" },
              { name: "Phoma", emoji: "🔴", risk: "Alto" },
              { name: "Mancha Aureolada", emoji: "🟡", risk: "Médio" },
              { name: "Folha Saudável", emoji: "🟢", risk: "Nenhum" },
            ].map((disease, i, arr) => (
              <View key={i}>
                <View style={styles.diseaseRow}>
                  <Text style={styles.diseaseEmoji}>{disease.emoji}</Text>
                  <Text style={[styles.diseaseName, { color: colors.foreground }]}>
                    {disease.name}
                  </Text>
                  <Text style={[styles.diseaseRisk, { color: colors.muted }]}>
                    {disease.risk}
                  </Text>
                </View>
                {i < arr.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { borderColor: "#D32F2F", opacity: pressed ? 0.75 : 1 },
          ]}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square.fill" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatItem({
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
    <View style={[styles.statItem, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  color,
  iconColor,
  disabled,
}: {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
  color: string;
  iconColor: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        { opacity: pressed && !disabled ? 0.7 : disabled ? 0.5 : 1 },
      ]}
      onPress={disabled ? undefined : onPress}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: `${iconColor}18` }]}>
        <IconSymbol name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, { color }]}>{label}</Text>
      <Text style={[styles.settingValue, { color: iconColor }]}>{value}</Text>
      <IconSymbol name="chevron.right" size={16} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 20 },

  header: { paddingTop: 4 },
  headerTitle: { fontSize: 28, fontWeight: "800" },

  userCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  userEmail: { fontSize: 13, color: "rgba(255,255,255,0.75)" },

  statsSection: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statItem: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", textAlign: "center", opacity: 0.8 },

  diagButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  diagButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  settingsSection: { gap: 12 },
  settingsCard: { borderRadius: 16, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  settingValue: { fontSize: 13, fontWeight: "500" },
  divider: { height: 0.5, marginLeft: 62 },

  diseasesSection: { gap: 12 },
  diseasesCard: { borderRadius: 16, overflow: "hidden" },
  diseaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  diseaseEmoji: { fontSize: 18 },
  diseaseName: { flex: 1, fontSize: 14, fontWeight: "500" },
  diseaseRisk: { fontSize: 12 },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#D32F2F" },
});
