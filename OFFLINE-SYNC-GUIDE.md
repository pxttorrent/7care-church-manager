# 📱 Guia de Sincronização Offline - PWA v28

## 🎉 NOVA FUNCIONALIDADE: Criar Dados Offline!

Agora você pode **criar**, **editar** e **deletar** dados enquanto estiver **OFFLINE**, e eles serão **sincronizados automaticamente** quando voltar online!

---

## 🚀 Como Funciona:

### **1. OFFLINE - Criar Evento:**

```
1. Desconecte a internet (modo avião)
2. Acesse /calendar
3. Clique em "Novo Evento"
4. Preencha os dados:
   - Título: "Evento Offline Teste"
   - Data: Hoje
   - Local: "Igreja"
   - Tipo: "Reunião"
5. Salve

✅ O evento APARECE imediatamente no calendário!
✅ Banner aparece no topo: "1 alteração pendente"
✅ Indicador mostra que está offline
```

### **2. ONLINE - Sincronização Automática:**

```
1. Reconecte à internet
2. Banner muda para: "Sincronizando..."
3. Aguarde 2-3 segundos
4. Banner mostra: "Sincronizado! 1 alteração enviada"
5. ✅ Evento agora está salvo no servidor!
6. ✅ ID temporário substituído pelo ID real
```

---

## 🎨 Indicadores Visuais:

### **Modo Offline:**
```
┌────────────────────────────────────┐
│ 🌩️  Modo Offline                   │
│ Alterações serão sincronizadas     │
│ ao reconectar                      │
└────────────────────────────────────┘
```

### **Itens Pendentes:**
```
┌────────────────────────────────────┐
│ ⚠️  3 alterações pendentes          │
│ [Sincronizar]                      │
└────────────────────────────────────┘
```

### **Sincronizando:**
```
┌────────────────────────────────────┐
│ 🔄 Sincronizando...                │
│ Enviando alterações para o servidor│
└────────────────────────────────────┘
```

### **Sucesso:**
```
┌────────────────────────────────────┐
│ ✅ Sincronizado!                   │
│ 3 alterações enviadas              │
└────────────────────────────────────┘
```

---

## 🧪 Teste Completo - Passo a Passo:

### **Preparação:**

```
1. Acesse https://7care.netlify.app
2. Faça login
3. Navegue por todas as páginas (para cachear)
4. Aguarde 10 segundos
```

### **Teste 1: Criar Evento Offline**

```
ONLINE:
1. Acesse /calendar
2. Veja os eventos existentes

OFFLINE:
3. Ative modo avião (ou desconecte WiFi)
4. Recarregue a página (Ctrl+R) → ✅ Ainda funciona!
5. Clique em "Novo Evento"
6. Preencha:
   - Título: "Reunião de Oração Offline"
   - Data: Amanhã às 19:00
   - Local: "Igreja Central"
   - Tipo: "Reunião"
7. Salve

RESULTADO:
✅ Evento aparece imediatamente no calendário
✅ Banner: "1 alteração pendente"
✅ Evento tem ID temporário (temp_1234567890)

ONLINE:
8. Reconecte (desative modo avião)
9. Aguarde 5 segundos
10. Banner: "Sincronizando..." → "Sincronizado!"
11. ✅ Evento agora tem ID real do servidor!
```

### **Teste 2: Editar Tarefa Offline**

```
OFFLINE:
1. Ative modo avião
2. Acesse /tasks
3. Clique em uma tarefa
4. Altere o status para "Concluída"
5. Salve

RESULTADO:
✅ Tarefa muda de status imediatamente
✅ Banner: "1 alteração pendente"

ONLINE:
6. Reconecte
7. Aguarde sincronização automática
8. ✅ Servidor atualizado!
```

### **Teste 3: Múltiplas Alterações**

```
OFFLINE:
1. Modo avião ativado
2. Crie 2 eventos
3. Edite 1 tarefa
4. Crie 1 oração
5. Banner: "4 alterações pendentes"

ONLINE:
6. Reconecte
7. Banner: "Sincronizando..."
8. Aguarde
9. Banner: "Sincronizado! 4 alterações enviadas"
10. ✅ Todas no servidor!
```

