# CaféDiag IA — Design Document

## Conceito Visual

Aplicativo para diagnóstico de doenças em folhas de café utilizando inteligência artificial. O design combina estética agrícola com tecnologia moderna, priorizando simplicidade e usabilidade em campo (uso ao ar livre, sol, mãos sujas).

---

## Paleta de Cores

| Token         | Claro       | Escuro      | Uso                          |
|---------------|-------------|-------------|------------------------------|
| `primary`     | `#2E7D32`   | `#4CAF50`   | Botões principais, destaques |
| `secondary`   | `#6D4C41`   | `#8D6E63`   | Acentos marrom café          |
| `background`  | `#F5F7F2`   | `#121A0F`   | Fundo das telas              |
| `surface`     | `#FFFFFF`   | `#1E2D1A`   | Cards, modais                |
| `foreground`  | `#1A2E1A`   | `#E8F5E9`   | Texto principal              |
| `muted`       | `#5A7A5A`   | `#81A881`   | Texto secundário             |
| `border`      | `#C8DCC8`   | `#2E4A2E`   | Bordas e divisores           |
| `success`     | `#2E7D32`   | `#66BB6A`   | Folha saudável               |
| `warning`     | `#F9A825`   | `#FBBF24`   | Risco médio                  |
| `error`       | `#D32F2F`   | `#F87171`   | Risco alto, erros            |

---

## Tipografia

- **Fonte:** Inter (sistema) ou Poppins
- Títulos: SemiBold, 24px
- Subtítulos: Medium, 18px
- Corpo: Regular, 14-16px
- Botões: SemiBold, 16px

---

## Lista de Telas

### 1. Splash Screen (`/splash`)
- Logo centralizado com animação suave de fade-in
- Fundo com gradiente verde
- Duração: 2 segundos → redireciona para Login ou Home

### 2. Login (`/login`)
- Logo do app no topo
- Campo Email + Campo Senha
- Botão "Entrar" (verde, grande)
- Link "Criar conta" e "Esqueci a senha"
- Login social (OAuth Manus)

### 3. Cadastro (`/register`)
- Campos: Nome, Email, Telefone, Senha, Confirmar Senha
- Botão "Criar Conta"
- Link "Já tenho conta"

### 4. Home (`/(tabs)/index`)
- Header com saudação + avatar do usuário
- Card principal grande: "Diagnosticar Folha" com ícone de câmera
- Grid de atalhos: Histórico, Recomendações, Estatísticas
- Lista de últimos diagnósticos (FlatList)

### 5. Câmera/Upload (`/capture`)
- Câmera fullscreen com overlay de enquadramento
- Botão capturar (grande, centralizado)
- Botão upload da galeria
- Instruções rápidas (enquadramento, iluminação)

### 6. Processamento IA (`/processing`)
- Imagem capturada em miniatura
- Animação de loading com ícones de IA
- Barra de progresso animada
- Mensagens dinâmicas: "Analisando padrões...", "Comparando com banco agrícola..."

### 7. Resultado do Diagnóstico (`/result/[id]`)
- Foto analisada em destaque
- Badge com nome da doença (ex: "Ferrugem do Cafeeiro")
- Percentual de confiança
- Indicador de risco (baixo/médio/alto) com cor
- Seção de recomendações de tratamento
- Botões: Compartilhar, Salvar, Novo Diagnóstico

### 8. Histórico (`/(tabs)/history`)
- FlatList com cards de diagnósticos anteriores
- Cada card: foto thumbnail, data, doença, nível de risco
- Filtros por data e tipo de doença
- Pull-to-refresh

### 9. Perfil (`/(tabs)/profile`)
- Avatar + nome + email do usuário
- Estatísticas: total de diagnósticos, doenças mais frequentes
- Configurações: notificações, tema
- Botão Sair

---

## Fluxos Principais

### Fluxo de Diagnóstico
```
Home → Captura → Processamento IA → Resultado → Histórico
```

### Fluxo de Autenticação
```
Splash → Login (ou Cadastro) → Home
```

### Fluxo de Histórico
```
Home → Histórico → Detalhe do Diagnóstico
```

---

## Navegação

- **Bottom Tabs:** Home | Histórico | Perfil
- **Stack interno:** Captura → Processamento → Resultado

---

## Design System

| Elemento       | Valor              |
|----------------|--------------------|
| Border Radius  | 12-20px            |
| Espaçamento    | 8 / 16 / 24 / 32px |
| Altura botões  | 52-56px            |
| Sombra cards   | suave, 4px blur    |

---

## UX para Uso em Campo

- Botões grandes (mínimo 52px de altura)
- Alto contraste para legibilidade ao sol
- Ícones claros e intuitivos
- Mínimo de texto técnico
- Feedback visual imediato em todas as ações
