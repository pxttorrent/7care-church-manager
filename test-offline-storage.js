/**
 * 🧪 SCRIPT DE TESTE - OfflineStorage
 * 
 * Para executar:
 * 1. Abra https://7care.netlify.app em modo desenvolvedor (F12)
 * 2. Cole este script inteiro no console
 * 3. Aguarde os resultados
 */

(async function testOfflineStorage() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🧪 TESTE DO OFFLINE STORAGE                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // ========================================
    // 1. VERIFICAR SE INDEXEDDB ESTÁ DISPONÍVEL
    // ========================================
    console.log('1️⃣ Verificando disponibilidade do IndexedDB...');
    
    if (!window.indexedDB) {
      console.error('❌ IndexedDB não está disponível neste navegador!');
      return;
    }
    console.log('✅ IndexedDB disponível\n');

    // ========================================
    // 2. ABRIR BANCO MANUALMENTE
    // ========================================
    console.log('2️⃣ Abrindo banco 7care-offline-db...');
    
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('7care-offline-db', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Criar stores
        const stores = [
          { name: 'tasks', keyPath: 'id' },
          { name: 'users', keyPath: 'id' },
          { name: 'sync_queue', keyPath: 'id' },
          { name: 'metadata', keyPath: 'key' }
        ];

        stores.forEach(config => {
          if (!db.objectStoreNames.contains(config.name)) {
            db.createObjectStore(config.name, { keyPath: config.keyPath });
            console.log(`   📦 Store "${config.name}" criado`);
          }
        });
      };
    });

    console.log('✅ Banco aberto com sucesso');
    console.log(`   Stores disponíveis: ${Array.from(db.objectStoreNames).join(', ')}\n`);

    // ========================================
    // 3. TESTAR SALVAR TAREFA
    // ========================================
    console.log('3️⃣ Testando salvar tarefa...');
    
    const testTask = {
      id: `test_${Date.now()}`,
      title: 'Tarefa de Teste Offline',
      description: 'Esta é uma tarefa criada para testar o armazenamento offline',
      status: 'pending',
      priority: 'high',
      created_by: 1,
      created_at: new Date().toISOString(),
      _localModified: new Date().toISOString(),
      _synced: false
    };

    await new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.put(testTask);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('✅ Tarefa salva com sucesso');
    console.log('   ID:', testTask.id);
    console.log('   Título:', testTask.title, '\n');

    // ========================================
    // 4. TESTAR BUSCAR TAREFAS
    // ========================================
    console.log('4️⃣ Testando buscar tarefas...');
    
    const tasks = await new Promise((resolve, reject) => {
      const transaction = db.transaction('tasks', 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    console.log(`✅ ${tasks.length} tarefa(s) encontrada(s)`);
    tasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title} (${task.status})`);
    });
    console.log('');

    // ========================================
    // 5. TESTAR FILA DE SINCRONIZAÇÃO
    // ========================================
    console.log('5️⃣ Testando fila de sincronização...');
    
    const queueItem = {
      id: `sync_${Date.now()}`,
      type: 'CREATE',
      storeName: 'tasks',
      endpoint: '/api/tasks',
      data: testTask,
      timestamp: new Date().toISOString(),
      attempts: 0,
      status: 'pending'
    };

    await new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.put(queueItem);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('✅ Item adicionado à fila');
    console.log('   Tipo:', queueItem.type);
    console.log('   Endpoint:', queueItem.endpoint, '\n');

    // ========================================
    // 6. VERIFICAR FILA
    // ========================================
    console.log('6️⃣ Verificando fila de sincronização...');
    
    const queue = await new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    console.log(`✅ ${queue.length} item(ns) na fila`);
    queue.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.type} ${item.endpoint} (${item.status})`);
    });
    console.log('');

    // ========================================
    // 7. SALVAR METADATA
    // ========================================
    console.log('7️⃣ Testando metadata...');
    
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('metadata', 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({
        key: 'last_sync',
        value: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('✅ Metadata salva com sucesso\n');

    // ========================================
    // 8. ESTATÍSTICAS FINAIS
    // ========================================
    console.log('8️⃣ Estatísticas Finais:');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log(`║  📊 RESULTADOS                                               ║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Tarefas armazenadas: ${tasks.length.toString().padEnd(35)}║`);
    console.log(`║  ✅ Itens na fila: ${queue.length.toString().padEnd(41)}║`);
    console.log(`║  ✅ Status: TUDO FUNCIONANDO!${' '.repeat(26)}║`);
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // ========================================
    // 9. LIMPAR DADOS DE TESTE (OPCIONAL)
    // ========================================
    console.log('9️⃣ Limpeza (opcional):');
    console.log('   Para limpar os dados de teste, execute:');
    console.log('   → limparTestesOffline()\n');

    // Criar função global para limpar
    window.limparTestesOffline = async function() {
      const tx = db.transaction(['tasks', 'sync_queue', 'metadata'], 'readwrite');
      
      await Promise.all([
        new Promise(resolve => {
          const req = tx.objectStore('tasks').clear();
          req.onsuccess = resolve;
        }),
        new Promise(resolve => {
          const req = tx.objectStore('sync_queue').clear();
          req.onsuccess = resolve;
        }),
        new Promise(resolve => {
          const req = tx.objectStore('metadata').clear();
          req.onsuccess = resolve;
        })
      ]);

      console.log('🧹 Dados de teste limpos!');
    };

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ TODOS OS TESTES PASSARAM!                                ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('╔══════════════════════════════════════════════════════════════╗');
    console.error('║  ❌ ERRO NO TESTE                                            ║');
    console.error('╚══════════════════════════════════════════════════════════════╝');
    console.error('Erro:', error);
    console.error('Stack:', error.stack);
  }
})();

