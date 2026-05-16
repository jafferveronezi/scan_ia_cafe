# 🛠️ Melhorias Gerais de Código

## 1. Estrutura de Projeto

### Reorganizar pastas por feature
```
/src
  /features
    /auth
      /components
        - LoginScreen.tsx
        - SplashScreen.tsx
      /hooks
        - useAuth.ts
        - useAuthRefresh.ts
      /services
        - authService.ts
      /types
        - auth.types.ts
    /diagnosis
      /components
      /hooks
      /services
      /types
    /profile
      /components
      /hooks
      /services
      /types
  /shared
    /components
    /hooks
    /utils
    /types
  /core
    /api
    /logger
    /errors
```

---

## 2. Melhorias de Performance

### 2.1 React Query / TanStack Query
**Implementar cache e invalidação automática:**

```tsx
// hooks/use-diagnoses.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { getDiagnoses, createDiagnosis } from '@/api/diagnoses';

export function useDiagnoses() {
  return useQuery({
    queryKey: ['diagnoses'],
    queryFn: getDiagnoses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDiagnosis,
    onSuccess: () => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
    },
  });
}
```

### 2.2 Image Optimization
```tsx
// Usar cached images
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  cachePolicy="memory-disk"
  placeholder={blurhash} // Progressive loading
/>
```

### 2.3 Lazy Loading
```tsx
// Usar React.lazy para code-splitting
const ProfileScreen = React.lazy(() => import('./ProfileScreen'));

<Suspense fallback={<LoadingSpinner />}>
  <ProfileScreen />
</Suspense>
```

---

## 3. Qualidade de Código

### 3.1 Type Safety - Zod Schema Validation
```typescript
// schemas/auth.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number().positive(),
  openId: z.string().min(1),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  loginMethod: z.string().nullable(),
  lastSignedIn: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Validar em runtime
const result = UserSchema.safeParse(userData);
if (!result.success) {
  throw new ValidationError(result.error.message);
}
```

### 3.2 Constants Centralizados
```typescript
// constants/diseases.ts
export const DISEASE_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const DISEASE_CONFIDENCE = {
  MIN: 0.7,
  MEDIUM: 0.85,
  HIGH: 0.95,
} as const;
```

### 3.3 Melhor Tratamento de Erros
```tsx
// Criar error boundary global
export function ErrorFallback({ error, resetError }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops! Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Button
        title="Try again"
        onPress={resetError}
      />
    </View>
  );
}
```

---

## 4. Testing

### 4.1 Estrutura de Testes
```
/tests
  /unit
    - auth.test.ts
    - api.test.ts
    - utils.test.ts
  /integration
    - auth-flow.test.ts
    - diagnosis-flow.test.ts
  /e2e
    - login.e2e.test.ts
    - diagnosis.e2e.test.ts
```

### 4.2 Test Utilities
```typescript
// tests/setup.ts
import { renderHook } from '@testing-library/react-native';

export function renderTestHook<T>(hook: () => T) {
  const { result } = renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
  });
  return result;
}
```

---

## 5. Segurança

### 5.1 Validação de Input
```tsx
// Validar todas as inputs
const nameSchema = z.string().min(2).max(100);

function handleNameChange(text: string) {
  try {
    nameSchema.parse(text);
    setName(text);
  } catch (error) {
    setNameError('Invalid name');
  }
}
```

### 5.2 CORS e Headers
```typescript
// server/middleware/security.ts
export function securityHeaders(req: Request, res: Response, next: () => void) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}
```

### 5.3 Rate Limiting
```typescript
// server/middleware/rateLimit.ts
import { rateLimit } from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts',
});
```

---

## 6. Documentação

### 6.1 JSDoc Comments
```typescript
/**
 * Authenticate user with OAuth
 * @param code - OAuth authorization code
 * @param state - CSRF state token
 * @returns Promise with session token and user info
 * @throws AuthError if authentication fails
 * 
 * @example
 * ```ts
 * const { sessionToken, user } = await authenticateOAuth(code, state);
 * ```
 */
export async function authenticateOAuth(
  code: string,
  state: string,
): Promise<{ sessionToken: string; user: User }> {
  // ...
}
```

### 6.2 README por Feature
```markdown
# Authentication Module

## Overview
Gerencia autenticação OAuth e gerenciamento de sessões.

## Usage
...

## API
...

## Security
...
```

---

## 7. DevOps e Deployment

### 7.1 Environment Management
```bash
# .env.local (development)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_OAUTH_PORTAL_URL=http://localhost:5000

# .env.production
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
EXPO_PUBLIC_OAUTH_PORTAL_URL=https://auth.example.com
```

### 7.2 CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm type-check
```

---

## 8. Monitoramento

### 8.1 Erro Tracking
```typescript
// services/errorTracking.ts
import * as Sentry from "@sentry/react-native";

export function initErrorTracking() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}

// Usar em error boundary
Sentry.captureException(error);
```

### 8.2 Analytics
```typescript
// services/analytics.ts
export function trackEvent(event: string, data?: Record<string, any>) {
  // Send to analytics service
  analytics.track(event, data);
  logger.info('analytics', `Event: ${event}`, data);
}
```

---

## 9. Accessibility

### 9.1 Accessible Components
```tsx
<Pressable
  accessible
  accessibilityLabel="Log in with OAuth"
  accessibilityHint="Opens authentication screen"
  onPress={handleLogin}
>
  <Text>Log In</Text>
</Pressable>
```

### 9.2 Color Contrast
- Manter proporção 4.5:1 para texto normal
- 3:1 para texto grande (18pt+)
- Não depender apenas de cores

---

## 10. Performance Checklist

- [ ] Code splitting implementado
- [ ] Images otimizadas (WebP, lazy loading)
- [ ] Bundles analisados com `webpack-bundle-analyzer`
- [ ] Render performance medida com React DevTools
- [ ] Network waterfall otimizado
- [ ] Caching strategy implementada
- [ ] Pagination ou virtualization para listas longas
- [ ] Debounce/throttle em event handlers
- [ ] Memory leaks identificados e fixados

---

## Próximas Etapas

1. **Refactoring Imediato:**
   - Implementar Zod schema validation
   - Centralizar constantes
   - Adicionar JSDoc

2. **Curto Prazo (1-2 sprints):**
   - Implementar React Query
   - Adicionar error boundaries
   - Melhorar logging

3. **Médio Prazo (1-2 meses):**
   - Testes abrangentes
   - Performance monitoring
   - CI/CD pipeline

4. **Longo Prazo (roadmap):**
   - Micro-frontends
   - PWA features
   - Offline support

