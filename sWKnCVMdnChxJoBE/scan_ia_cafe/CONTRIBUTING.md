# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o **CaféDiag IA**! Este documento fornece diretrizes e instruções para contribuir com o projeto.

---

## 📋 Código de Conduta

Este projeto adota um código de conduta inclusivo. Esperamos que todos os contribuidores respeitem e sigam estas diretrizes:

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

---

## 🚀 Como Contribuir

### 1. Reportar Bugs

Se encontrar um bug, abra uma [Issue](https://github.com/jafferveronezi/scan_ia_cafe/issues) com:

- **Título claro e descritivo**
- **Descrição detalhada do problema**
- **Passos para reproduzir**
- **Comportamento esperado vs. atual**
- **Screenshots/logs** (se aplicável)
- **Ambiente:** SO, versão Node.js, etc.

### 2. Sugerir Melhorias

Para sugerir uma nova feature:

- Abra uma [Issue](https://github.com/jafferveronezi/scan_ia_cafe/issues) com o rótulo `enhancement`
- Descreva o caso de uso e benefícios
- Forneça exemplos de como seria usado
- Discuta possíveis implementações

### 3. Enviar Pull Requests

#### Preparação

```bash
# 1. Fork o repositório
git clone https://github.com/seu-usuario/scan_ia_cafe.git
cd scan_ia_cafe

# 2. Criar branch para sua feature
git checkout -b feature/sua-feature-incrivel

# 3. Instalar dependências
pnpm install

# 4. Criar branch de desenvolvimento
git checkout -b develop
```

#### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
pnpm dev

# Execute testes
pnpm test

# Verifique TypeScript
pnpm check

# Formate o código
pnpm format
```

#### Commit

Siga o padrão de commit convencional:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos:**
- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de lógica)
- `refactor:` Refatoração de código
- `perf:` Melhoria de performance
- `test:` Testes
- `chore:` Tarefas de build, dependências, etc.

**Exemplos:**
```bash
git commit -m "feat(diagnosis): add support for new coffee disease detection"
git commit -m "fix(auth): resolve OAuth token expiration issue"
git commit -m "docs(setup): improve local setup instructions"
```

#### Push e Pull Request

```bash
# Push para seu fork
git push origin feature/sua-feature-incrivel

# Abra um Pull Request no GitHub
# Preencha o template de PR com:
# - Descrição das mudanças
# - Issue relacionada (se houver)
# - Screenshots/testes
# - Checklist de verificação
```

---

## 📐 Padrões de Código

### TypeScript

- Use tipos explícitos sempre que possível
- Evite `any`
- Prefira interfaces a type aliases para objetos
- Use `const` por padrão, `let` quando necessário

```typescript
// ✅ Bom
interface DiagnosisResult {
  disease: string;
  confidence: number;
}

const result: DiagnosisResult = { disease: "ferrugem", confidence: 0.95 };

// ❌ Evitar
const result: any = { disease: "ferrugem", confidence: 0.95 };
```

### React/React Native

- Use functional components
- Prefira hooks a class components
- Nomeie componentes com PascalCase
- Use `useCallback` para funções em dependências

```typescript
// ✅ Bom
export function DiagnosisCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const handlePress = useCallback(() => {
    // ação
  }, []);

  return <Pressable onPress={handlePress}>...</Pressable>;
}

// ❌ Evitar
export class DiagnosisCard extends React.Component {
  // ...
}
```

### Testes

- Escreva testes para novas features
- Use Vitest para testes unitários
- Mantenha cobertura acima de 70%

```typescript
// ✅ Bom
describe("DiagnosisCard", () => {
  it("should display disease name", () => {
    const diagnosis = { disease: "ferrugem", confidence: 0.95 };
    const { getByText } = render(<DiagnosisCard diagnosis={diagnosis} />);
    expect(getByText("ferrugem")).toBeTruthy();
  });
});
```

---

## 📁 Estrutura de Pastas

Ao adicionar novos arquivos, siga a estrutura existente:

```
app/
├── (auth)/          # Telas de autenticação
├── (tabs)/          # Telas principais com abas
├── result/          # Telas dinâmicas
└── _layout.tsx      # Layout raiz

components/
├── ui/              # Componentes reutilizáveis
└── screen-container.tsx

server/
├── _core/           # Núcleo do servidor
├── routers.ts       # Rotas tRPC
└── db.ts            # Funções de BD

shared/
├── types.ts         # Tipos compartilhados
└── const.ts         # Constantes
```

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Teste específico
pnpm test auth.logout.test.ts

# Com cobertura
pnpm test -- --coverage
```

### Escrever Testes

```typescript
import { describe, it, expect } from "vitest";

describe("analyzeLeafImage", () => {
  it("should detect ferrugem disease", async () => {
    const result = await analyzeLeafImage(mockImageUrl);
    expect(result.diseaseSlug).toBe("ferrugem");
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});
```

---

## 📚 Documentação

Ao adicionar features, atualize a documentação:

- **README.md** — Visão geral do projeto
- **SETUP_LOCAL.md** — Instruções de configuração
- **design.md** — Especificações de design
- **server/README.md** — Documentação do backend
- **Comentários de código** — Explique lógica complexa

---

## 🔍 Checklist de PR

Antes de submeter um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] TypeScript sem erros (`pnpm check`)
- [ ] Testes passam (`pnpm test`)
- [ ] Código formatado (`pnpm format`)
- [ ] Documentação atualizada
- [ ] Commits seguem o padrão convencional
- [ ] Sem console.log ou código de debug
- [ ] Sem dependências desnecessárias

---

## 🎯 Prioridades de Contribuição

Áreas onde contribuições são especialmente bem-vindas:

1. **Testes** — Aumentar cobertura de testes
2. **Documentação** — Melhorar guias e comentários
3. **Performance** — Otimizar renderização e queries
4. **Acessibilidade** — Melhorar suporte a leitores de tela
5. **Internacionalização** — Adicionar suporte a mais idiomas
6. **Novas Doenças** — Expandir base de conhecimento

---

## 📞 Suporte

- 💬 **Discussões:** GitHub Discussions
- 📧 **Issues:** GitHub Issues
- 📚 **Documentação:** [SETUP_LOCAL.md](./SETUP_LOCAL.md)

---

## 🙏 Obrigado!

Suas contribuições tornam o CaféDiag IA melhor para todos. Agradecemos antecipadamente!

---

**Última atualização:** Maio 2026
