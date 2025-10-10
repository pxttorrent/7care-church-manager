# 🔄 GUIA: Forçar Atualização para Service Worker v28

## ⚠️ IMPORTANTE: Leia ANTES de Testar!

O Service Worker v28 precisa ser **instalado e ativado** antes de funcionar. Siga os passos abaixo **EXATAMENTE** para garantir que a atualização ocorra corretamente.

---

## 🚀 PASSO A PASSO - Ativação do SW v28:

### **PASSO 1: Limpar TUDO (CRUCIAL!)**

```
1. Acesse https://7care.netlify.app

2. Pressione F12 (DevTools)

3. Vá na aba "Application" (Chrome) ou "Armazenamento" (Firefox)

4. Clique em "Clear Storage" (lado esquerdo)

5. Marque TODAS as opções:
   ☑️ Application (escolha "Unregister service workers")
   ☑️ Storage (todos)
   ☑️ Cache
   
6. Clique em "Clear site data"

7. FECHE a aba completamente (X)
```

### **PASSO 2: Abrir Nova Aba (Limpa)**

```
1. Abra NOVA aba (Ctrl+T)

2. Acesse https://7care.netlify.app

3. Pressione Ctrl+Shift+R (hard refresh)

4. Aguarde 10 segundos
```

### **PASSO 3: Verificar Instalação do v28**

```
1. Pressione F12 (DevTools)

2. Vá na aba "Console"

3. Procure por estas mensagens (em ordem):
   ✅ "🚀 Iniciando Service Worker v28..."
   ✅ "✅ Service Worker registrado!"
   ✅ "🔄 SW v28: Instalando Service Worker..."
   ✅ "📦 SW v28: Preparando para cachear X assets"
   ✅ "✅ SW v28: Pre-cache completo!"
   ✅ "🎉 SW v28: Features ativas:"
   ✅ "   - Offline Sync Queue (POST/PUT/PATCH)"
```

**SE VIR TODAS AS MENSAGENS ACIMA:**
✅ **SW v28 ATIVADO COM SUCESSO!**
Pule para "TESTE OFFLINE" abaixo.

**SE NÃO VIR ou ver mensagens de v27:**
⚠️ Ainda usando versão antiga.
Continue para PASSO 4.

### **PASSO 4: Forçar Ativação Manual (se necessário)**

```
1. Pressione F12 (DevTools)

2. Vá na aba "Application"

3. Clique em "Service Workers" (lado esquerdo)

4. Você verá algo assim:
   
   Source: sw.js
   Status: waiting to activate
   
   OU
   
   Source: sw.js
   Status: activated and is running

5. Se mostrar "waiting to activate":
   - Clique no botão "skipWaiting"
   - A página vai recarregar
   
6. Se mostrar "activated":
   - Marque "Update on reload"
   - Pressione Ctrl+Shift+R
   
7. Aguarde aparecer no console:
   "✅ SW v28: Service Worker carregado"
```

### **PASSO 5: Verificar que v28 Está Ativo**

Cole este código no Console (F12):

```javascript
(async function() {
  const reg = await navigator.serviceWorker.ready;
  console.log('✅ Service Worker:', reg.active ? 'ATIVO' : 'INATIVO');
  
  // Forçar skip waiting se houver update pendente
  if (reg.waiting) {
    console.log('🔄 Ativando versão nova...');
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => window.location.reload(), 1000);
  } else if (reg.active) {
    console.log('✅ Versão ativa está rodando!');
  }
})();
```

---

## 🧪 TESTE OFFLINE - Depois do SW v28 Ativo:

### **TESTE 1: Verificar Cache**

```
1. ONLINE: Vá em /calendar
2. ONLINE: Aguarde 5 segundos
3. ONLINE: Console deve mostrar:
   "💾 SW v28: API cached: /api/events"
```

### **TESTE 2: Criar Evento Offline**

```
4. OFFLINE: Ative modo avião ✈️

5. OFFLINE: Pressione Ctrl+R (reload)

6. OFFLINE: Console deve mostrar:
   "📡 SW v28: OFFLINE - Buscando dados do cache: /api/events"
   "✅ SW v28: X itens retornados do cache"

7. OFFLINE: Clique em "Novo Evento" (+)

8. OFFLINE: Preencha:
   - Título: "Teste Offline v28"
   - Data: Hoje
   - Local: "Igreja"
   - Tipo: "Reunião"

9. OFFLINE: Salve

10. OFFLINE: Console DEVE mostrar:
    "📝 SW v28: OFFLINE - Salvando operação: POST /api/events"
    "✅ SW v28: Operação salva na fila"
    "💾 SW v28: Dados locais salvos para /api/events com ID temp_xxx"
```

