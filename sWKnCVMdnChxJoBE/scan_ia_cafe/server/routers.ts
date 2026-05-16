import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM, type Message } from "./_core/llm";
import { storagePut } from "./storage";

// ─── Disease Knowledge Base ───────────────────────────────────────────────────

const DISEASE_RECOMMENDATIONS: Record<string, string[]> = {
  ferrugem: [
    "Aplicar fungicidas à base de cobre ou triazóis",
    "Realizar podas de galhos afetados",
    "Melhorar a ventilação entre plantas",
    "Monitorar a umidade do cafezal",
    "Evitar irrigação por aspersão nas horas quentes",
  ],
  cercosporiose: [
    "Aplicar fungicidas preventivos no início da estação chuvosa",
    "Realizar adubação equilibrada com potássio",
    "Remover e destruir folhas infectadas",
    "Evitar excesso de sombreamento",
    "Manter o pH do solo entre 6,0 e 6,5",
  ],
  phoma: [
    "Aplicar fungicidas sistêmicos (benzimidazóis)",
    "Realizar podas sanitárias rigorosas",
    "Evitar ferimentos nas plantas durante tratos culturais",
    "Melhorar a drenagem do solo",
    "Realizar análise foliar para corrigir deficiências nutricionais",
  ],
  mancha_aureolada: [
    "Aplicar bactericidas à base de cobre",
    "Evitar irrigação por aspersão",
    "Realizar podas de ramos afetados",
    "Desinfetar ferramentas de poda",
    "Monitorar condições climáticas favoráveis à doença",
  ],
  saudavel: [
    "Manter adubação equilibrada conforme análise de solo",
    "Realizar monitoramento periódico das plantas",
    "Manter o controle preventivo de pragas e doenças",
    "Garantir irrigação adequada",
    "Realizar podas de formação e manutenção regularmente",
  ],
};

// ─── AI Analysis Function ─────────────────────────────────────────────────────

async function analyzeLeafImage(imageUrl: string) {
  const systemPrompt = `Você é um especialista em fitopatologia do cafeeiro com 20 anos de experiência. 
Analise a imagem de uma folha de café e identifique se há presença de doenças.

As doenças que você pode identificar são:
1. Ferrugem do cafeeiro (Hemileia vastatrix) - manchas amareladas/alaranjadas na face inferior
2. Cercosporiose (Cercospora coffeicola) - manchas circulares com halo amarelo
3. Phoma (Phoma tarda) - manchas escuras com bordas irregulares
4. Mancha aureolada (Pseudomonas syringae) - manchas com halo amarelo brilhante
5. Folha saudável - sem sinais de doença

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "disease": "nome completo da doença em português",
  "diseaseSlug": "ferrugem|cercosporiose|phoma|mancha_aureolada|saudavel",
  "confidence": 0.92,
  "riskLevel": "low|medium|high",
  "isHealthy": false,
  "description": "descrição detalhada do diagnóstico em 2-3 frases"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt } as Message,
        {
          role: "user",
          content: [
            {
              type: "text" as const,
              text: "Analise esta folha de café e forneça o diagnóstico:",
            },
            {
              type: "image_url" as const,
              image_url: { url: imageUrl, detail: "high" as const },
            },
          ],
        } as Message,
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error("Empty LLM response");
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

    const parsed = JSON.parse(content);

    // Validate and sanitize
    const validSlugs = ["ferrugem", "cercosporiose", "phoma", "mancha_aureolada", "saudavel"];
    const slug = validSlugs.includes(parsed.diseaseSlug) ? parsed.diseaseSlug : "saudavel";
    const confidence = Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0.7));
    const riskLevel = ["low", "medium", "high"].includes(parsed.riskLevel)
      ? parsed.riskLevel
      : "medium";

    return {
      disease: parsed.disease || "Folha Saudável",
      diseaseSlug: slug,
      confidence,
      riskLevel: riskLevel as "low" | "medium" | "high",
      isHealthy: slug === "saudavel",
      description: parsed.description || "Análise concluída com sucesso.",
      recommendations: DISEASE_RECOMMENDATIONS[slug] || DISEASE_RECOMMENDATIONS["saudavel"],
    };
  } catch (error) {
    console.error("[AI Analysis] Error:", error);
    // Fallback response
    return {
      disease: "Análise Indisponível",
      diseaseSlug: "saudavel",
      confidence: 0.5,
      riskLevel: "low" as const,
      isHealthy: true,
      description: "Não foi possível analisar a imagem. Por favor, tente novamente com uma foto mais nítida.",
      recommendations: ["Tire uma foto com boa iluminação", "Certifique-se de que a folha está em foco"],
    };
  }
}

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok", app: "CaféDiag IA" })),

  diagnoses: router({
    /**
     * Analyze a leaf image using AI and save the diagnosis
     */
    analyze: protectedProcedure
      .input(
        z.object({
          imageBase64: z.string().min(1),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 1. Upload image to storage
        const fileName = `diagnoses/${ctx.user.id}/${Date.now()}.jpg`;
        const imageBuffer = Buffer.from(input.imageBase64, "base64");

        const { key, url } = await storagePut(fileName, imageBuffer, input.mimeType);

        // Build full URL for LLM analysis
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const fullImageUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

        // 2. Analyze with AI
        const analysis = await analyzeLeafImage(fullImageUrl);

        // 3. Save to database
        const diagnosisId = await db.createDiagnosis({
          userId: ctx.user.id,
          imageUrl: url,
          imageKey: key,
          disease: analysis.disease,
          diseaseSlug: analysis.diseaseSlug,
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel,
          isHealthy: analysis.isHealthy,
          description: analysis.description,
          recommendations: JSON.stringify(analysis.recommendations),
        });

        return {
          id: diagnosisId,
          ...analysis,
          imageUrl: url,
          createdAt: new Date().toISOString(),
        };
      }),

    /**
     * List all diagnoses for the authenticated user
     */
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const items = await db.getDiagnosesByUser(ctx.user.id, input?.limit ?? 50);
        return items.map((d) => ({
          ...d,
          recommendations: d.recommendations ? JSON.parse(d.recommendations) : [],
        }));
      }),

    /**
     * Get a single diagnosis by ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const diagnosis = await db.getDiagnosisById(input.id, ctx.user.id);
        if (!diagnosis) return null;
        return {
          ...diagnosis,
          recommendations: diagnosis.recommendations
            ? JSON.parse(diagnosis.recommendations)
            : [],
        };
      }),

    /**
     * Get user statistics
     */
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserDiagnosisStats(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
