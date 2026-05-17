# Setup Local

Este documento explica como preparar e executar o projeto `scan_ia_cafe` no ambiente local.

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
DATABASE_URL="file:./dev.sqlite"
JWT_SECRET="sua-chave-jwt-segura-aqui"
NODE_ENV="development"
EXPO_PUBLIC_API_BASE_URL="http://localhost:3000"
```

Os principais valores usados pelo projeto são:

- `DATABASE_URL` — URL do banco de dados SQLite local (`file:./dev.sqlite`)
- `JWT_SECRET` — chave secreta JWT para autenticação
- `NODE_ENV` — ambiente de execução (`development` ou `production`)
- `EXPO_PUBLIC_API_BASE_URL` — URL base da API local

> Dependendo do fluxo de autenticação e do OAuth Manus, podem existir outras variáveis exigidas pelo servidor.

### Gerando `JWT_SECRET`

```bash
openssl rand -base64 32
```

## 5. Preparar o banco de dados

### 5.1 Usar SQLite local

Basta apontar o `DATABASE_URL` para um arquivo local, por exemplo:

```bash
DATABASE_URL="file:./dev.sqlite"
```

### 5.2 Executar migrações

```bash
pnpm db:push
```

### 5.3 Verificar a configuração

```bash
pnpm check
```

## 6. Rodar o projeto

### 6.1 Ambiente completo (frontend + backend)

```bash
pnpm dev
```

### 6.2 Apenas backend

```bash
pnpm dev:server
```

### 6.3 Apenas frontend

```bash
pnpm dev:metro
```

### 6.4 Android

```bash
pnpm android
```

### 6.5 iOS

```bash
pnpm ios
```

### 6.6 Gerar QR code

```bash
pnpm qr
```

## 7. Comandos úteis

- `pnpm build` — compila o servidor para produção em `dist/`
- `pnpm start` — inicia o servidor em produção (`node dist/index.js`)
- `pnpm check` — validação TypeScript sem gerar arquivos
- `pnpm lint` — executa ESLint
- `pnpm format` — formata o código com Prettier
- `pnpm test` — executa os testes com Vitest

## 8. Acessar a aplicação

### Web
Abra no navegador o endereço exibido pelo `expo start`. Normalmente:

```bash
http://localhost:8081
```

### Mobile
Use o Expo Go no celular e escaneie o QR code gerado por `pnpm dev`.

### Emuladores
- Android: `pnpm android`
- iOS: `pnpm ios` (apenas macOS)

## 9. Dicas rápidas

- Mantenha o backend rodando com `pnpm dev:server` enquanto desenvolve APIs.
- Use `pnpm dev` para rodar frontend e backend juntos.
- Atualize `DATABASE_URL` e `EXPO_PUBLIC_API_BASE_URL` conforme o seu ambiente local.

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
