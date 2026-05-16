# CaféDiag IA — TODO

## Configuração e Branding
- [x] Gerar logo do aplicativo com IA
- [x] Configurar tema de cores (verde agrícola + marrom café)
- [x] Atualizar app.config.ts com nome e branding
- [x] Configurar ícones de navegação

## Backend e Banco de Dados
- [x] Definir schema: tabela diagnoses (diagnósticos)
- [x] Executar migração do banco de dados
- [x] Implementar rotas tRPC: diagnóstico (criar, listar, buscar por ID, stats)
- [x] Implementar integração com LLM para análise de imagem
- [x] Implementar upload de imagens para S3

## Autenticação
- [x] Implementar tela de Login com OAuth Manus
- [x] Implementar proteção de rotas (redirecionar para login se não autenticado)
- [x] Implementar logout

## Telas
- [x] Tela de Login com animação e logo
- [x] Home Screen com card de diagnóstico e últimos resultados
- [x] Tela de Captura (câmera + upload de galeria)
- [x] Tela de Processamento IA com animação
- [x] Tela de Resultado do Diagnóstico
- [x] Tela de Histórico com FlatList
- [x] Tela de Perfil com estatísticas e configurações

## Funcionalidades
- [x] Captura de foto com câmera
- [x] Upload de imagem da galeria
- [x] Envio de imagem para análise por IA
- [x] Exibição de resultado com confiança e recomendações
- [x] Histórico de diagnósticos (persistido no banco)
- [x] Compartilhamento de diagnóstico
- [x] Pull-to-refresh no histórico
- [x] Estatísticas do usuário (total, saudáveis, doenças)
- [x] Alternância de tema claro/escuro
- [x] Base de conhecimento de doenças do café
