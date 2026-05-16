// Shared types between frontend and backend

export type RiskLevel = "low" | "medium" | "high";
export type DiseaseSlug =
  | "ferrugem"
  | "cercosporiose"
  | "phoma"
  | "mancha_aureolada"
  | "saudavel";

export interface DiagnosisResult {
  id: number;
  disease: string;
  diseaseSlug: DiseaseSlug;
  confidence: number;
  riskLevel: RiskLevel;
  isHealthy: boolean;
  description: string;
  recommendations: string[];
  imageUrl: string;
  createdAt: string;
}

export interface UserStats {
  total: number;
  healthy: number;
  diseased: number;
}

export const DISEASE_LABELS: Record<DiseaseSlug, string> = {
  ferrugem: "Ferrugem do Cafeeiro",
  cercosporiose: "Cercosporiose",
  phoma: "Phoma",
  mancha_aureolada: "Mancha Aureolada",
  saudavel: "Folha Saudável",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};
