// ==========================================
// SOLUÇÃO AUTOMÁTICA - SISTEMA DE PONTUAÇÃO
// ==========================================
// Este script:
// 1. Verifica se há configuração
// 2. Se não houver, cria uma nova
// 3. Recalcula todos os usuários
// ==========================================
// Cole no Console (F12) em https://7care.netlify.app
// ==========================================

console.clear();
console.log('%c🔧 SOLUÇÃO AUTOMÁTICA - SISTEMA DE PONTUAÇÃO', 'font-size: 20px; font-weight: bold; color: #4CAF50; background: #000; padding: 10px;');
console.log('═'.repeat(80));

(async () => {
  try {
    // 1. Verificar configuração
    console.log('\n%c📊 [1/3] Verificando configuração...', 'font-size: 16px; color: #2196F3; font-weight: bold;');
    
    let configExists = false;
    try {
      const configResponse = await fetch('/api/system/points-config');
      if (configResponse.ok) {
        const config = await configResponse.json();
        if (config && Object.keys(config).length > 0 && config.engajamento) {
          configExists = true;
          console.log('✅ Configuração existe');
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar config:', e.message);
    }
    
    // 2. Criar configuração se não existir
    if (!configExists) {
      console.log('\n%c🔧 [2/3] Criando configuração padrão...', 'font-size: 16px; color: #FF9800; font-weight: bold;');
      console.log('(A tabela points_configuration está vazia)\n');
      
      const resetResponse = await fetch('/api/system/points-config/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (resetResponse.ok) {
        const resetResult = await resetResponse.json();
        console.log('✅ Configuração padrão criada!');
        console.log('   Resultado:', resetResult);
        
        // Aguardar 1 segundo para garantir que foi salva
        await new Promise(r => setTimeout(r, 1000));
      } else {
        throw new Error('Falha ao criar configuração');
      }
    } else {
      console.log('✅ Configuração já existe, pulando para recálculo...');
    }
    
    // 3. Recalcular pontos
    console.log('\n%c🔄 [3/3] Recalculando pontos de todos os usuários...', 'font-size: 16px; color: #9C27B0; font-weight: bold;');
    console.log('Aguarde... (pode levar 20-30 segundos com 327 usuários)\n');
    
    const recalcStart = Date.now();
    const recalcResponse = await fetch('/api/system/recalculate-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!recalcResponse.ok) {
      throw new Error(`Erro HTTP: ${recalcResponse.status}`);
    }
    
    const recalcResult = await recalcResponse.json();
    const duration = ((Date.now() - recalcStart) / 1000).toFixed(1);
    
    // RESULTADO FINAL
    console.log('═'.repeat(80));
    console.log('%c🎉 PROCESSO CONCLUÍDO!', 'font-size: 20px; font-weight: bold; color: #4CAF50; background: #000; padding: 10px;');
    console.log('═'.repeat(80));
    
    console.log('\n%c📊 RESULTADO:', 'font-size: 18px; font-weight: bold; color: #2196F3;');
    console.log('✅ Sucesso:', recalcResult.success);
    console.log('👥 Total de usuários:', recalcResult.totalUsers || 0);
    console.log('📈 Usuários atualizados:', recalcResult.updatedCount || recalcResult.updatedUsers || 0);
    console.log('❌ Erros:', recalcResult.errors || recalcResult.errorCount || 0);
    console.log('⏱️ Duração:', duration, 'segundos');
    
    if ((recalcResult.updatedCount || recalcResult.updatedUsers || 0) > 0) {
      console.log('\n%c✅ SUCESSO!', 'font-size: 18px; font-weight: bold; color: #4CAF50;');
      console.log(`${recalcResult.updatedCount || recalcResult.updatedUsers} usuários tiveram pontos atualizados!`);
      console.log('\nVá para https://7care.netlify.app/users para ver os pontos atualizados.');
      
      alert(`✅ Recálculo concluído!\n\n` +
            `📈 ${recalcResult.updatedCount || recalcResult.updatedUsers} usuários atualizados\n` +
            `⏱️ Tempo: ${duration}s`);
    } else {
      console.log('\n%c⚠️ 0 USUÁRIOS ATUALIZADOS', 'font-size: 18px; font-weight: bold; color: #FF9800;');
      console.log('\nPossíveis causas:');
      console.log('1. Pontos já estão corretos (normal após primeiro cálculo)');
      console.log('2. Campos dos usuários estão vazios (engajamento, classificação, etc.)');
      console.log('3. Configuração retornou erro silencioso');
      
      console.log('\n💡 Para testar com certeza, execute:');
      console.log('%c// Zerar pontos e recalcular', 'color: #4CAF50; font-weight: bold;');
      console.log('%cfetch("/api/users").then(r => r.json()).then(users => {', 'color: #4CAF50;');
      console.log('%c  Promise.all(users.map(u => ', 'color: #4CAF50;');
      console.log('%c    fetch(`/api/users/${u.id}`, {', 'color: #4CAF50;');
      console.log('%c      method: "PUT",', 'color: #4CAF50;');
      console.log('%c      headers: {"Content-Type": "application/json"},', 'color: #4CAF50;');
      console.log('%c      body: JSON.stringify({points: 0})', 'color: #4CAF50;');
      console.log('%c    })', 'color: #4CAF50;');
      console.log('%c  )).then(() => console.log("Agora recalcule novamente"));', 'color: #4CAF50;');
      console.log('%c});', 'color: #4CAF50;');
    }
    
    console.log('\n═'.repeat(80));
    
  } catch (error) {
    console.log('\n' + '═'.repeat(80));
    console.error('%c❌ ERRO!', 'font-size: 20px; font-weight: bold; color: #F44336;');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.log('═'.repeat(80));
  }
})();

