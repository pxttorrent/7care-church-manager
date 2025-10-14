# 🧪 Guia de Teste de Limpeza Completa

## Como Testar a Limpeza de Dados

---

## Opção 1: Pelo Botão na Interface (RECOMENDADO) ✅

### Passo a Passo:

1. **Abra o navegador**
   - Chrome, Edge, Firefox ou Safari

2. **Acesse o sistema**
   ```
   https://7care.netlify.app/
   ```

3. **Faça login como admin**
   - Email: admin@7care.com
   - Senha: (sua senha de admin)

4. **Abra o Console do Navegador**
   - Pressione `F12` (Windows/Linux)
   - Ou `Cmd + Option + J` (Mac)
   - Ou clique com botão direito → "Inspecionar" → aba "Console"

5. **Vá para Configurações**
   - Clique no menu lateral
   - Selecione "Configurações"

6. **Acesse Gestão de Dados**
   - Clique na aba "Gestão de Dados"
   - Você verá o botão vermelho "Limpar Dados"

7. **Clique em "Limpar Dados"**
   - Um diálogo de confirmação aparecerá
   - Clique em "Confirmar"

8. **Observe os Logs no Console**
   - Você verá mensagens detalhadas como:
   ```
   🧹 Iniciando limpeza completa do sistema...
   📡 Limpando banco de dados...
   ✅ Banco de dados limpo
   🗑️ Limpando React Query cache...
   ✅ React Query cache limpo
   ... etc
   ```

9. **Aguarde o Reload Automático**
   - A página será recarregada em 3 segundos
   - Mensagem aparecerá: "Sistema limpo com sucesso"

10. **Verifique as Páginas**
    - Dashboard → deve estar vazio
    - Usuários → apenas admin
    - Eventos → agenda vazia
    - Tarefas → lista vazia
    - Chat → sem mensagens
    - Etc.

---

## Opção 2: Script no Console do Navegador 🖥️

### Passo a Passo:

1. **Abra o sistema**
   ```
   https://7care.netlify.app/
   ```

2. **Faça login como admin**

3. **Abra o Console (F12)**

4. **Cole o script**
   - Abra o arquivo: `teste-limpeza-manual.js`
   - Copie TODO o conteúdo
   - Cole no console
   - Pressione Enter

5. **Observe os Logs**
   ```
   🧹 INICIANDO TESTE DE LIMPEZA COMPLETA
   ════════════════════════════════════
   
   📡 ETAPA 1: Limpando banco de dados...
   ✅ Banco de dados limpo
   
   🗑️ ETAPA 2: Limpando React Query cache...
   ✅ React Query cache limpo
   
   ... e assim por diante
   ```

6. **Aguarde o Reload**
   - Automático em 3 segundos

7. **Verifique o Resultado**

---

## Opção 3: Via Terminal (Servidor Local) 💻

Se você estiver com o servidor rodando localmente:

1. **Abra o terminal**

2. **Execute o comando:**
   ```bash
   curl -X POST http://localhost:5000/api/system/clear-all \
     -H "Content-Type: application/json" \
     | json_pp
   ```

3. **Veja o resultado:**
   ```json
   {
     "success": true,
     "message": "Todos os dados foram limpos com sucesso!",
     "details": {
       "operationsExecuted": 24,
       "warnings": 0,
       "timestamp": "2025-10-14T..."
     }
   }
   ```

---

## O Que Observar Durante o Teste 👀

### Logs Esperados no Console:

```
🧹 Iniciando limpeza completa do sistema...
📡 Limpando banco de dados...
✅ Banco de dados limpo

🗑️ Limpando React Query cache...
✅ React Query cache limpo

🗑️ Limpando IndexedDB...
  Deletando database: 7care-sync-db
  Deletando database: offline-storage
✅ IndexedDB limpo

🗑️ Limpando localStorage...
  Removendo: user-data
  Removendo: events-cache
✅ localStorage limpo

🗑️ Limpando sessionStorage...
✅ sessionStorage limpo

🗑️ Limpando Service Worker cache...
  Deletando cache: 7care-v28-precache-total
  Deletando cache: 7care-api-v28
✅ Service Worker cache limpo

🗑️ Desregistrando Service Worker...
  Encontrados 1 Service Workers registrados
  Desregistrando SW: https://7care.netlify.app/
  Enviando mensagem de SKIP_WAITING para SW ativo
✅ Service Worker desregistrado

🎉 LIMPEZA COMPLETA CONCLUÍDA!
ℹ️ A página será recarregada em 3 segundos...
```

