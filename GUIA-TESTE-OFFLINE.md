# 🧪 Guia de Teste - Armazenamento Offline

## ✅ O QUE FOI IMPLEMENTADO:

### 1. **Armazenamento Local (IndexedDB)**
- ✅ Sistema de banco de dados local no navegador
- ✅ Armazena tarefas mesmo sem internet
- ✅ Fila de sincronização automática

### 2. **Hook `useOfflineData`**
- ✅ Gerenciamento automático offline/online
- ✅ Sincronização transparente
- ✅ Otimista: mudanças aparecem imediatamente

### 3. **Página Tasks Atualizada**
- ✅ Funciona 100% offline
- ✅ Indicadores visuais de status
- ✅ Badges mostrando itens pendentes

---

## 🚀 COMO TESTAR (PASSO A PASSO):

### **1. Acessar a Aplicação**

**Produção:** https://7care.netlify.app

Aguarde o deploy terminar (~2-3 minutos após o push)

---

### **2. Fazer Login**

Faça login normalmente na aplicação.

---

### **3. Acessar Tarefas**

1. Clique em **Menu**
2. Clique em **Tarefas**

Você verá no topo da página:
- ✅ Badge **"Online"** (verde)
- Últim sincronização

---

### **4. Teste 1: Criar Tarefa ONLINE**

#### **Ação:**
1. Clique em **"Nova Tarefa"**
2. Preencha:
   - **Título:** "Teste Online"
   - **Descrição:** "Tarefa criada online"
   - **Prioridade:** Alta
3. Clique em **"Criar Tarefa"**

#### **Resultado Esperado:**
- ✅ Tarefa aparece imediatamente na lista
- ✅ Toast: "Tarefa criada com sucesso!"
- ✅ **SEM badge "Pendente"** (foi sincronizada)

---

### **5. Teste 2: Verificar IndexedDB**

#### **Ação:**
1. Pressione **F12** (DevTools)
2. Vá em **Application** → **IndexedDB** → **7care-offline-db** → **tasks**

#### **Resultado Esperado:**
- ✅ Você vê a tarefa "Teste Online" salva
- ✅ Propriedade `_synced: true`

---

### **6. Teste 3: Simular OFFLINE**

#### **Ação:**
1. **DevTools** → **Network** → **Throttling** → **Offline**
2. Ou use o atalho do navegador para modo offline

#### **Resultado Esperado:**
- ✅ Badge muda para **"Offline"** (amarelo)
- ✅ Mensagem: "Modo offline - suas alterações serão sincronizadas quando conectar"

---

### **7. Teste 4: Criar Tarefa OFFLINE**

#### **Ação:**
1. Clique em **"Nova Tarefa"**
2. Preencha:
   - **Título:** "Teste Offline"
   - **Descrição:** "Tarefa criada sem internet"
   - **Prioridade:** Média
3. Clique em **"Criar Tarefa"**

#### **Resultado Esperado:**
- ✅ Tarefa aparece **IMEDIATAMENTE** na lista
- ✅ Toast: "Tarefa salva offline. Será sincronizada quando conectar." (com ícone 📴)
- ✅ Tarefa tem **badge "Pendente"** (amarelo)
- ✅ **Borda esquerda amarela** na tarefa

---

### **8. Teste 5: Editar Tarefa OFFLINE**

#### **Ação:**
1. Clique nos **3 pontinhos** da tarefa "Teste Offline"
2. Clique em **"Editar"**
3. Altere o título para: "Teste Offline EDITADO"
4. Clique em **"Salvar"**

#### **Resultado Esperado:**
- ✅ Mudança aparece imediatamente
- ✅ Toast: "Tarefa atualizada offline..."
- ✅ Badge "Pendente" continua

---

### **9. Teste 6: Verificar Fila de Sincronização**

#### **Ação:**
1. **DevTools** → **IndexedDB** → **7care-offline-db** → **sync_queue**

#### **Resultado Esperado:**
- ✅ Você vê **2 itens** na fila:
  - CREATE (Teste Offline)
  - UPDATE (Teste Offline EDITADO)
- ✅ Cada item tem `status: "pending"`

---

### **10. Teste 7: Voltar ONLINE e Sincronizar**

#### **Ação:**
1. **DevTools** → **Network** → **Throttling** → **Online**
2. Ou desative modo offline do navegador

#### **Resultado Esperado:**
- ✅ Badge muda para **"Online"** (verde)
- ✅ Aparece badge **"Sincronizando..."** (azul, com animação)
- ✅ Após ~2-5 segundos:
  - Badge "Pendente" desaparece
  - Borda amarela desaparece
  - Toast ou log: "X item(ns) sincronizado(s)"

---

### **11. Teste 8: Verificar Sincronização**

#### **Ação:**
1. **DevTools** → **IndexedDB** → **7care-offline-db** → **sync_queue**

#### **Resultado Esperado:**
- ✅ Fila está **vazia** (todos os itens foram sincronizados)

2. **IndexedDB** → **tasks**

#### **Resultado Esperado:**
- ✅ Tarefa "Teste Offline EDITADO" tem:
  - `_synced: true`
  - `id` mudou de `temp_...` para ID numérico real

