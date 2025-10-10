/**
 * 🔍 DIAGNÓSTICO COMPLETO - Tasks 0 quando deveria ter 9
 * 
 * Execute em: https://7care.netlify.app/tasks
 * Console (F12)
 */

(async function diagnosticoCompleto() {
  console.clear();
  console.log('%c╔══════════════════════════════════════════════════════════════╗', 'color: #ff0000; font-weight: bold;');
  console.log('%c║  🚨 DIAGNÓSTICO COMPLETO - TASKS ZERADAS                     ║', 'color: #ff0000; font-weight: bold;');
  console.log('%c╚══════════════════════════════════════════════════════════════╝', 'color: #ff0000; font-weight: bold;');

  const resultados = {};

  try {
    // ========================================
    // 1. VERIFICAR CONFIGURAÇÃO GOOGLE SHEETS
    // ========================================
    console.log('\n%c1️⃣ CONFIGURAÇÃO GOOGLE SHEETS:', 'font-weight: bold; color: #0066ff;');
    
    const config = localStorage.getItem('google-drive-sync-config');
    
    if (!config) {
      console.error('   ❌ Google Sheets NÃO CONFIGURADO!');
      resultados.googleSheets = 'NÃO CONFIGURADO';
    } else {
      const configObj = JSON.parse(config);
      console.log('   ✅ Configurado');
      console.log('   URL:', configObj.spreadsheetUrl);
      resultados.googleSheets = 'CONFIGURADO';
      resultados.sheetsUrl = configObj.spreadsheetUrl;
    }

    // ========================================
    // 2. VERIFICAR DADOS NO SERVIDOR (API)
    // ========================================
    console.log('\n%c2️⃣ TAREFAS NO SERVIDOR (API):', 'font-weight: bold; color: #0066ff;');
    
    const serverResponse = await fetch('/api/tasks', {
      headers: { 'x-user-id': '1' }
    });

    console.log('   Status:', serverResponse.status, serverResponse.statusText);

    if (serverResponse.ok) {
      const serverData = await serverResponse.json();
      const serverTasks = serverData.tasks || serverData || [];
      
      console.log('   ✅ Resposta OK');
      console.log('   📊 Total de tarefas:', serverTasks.length);
      
      resultados.servidor = serverTasks.length;
      
      if (serverTasks.length > 0) {
        console.log('   Primeiras 3 tarefas:');
        serverTasks.slice(0, 3).forEach((task, i) => {
          console.log(`      ${i + 1}. [${task.id}] ${task.title} (${task.status})`);
        });
      } else {
        console.warn('   ⚠️ SERVIDOR TEM 0 TAREFAS!');
      }
    } else {
      console.error('   ❌ Erro ao buscar do servidor');
      resultados.servidor = 'ERRO';
    }

    // ========================================
    // 3. VERIFICAR INDEXEDDB LOCAL
    // ========================================
    console.log('\n%c3️⃣ TAREFAS NO INDEXEDDB LOCAL:', 'font-weight: bold; color: #0066ff;');
    
    try {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('7care-offline-db', 1);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onupgradeneeded = (event) => {
          console.log('   🔨 Criando banco pela primeira vez...');
          const db = event.target.result;
          if (!db.objectStoreNames.contains('tasks')) {
            db.createObjectStore('tasks', { keyPath: 'id' });
          }
        };
      });

      const tx = db.transaction('tasks', 'readonly');
      const localTasks = await new Promise((resolve, reject) => {
        const req = tx.objectStore('tasks').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      console.log('   📦 Total de tarefas:', localTasks.length);
      resultados.indexedDB = localTasks.length;
      
      if (localTasks.length > 0) {
        console.log('   Primeiras 3 tarefas:');
        localTasks.slice(0, 3).forEach((task, i) => {
          console.log(`      ${i + 1}. [${task.id}] ${task.title} (synced: ${task._synced})`);
        });
      } else {
        console.warn('   ⚠️ INDEXEDDB TEM 0 TAREFAS!');
      }
    } catch (error) {
      console.error('   ❌ Erro ao acessar IndexedDB:', error);
      resultados.indexedDB = 'ERRO';
    }

    // ========================================
    // 4. VERIFICAR REACT QUERY CACHE
    // ========================================
    console.log('\n%c4️⃣ REACT QUERY CACHE:', 'font-weight: bold; color: #0066ff;');
    
    // Tentar acessar queryClient global
    if (window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('   ℹ️ React Query DevTools detectado');
    }
    
    console.log('   (Dados carregados via useOfflineData)');

    // ========================================
    // 5. TESTAR IMPORTAÇÃO GOOGLE SHEETS
    // ========================================
    if (config) {
      console.log('\n%c5️⃣ TESTANDO IMPORTAÇÃO GOOGLE SHEETS:', 'font-weight: bold; color: #0066ff;');
      
      const configObj = JSON.parse(config);
      const match = configObj.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      
      if (match) {
        const spreadsheetId = match[1];
        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
        
        console.log('   📊 Importando do Google Sheets...');
        
        const importResponse = await fetch('/api/tasks/sync-google-drive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvUrl, spreadsheetUrl: configObj.spreadsheetUrl })
        });

        const importResult = await importResponse.json();
        
        console.log('   Resposta completa:', importResult);
        
        if (importResult.success) {
          console.log('   ✅ Importação bem-sucedida!');
          console.log('   📥 Total importadas:', importResult.importedTasks);
          console.log('   📊 Total no Sheets:', importResult.totalTasks);
          resultados.importacao = importResult.importedTasks;
        } else {
          console.error('   ❌ Falha na importação');
          console.error('   Erro:', importResult.error || importResult.message);
          resultados.importacao = 'FALHOU';
        }
      }
    }

    // ========================================
    // 6. VERIFICAR FILA DE SINCRONIZAÇÃO
    // ========================================
    console.log('\n%c6️⃣ FILA DE SINCRONIZAÇÃO:', 'font-weight: bold; color: #0066ff;');
    
    try {
      const db = await new Promise(resolve => {
        const req = indexedDB.open('7care-offline-db', 1);
        req.onsuccess = () => resolve(req.result);
      });

      const tx = db.transaction('sync_queue', 'readonly');
      const queue = await new Promise(resolve => {
        const req = tx.objectStore('sync_queue').getAll();
        req.onsuccess = () => resolve(req.result);
      });

      console.log('   📝 Itens na fila:', queue.length);
      resultados.fila = queue.length;
      
      if (queue.length > 0) {
        console.log('   Itens:');
        queue.forEach((item, i) => {
          console.log(`      ${i + 1}. ${item.type} ${item.endpoint} (${item.status})`);
        });
      }
    } catch (error) {
      console.log('   ℹ️ Sem fila ou erro:', error.message);
      resultados.fila = 0;
    }

    // ========================================
    // RESUMO FINAL
    // ========================================
    console.log('\n%c╔══════════════════════════════════════════════════════════════╗', 'font-weight: bold; color: #ff6600;');
    console.log('%c║  📊 RESUMO DO DIAGNÓSTICO                                    ║', 'font-weight: bold; color: #ff6600;');
    console.log('%c╠══════════════════════════════════════════════════════════════╣', 'font-weight: bold; color: #ff6600;');
    console.log(`%c║  Google Sheets: ${String(resultados.googleSheets).padEnd(44)} ║`, 'color: #ff6600;');
    console.log(`%c║  Servidor: ${String(resultados.servidor).padEnd(49)} ║`, 'color: #ff6600;');
    console.log(`%c║  IndexedDB: ${String(resultados.indexedDB).padEnd(48)} ║`, 'color: #ff6600;');
    console.log(`%c║  Importação: ${String(resultados.importacao).padEnd(46)} ║`, 'color: #ff6600;');
    console.log(`%c║  Fila: ${String(resultados.fila).padEnd(53)} ║`, 'color: #ff6600;');
    console.log('%c╚══════════════════════════════════════════════════════════════╝', 'font-weight: bold; color: #ff6600;');

    // ========================================
    // AÇÕES CORRETIVAS
    // ========================================
    console.log('\n%c🔧 AÇÕES DISPONÍVEIS:', 'font-weight: bold; color: #00cc00;');
    
    window.corrigirAgora = async function() {
      console.log('\n🔄 CORREÇÃO AUTOMÁTICA INICIADA...\n');
      
      // 1. Forçar importação
      console.log('1. Importando do Google Sheets...');
      if (config) {
        const configObj = JSON.parse(config);
        const match = configObj.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          const spreadsheetId = match[1];
          const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
          
          const importResp = await fetch('/api/tasks/sync-google-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvUrl, spreadsheetUrl: configObj.spreadsheetUrl })
          });
          
          const importRes = await importResp.json();
          console.log('   ✅ Importação:', importRes.success ? 'Sucesso' : 'Falhou');
        }
      }
      
      // 2. Buscar do servidor
      console.log('2. Buscando tarefas do servidor...');
      const resp = await fetch('/api/tasks', { headers: { 'x-user-id': '1' } });
      const data = await resp.json();
      const tasks = data.tasks || data || [];
      console.log('   ✅ Encontradas:', tasks.length, 'tarefas');
      
      // 3. Atualizar IndexedDB
      console.log('3. Atualizando IndexedDB...');
      const db = await new Promise(resolve => {
        const req = indexedDB.open('7care-offline-db', 1);
        req.onsuccess = () => resolve(req.result);
      });
      
      const txClear = db.transaction('tasks', 'readwrite');
      await new Promise(resolve => {
        txClear.objectStore('tasks').clear().onsuccess = resolve;
      });
      
      for (const task of tasks) {
        const txAdd = db.transaction('tasks', 'readwrite');
        await new Promise(resolve => {
          txAdd.objectStore('tasks').put({...task, _synced: true}).onsuccess = resolve;
        });
      }
      console.log('   ✅ IndexedDB atualizado');
      
      // 4. Recarregar página
      console.log('4. Recarregando página...\n');
      console.log('✅ CORREÇÃO CONCLUÍDA! Recarregando...');
      setTimeout(() => location.reload(), 1000);
    };
    
    console.log('   → corrigirAgora() - Corrige tudo automaticamente');
    
  } catch (error) {
    console.error('\n❌ ERRO NO DIAGNÓSTICO:', error);
    console.error('Stack:', error.stack);
  }
})();

