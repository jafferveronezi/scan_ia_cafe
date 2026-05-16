# CaféDiag IA — Guia de Configuração Local

Bem-vindo ao **CaféDiag IA**, um aplicativo mobile de diagnóstico inteligente de doenças do café usando inteligência artificial. Este guia fornece instruções passo a passo para configurar e executar o projeto em seu ambiente local.

---

## Visão Geral do Projeto

O CaféDiag IA é um aplicativo fullstack construído com:

| Componente | Tecnologia |
|-----------|-----------|
| **Frontend Mobile** | React Native com Expo SDK 54 |
| **Frontend Web** | React 19 com Next.js (PWA) |
| **Backend** | Node.js com tRPC e Express |
| **Banco de Dados** | PostgreSQL com Drizzle ORM |
| **Autenticação** | OAuth via Manus |
| **IA/ML** | LLM multimodal para análise de imagens |
| **Armazenamento** | S3-compatible storage |

O aplicativo permite que produtores rurais fotografem folhas de café e recebam diagnósticos automáticos de doenças com recomendações agronômicas em tempo real.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Obrigatório

- **Node.js** (v18 ou superior) — [Download](https://nodejs.org/)
- **pnpm** (v9 ou superior) — `npm install -g pnpm`
- **Git** — [Download](https://git-scm.com/)
- **PostgreSQL** (v14 ou superior) — [Download](https://www.postgresql.org/download/)

### Opcional (para desenvolvimento mobile)

- **Expo CLI** — `npm install -g expo-cli`
- **Android Studio** (para emulador Android) — [Download](https://developer.android.com/studio)
- **Xcode** (para emulador iOS, apenas macOS) — [App Store](https://apps.apple.com/br/app/xcode/id497799835)

---

## Passo 1: Clonar o Repositório

```bash
git clone https://github.com/jafferveronezi/scan_ia_cafe.git
cd scan_ia_cafe
```

---

## Passo 2: Instalar Dependências

```bash
pnpm install
```

Este comando instalará todas as dependências do projeto, incluindo pacotes do frontend, backend e ferramentas de desenvolvimento.

---

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cafe_diagnostico"

# OAuth Manus (obtenha em https://manus.im)
EXPO_PUBLIC_OAUTH_PORTAL_URL="https://portal.manus.im"
EXPO_PUBLIC_OAUTH_SERVER_URL="https://api.manus.im"
EXPO_PUBLIC_APP_ID="seu-app-id-aqui"
EXPO_PUBLIC_OWNER_OPEN_ID="seu-owner-id-aqui"
EXPO_PUBLIC_OWNER_NAME="Seu Nome"
EXPO_PUBLIC_API_BASE_URL="http://localhost:3000"

# JWT (gere uma chave segura com: openssl rand -base64 32)
JWT_SECRET="sua-chave-jwt-segura-aqui"

# Node Environment
NODE_ENV="development"

# Storage (S3-compatible)
BUILT_IN_FORGE_API_URL="https://storage.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-storage-aqui"
```

### Gerando JWT_SECRET

Para gerar uma chave JWT segura:

```bash
openssl rand -base64 32
```

Copie a saída e cole no arquivo `.env.local`.

---

## Passo 4: Configurar Banco de Dados

### 4.1 Criar banco de dados PostgreSQL

```bash
createdb cafe_diagnostico
```

Ou via psql:

```bash
psql -U postgres
CREATE DATABASE cafe_diagnostico;
\q
```

### 4.2 Executar migrações

```bash
pnpm db:push
```

Este comando criará todas as tabelas necessárias (users, diagnoses) no banco de dados.

### 4.3 Verificar conexão

```bash
pnpm check
```

Se não houver erros, a configuração está correta.

---

## Passo 5: Executar o Projeto

### Opção A: Desenvolvimento Completo (Frontend + Backend)

```bash
pnpm dev
```

Este comando inicia:
- **Metro Bundler** (frontend) na porta `8081`
- **tRPC API Server** (backend) na porta `3000`

Você verá um QR code no terminal para abrir o app no Expo Go (mobile) ou acessar via navegador (web).

### Opção B: Apenas Frontend (com backend externo)

```bash
pnpm dev:metro
```

### Opção C: Apenas Backend

```bash
pnpm dev:server
```

---

## Passo 6: Acessar o Aplicativo

### No Navegador (Web)

Abra [http://localhost:8081](http://localhost:8081) no navegador.

### No Celular (iOS/Android)

1. Instale o aplicativo **Expo Go** na App Store ou Google Play
2. Abra o app e escaneie o QR code exibido no terminal
3. O app será carregado automaticamente

### Em Emulador

**Android:**
```bash
pnpm android
```

**iOS (apenas macOS):**
```bash
pnpm ios
```

---

## Fluxo de Uso

### 1. Login

- Clique em "Entrar com Manus"
- Você será redirecionado para o portal de autenticação
- Após login bem-sucedido, será redirecionado de volta ao app

### 2. Home

- Visualize diagnósticos recentes
- Veja estatísticas de folhas saudáveis vs. com doença
- Acesse ações rápidas

### 3. Fotografar Folha

- Clique em "Diagnosticar Folha"
- Use a câmera ou escolha da galeria
- Tire uma foto clara e bem iluminada da folha

### 4. Processamento IA

- O app enviará a imagem para análise
- A IA processará e identificará a doença (se houver)
- Você verá a confiança da análise em tempo real

### 5. Resultado

- Visualize o diagnóstico completo
- Veja recomendações agronômicas personalizadas
- Compartilhe o resultado ou salve no histórico

### 6. Histórico

- Acesse todos os diagnósticos anteriores
- Filtre por data ou tipo de doença
- Use pull-to-refresh para atualizar

### 7. Perfil

- Visualize estatísticas gerais
- Alterne entre tema claro e escuro
- Consulte a base de conhecimento de doenças
- Faça logout

---

## Estrutura do Projeto

```
scan_ia_cafe/
├── app/                          # Telas e rotas (Expo Router)
│   ├── (auth)/                   # Grupo de autenticação
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (tabs)/                   # Abas principais
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home
│   │   ├── history.tsx           # Histórico
│   │   └── profile.tsx           # Perfil
│   ├── capture.tsx               # Captura de imagem
│   ├── processing.tsx            # Processamento IA
│   ├── result/[id].tsx           # Resultado do diagnóstico
│   └── _layout.tsx               # Layout raiz
├── server/                       # Backend tRPC
│   ├── _core/                    # Núcleo do servidor
│   │   ├── index.ts              # Bootstrap Express
│   │   ├── trpc.ts               # Setup tRPC
│   │   ├── context.ts            # Contexto tRPC
│   │   ├── oauth.ts              # Rotas OAuth
│   │   ├── llm.ts                # Integração LLM
│   │   └── sdk.ts                # SDK de autenticação
│   ├── db.ts                     # Funções de banco de dados
│   ├── routers.ts                # Rotas tRPC (diagnoses, health)
│   └── storage.ts                # Upload para S3
├── drizzle/                      # Migrações e schema
│   ├── schema.ts                 # Definição de tabelas
│   └── migrations/               # Histórico de migrações
├── components/                   # Componentes React Native
├── hooks/                        # Custom hooks
├── lib/                          # Utilitários e providers
├── constants/                    # Constantes e temas
├── shared/                       # Tipos compartilhados
├── assets/                       # Imagens e ícones
├── tests/                        # Testes com Vitest
├── package.json                  # Dependências
├── app.config.ts                 # Configuração Expo
├── tailwind.config.js            # Configuração Tailwind
└── theme.config.js               # Paleta de cores
```

---

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia frontend + backend em desenvolvimento |
| `pnpm dev:metro` | Inicia apenas o Metro Bundler (frontend) |
| `pnpm dev:server` | Inicia apenas o servidor tRPC (backend) |
| `pnpm check` | Verifica erros TypeScript |
| `pnpm lint` | Executa ESLint |
| `pnpm format` | Formata código com Prettier |
| `pnpm test` | Executa testes com Vitest |
| `pnpm db:push` | Executa migrações do banco de dados |
| `pnpm build` | Constrói o backend para produção |
| `pnpm start` | Inicia o servidor em produção |
| `pnpm android` | Abre o app no emulador Android |
| `pnpm ios` | Abre o app no emulador iOS (macOS) |
| `pnpm qr` | Gera QR code para Expo Go |

---

## Solução de Problemas

### Erro: "Cannot find module 'expo-font'"

**Solução:** Reinstale as dependências:
```bash
pnpm install
```

### Erro: "Database connection refused"

**Solução:** Verifique se PostgreSQL está rodando:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Inicie o PostgreSQL via Services
```

### Erro: "EXPO_PUBLIC_OAUTH_PORTAL_URL is not set"

**Solução:** Verifique se o arquivo `.env.local` existe na raiz do projeto e contém todas as variáveis necessárias.

### Erro: "Metro bundler timeout"

**Solução:** Limpe o cache e reinicie:
```bash
pnpm dev --reset-cache
```

### Erro: "Port 3000 already in use"

**Solução:** Mude a porta do servidor no arquivo `server/_core/index.ts` ou encerre o processo usando a porta:
```bash
lsof -i :3000
kill -9 <PID>
```

---

## Desenvolvimento

### Adicionar Nova Tela

1. Crie um novo arquivo em `app/` ou `app/(tabs)/`
2. Use o componente `ScreenContainer` para SafeArea
3. Importe e use hooks como `useAuth()`, `useColors()`
4. Adicione a rota no layout correspondente

### Adicionar Nova Rota tRPC

1. Edite `server/routers.ts`
2. Adicione um novo procedimento ao `appRouter`
3. Use `protectedProcedure` para rotas autenticadas
4. A tipagem TypeScript será gerada automaticamente

### Adicionar Teste

1. Crie um arquivo em `tests/`
2. Use Vitest com a sintaxe `describe()` e `it()`
3. Execute com `pnpm test`

---

## Deploy

### Build para Produção

```bash
pnpm build
```

Isto compila o backend para a pasta `dist/`.

### Executar em Produção

```bash
NODE_ENV=production pnpm start
```

### Gerar APK (Android)

```bash
eas build --platform android
```

### Gerar IPA (iOS)

```bash
eas build --platform ios
```

---

## Suporte e Documentação

- **Expo Documentation:** [expo.dev](https://expo.dev)
- **React Native:** [reactnative.dev](https://reactnative.dev)
- **tRPC:** [trpc.io](https://trpc.io)
- **Drizzle ORM:** [orm.drizzle.team](https://orm.drizzle.team)
- **NativeWind:** [nativewind.dev](https://nativewind.dev)

---

## Licença

Este projeto é fornecido como está para fins educacionais e comerciais.

---

## Contribuições

Para contribuir com melhorias, abra uma issue ou pull request no repositório GitHub.

---

**Desenvolvido com ❤️ para produtores de café**
