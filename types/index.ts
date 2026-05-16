/**
 * Central type definitions for the application
 * Exported types should be used across the codebase
 */

/**
 * HTTP Request/Response types
 */
export interface ApiRequest<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: T;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Diagnosis types
 */
export interface DiagnosisResult {
  id: number;
  userId: number;
  imageUrl: string;
  disease: string;
  diseaseLabel: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagnosisStats {
  total: number;
  healthy: number;
  diseased: number;
  byDisease: Record<string, number>;
  byRisk: Record<'low' | 'medium' | 'high', number>;
}

/**
 * User types
 */
export interface UserProfile {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  avatar?: string;
  loginMethod: string | null;
  createdAt: Date;
  lastSignedIn: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US';
  notifications: boolean;
  emailUpdates: boolean;
}

/**
 * Error types
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T = any> {
  state: LoadingState;
  data?: T;
  error?: string;
  lastUpdated?: Date;
}

/**
 * Form types
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: (value: any) => string | null;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Theme types
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  colors: ThemeColors;
  typography: {
    fontSizeXs: number;
    fontSizeSm: number;
    fontSizeBase: number;
    fontSizeLg: number;
    fontSizeXl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/**
 * Analytics types
 */
export interface AnalyticsEvent {
  name: string;
  category: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
  userId?: number;
}

/**
 * Permission types
 */
export enum Permission {
  CREATE_DIAGNOSIS = 'create:diagnosis',
  READ_DIAGNOSIS = 'read:diagnosis',
  UPDATE_DIAGNOSIS = 'update:diagnosis',
  DELETE_DIAGNOSIS = 'delete:diagnosis',
  VIEW_STATS = 'view:stats',
  EXPORT_DATA = 'export:data',
}

export interface RolePermissions {
  role: 'user' | 'admin' | 'moderator';
  permissions: Permission[];
}

/**
 * Notification types
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Filter types
 */
export interface FilterOptions {
  disease?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  dateFrom?: Date;
  dateTo?: Date;
  confidenceMin?: number;
  confidenceMax?: number;
}

/**
 * Sort types
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Image types
 */
export interface ImageData {
  uri: string;
  width: number;
  height: number;
  size: number; // bytes
  mimeType: string;
  timestamp: Date;
}

/**
 * Cache types
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

export interface CacheConfig {
  ttl: number; // milliseconds
  maxSize?: number;
}
