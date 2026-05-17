# Rodar o Projeto Localmente

Este documento explica como preparar e executar o projeto `scan_ia_cafe` no seu ambiente local.

## 1. Pré-requisitos

Instale as ferramentas abaixo antes de começar:

- Node.js (recomendado v18+)
- pnpm (recomendado v9+)
- Git
- PostgreSQL (compatível com o `DATABASE_URL` do projeto)
- Expo CLI (opcional, mas recomendado para desenvolvimento mobile)

## 2. Clonar o repositório

```bash
git clone https://github.com/jafferveronezi/scan_ia_cafe.git
cd scan_ia_cafe
```

## 3. Instalar dependências

```bash
pnpm install
```

## 4. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as variáveis necessárias. Exemplo:

```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cafe_diagnostico"
JWT_SECRET="sua-chave-jwt-segura-aqui"
NODE_ENV="development"
EXPO_PUBLIC_API_BASE_URL="http://localhost:3000"
```

Os principais valores usados pelo projeto são:

- `DATABASE_URL` — endereço do banco de dados PostgreSQL
- `JWT_SECRET` — chave secreta JWT para autenticação
- `NODE_ENV` — ambiente, normalmente `development`
- `EXPO_PUBLIC_API_BASE_URL` — URL base da API local

> Dependendo do fluxo de autenticação e armazenamento, podem existir outras variáveis exigidas pelo servidor ou pelo OAuth do Manus.

## 5. Preparar o banco de dados

### 5.1 Criar o banco

```bash
createdb cafe_diagnostico
```

Ou usando psql:

```bash
psql -U postgres
CREATE DATABASE cafe_diagnostico;
\q
```

### 5.2 Executar migrações

```bash
pnpm db:push
```

Esse comando sincroniza o esquema do banco de dados usando o Drizzle ORM.

## 6. Rodar o projeto

O projeto possui scripts para desenvolvimento e para build.

### 6.1 Iniciar o ambiente completo (frontend + backend)

```bash
pnpm dev
```

Isso executa em paralelo:

- `pnpm dev:server` — servidor Node.js de backend
- `pnpm dev:metro` — bundler Expo/Metro para o frontend

### 6.2 Iniciar apenas o backend

```bash
pnpm dev:server
```

### 6.3 Iniciar apenas o frontend

```bash
pnpm dev:metro
```

### 6.4 Abrir no Android

```bash
pnpm android
```

### 6.5 Abrir no iOS

```bash
pnpm ios
```

### 6.6 Gerar QR Code

```bash
pnpm qr
```

## 7. Outros scripts úteis

- `pnpm build` — compila o servidor para produção em `dist/`
- `pnpm start` — inicia o servidor em produção (`node dist/index.js`)
- `pnpm check` — validação TypeScript sem gerar arquivos
- `pnpm lint` — executa lint do Expo
- `pnpm format` — formata todo o código com Prettier
- `pnpm test` — executa os testes com Vitest

## 8. Acessar a aplicação

### Web
Acesse o endereço mostrado pelo `expo start` no terminal. Normalmente é:

```bash
http://localhost:8081
```

### Mobile
Use o Expo Go no celular para escanear o QR code gerado pelo `pnpm dev`.

### Emuladores
- Android: `pnpm android`
- iOS: `pnpm ios` (apenas macOS)

## 9. Dicas de desenvolvimento

- Mantenha o backend rodando em `pnpm dev:server` enquanto desenvolve recursos de API.
- Use `pnpm dev` para ter frontend e backend ativos juntos.
- Atualize `DATABASE_URL` e `EXPO_PUBLIC_API_BASE_URL` conforme seu ambiente local.

---

Esse arquivo foi criado para facilitar o setup local do projeto e servir como referência rápida para novos desenvolvedores.
