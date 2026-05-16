# Melhorias Técnicas - Autenticação e Código

## 🔐 Melhorias de Autenticação

### 1. **Refresh Token Implementation**
**Problema Atual:** Tokens não são renovados automaticamente
**Solução:** Implementar mecanismo de refresh automático
- Adicionar `refreshToken` junto com `sessionToken`
- Implementar interceptador que detecta token expirado
- Renovar token automaticamente antes da expiração

### 2. **Error Handling Robusto**
**Problema Atual:** Erros genéricos sem classificação
**Solução:** 
- Implementar classe customizada `AuthError` com tipos específicos
- Diferenciar entre: autenticação inválida, token expirado, permissões insuficientes
- Tratamento específico por tipo de erro

### 3. **Type Safety**
**Problema Atual:** Alguns tipos incompletos ou `any`
**Solução:**
- Criar tipos Zod para validação runtime
- Melhorar tipagem do `User` com mais informações
- Adicionar status de permissões

### 4. **Session Timeout**
**Problema Atual:** Não há timeout de sessão
**Solução:**
- Implementar heartbeat para manter sessão ativa
- Logout automático após inatividade
- Indicador visual de timeout iminente

### 5. **Biometric Authentication**
**Sugestão:** Para aplicações nativas
- Suportar Face ID (iOS) / Fingerprint (Android)
- Como alternativa ao OAuth para velocidade

---

## 🛠️ Melhorias Gerais de Código

### 1. **Constants Organizados**
- [x] Criar `constants/auth.ts` com valores de timeout, storage keys, etc.
- Consolidar em um único lugar

### 2. **Logging Estruturado**
- Remover `console.log` diretos
- Implementar sistema de logging com níveis (debug, info, warn, error)
- Exemplo: `logger.debug("[auth]", "token received")`

### 3. **Error Boundaries**
- Adicionar error boundary em `(auth)` layout
- Melhorar tratamento de erros na tela de login

### 4. **Request Interceptors**
- Centralizar lógica de autenticação em interceptor
- Retry automático com backoff exponencial

### 5. **Tests**
- Adicionar testes para fluxo de autenticação
- Testar renovação de token
- Testar logout

### 6. **Database Schema**
- Adicionar tabela `sessions` para rastrear sessões ativas
- Adicionar coluna `lastActivity` para timeout
- Adicionar `loginAttempts` para prevent brute force

### 7. **Security Headers**
- Implementar CORS correto
- Adicionar rate limiting no backend
- Implementar CSRF protection

---

## 📋 Prioridades

| Prioridade | Item | Impacto |
|------------|------|--------|
| 🔴 Alta   | Refresh Token | Evita logout inesperado |
| 🔴 Alta   | Error Handling | Melhor UX |
| 🟡 Média  | Type Safety | Qualidade de código |
| 🟡 Média  | Session Timeout | Segurança |
| 🟢 Baixa  | Biometric Auth | Conveniência |

---

## 📁 Arquivos a Criar/Modificar

### Criar:
1. `lib/_core/auth-service.ts` - Serviço centralizado de auth
2. `lib/_core/errors.ts` - Tipos de erro customizados
3. `constants/auth.ts` - Constantes de autenticação
4. `lib/_core/logger.ts` - Sistema de logging
5. `server/_core/auth.ts` - Lógica backend de auth
6. `hooks/use-auth-refresh.ts` - Hook para refresh automático
7. `tests/auth.test.ts` - Testes de autenticação

### Modificar:
1. `lib/_core/api.ts` - Adicionar interceptadores
2. `hooks/use-auth.ts` - Usar novo auth-service
3. `app/(auth)/login.tsx` - Melhor error handling
4. `drizzle/schema.ts` - Adicionar tabela de sessões

---

## 🔒 Requisitos de Segurança

- [ ] Tokens armazenados apenas em SecureStore (nativo)
- [ ] Cookies HttpOnly (web)
- [ ] CSRF tokens
- [ ] Rate limiting de login
- [ ] Validação de estado OAuth
- [ ] Refresh token rotation
- [ ] Logout de todos os dispositivos