---

### **12. Teste 9: Recarregar Página**

#### **Ação:**
1. Pressione **F5** (recarregar)
2. Faça login novamente (se necessário)
3. Acesse **Tarefas**

#### **Resultado Esperado:**
- ✅ **Todas as tarefas** continuam aparecendo
- ✅ Tarefas criadas offline estão presentes
- ✅ Dados persistiram após reload

---

### **13. Teste 10: Sincronização Manual**

#### **Ação:**
1. Crie uma tarefa offline
2. Volte online
3. Clique no botão **"Sincronizar"** (no topo da página)

#### **Resultado Esperado:**
- ✅ Ícone gira (animação de carregamento)
- ✅ Sincronização acontece
- ✅ Badge "Pendente" desaparece

---

### **14. Teste 11: Marcar como Concluída OFFLINE**

#### **Ação:**
1. Modo offline
2. Clique no **círculo** ao lado de uma tarefa para marcar como concluída

#### **Resultado Esperado:**
- ✅ Status muda para "Concluída" imediatamente
- ✅ Toast: "Status atualizado offline"
- ✅ Badge "Pendente" aparece

---

### **15. Teste 12: Deletar OFFLINE**

#### **Ação:**
1. Modo offline
2. Clique nos **3 pontinhos** → **"Deletar"**
3. Confirme

#### **Resultado Esperado:**
- ✅ Tarefa some da lista imediatamente
- ✅ Toast: "Tarefa deletada offline..."
- ✅ Operação vai para fila de sync

---

## 📊 INDICADORES VISUAIS:

### **Badges no Header:**

| Badge | Cor | Significado |
|-------|-----|-------------|
| 🟢 Online | Verde | Conectado à internet |
| 🟡 Offline | Amarelo | Sem internet |
| 🔵 Sincronizando... | Azul (pulsando) | Sincronização em andamento |
| 🟠 X pendente(s) | Laranja | Itens aguardando sincronização |

### **Indicadores nas Tarefas:**

| Indicador | Significado |
|-----------|-------------|
| Borda amarela à esquerda | Tarefa não sincronizada |
| Badge "Pendente" | Aguardando sincronização |

---

## 🔍 VERIFICAÇÃO NO CONSOLE:

### **Ao Iniciar App:**
```
✅ OfflineStorage inicializado globalmente
✅ OfflineStorage inicializado para Tasks
```

### **Ao Criar Tarefa Offline:**
```
💾 [tasks] Item criado localmente: temp_...
📝 Adicionado à fila: CREATE /api/tasks
```

### **Ao Sincronizar:**
```
🔄 Iniciando sincronização com servidor...
📦 X itens para sincronizar
✅ CREATE sincronizado e atualizado: tasks#123
🔄 Sincronização concluída: ✅ X sucesso, ❌ 0 falhas
```

---

## ❌ SOLUÇÃO DE PROBLEMAS:

### **Tarefa não aparece offline:**
1. Verifique console por erros
2. F12 → Application → IndexedDB → 7care-offline-db
3. Veja se a tarefa está salva em `tasks`

### **Sincronização não acontece:**
1. Verifique se está realmente online
2. Veja console por erros de rede
3. Verifique `sync_queue` no IndexedDB

### **Badge "Pendente" não some:**
1. Aguarde ~5-10 segundos (sincronização pode demorar)
2. Clique em "Sincronizar" manualmente
3. Recarregue a página

### **Limpar Tudo e Recomeçar:**
```javascript
// Cole no console:
indexedDB.deleteDatabase('7care-offline-db');
// Depois recarregue a página
```

---

## 🎯 CHECKLIST COMPLETO:

- [ ] **Teste 1:** Criar tarefa online ✅
- [ ] **Teste 2:** Verificar IndexedDB ✅
- [ ] **Teste 3:** Entrar em modo offline ✅
- [ ] **Teste 4:** Criar tarefa offline ✅
- [ ] **Teste 5:** Editar tarefa offline ✅
- [ ] **Teste 6:** Verificar fila de sync ✅
- [ ] **Teste 7:** Voltar online e sincronizar ✅
- [ ] **Teste 8:** Verificar fila vazia após sync ✅
- [ ] **Teste 9:** Recarregar e ver dados persistindo ✅
- [ ] **Teste 10:** Sincronização manual ✅
- [ ] **Teste 11:** Marcar como concluída offline ✅
- [ ] **Teste 12:** Deletar offline ✅

---

## ✅ SUCESSO TOTAL:

Se todos os 12 testes passaram:

**🎉 PARABÉNS! O sistema offline está funcionando perfeitamente!**

---

## 📝 PRÓXIMOS PASSOS (OPCIONAL):

1. **Expandir para outras páginas:**
   - Calendar
   - Interested
   - Prayers
   - Users

2. **Melhorias futuras:**
   - Resolução de conflitos (se editar offline e online simultaneamente)
   - Indicador de quanto tempo está offline
   - Download manual de dados para offline

---

**Desenvolvido por:** Cursor AI  
**Data:** 10 de Outubro de 2025  
**Versão:** 1.0 - Tasks Offline-First

