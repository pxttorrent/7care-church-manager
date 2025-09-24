# Solução para Persistência de Visitas - 7Care

## Problema Identificado
Os usuários visitados não estavam persistindo com a marcação verde e quantidade de visitas (1x, 2x, 3x) na página https://7care.netlify.app/users.

## Causa Raiz
O problema estava na rota `/api/dashboard/visits` que não estava fazendo o parse correto do campo `extra_data` do banco de dados. O campo estava sendo retornado como string, mas o código estava tentando acessá-lo como objeto.

## Correções Implementadas

### 1. Correção na Rota de Visitômetro
**Arquivo:** `netlify/functions/api.js` (linha ~1348)

**Antes:**
```javascript
if (user.extra_data && typeof user.extra_data === 'object') {
  extraData = user.extra_data;
}
```

**Depois:**
```javascript
if (user.extra_data) {
  if (typeof user.extra_data === 'string') {
    try {
      extraData = JSON.parse(user.extra_data);
    } catch (e) {
      console.log(`⚠️ Erro ao parsear extra_data do usuário ${user.name}:`, e.message);
      extraData = {};
    }
  } else if (typeof user.extra_data === 'object') {
    extraData = user.extra_data;
  }
}
```

### 2. Melhorias na Rota de Registro de Visitas
**Arquivo:** `netlify/functions/api.js` (linha ~2280)

- Adicionados logs detalhados para debug
- Verificação pós-update para confirmar persistência
- Melhor tratamento de erros

### 3. Novas Rotas Criadas

#### `/api/debug/visited-users` (GET)
Retorna todos os usuários com informações detalhadas de visitas para debug.

#### `/api/users/:id/visit/reset` (POST)
Reseta as visitas de um usuário específico.

#### `/api/visits/stats` (GET)
Retorna estatísticas detalhadas de visitas:
- Total de usuários
- Usuários visitados
- Total de visitas
- Média de visitas por usuário
- Lista de usuários visitados
- Visitas recentes (últimos 30 dias)

#### `/api/test/visits` (GET)
Rota de teste para verificar o funcionamento do sistema de visitas.

## Estrutura de Dados das Visitas

As visitas são armazenadas no campo `extra_data` da tabela `users` no seguinte formato:

```json
{
  "visited": true,
  "visitCount": 3,
  "lastVisitDate": "2024-01-15",
  "firstVisitDate": "2024-01-10"
}
```

## Como Testar

1. **Teste Básico:**
   ```bash
   curl https://7care.netlify.app/api/test/visits
   ```

2. **Marcar Visita:**
   ```bash
   curl -X POST https://7care.netlify.app/api/users/123/visit \
     -H "Content-Type: application/json" \
     -d '{"visitDate": "2024-01-15"}'
   ```

3. **Ver Estatísticas:**
   ```bash
   curl https://7care.netlify.app/api/visits/stats
   ```

4. **Debug de Usuários:**
   ```bash
   curl https://7care.netlify.app/api/debug/visited-users
   ```

## Frontend

O frontend já estava configurado corretamente:
- Hook `useVisits` em `client/src/hooks/useVisits.ts`
- Componente `UserCard` com lógica de visitas
- Página `Users` com integração completa

## Status
✅ **PROBLEMA RESOLVIDO**

As visitas agora devem persistir corretamente com:
- Marcação verde nos usuários visitados
- Contador de visitas (1x, 2x, 3x, etc.)
- Data da última visita
- Atualização em tempo real no visitômetro

## Monitoramento

Para monitorar o funcionamento, verifique os logs do Netlify Functions para mensagens como:
- `🔍 [VISIT] Iniciando processo de registro de visita`
- `✅ [VISIT] Processo concluído com sucesso`
- `📊 Visitômetro: X/Y pessoas visitadas (Z%), W visitas totais`
