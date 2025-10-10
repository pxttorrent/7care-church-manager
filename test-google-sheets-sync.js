/**
 * 🔍 DIAGNÓSTICO - Sincronização Google Sheets
 * 
 * Para executar em produção:
 * 1. Abra https://7care.netlify.app/tasks
 * 2. F12 (console)
 * 3. Cole este script inteiro
 */

(async function diagnosticarGoogleSheetsSync() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🔍 DIAGNÓSTICO - SINCRONIZAÇÃO GOOGLE SHEETS                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // ========================================
    // 1. VERIFICAR CONFIGURAÇÃO
    // ========================================
    console.log('1️⃣ Verificando configuração do Google Sheets...\n');
    
    const config = localStorage.getItem('google-drive-sync-config');
    
    if (!config) {
      console.error('❌ Google Sheets NÃO CONFIGURADO!');
      console.log('   Vá em Settings → Sincronização com Google Sheets');
      return;
    }
    
    const configObj = JSON.parse(config);
    console.log('✅ Google Sheets configurado:');
    console.log('   URL:', configObj.spreadsheetUrl);
    console.log('   Auto-sync:', configObj.autoSync);
    console.log('   Intervalo:', configObj.syncInterval, 'ms\n');

    // ========================================
    // 2. VERIFICAR ENDPOINT DE IMPORTAÇÃO
    // ========================================
    console.log('2️⃣ Testando endpoint de importação...\n');
    
    // Extrair spreadsheet ID
    const match = configObj.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      console.error('❌ Não foi possível extrair ID da planilha');
      return;
    }
    
    const spreadsheetId = match[1];
    console.log('   Spreadsheet ID:', spreadsheetId);
    
    // Construir CSV URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
    console.log('   CSV URL:', csvUrl, '\n');

    // Testar importação
    console.log('   Testando importação do Google Sheets...');
    const importResponse = await fetch('/api/tasks/sync-google-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvUrl, spreadsheetUrl: configObj.spreadsheetUrl })
    });

    const importResult = await importResponse.json();
    console.log('   Resposta:', importResult);

    if (importResult.success) {
      console.log('   ✅ Importação funcionando!');
      console.log('   📊 Total de tarefas:', importResult.totalTasks);
      console.log('   📥 Importadas:', importResult.importedTasks);
      console.log('   ❌ Erros:', importResult.errorCount || 0, '\n');
    } else {
      console.error('   ❌ Erro na importação:', importResult.error || importResult.message, '\n');
      return;
    }

    // ========================================
    // 3. VERIFICAR TAREFAS NO SERVIDOR
    // ========================================
    console.log('3️⃣ Verificando tarefas no servidor...\n');
    
    const tasksResponse = await fetch('/api/tasks', {
      headers: { 'x-user-id': '1' }
    });

    if (!tasksResponse.ok) {
      console.error('❌ Erro ao buscar tarefas do servidor');
      return;
    }

    const tasksData = await tasksResponse.json();
    const serverTasks = tasksData.tasks || [];
    
    console.log('✅ Tarefas no servidor:', serverTasks.length);
    console.log('   Primeiras 3:');
    serverTasks.slice(0, 3).forEach((task, i) => {
      console.log(`   ${i + 1}. ${task.title} (${task.status})`);
    });
    console.log('');

    // ========================================
    // 4. VERIFICAR TAREFAS NO INDEXEDDB
    // ========================================
    console.log('4️⃣ Verificando tarefas no IndexedDB local...\n');
    
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('7care-offline-db', 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const tx = db.transaction('tasks', 'readonly');
    const localTasks = await new Promise((resolve, reject) => {
      const req = tx.objectStore('tasks').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    console.log('✅ Tarefas no IndexedDB:', localTasks.length);
    console.log('   Primeiras 3:');
    localTasks.slice(0, 3).forEach((task, i) => {
      console.log(`   ${i + 1}. ${task.title} (${task.status})`);
    });
    console.log('');

    // ========================================
    // 5. COMPARAR SERVIDOR vs INDEXEDDB
    // ========================================
    console.log('5️⃣ Comparando Servidor vs IndexedDB...\n');
    
    const serverIds = serverTasks.map(t => t.id).sort();
    const localIds = localTasks.map(t => t.id).sort();
    
    const missing = serverIds.filter(id => !localIds.includes(id));
    const extra = localIds.filter(id => !serverIds.includes(id));
    
    console.log('📊 Comparação:');
    console.log('   Servidor:', serverIds.length, 'tarefas');
    console.log('   Local:', localIds.length, 'tarefas');
    console.log('   Faltando no local:', missing.length);
    console.log('   Extras no local:', extra.length);
    
    if (missing.length > 0) {
      console.log('   ⚠️ IDs faltando:', missing);
    }
    if (extra.length > 0) {
      console.log('   ⚠️ IDs extras:', extra);
    }
    console.log('');

    // ========================================
    // 6. TESTAR ENDPOINT DE EXPORTAÇÃO
    // ========================================
    console.log('6️⃣ Testando endpoint de exportação (App → Sheets)...\n');
    
    const testTask = serverTasks[0];
    if (testTask) {
      const exportResponse = await fetch('/api/tasks/add-to-google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: [testTask] })
      });

      const exportResult = await exportResponse.json();
      console.log('   Resposta:', exportResult);
      
      if (exportResult.success) {
        console.log('   ✅ Exportação funcionando!');
        console.log('   📤 Tarefas adicionadas:', exportResult.addedCount, '\n');
      } else {
        console.error('   ❌ Erro na exportação:', exportResult.message, '\n');
      }
    }

    // ========================================
    // 7. VERIFICAR POLLING ATIVO
    // ========================================
    console.log('7️⃣ Verificando se polling está ativo...\n');
    
    console.log('   Aguardando 5 segundos para ver sincronizações...');
    
    let syncDetected = false;
    const originalLog = console.log;
    console.log = function(...args) {
      if (args[0] && args[0].includes('Sincronizado') && args[0].includes('Google Sheets')) {
        syncDetected = true;
        console.log = originalLog;
        console.log('   ✅ POLLING ATIVO! Sincronização detectada:', ...args);
      }
      originalLog.apply(console, args);
    };

    setTimeout(() => {
      console.log = originalLog;
      if (!syncDetected) {
        console.warn('   ⚠️ Nenhuma sincronização detectada em 5 segundos');
        console.log('   Possíveis causas:');
        console.log('   - Google Sheets não está configurado');
        console.log('   - Está offline');
        console.log('   - Não houve mudanças para sincronizar');
      }
      
      // ========================================
      // RESUMO FINAL
      // ========================================
      console.log('\n╔══════════════════════════════════════════════════════════════╗');
      console.log('║  📊 RESUMO DO DIAGNÓSTICO                                    ║');
      console.log('╠══════════════════════════════════════════════════════════════╣');
      console.log(`║  Config: ${config ? '✅' : '❌'}                              ║`);
      console.log(`║  Importação: ${importResult.success ? '✅' : '❌'}            ║`);
      console.log(`║  Servidor: ${serverTasks.length} tarefas                     ║`);
      console.log(`║  Local: ${localTasks.length} tarefas                         ║`);
      console.log(`║  Diferença: ${Math.abs(serverTasks.length - localTasks.length)} tarefas ║`);
      console.log(`║  Polling: ${syncDetected ? '✅ Ativo' : '⚠️ Não detectado'}   ║`);
      console.log('╚══════════════════════════════════════════════════════════════╝\n');

      if (missing.length > 0 || extra.length > 0) {
        console.log('⚠️ AÇÃO NECESSÁRIA:');
        console.log('   Execute: await sincronizarAgora()');
        
        window.sincronizarAgora = async function() {
          console.log('🔄 Forçando sincronização...');
          
          // Limpar local
          const db = await new Promise(resolve => {
            const req = indexedDB.open('7care-offline-db', 1);
            req.onsuccess = () => resolve(req.result);
          });
          
          const tx = db.transaction('tasks', 'readwrite');
          await new Promise(resolve => {
            tx.objectStore('tasks').clear().onsuccess = resolve;
          });
          
          // Recarregar do servidor
          for (const task of serverTasks) {
            const tx2 = db.transaction('tasks', 'readwrite');
            await new Promise(resolve => {
              tx2.objectStore('tasks').put({...task, _synced: true}).onsuccess = resolve;
            });
          }
          
          console.log('✅ Sincronização manual concluída!');
          console.log('🔄 Recarregue a página para ver as mudanças');
        };
      } else {
        console.log('✅ TUDO SINCRONIZADO CORRETAMENTE!');
      }
    }, 5000);

  } catch (error) {
    console.error('╔══════════════════════════════════════════════════════════════╗');
    console.error('║  ❌ ERRO NO DIAGNÓSTICO                                      ║');
    console.error('╚══════════════════════════════════════════════════════════════╝');
    console.error('Erro:', error);
    console.error('Stack:', error.stack);
  }
})();