---

## 🔧 Sincronização Manual:

Se a sincronização automática não disparar, você pode forçar:

```javascript
// No console do navegador (F12):
if (navigator.serviceWorker.controller) {
  const messageChannel = new MessageChannel();
  navigator.serviceWorker.controller.postMessage(
    { type: 'SYNC_NOW' },
    [messageChannel.port2]
  );
}
```

Ou clique no botão **"Sincronizar"** no banner quando estiver online.

---

## 📊 Logs de Debug:

### **Service Worker (Console):**

```
📝 SW v28: OFFLINE - Salvando operação: POST /api/events
✅ SW v28: Operação salva na fila de sincronização
🔄 SW v28: Sincronizando 1 itens pendentes...
📤 SW v28: Sincronizando POST https://7care.netlify.app/api/events
✅ SW v28: Item 1 sincronizado com sucesso
🎉 SW v28: Sincronização completa! 1 sucesso, 0 falhas
```

### **Frontend (Console):**

```
📥 Item adicionado à fila de sync: 1
🌐 Voltou online! Iniciando sincronização...
✅ 1 itens sincronizados com sucesso!
```

---

## ⚙️ Configurações:

### **Onde os dados ficam salvos offline:**

```
IndexedDB → 7care-sync-db → sync-queue

Estrutura:
{
  id: 1,
  url: "https://7care.netlify.app/api/events",
  method: "POST",
  body: { title: "Evento", date: "2025-10-10", ... },
  headers: { "Content-Type": "application/json" },
  timestamp: 1760054213822,
  status: "pending",
  retries: 0
}
```

### **Quando sincroniza:**

1. **Automaticamente** quando voltar online
2. **Background Sync** (se suportado pelo navegador)
3. **Manualmente** via botão "Sincronizar"
4. **A cada 10 segundos** verifica se há itens pendentes

---

## 🎯 Operações Suportadas:

```
✅ POST /api/events - Criar evento
✅ PUT /api/events/:id - Atualizar evento
✅ DELETE /api/events/:id - Deletar evento

✅ POST /api/tasks - Criar tarefa
✅ PATCH /api/tasks/:id - Atualizar tarefa
✅ DELETE /api/tasks/:id - Deletar tarefa

✅ POST /api/prayers - Criar oração
✅ PUT /api/prayers/:id - Atualizar oração
✅ DELETE /api/prayers/:id - Deletar oração

✅ POST /api/users - Criar usuário
✅ PUT /api/users/:id - Atualizar usuário

... e TODAS as outras operações POST/PUT/PATCH/DELETE!
```

---

## 🔍 Troubleshooting:

### **Problema: Sincronização não ocorre automaticamente**

```
Solução 1: Clique no botão "Sincronizar" manualmente
Solução 2: Feche e abra o app novamente
Solução 3: Force refresh (Ctrl+Shift+R)
```

### **Problema: Dados aparecem duplicados**

```
Causa: ID temporário + ID real aparecem juntos
Solução: Recarregue a página após sincronização
```

### **Problema: Sincronização falha**

```
Verifique:
1. Você está realmente online?
2. O servidor está funcionando?
3. Os dados são válidos?
4. Veja logs do console para detalhes
```

---

## 📱 Compatibilidade:

```
✅ Chrome/Edge (Desktop + Mobile) - 100%
✅ Firefox (Desktop + Mobile) - 100%
✅ Safari (iOS/macOS) - 100%*
⚠️  *Background Sync não disponível no Safari
   (mas sincronização manual funciona)
```

---

## 🎉 Benefícios:

```
✅ Trabalhe totalmente offline
✅ Sem perder dados
✅ Sincronização transparente
✅ Retry automático
✅ Indicadores visuais claros
✅ Funciona em celular e desktop
✅ Não precisa de configuração
```

---

**PWA v28 - Offline First está PRONTO! 🚀**

