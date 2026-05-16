# 🌿 CaféDiag IA

**Diagnóstico Inteligente de Doenças do Café com Inteligência Artificial**

Um aplicativo mobile e web fullstack que permite aos produtores rurais fotografar folhas de café e receber diagnósticos automáticos de doenças em tempo real, com recomendações agronômicas personalizadas.

![CaféDiag IA](assets/images/icon.png)

---

## ✨ Características Principais

- **📱 Multiplataforma** — iOS, Android e Web (PWA)
- **🤖 Análise por IA** — Detecção automática de 4 doenças do café
- **⚡ Resultado em Segundos** — Processamento rápido via LLM multimodal
- **🔒 Autenticação Segura** — OAuth via Manus (sem senha)
- **📊 Histórico Completo** — Todos os diagnósticos salvos no banco de dados
- **🌙 Modo Escuro** — Interface adaptável a preferências do usuário
- **💾 Offline Ready** — Funciona com ou sem conexão
- **🎯 Recomendações Agronômicas** — Dicas personalizadas por doença

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js v18+
- PostgreSQL 14+
- pnpm 9+

### Instalação Rápida

```bash
# 1. Clonar repositório
git clone https://github.com/jafferveronezi/scan_ia_cafe.git
cd scan_ia_cafe

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Configurar banco de dados
pnpm db:push

# 5. Iniciar desenvolvimento
pnpm dev
```

Acesse [http://localhost:8081](http://localhost:8081) no navegador ou escaneie o QR code no terminal com Expo Go.

---

## 📚 Documentação Completa

Para instruções detalhadas de configuração local, consulte:

- **[SETUP_LOCAL.md](./SETUP_LOCAL.md)** — Guia passo a passo de configuração
- **[design.md](./design.md)** — Especificações de design e UX
- **[server/README.md](./server/README.md)** — Documentação do backend
- **[todo.md](./todo.md)** — Status do projeto

---

## 🏗️ Arquitetura

### Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend Mobile** | React Native + Expo SDK 54 |
| **Frontend Web** | React 19 + Next.js |
| **Backend** | Node.js + tRPC + Express |
| **Banco de Dados** | PostgreSQL + Drizzle ORM |
| **Autenticação** | OAuth Manus |
| **IA/ML** | LLM Multimodal (Manus) |
| **Armazenamento** | S3-compatible (Manus Storage) |
| **Styling** | Tailwind CSS + NativeWind |

### Estrutura de Pastas

```
scan_ia_cafe/
├── app/                    # Telas e rotas (Expo Router)
├── server/                 # Backend tRPC
├── components/             # Componentes React Native
├── hooks/                  # Custom hooks
├── lib/                    # Utilitários
├── drizzle/                # Migrações de BD
├── assets/                 # Imagens e ícones
├── tests/                  # Testes Vitest
└── SETUP_LOCAL.md          # Guia de configuração
```

---

## 🎯 Doenças Detectadas

O aplicativo identifica as seguintes doenças do café:

| Doença | Agente Causador | Sintomas |
|--------|-----------------|----------|
| **Ferrugem** | *Hemileia vastatrix* | Manchas alaranjadas na face inferior |
| **Cercosporiose** | *Cercospora coffeicola* | Manchas circulares com halo amarelo |
| **Phoma** | *Phoma tarda* | Manchas escuras com bordas irregulares |
| **Mancha Aureolada** | *Pseudomonas syringae* | Manchas com halo amarelo brilhante |

---

## 🔄 Fluxo de Uso

```
Login (OAuth Manus)
    ↓
Home (Dashboard)
    ↓
Fotografar Folha (Câmera/Galeria)
    ↓
Processamento IA (Análise)
    ↓
Resultado (Diagnóstico + Recomendações)
    ↓
Histórico (Visualizar todos os diagnósticos)
    ↓
Perfil (Estatísticas e Configurações)
```

---

## 📱 Screenshots

### Tela de Login
Autenticação segura via OAuth Manus com interface intuitiva.

### Home
Dashboard com diagnósticos recentes e estatísticas do usuário.

### Captura
Câmera nativa com guias visuais para melhor enquadramento.

### Resultado
Diagnóstico completo com confiança da IA e recomendações agronômicas.

### Histórico
Lista completa de todos os diagnósticos realizados.

### Perfil
Configurações, estatísticas e alternância de tema.

---

## 🛠️ Desenvolvimento

### Comandos Principais

```bash
# Desenvolvimento
pnpm dev              # Frontend + Backend
pnpm dev:metro       # Apenas Frontend
pnpm dev:server      # Apenas Backend

# Testes
pnpm test            # Executar testes
pnpm check           # Verificar TypeScript

# Build
pnpm build           # Build para produção
pnpm start           # Iniciar servidor produção

# Banco de Dados
pnpm db:push         # Executar migrações
```

### Adicionar Dependências

```bash
pnpm add <package>
pnpm add -D <dev-package>
```

---

## 🔐 Segurança

- **Autenticação:** OAuth 2.0 via Manus
- **Tokens:** JWT com expiração configurável
- **Armazenamento:** Senhas nunca são armazenadas
- **Imagens:** Armazenadas em S3 com acesso controlado
- **Variáveis:** Sensíveis em `.env.local` (não versionadas)

---

## 📊 Estatísticas

- **Telas:** 7 (Login, Home, Captura, Processamento, Resultado, Histórico, Perfil)
- **Rotas tRPC:** 5 (health, analyze, list, getById, stats)
- **Doenças:** 4 + 1 (saudável)
- **Linhas de Código:** ~5000+
- **Testes:** Vitest com cobertura básica

---

## 🚀 Deploy

### Opções de Deploy

1. **Web (Vercel/Netlify)**
   ```bash
   pnpm build
   # Deploy da pasta `dist/`
   ```

2. **Mobile (EAS Build)**
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

3. **Backend (Cloud Run/Railway/Render)**
   ```bash
   pnpm build
   # Deploy do Node.js
   ```

---

## 📝 Licença

Este projeto é fornecido como está para fins educacionais e comerciais.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas:

- 📧 Abra uma [Issue](https://github.com/jafferveronezi/scan_ia_cafe/issues)
- 💬 Consulte a [Documentação](./SETUP_LOCAL.md)
- 🔍 Verifique [Soluções de Problemas](./SETUP_LOCAL.md#solução-de-problemas)

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para produtores de café que buscam tecnologia acessível e eficiente.

**Tecnologias:**
- Expo e React Native
- tRPC e Node.js
- PostgreSQL e Drizzle
- Tailwind CSS e NativeWind
- Manus AI e Storage

---

**Última atualização:** Maio 2026

**Status:** ✅ Pronto para Produção
