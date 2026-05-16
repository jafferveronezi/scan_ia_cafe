/**
 * Disease-related constants and configurations
 * Centralized source of truth for disease data
 */

export const DISEASES = {
  FERRUGEM: 'ferrugem',
  CERCOSPORIOSE: 'cercosporiose',
  PHOMA: 'phoma',
  MANCHA_AUREOLADA: 'mancha_aureolada',
  SAUDAVEL: 'saudavel',
} as const;

export const DISEASE_NAMES: Record<typeof DISEASES[keyof typeof DISEASES], string> = {
  ferrugem: 'Ferrugem do Cafeeiro',
  cercosporiose: 'Cercosporiose',
  phoma: 'Phoma',
  mancha_aureolada: 'Mancha Aureolada',
  saudavel: 'Folha Saudável',
} as const;

export const DISEASE_DESCRIPTIONS: Record<
  typeof DISEASES[keyof typeof DISEASES],
  string
> = {
  ferrugem:
    'Manchas alaranjadas na face inferior das folhas. A doença mais comum em cafezais.',
  cercosporiose: 'Manchas circulares com halo amarelo, podendo coalescir.',
  phoma: 'Manchas escuras com bordas irregulares, comumente em folhas mais velhas.',
  mancha_aureolada:
    'Manchas com halo amarelo brilhante, exigem controle rigoroso.',
  saudavel: 'Folha sem sinais visíveis de doença. Manutenção preventiva recomendada.',
} as const;

export const DISEASE_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const DISEASE_SEVERITY_COLORS: Record<
  typeof DISEASE_SEVERITY[keyof typeof DISEASE_SEVERITY],
  string
> = {
  low: '#2E7D32', // Green
  medium: '#F9A825', // Orange
  high: '#D32F2F', // Red
} as const;

export const CONFIDENCE_LEVELS = {
  LOW: 0.7,
  MEDIUM: 0.85,
  HIGH: 0.95,
} as const;

export const CONFIDENCE_LABELS: Record<number, string> = {
  0.7: 'Baixa',
  0.85: 'Média',
  0.95: 'Alta',
} as const;

export const DISEASE_RECOMMENDATIONS: Record<
  typeof DISEASES[keyof typeof DISEASES],
  string[]
> = {
  ferrugem: [
    'Aplicar fungicidas à base de cobre ou triazóis',
    'Realizar podas de galhos afetados',
    'Melhorar a ventilação entre plantas',
    'Monitorar a umidade do cafezal',
    'Evitar irrigação por aspersão nas horas quentes',
  ],
  cercosporiose: [
    'Aplicar fungicidas preventivos no início da estação chuvosa',
    'Realizar adubação equilibrada com potássio',
    'Remover e destruir folhas infectadas',
    'Evitar excesso de sombreamento',
    'Manter o pH do solo entre 6,0 e 6,5',
  ],
  phoma: [
    'Aplicar fungicidas sistêmicos (benzimidazóis)',
    'Realizar podas sanitárias rigorosas',
    'Evitar ferimentos nas plantas durante tratos culturais',
    'Melhorar a drenagem do solo',
    'Realizar análise foliar para corrigir deficiências nutricionais',
  ],
  mancha_aureolada: [
    'Aplicar bactericidas à base de cobre',
    'Evitar irrigação por aspersão',
    'Realizar podas de ramos afetados',
    'Desinficiscar ferramentas de poda',
    'Monitorar condições climáticas favoráveis à doença',
  ],
  saudavel: [
    'Manter adubação equilibrada conforme análise de solo',
    'Realizar monitoramento periódico das plantas',
    'Manter o controle preventivo de pragas e doenças',
    'Garantir irrigação adequada',
    'Realizar podas de formação e manutenção regularmente',
  ],
} as const;

export type DiseaseType = typeof DISEASES[keyof typeof DISEASES];
export type SeverityType = typeof DISEASE_SEVERITY[keyof typeof DISEASE_SEVERITY];