**SE VIR ESSAS MENSAGENS:**
✅ Sistema funcionando!
Evento deve aparecer na lista.

**SE NÃO VIR:**
❌ SW não está interceptando.
Me envie print do Console inteiro.

### **TESTE 3: Verificar Aparecimento**

```
11. OFFLINE: Recarregue a página (Ctrl+R)

12. OFFLINE: Vá em /calendar novamente

13. OFFLINE: Console deve mostrar:
    "📡 SW v28: OFFLINE - Buscando dados: /api/events"
    "✅ SW v28: X itens retornados do cache"
    "🔀 SW v28: Mesclando 1 itens locais com X do cache"
    "✅ SW v28: Total após mesclagem: X+1 itens"

14. ✅ Evento "Teste Offline v28" DEVE APARECER na lista!
```

### **TESTE 4: Sincronização**

```
15. ONLINE: Desative modo avião

16. Banner deve aparecer:
    "⚠️ 1 alteração pendente [Sincronizar]"

17. Clique em "Sincronizar" (ou aguarde auto-sync)

18. Console mostrará:
    "🔄 SW v28: Sincronizando 1 itens pendentes..."
    "📤 SW v28: Sincronizando POST .../api/events"
    "✅ SW v28: Item 1 sincronizado com sucesso"
    "🧹 SW v28: Dados locais removidos"

19. Banner: "✅ Sincronizado! 1 alteração enviada"

20. Página recarrega automaticamente

21. ✅ Evento agora tem ID REAL do servidor!
```

---

## 🔍 Diagnóstico Rápido:

Cole este código no Console para diagnóstico completo:

```javascript
(async function diagnose() {
  console.log('\n🔍 DIAGNÓSTICO RÁPIDO:\n');
  
  // 1. SW Status
  console.log('1. Service Worker:');
  console.log('   Controlador:', !!navigator.serviceWorker.controller);
  
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg) {
    console.log('   Ativo:', !!reg.active);
    console.log('   Waiting:', !!reg.waiting);
    console.log('   Installing:', !!reg.installing);
  }
  
  // 2. Caches
  console.log('\n2. Caches:');
  const cacheNames = await caches.keys();
  console.log('   Nomes:', cacheNames);
  
  const hasV28 = cacheNames.some(n => n.includes('v28'));
  console.log('   Tem v28:', hasV28 ? '✅ SIM' : '❌ NÃO');
  
  // 3. IndexedDB
  console.log('\n3. IndexedDB:');
  const dbs = await indexedDB.databases();
  console.log('   Databases:', dbs.map(d => d.name));
  
  const hasSyncDB = dbs.some(d => d.name === '7care-sync-db');
  if (hasSyncDB) {
    const db = await new Promise(r => {
      const req = indexedDB.open('7care-sync-db');
      req.onsuccess = () => r(req.result);
    });
    console.log('   Stores:', Array.from(db.objectStoreNames));
    
    const hasLocalData = db.objectStoreNames.contains('local-data');
    console.log('   Tem local-data:', hasLocalData ? '✅ SIM' : '❌ NÃO');
  }
  
  // Conclusão
  console.log('\n📊 RESUMO:');
  if (reg && reg.active && hasV28) {
    console.log('   ✅ SW v28 ATIVO - Pronto para teste!');
  } else if (!reg || !reg.active) {
    console.log('   ❌ SW NÃO ATIVO - Siga PASSO 4');
  } else if (!hasV28) {
    console.log('   ❌ Ainda em versão antiga - Limpe cache (PASSO 1)');
  }
})();
```

---

## ❌ SE NADA FUNCIONAR:

### **Opção A: Desregistrar e Reregistrar**

```javascript
// Cole no console:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
  console.log('✅ Todos os SW desregistrados');
  setTimeout(() => window.location.reload(), 1000);
});
```

### **Opção B: Modo Incógnito**

```
1. Abra janela anônima (Ctrl+Shift+N)
2. Acesse https://7care.netlify.app
3. Faça login
4. Teste o fluxo offline
```

---

## 📋 ME ENVIE SE NÃO FUNCIONAR:

1. **Console completo** (copie e cole TUDO)
2. **Captura de tela** da aba "Application → Service Workers"
3. **Resultado do código de diagnóstico** acima

**Com isso vou identificar e corrigir o problema!** 🔍

