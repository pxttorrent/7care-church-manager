# 🧹 Alterações no Sistema de Limpeza de Dados

## Resumo
Atualizado o botão "Limpar Dados" da aba "Gestão de Dados" em Configurações para limpar **TODOS os dados do sistema** de todas as páginas, mantendo apenas as rotas e configurações essenciais.

## Data da Alteração
14 de outubro de 2025

---

## 📝 O que foi alterado

### 1. **server/neonAdapter.ts** - Função `clearAllData()`
**Localização:** Linha 1403-1490

#### Antes:
- Limpava apenas 5 tabelas:
  - events
  - meetings
  - messages
  - notifications
  - prayers

#### Depois:
Agora limpa **TODAS as tabelas do sistema** (25+ tabelas):

**Tabelas Dependentes (relacionamentos):**
- video_call_participants
- conversation_participants
- event_participants
- prayer_intercessors
- user_achievements
- user_points_history
- point_activities
- messages
- push_subscriptions

**Tabelas Principais:**
- video_call_sessions
- conversations
- events
- meetings
- prayers
- notifications
- emotional_checkins
- relationships
- discipleship_requests
- missionary_profiles
- meeting_types
- achievements
- point_configs
- churches
- users (exceto admin)

---

### 2. **netlify/functions/api.js** - Endpoint `/api/system/clear-all`
**Localização:** Linha 9955-10051

#### Alterações:
- Reorganizado para limpar todas as tabelas em ordem correta (respeitando foreign keys)
- Melhorado o log de progresso com descrições claras
- Adicionado tratamento de erros individual por tabela
- Atualizado retorno com lista detalhada de dados limpos

---

## 🔒 O que é MANTIDO

### Dados Preservados:
1. **Usuários Admin** - Todos os usuários com `role = 'admin'`
2. **system_config** - Configurações do sistema
3. **system_settings** - Configurações gerais
4. **event_filter_permissions** - Permissões de filtros de eventos

### Rotas:
✅ **TODAS as rotas da API permanecem intactas**
- As rotas são definições de código, não dados do banco
- Não são afetadas pela limpeza de dados

---

## 🗑️ O que é LIMPO

### Dados de Usuários:
- ✅ Todos os usuários exceto admins
- ✅ Histórico de pontos
- ✅ Atividades de pontos
- ✅ Conquistas de usuários
- ✅ Check-ins emocionais
- ✅ Perfis missionários
- ✅ Subscriptions push

### Dados de Eventos:
- ✅ Eventos
- ✅ Participantes de eventos
- ✅ Reuniões
- ✅ Tipos de reunião

### Dados de Comunicação:
- ✅ Mensagens
- ✅ Conversas
- ✅ Participantes de conversas
- ✅ Notificações

### Dados de Discipulado:
- ✅ Relacionamentos
- ✅ Solicitações de discipulado

### Dados Espirituais:
- ✅ Orações
- ✅ Intercessores de oração

### Dados de Vídeo:
- ✅ Sessões de vídeo
- ✅ Participantes de vídeo

### Dados Organizacionais:
- ✅ Igrejas
- ✅ Conquistas
- ✅ Configurações de pontos

---

## 🎯 Como Usar

1. Acesse: https://7care.netlify.app/settings
2. Vá para a aba **"Gestão de Dados"**
3. Clique no botão vermelho **"Limpar Dados"**
4. Confirme a ação no diálogo

### ⚠️ Aviso Importante:
- Esta ação é **IRREVERSÍVEL**
- Todos os dados serão **PERMANENTEMENTE DELETADOS**
- Apenas usuários **admin** podem acessar esta funcionalidade
- Faça **backup** antes de usar se necessário

---

## 🔍 Detalhes Técnicos

### Ordem de Exclusão:
A limpeza respeita as foreign keys do banco de dados, deletando:
1. Primeiro: Tabelas dependentes (relacionamentos)
2. Depois: Tabelas principais
3. Por último: Usuários (exceto admin)

### Logs:
O processo gera logs detalhados no console:
```
🧹 Iniciando limpeza completa de todos os dados do sistema...
  🗑️ Limpando participantes de vídeo...
  ✅ Participantes de vídeo limpo
  🗑️ Limpando participantes de conversas...
  ✅ Participantes de conversas limpo
  ...
✅ Todos os dados foram limpos com sucesso!
ℹ️ Mantidos: usuários admin, configurações do sistema e permissões
```

### Tratamento de Erros:
- Se uma tabela não existir, o erro é logado mas a limpeza continua
- Todas as operações são rastreadas (sucessos e avisos)
- Retorno inclui detalhes completos da operação

---

## 📊 Resposta da API

### Sucesso:
```json
{
  "success": true,
  "message": "Todos os dados foram limpos com sucesso! 24 operações executadas.",
  "details": {
    "operationsExecuted": 24,
    "warnings": 0,
    "timestamp": "2025-10-14T...",
    "maintained": [
      "usuários admin",
      "system_config",
      "system_settings",
      "event_filter_permissions"
    ],
    "cleared": [
      "users (exceto admin)",
      "events",
      "meetings",
      "churches",
      "relationships",
      "prayers",
      "notifications",
      "messages",
      "conversations",
      "discipleship_requests",
      "missionary_profiles",
      "emotional_checkins",
      "achievements",
      "point_configs",
      "point_activities",
      "user_achievements",
      "user_points_history",
      "meeting_types",
      "event_participants",
      "prayer_intercessors",
      "video_call_sessions",
      "video_call_participants",
      "conversation_participants",
      "push_subscriptions"
    ]
  }
}
```

### Erro:
```json
{
  "success": false,
  "error": "Erro interno do servidor durante a limpeza",
  "details": "mensagem de erro específica"
}
```

---

## ✅ Testes Realizados

- ✅ Build do projeto executado com sucesso
- ✅ Linter sem erros
- ✅ Imports verificados (drizzle-orm `ne`, `eq`, `and`, etc.)
- ✅ Ordem de exclusão validada (foreign keys)
- ✅ Logs de progresso funcionando

---

## 🚀 Próximos Passos (Recomendado)

1. **Testar em ambiente de desenvolvimento local** antes de usar em produção
2. **Fazer backup do banco de dados** antes da primeira execução
3. **Documentar** o processo de backup/restauração
4. Considerar adicionar funcionalidade de **backup automático** antes da limpeza

---

## 📞 Suporte

Se encontrar algum problema:
1. Verifique os logs do console (F12)
2. Verifique os logs do servidor
3. Verifique se o usuário tem permissão de admin

---

**Desenvolvedor:** Assistente AI  
**Data:** 14 de outubro de 2025  
**Versão:** 1.0

