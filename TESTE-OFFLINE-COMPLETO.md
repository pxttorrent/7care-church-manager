# 🧪 TESTE COMPLETO: Offline → Online → Google Sheets

## 📋 Objetivo
Testar se tarefas criadas offline aparecem no frontend e depois sincronizam com o Google Sheets.

## 🔧 Passo a Passo

### 1️⃣ Preparar Ambiente
1. Abra https://7care.netlify.app/tasks
2. Aperte **F12** (abrir DevTools)
3. Vá na aba **Console**
4. **OPCIONAL:** Limpe o cache antigo:
   ```javascript
   indexedDB.deleteDatabase('7care-offline')
   ```
5. Recarregue a página (F5)

### 2️⃣ Simular Modo Offline
1. No DevTools, vá na aba **Network** (Rede)
2. No dropdown onde diz "**No throttling**" ou "**Online**":
   - Selecione **Offline** ❌
3. Você verá o badge mudar para "📴 Offline"

### 3️⃣ Criar Tarefa Offline
1. Clique em **"Nova Tarefa"**
2. Preencha:
   - Título: `TESTE OFFLINE` (ou qualquer nome)
   - Descrição: `Criada em modo offline`
   - Prioridade: Média
3. Clique em **"Criar Tarefa"**
4. **OBSERVE NO CONSOLE:**
   ```
   💾 [tasks] Item criado localmente: temp_xxxxx
   📋 Adicionado à fila: CREATE /api/tasks
   ⚠️ [tasks] Erro ao sincronizar criação: (erro de rede)
   ```

### 4️⃣ Verificar no Frontend
1. **A tarefa DEVE aparecer na lista** ✅
2. Ela terá um ID temporário (ex: `temp_1728612345_abc123`)
3. Pode ter um badge "📴 Offline" ou similar

### 5️⃣ Voltar Online
1. No DevTools, aba **Network**
2. Mude de **Offline** para **Online** ✅
3. Você verá o badge mudar para "🌐 Online"

### 6️⃣ Sincronizar com Servidor
**OPÇÃO A: Automático (aguardar 30 segundos)**
- O sistema sincroniza automaticamente a cada 30 segundos

**OPÇÃO B: Manual (mais rápido)**
1. Clique no botão **"Servidor"** 🔄
2. **OBSERVE NO CONSOLE:**
   ```
   🔄 Iniciando sincronização com servidor...
   📦 1 itens para sincronizar
   📤 Enviando CREATE para /api/tasks
   ✅ [tasks] Item sincronizado: [novo ID real]
   💾 Cache atualizado após criação
   ```

### 7️⃣ Verificar Sincronização
**No Console, você verá:**
```
🔄 ID mudou de temp_xxxxx para 150 (ID real do servidor)
💾 tasks#temp_xxxxx deletado localmente (duplicata removida)
💾 tasks#150 salvo localmente
📤 [ADD] Adicionando tarefa 150 ao Google Sheets...
✅ [ADD] Tarefa 150 adicionada ao Google Sheets!
```

### 8️⃣ Verificar Google Sheets
1. Abra a planilha de tarefas
2. **A tarefa "TESTE OFFLINE" deve estar lá!** ✅
3. Com todos os dados corretos

### 9️⃣ Recarregar Página (Teste Final)
1. Recarregue a página (F5)
2. **A tarefa continua lá** ✅
3. Agora com ID real (não mais temp_)
4. Google Sheets sincronizado ✅

## ✅ Resultado Esperado

```
✅ Criar offline → Aparece no frontend
✅ Sincronizar → Aparece no servidor
✅ Sincronizar → Aparece no Google Sheets
✅ Recarregar → Tarefa permanece
✅ Sem duplicatas
✅ ID temporário substituído por ID real
```

## 🔍 Logs Importantes

### Console do Navegador:
- `💾 [tasks] Item criado localmente` → Criou offline
- `📋 Adicionado à fila` → Na fila de sincronização
- `✅ [tasks] Item sincronizado` → Sincronizou com servidor
- `📤 [ADD] Adicionando tarefa X ao Google Sheets` → Sincronizou com Google Sheets
- `✅ [ADD] Tarefa X adicionada ao Google Sheets!` → Sucesso!

## ⚠️ Troubleshooting

**Se a tarefa não aparecer offline:**
- Verifique se o IndexedDB está habilitado
- Veja no Console se há erros

**Se não sincronizar ao voltar online:**
- Clique no botão "Servidor" manualmente
- Verifique a aba Network se há erros

**Se aparecer duplicata:**
- É normal ver temp_xxx e o ID real brevemente
- O sistema remove o temp_xxx automaticamente
- Se ficar duplicado, há um bug na remoção

## 🎯 Teste Adicional

Depois de criar offline, teste:
1. **Editar** a tarefa offline
2. **Marcar como concluída** offline
3. **Deletar** a tarefa offline
4. Voltar online e sincronizar
5. Verificar se todas as operações foram aplicadas corretamente

