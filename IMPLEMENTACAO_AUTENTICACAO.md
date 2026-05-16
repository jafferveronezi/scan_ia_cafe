# 🔐 Guia de Implementação - Autenticação Melhorada

## Visão Geral

Este guia descreve como implementar o sistema de autenticação melhorado no projeto. O novo sistema inclui:

- ✅ **Gerenciamento de token** com expiração e renovação automática
- ✅ **Tratamento de erros** estruturado e específico
- ✅ **Retry automático** com backoff exponencial
- ✅ **Session timeout** e rastreamento de inatividade
- ✅ **Logging estruturado** para debugging
- ✅ **Type safety** com validação runtime

---

## 📁 Arquivos Criados

```
lib/_core/
  ├── errors.ts              ← Tipos de erro customizados
  ├── logger.ts              ← Sistema de logging
  ├── auth-service.ts        ← Serviço centralizado de autenticação
  └── api-enhanced.ts        ← API client com retry e tratamento de erros

hooks/
  └── use-auth-refresh.ts    ← Hook para renovação automática de token

constants/
  └── auth.ts                ← Constantes de autenticação
```

---

## 🚀 Plano de Integração

### Fase 1: Backup e Preparação
```bash
# 1. Fazer backup dos arquivos atuais
cp lib/_core/auth.ts lib/_core/auth.backup.ts
cp lib/_core/api.ts lib/_core/api.backup.ts
cp hooks/use-auth.ts hooks/use-auth.backup.ts
```

### Fase 2: Manutenção da Compatibilidade (Recomendado)
**NÃO REMOVA** os arquivos antigos (`auth.ts`, `api.ts`). Mantenha para compatibilidade enquanto migra.

**Estratégia:**
1. Novos componentes usam `auth-service.ts` e `api-enhanced.ts`
2. Componentes antigos continuam usando `auth.ts` e `api.ts`
3. Gradualmente migre componentes antigos
4. Após testar completamente, remova os antigos

---

## 📋 Checklist de Implementação

### ✅ Passo 1: Verificar Dependências
```bash
# Confirmar que as dependências estão instaladas
pnpm list expo-secure-store
pnpm list react-native
```

### ✅ Passo 2: Atualizar `app/_layout.tsx`
Adicione o hook de refresh automático ao layout raiz:

```tsx
import { useAuthRefresh } from '@/hooks/use-auth-refresh';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  // Configure refresh automático e timeout
  useAuthRefresh({
    onRefreshFailed: () => {
      // Força logout se refresh falhar
      router.replace('/(auth)/login');
    },
    onSessionExpired: () => {
      // Logout automático por inatividade
      router.replace('/(auth)/login');
    },
    trackActivity: true, // Rastreia cliques/toques do usuário
  });

  return (
    // ... resto do layout
  );
}
```

### ✅ Passo 3: Atualizar `app/(auth)/login.tsx`
```tsx
import { exchangeOAuthCode } from '@/lib/_core/api-enhanced';
import { authService } from '@/lib/_core/auth-service';
import { logger } from '@/lib/_core/logger';
import { AuthError } from '@/lib/_core/errors';

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOAuthCallback = async (code: string, state: string) => {
    setLoading(true);
    setError(null);

    try {
      const { sessionToken, expiresIn, user } = await exchangeOAuthCode(code, state);

      // Armazenar token e user info
      await authService.setSessionToken(sessionToken, expiresIn);
      await authService.setUserInfo(user);

      logger.info('auth', 'Login successful', { userId: user.id });

      // Navigate to home
      router.replace('/(tabs)');
    } catch (err) {
      logger.error('auth', 'Login failed', err);

      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... UI
    {error && <ErrorBanner message={error} />}
  );
}
```

### ✅ Passo 4: Atualizar `hooks/use-auth.ts`
Modernize o hook existente para usar o novo serviço:

```tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { authService } from '@/lib/_core/auth-service';
import { getMe } from '@/lib/_core/api-enhanced';
import { logger } from '@/lib/_core/logger';

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar novo serviço
      const userInfo = await authService.getUserInfo();

      if (!userInfo) {
        // Se web, tentar buscar da API
        if (Platform.OS === 'web') {
          const apiUser = await getMe();
          if (apiUser) {
            await authService.setUserInfo(apiUser);
            setUser(apiUser);
            return;
          }
        }

        setUser(null);
        return;
      }

      setUser(userInfo);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user');
      logger.error('auth', 'fetchUser failed', error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logout(); // API call
    } catch (err) {
      logger.error('auth', 'Logout failed', err);
    } finally {
      await authService.clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchUser();
    }
  }, [autoFetch, fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    fetchUser,
    logout,
  };
}
```

### ✅ Passo 5: Adicionar Error Boundary
```tsx
// app/(auth)/_layout.tsx
import { ErrorBoundary } from '@react-native-community/hooks';

export default function AuthLayout() {
  return (
    <ErrorBoundary
      onError={(error) => {
        logger.error('auth', 'Error in auth layout', error);
      }}
    >
      <Stack>
        <Stack.Screen name="login" />
      </Stack>
    </ErrorBoundary>
  );
}
```

### ✅ Passo 6: Atualizar Banco de Dados (Opcional mas Recomendado)

```sql
-- Adicionar tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  refresh_token_hash TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
```

---

## 🧪 Testando a Implementação

### Teste 1: Login e Token Storage
```typescript
// Verificar se token está sendo armazenado
const token = await authService.getSessionToken();
expect(token).toBeDefined();
```

### Teste 2: Retry Automático
```typescript
// Simular falha de rede e verificar retry
const result = await apiCall('/api/test', {}, {
  maxRetries: 2,
});
```

### Teste 3: Session Timeout
```typescript
// Verificar inatividade
await authService.updateLastActivity();
// ... aguardar 30 minutos
const isInactive = await authService.checkInactivity();
expect(isInactive).toBe(true);
```

### Teste 4: Token Refresh
```typescript
// Chamar refresh manualmente
const refreshed = await refreshAuthToken();
expect(refreshed).toBeDefined();
```

---

## 📊 Monitoramento e Logging

### Ver todos os logs
```typescript
import { logger } from '@/lib/_core/logger';

// Recuperar logs
const allLogs = logger.getLogs();
const authLogs = logger.getLogs({ module: 'auth' });
const errors = logger.getLogs({ level: 'error' });

console.table(errors);
```

### Exportar logs para debugg
```typescript
export function exportLogs() {
  const logs = logger.getLogs();
  const json = JSON.stringify(logs, null, 2);
  // Salvar em arquivo ou enviar para servidor
}
```

---

## 🔒 Checklist de Segurança

- [ ] Tokens armazenados apenas em SecureStore (nativo)
- [ ] Cookies com HttpOnly flag (web)
- [ ] Validação de estado OAuth
- [ ] CSRF tokens implementados
- [ ] Rate limiting de login (backend)
- [ ] Token refresh rotation (backend)
- [ ] Logout limpa todos os dados sensíveis
- [ ] Refresh token armazenado separadamente
- [ ] Timeout automático por inatividade
- [ ] Validação de User-Agent (opcional)

---

## 🚨 Troubleshooting

### Problema: Token expirado inesperadamente
**Solução:**
1. Verifique o tempo do servidor vs. cliente
2. Aumente `SESSION_TIMEOUTS.REFRESH_THRESHOLD`
3. Adicione logs para rastrear renovações

### Problema: Retry infinito
**Solução:**
1. Reduza `RETRY_CONFIG.MAX_RETRIES`
2. Verifique se o endpoint retorna 5xx
3. Implemente circuit breaker

### Problema: Session não persiste após app restart
**Solução:**
1. Verifique se `setSessionToken` é chamado
2. Confirme SecureStore está funcionando
3. Verifique permissões de storage

### Problema: Logout não limpa dados
**Solução:**
```typescript
// Garantir limpeza completa
await logout(); // API call
await authService.clearSession(); // Limpar storage
setUser(null); // Limpar estado
```

---

## 📚 Referências

- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [OAuth 2.0](https://oauth.net/2/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 🎯 Próximos Passos

1. **Biometric Authentication** - Adicionar Face ID / Fingerprint
2. **Two-Factor Authentication** - SMS ou TOTP
3. **Social Login** - Google, Apple, GitHub
4. **Account Recovery** - Email ou phone verification
5. **Security Audit** - Teste de penetração