### Mensagem de Sucesso:

Uma notificação toast aparecerá:
```
✅ Sistema limpo com sucesso
Todos os dados foram removidos: banco de dados, 
cache, localStorage, IndexedDB e Service Worker.
```

---

## Como Verificar Se Funcionou ✅

### Após o reload, verifique:

1. **Dashboard**
   - ✅ Sem estatísticas
   - ✅ Sem usuários recentes
   - ✅ Sem eventos próximos

2. **Usuários**
   - ✅ Apenas usuário admin na lista
   - ✅ Total: 1 usuário

3. **Eventos/Agenda**
   - ✅ Calendário vazio
   - ✅ Sem eventos

4. **Tarefas**
   - ✅ Lista vazia
   - ✅ Sem tarefas

5. **Chat**
   - ✅ Sem conversas
   - ✅ Sem mensagens

6. **Interessados**
   - ✅ Lista vazia

7. **Orações**
   - ✅ Lista vazia

8. **Service Worker (F12 → Application → Service Workers)**
   - ❌ **NENHUM Service Worker registrado** 
   - Ou mostrará "Nenhum service worker"

9. **Cache Storage (F12 → Application → Cache Storage)**
   - ❌ **Vazio ou sem caches**

10. **IndexedDB (F12 → Application → IndexedDB)**
    - ❌ **Sem bancos de dados**
    - Ou bancos vazios

---

## Problemas Comuns e Soluções 🔧

### Problema 1: "Erro ao limpar dados"
**Solução:**
- Verifique se está logado como admin
- Recarregue a página (F5)
- Tente novamente

### Problema 2: Dados ainda aparecem
**Solução:**
- Limpe o cache manualmente: `Ctrl + Shift + Delete`
- Feche e reabra o navegador
- Execute o script no console

### Problema 3: Service Worker ainda ativo
**Solução:**
- Vá em F12 → Application → Service Workers
- Clique em "Unregister" manualmente
- Recarregue a página

### Problema 4: "Network Error"
**Solução:**
- Verifique sua conexão com internet
- Veja se o servidor está online
- Tente novamente em alguns segundos

---

## Checklist de Teste ✓

Antes de testar:
- [ ] Fazer backup do banco de dados
- [ ] Avisar outros usuários
- [ ] Anotar dados importantes

Durante o teste:
- [ ] Abrir console (F12)
- [ ] Observar todos os logs
- [ ] Anotar mensagens de erro (se houver)

Após o teste:
- [ ] Verificar Dashboard vazio
- [ ] Verificar Usuários (só admin)
- [ ] Verificar Eventos vazios
- [ ] Verificar Service Worker desregistrado
- [ ] Verificar Cache vazio
- [ ] Tentar fazer login novamente
- [ ] Criar um novo evento de teste
- [ ] Criar um novo usuário de teste

---

## Comandos Úteis no Console 🛠️

### Verificar estado atual:

```javascript
// Verificar localStorage
console.log('localStorage:', localStorage.length, 'chaves');

// Verificar sessionStorage  
console.log('sessionStorage:', sessionStorage.length, 'chaves');

// Verificar IndexedDB
indexedDB.databases().then(dbs => console.log('IndexedDB:', dbs));

// Verificar Service Worker
navigator.serviceWorker.getRegistrations().then(regs => 
  console.log('Service Workers:', regs.length)
);

// Verificar Cache
caches.keys().then(keys => console.log('Caches:', keys));
```

### Limpar manualmente (se necessário):

```javascript
// Limpar localStorage
localStorage.clear();

// Limpar sessionStorage
sessionStorage.clear();

// Limpar todos os caches
caches.keys().then(keys => 
  Promise.all(keys.map(key => caches.delete(key)))
);

// Desregistrar Service Workers
navigator.serviceWorker.getRegistrations().then(regs => 
  Promise.all(regs.map(reg => reg.unregister()))
);
```

---

## Contato para Suporte 📞

Se encontrar problemas:
1. Copie todos os logs do console
2. Tire prints da tela
3. Anote mensagens de erro
4. Entre em contato com suporte

---

## Conclusão 🎯

A limpeza está funcionando **100% corretamente** se:
- ✅ Todos os logs aparecem no console
- ✅ Mensagem de sucesso é exibida
- ✅ Página recarrega automaticamente
- ✅ Todas as páginas ficam vazias
- ✅ Service Worker é desregistrado
- ✅ Cache é limpo

**Boa sorte com o teste!** 🚀

