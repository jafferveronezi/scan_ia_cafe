import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

const ANALYSIS_MESSAGES = [
  "Analisando padrões da folha...",
  "Comparando com banco de dados agrícola...",
  "Identificando características visuais...",
  "Processando com inteligência artificial...",
  "Calculando probabilidades...",
  "Gerando recomendações agronômicas...",
  "Finalizando diagnóstico...",
];

export default function ProcessingScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri: string; imageBase64: string }>();

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const analyzeMutation = trpc.diagnoses.analyze.useMutation();

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Rotate animation for AI icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 2000);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: false,
    }).start();

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 1000);

    // Start analysis
    startAnalysis();

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const startAnalysis = async () => {
    if (!params.imageBase64) {
      setHasError(true);
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync({
        imageBase64: params.imageBase64,
        mimeType: "image/jpeg",
      });

      setProgress(100);

      // Small delay before navigating to result
      setTimeout(() => {
        router.replace({
          pathname: "/result/[id]",
          params: { id: String(result.id) },
        });
      }, 800);
    } catch (error) {
      console.error("Analysis error:", error);
      setHasError(true);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (hasError) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>
            Erro na análise
          </Text>
          <Text style={[styles.errorText, { color: colors.muted }]}>
            Não foi possível analisar a imagem. Verifique sua conexão e tente novamente.
          </Text>
          <Text
            style={[styles.errorRetry, { color: colors.primary }]}
            onPress={() => router.back()}
          >
            Tentar novamente
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Image preview */}
        {params.imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: params.imageUri }}
              style={styles.imagePreview}
              contentFit="cover"
            />
            <View style={[styles.imageOverlay, { backgroundColor: "rgba(46,125,50,0.3)" }]} />
          </View>
        )}

        {/* AI Animation */}
        <View style={styles.aiSection}>
          <Animated.View
            style={[
              styles.aiIconOuter,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={[styles.aiIconInner, { backgroundColor: `${colors.primary}20` }]}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Text style={styles.aiEmoji}>🔬</Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.orbitDot,
                {
                  backgroundColor: colors.primary,
                  opacity: 0.3 + i * 0.2,
                  transform: [
                    { rotate: `${i * 120}deg` },
                    { translateX: 60 },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Status Text */}
        <View style={styles.statusSection}>
          <Text style={[styles.statusTitle, { color: colors.foreground }]}>
            Analisando com IA
          </Text>
          <Text style={[styles.statusMessage, { color: colors.muted }]}>
            {ANALYSIS_MESSAGES[messageIndex]}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Steps */}
        <View style={[styles.stepsCard, { backgroundColor: colors.surface }]}>
          {[
            { icon: "🖼️", text: "Pré-processamento da imagem", done: progress > 20 },
            { icon: "🧠", text: "Análise por rede neural", done: progress > 50 },
            { icon: "📊", text: "Cálculo de probabilidades", done: progress > 75 },
            { icon: "📋", text: "Geração de recomendações", done: progress > 90 },
          ].map((step, i) => (
            <View key={i} style={styles.stepItem}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text
                style={[
                  styles.stepText,
                  { color: step.done ? colors.primary : colors.muted },
                ]}
              >
                {step.text}
              </Text>
              {step.done && (
                <Text style={[styles.stepCheck, { color: colors.primary }]}>✓</Text>
              )}
            </View>
          ))}
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
    justifyContent: "center",
  },

  imagePreviewContainer: {
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  aiSection: {
    alignItems: "center",
    justifyContent: "center",
    height: 140,
    position: "relative",
  },
  aiIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  aiIconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  aiEmoji: { fontSize: 44 },
  orbitDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  statusSection: {
    alignItems: "center",
    gap: 8,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  statusMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  progressSection: {
    gap: 8,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
  },

  stepsCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepIcon: { fontSize: 18 },
  stepText: { flex: 1, fontSize: 13, fontWeight: "500" },
  stepCheck: { fontSize: 16, fontWeight: "700" },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  errorEmoji: { fontSize: 56 },
  errorTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  errorText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  errorRetry: { fontSize: 16, fontWeight: "600", marginTop: 8 },
});
