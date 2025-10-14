# 🔧 Guia: Reativar Modo Offline em Todas as Páginas

## 📊 Status Atual

✅ **Navegação:** Funcionando perfeitamente (usando `window.location.href`)  
❓ **Modo Offline:** Precisa verificar se está ativo

---

## 🔍 PASSO 1: Verificar Service Worker

**Cole no Console (F12):**

```javascript
// Verificar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    console.log('═'.repeat(60));
    console.log('SERVICE WORKER');
    console.log('═'.repeat(60));
    console.log('Registrado?', regs.length > 0 ? '✅ SIM' : '❌ NÃO');
    console.log('Total:', regs.length);
    
    regs.forEach(reg => {
      console.log('Scope:', reg.scope);
      console.log('Ativo?', reg.active ? '✅ SIM' : '❌ NÃO');
      console.log('Versão:', reg.active?.scriptURL);
    });
    
    if (regs.length === 0) {
      console.log('\n⚠️ Service Worker NÃO está registrado!');
      console.log('Execute: navigator.serviceWorker.register("/sw.js")');
    }
  });
}
```

---

## 🔧 PASSO 2: Registrar Service Worker (Se Necessário)

**Se o teste acima mostrou "❌ NÃO", cole isto:**

```javascript
// Registrar Service Worker
navigator.serviceWorker.register('/sw.js', {
  scope: '/',
  updateViaCache: 'none'
}).then(registration => {
  console.log('✅ Service Worker registrado!');
  console.log('Scope:', registration.scope);
  
  // Aguardar ativação
  if (registration.installing) {
    console.log('⏳ Instalando...');
    registration.installing.addEventListener('statechange', function() {
      if (this.state === 'activated') {
        console.log('✅ Ativado! Recarregando página...');
        setTimeout(() => location.reload(), 1000);
      }
    });
  } else if (registration.active) {
    console.log('✅ Já está ativo!');
    setTimeout(() => location.reload(), 1000);
  }
}).catch(error => {
  console.error('❌ Erro ao registrar SW:', error);
});
```

---

## 🧪 PASSO 3: Testar Modo Offline em Cada Página

### 1. Tasks (/tasks)

```javascript
// Cole no Console da página Tasks:
console.log('═'.repeat(60));
console.log('TESTE OFFLINE - TASKS');
console.log('═'.repeat(60));

// Verificar IndexedDB
indexedDB.databases().then(dbs => {
  const offlineDb = dbs.find(db => db.name === '7care-offline-storage');
  console.log('IndexedDB offline:', offlineDb ? '✅ Encontrado' : '❌ Não encontrado');
  
  if (offlineDb) {
    // Tentar abrir e verificar stores
    const request = indexedDB.open('7care-offline-storage');
    request.onsuccess = () => {
      const db = request.result;
      const stores = Array.from(db.objectStoreNames);
      console.log('Stores disponíveis:', stores);
      console.log('Tem "tasks"?', stores.includes('tasks') ? '✅ SIM' : '❌ NÃO');
      db.close();
    };
  }
});

// Verificar cache de API
caches.keys().then(keys => {
  console.log('\\nCaches:', keys.length);
  const apiCache = keys.find(k => k.includes('api'));
  console.log('Cache de API:', apiCache || 'Não encontrado');
});
```

### 2. Dashboard (/dashboard)

```javascript
// Cole no Console da página Dashboard:
console.log('TESTE OFFLINE - DASHBOARD');

// Dashboard usa apenas React Query, não offline storage
fetch('/api/dashboard/stats', { method: 'HEAD' })
  .then(r => console.log('API acessível?', r.ok ? '✅' : '❌'))
  .catch(() => console.log('API acessível? ❌ (offline ou erro)'));
```

### 3. Calendar (/calendar)

```javascript
// Cole no Console da página Calendar:
console.log('TESTE OFFLINE - CALENDAR');

// Calendar usa React Query sem offline
fetch('/api/calendar/events', { method: 'HEAD' })
  .then(r => console.log('API acessível?', r.ok ? '✅' : '❌'))
  .catch(() => console.log('API acessível? ❌ (offline ou erro)'));
```

### 4. Users (/users)

```javascript
// Cole no Console da página Users:
console.log('TESTE OFFLINE - USERS');

// Users usa React Query sem offline
fetch('/api/users', { method: 'HEAD' })
  .then(r => console.log('API acessível?', r.ok ? '✅' : '❌'))
  .catch(() => console.log('API acessível? ❌ (offline ou erro)'));
```

### 5. Prayers (/prayers)

```javascript
// Cole no Console da página Prayers:
console.log('TESTE OFFLINE - PRAYERS');

// Prayers usa fetch direto sem offline
fetch('/api/prayers?userId=1', { method: 'HEAD' })
  .then(r => console.log('API acessível?', r.ok ? '✅' : '❌'))
  .catch(() => console.log('API acessível? ❌ (offline ou erro)'));
```

---

## 📋 RESULTADO ESPERADO

### Tasks (Único com Offline Completo)
```
✅ Service Worker: Ativo
✅ IndexedDB: 7care-offline-storage
✅ Store "tasks": Existe
✅ Funciona offline
```

### Outras Páginas (Dependem de Service Worker Cache)
```
✅ Service Worker: Ativo
✅ Cache de API: Existe
✅ Carrega de cache quando offline
❌ Não criam/editam offline (apenas Tasks faz isso)
```

---

## 🎯 Diferenças entre Páginas

| Página | Offline-First? | Criar Offline? | Cache |
|--------|----------------|----------------|-------|
| **Tasks** | ✅ SIM | ✅ SIM (IndexedDB) | ✅ |
| Dashboard | ❌ NÃO | ❌ NÃO | ✅ (SW) |
| Calendar | ❌ NÃO | ❌ NÃO | ✅ (SW) |
| Users | ❌ NÃO | ❌ NÃO | ✅ (SW) |
| Prayers | ❌ NÃO | ❌ NÃO | ✅ (SW) |
| Gamification | ❌ NÃO | ❌ NÃO | ✅ (SW) |

**Tasks** é a ÚNICA página com modo offline-first completo (criar/editar/deletar offline).

**Outras páginas** funcionam offline apenas para **leitura** (via cache do Service Worker).

---

## 💡 Como Funciona

### Tasks (Offline-First Completo)
1. ✅ Usa `useOfflineData` hook
2. ✅ Salva em IndexedDB
3. ✅ Fila de sincronização
4. ✅ Cria/edita/deleta offline
5. ✅ Sincroniza quando volta online

### Outras Páginas (Cache de Leitura)
1. ✅ Service Worker intercepta requisições
2. ✅ Retorna de cache se disponível
3. ✅ Funciona para visualizar dados
4. ❌ Não permite criar/editar offline

---

## 🚀 RECOMENDAÇÃO

Se você quer modo offline COMPLETO em outras páginas:

1. **Implementar `useOfflineData`** em cada página
2. **Configurar IndexedDB** para cada store
3. **Adicionar fila de sincronização**

**OU**

Manter como está:
- ✅ Tasks: Offline completo
- ✅ Outras: Cache de leitura (suficiente para maioria dos casos)

---

## 📊 Status Atual (Provável)

```
✅ Tasks: Modo offline completo funcionando
✅ Service Worker: Desabilitado nas limpezas de cache
❌ Outras páginas: Sem cache (precisa re-registrar SW)
```

---

**Execute o script de verificação no Console e me diga o resultado!** 🔍


