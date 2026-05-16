import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading]);

  const handleLogin = async () => {
    await startOAuthLogin();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient simulation */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Background decorative circles */}
      <View style={[styles.bgCircle, { top: -80, right: -80, width: 250, height: 250 }]} />
      <View style={[styles.bgCircle, { bottom: 100, left: -60, width: 200, height: 200 }]} />
      <View style={[styles.bgCircle, { top: "40%", right: -40, width: 120, height: 120 }]} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              contentFit="cover"
            />
          </View>
          <Text style={styles.appName}>CaféDiag IA</Text>
          <Text style={styles.tagline}>
            Diagnóstico inteligente de{"\n"}doenças do cafeeiro
          </Text>
        </View>

        {/* Feature Pills */}
        <View style={styles.features}>
          <FeaturePill icon="🔬" text="Análise por IA" />
          <FeaturePill icon="⚡" text="Resultado em segundos" />
          <FeaturePill icon="🌿" text="Recomendações agronômicas" />
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
            ]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Entrar com Manus</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Acesso seguro via OAuth · Seus dados estão protegidos
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillIcon}>{icon}</Text>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A3A1A",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bgTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#1A3A1A",
  },
  bgBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#0F2410",
  },
  bgCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(46, 125, 50, 0.15)",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 32,
    paddingVertical: 60,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    gap: 16,
    paddingTop: 40,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: 110,
    height: 110,
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 24,
  },
  features: {
    width: "100%",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillIcon: {
    fontSize: 22,
  },
  pillText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  ctaSection: {
    width: "100%",
    gap: 14,
    paddingBottom: 20,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
    letterSpacing: 0.2,
  },
  disclaimer: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: 18,
  },
});
