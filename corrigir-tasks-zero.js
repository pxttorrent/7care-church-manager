/**
 * 🔧 CORREÇÃO RÁPIDA - Tasks Zeradas
 * 
 * Execute em: https://7care.netlify.app/tasks (F12 console)
 */

(async function corrigirTasksZero() {
  console.clear();
  console.log('%c🔧 CORREÇÃO: TASKS ZERADAS', 'font-size: 20px; font-weight: bold; color: #ff0000;');
  
  try {
    // PASSO 1: Buscar do servidor
    console.log('\n1️⃣ Buscando do servidor...');
    const resp = await fetch('/api/tasks', { headers: { 'x-user-id': '1' } });
    const data = await resp.json();
    const tasks = data.tasks || data || [];
    
    console.log(`   Servidor tem: ${tasks.length} tarefas`);
    
    if (tasks.length === 0) {
      console.error('   ❌ SERVIDOR TAMBÉM TEM 0 TAREFAS!');
      console.log('   O problema é que o Google Sheets não foi importado para o servidor.');
      console.log('\n   🔧 SOLUÇÃO: Importar do Google Sheets agora...\n');
      
      // Buscar configuração
      const config = localStorage.getItem('google-drive-sync-config');
      if (!config) {
        console.error('   ❌ Google Sheets não configurado!');
        console.log('   Vá em Settings e configure o Google Sheets primeiro.');
        return;
      }
      
      const configObj = JSON.parse(config);
      const match = configObj.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      
      if (!match) {
        console.error('   ❌ URL inválida do Google Sheets');
        return;
      }
      
      const spreadsheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
      
      console.log('   📊 Importando do Google Sheets...');
      console.log('   URL:', csvUrl);
      
      const importResp = await fetch('/api/tasks/sync-google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvUrl, spreadsheetUrl: configObj.spreadsheetUrl })
      });
      
      const importResult = await importResp.json();
      console.log('   Resultado:', importResult);
      
      if (!importResult.success) {
        console.error('   ❌ Falha na importação:', importResult.error || importResult.message);
        return;
      }
      
      console.log(`   ✅ Importadas: ${importResult.importedTasks} tarefas`);
      
      // Buscar novamente do servidor
      const resp2 = await fetch('/api/tasks', { headers: { 'x-user-id': '1' } });
      const data2 = await resp2.json();
      const tasks2 = data2.tasks || data2 || [];
      
      console.log(`   Servidor agora tem: ${tasks2.length} tarefas\n`);
      
      if (tasks2.length === 0) {
        console.error('   ❌ AINDA TEM 0! Problema na API de importação.');
        return;
      }
      
      // Usar as tarefas importadas
      tasks.length = 0;
      tasks.push(...tasks2);
    }
    
    // PASSO 2: Atualizar IndexedDB
    console.log('2️⃣ Atualizando IndexedDB...');
    
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('7care-offline-db', 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
      };
    });
    
    // Limpar
    const txClear = db.transaction('tasks', 'readwrite');
    await new Promise(resolve => {
      txClear.objectStore('tasks').clear().onsuccess = resolve;
    });
    console.log('   🧹 IndexedDB limpo');
    
    // Adicionar tarefas
    for (const task of tasks) {
      const txAdd = db.transaction('tasks', 'readwrite');
      await new Promise(resolve => {
        txAdd.objectStore('tasks').put({
          ...task,
          _synced: true
        }).onsuccess = resolve;
      });
    }
    
    console.log(`   ✅ ${tasks.length} tarefas adicionadas ao IndexedDB\n`);
    
    // PASSO 3: Recarregar página
    console.log('3️⃣ Recarregando página...');
    console.log('\n✅ CORREÇÃO CONCLUÍDA!\n');
    
    setTimeout(() => {
      location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
    console.error('Stack:', error.stack);
  }
})();

