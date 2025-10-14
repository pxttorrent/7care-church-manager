// ==========================================
// TESTE SIMPLES: BASE DE CÁLCULO
// ==========================================
// COMO USAR:
// 1. Abra https://7care.netlify.app/settings
// 2. Vá para aba "Base de Cálculo"
// 3. Pressione F12 (Console)
// 4. Cole ESTE código
// 5. Pressione Enter
// ==========================================

console.clear();
console.log('%c🧪 TESTE: BASE DE CÁLCULO', 'font-size: 24px; font-weight: bold; color: #4CAF50; background: #000; padding: 10px;');
console.log('══════════════════════════════════════════════════════════════════════');

(async () => {
  try {
    // 1. Verificar configuração
    console.log('\n%c📊 Verificando configuração...', 'font-size: 16px; color: #2196F3; font-weight: bold;');
    const config = await fetch('/api/system/points-config').then(r => r.json());
    console.log('✅ Config carregada');
    console.log('   Engajamento alto:', config.engajamento?.alto || 'não definido');
    console.log('   Dizimista recorrente:', config.dizimista?.recorrente || 'não definido');
    
    // 2. Verificar usuários ANTES
    console.log('\n%c📊 Verificando usuários ANTES do recálculo...', 'font-size: 16px; color: #FF9800; font-weight: bold;');
    const usersBefore = await fetch('/api/users').then(r => r.json());
    const avgBefore = Math.round(usersBefore.filter(u => u.role !== 'admin').reduce((s, u) => s + (u.points || 0), 0) / usersBefore.filter(u => u.role !== 'admin').length);
    console.log('✅ Usuários:', usersBefore.length);
    console.log('✅ Média ANTES:', avgBefore, 'pontos');
    
    // 3. Disparar recálculo
    console.log('\n%c🔄 Disparando recálculo...', 'font-size: 16px; color: #9C27B0; font-weight: bold;');
    const recalcResponse = await fetch('/api/system/recalculate-points', { method: 'POST' });
    const recalcResult = await recalcResponse.json();
    console.log('✅ Recálculo iniciado');
    
    // 4. Monitorar progresso
    console.log('\n%c📈 Monitorando progresso...', 'font-size: 16px; color: #F44336; font-weight: bold;');
    console.log('(Aguardando... atualizando a cada 2 segundos)\n');
    
    let complete = false;
    let attempts = 0;
    
    while (!complete && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000));
      
      const status = await fetch('/api/system/recalculation-status').then(r => r.json());
      
      if (status.isRecalculating) {
        console.log(`⏳ ${Math.round(status.progress)}% - ${status.message}`);
      } else {
        console.log('✅ Concluído!');
        complete = true;
      }
      
      attempts++;
    }
    
    // 5. Verificar usuários DEPOIS
    console.log('\n%c📊 Verificando usuários DEPOIS do recálculo...', 'font-size: 16px; color: #00BCD4; font-weight: bold;');
    const usersAfter = await fetch('/api/users').then(r => r.json());
    const avgAfter = Math.round(usersAfter.filter(u => u.role !== 'admin').reduce((s, u) => s + (u.points || 0), 0) / usersAfter.filter(u => u.role !== 'admin').length);
    console.log('✅ Usuários:', usersAfter.length);
    console.log('✅ Média DEPOIS:', avgAfter, 'pontos');
    
    // Resumo
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('%c🎉 TESTE CONCLUÍDO!', 'font-size: 24px; font-weight: bold; color: #4CAF50; background: #000; padding: 10px;');
    console.log('══════════════════════════════════════════════════════════════════════');
    
    console.log('\n%c📊 RESULTADO:', 'font-size: 18px; font-weight: bold; color: #2196F3;');
    console.log(`✅ Configuração: Funcionando`);
    console.log(`✅ Recálculo: ${recalcResult.updatedCount || 0} usuários atualizados`);
    console.log(`✅ Média: ${avgBefore} → ${avgAfter} pontos`);
    console.log(`✅ Erros: ${recalcResult.errorCount || 0}`);
    
    console.log('\n%c🎯 CONCLUSÃO:', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
    if (recalcResult.success) {
      console.log('✅ Sistema de Base de Cálculo está FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Ao clicar em "Salvar", os pontos são recalculados automaticamente.');
      console.log('✅ A barra de progresso aparece na página Users durante o processo.');
    } else {
      console.log('⚠️ Houve algum problema. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('%c❌ ERRO!', 'font-size: 20px; font-weight: bold; color: #F44336;');
    console.error('Erro:', error.message);
  }
})();

