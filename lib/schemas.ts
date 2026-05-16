/**
 * Zod schemas for runtime type validation
 * Ensures data integrity and type safety at runtime
 */

import { z } from 'zod';
import { DISEASES, DISEASE_SEVERITY } from '@/constants/diseases';

/**
 * User schema
 */
export const UserSchema = z.object({
  id: z.number().positive('User ID must be positive'),
  openId: z.string().min(1, 'OpenID cannot be empty'),
  name: z.string().nullable().optional(),
  email: z.string().email('Invalid email format').nullable().optional(),
  loginMethod: z.string().nullable().optional(),
  lastSignedIn: z.string().datetime('Invalid datetime format'),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Diagnosis schema for leaf analysis results
 */
export const DiagnosisSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  imageUrl: z.string().url('Invalid image URL'),
  disease: z.enum([
    DISEASES.FERRUGEM,
    DISEASES.CERCOSPORIOSE,
    DISEASES.PHOMA,
    DISEASES.MANCHA_AUREOLADA,
    DISEASES.SAUDAVEL,
  ]),
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
  riskLevel: z.enum([DISEASE_SEVERITY.LOW, DISEASE_SEVERITY.MEDIUM, DISEASE_SEVERITY.HIGH]),
  description: z.string().min(1, 'Description cannot be empty'),
  recommendations: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Diagnosis = z.infer<typeof DiagnosisSchema>;

/**
 * Create diagnosis input schema (for API requests)
 */
export const CreateDiagnosisInputSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  disease: z.string(),
  confidence: z.number().min(0).max(1),
  riskLevel: z.string(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export type CreateDiagnosisInput = z.infer<typeof CreateDiagnosisInputSchema>;

/**
 * AI Analysis response schema
 */
export const AIAnalysisResponseSchema = z.object({
  disease: z.string(),
  diseaseSlug: z.string(),
  confidence: z.number(),
  riskLevel: z.string(),
  isHealthy: z.boolean(),
  description: z.string(),
});

export type AIAnalysisResponse = z.infer<typeof AIAnalysisResponseSchema>;

/**
 * OAuth token response schema
 */
export const OAuthTokenResponseSchema = z.object({
  app_session_id: z.string().min(1),
  expires_in: z.number().int().positive().optional(),
  user: UserSchema.optional(),
});

export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponseSchema>;

/**
 * API error response schema
 */
export const APIErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  statusCode: z.number().int().optional(),
  details: z.record(z.string(), z.any()).optional(),
});

export type APIErrorResponse = z.infer<typeof APIErrorResponseSchema>;

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: PaginationSchema,
  });

/**
 * User statistics schema
 */
export const UserStatisticsSchema = z.object({
  totalDiagnoses: z.number().nonnegative(),
  healthyCount: z.number().nonnegative(),
  diseaseCount: z.number().nonnegative(),
  lastDiagnosisDate: z.string().datetime().nullable(),
  riskDistribution: z.record(
    z.enum([DISEASE_SEVERITY.LOW, DISEASE_SEVERITY.MEDIUM, DISEASE_SEVERITY.HIGH]),
    z.number().nonnegative(),
  ),
});

export type UserStatistics = z.infer<typeof UserStatisticsSchema>;

/**
 * Validation helper functions
 */
export const validators = {
  /**
   * Validate user data
   */
  validateUser: (data: unknown) => UserSchema.parse(data),

  /**
   * Safely validate user data (returns null if invalid)
   */
  validateUserSafe: (data: unknown) => UserSchema.safeParse(data),

  /**
   * Validate diagnosis data
   */
  validateDiagnosis: (data: unknown) => DiagnosisSchema.parse(data),

  /**
   * Safely validate diagnosis data
   */
  validateDiagnosisSafe: (data: unknown) => DiagnosisSchema.safeParse(data),

  /**
   * Validate AI analysis response
   */
  validateAIResponse: (data: unknown) => AIAnalysisResponseSchema.parse(data),

  /**
   * Safely validate AI analysis response
   */
  validateAIResponseSafe: (data: unknown) => AIAnalysisResponseSchema.safeParse(data),

  /**
   * Validate OAuth token response
   */
  validateOAuthResponse: (data: unknown) => OAuthTokenResponseSchema.parse(data),

  /**
   * Safely validate OAuth token response
   */
  validateOAuthResponseSafe: (data: unknown) => OAuthTokenResponseSchema.safeParse(data),
};

/**
 * Export for external use
 */
export default validators;
