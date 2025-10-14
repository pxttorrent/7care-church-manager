// ==========================================
// DIAGNÓSTICO: BASE DE CÁLCULO
// ==========================================
// COMO USAR:
// 1. Abra https://7care.netlify.app/
// 2. Pressione F12 (Console)
// 3. Cole ESTE código
// 4. Pressione Enter
// ==========================================

console.clear();
console.log('%c🔍 DIAGNÓSTICO: SISTEMA DE PONTUAÇÃO', 'font-size: 24px; font-weight: bold; color: #FF9800; background: #000; padding: 10px;');
console.log('══════════════════════════════════════════════════════════════════════');

(async () => {
  try {
    // 1. Verificar usuários no banco
    console.log('\n%c👥 [1/5] Verificando usuários no banco...', 'font-size: 16px; color: #2196F3; font-weight: bold;');
    const usersResponse = await fetch('/api/users');
    const users = await usersResponse.json();
    
    console.log(`✅ Total de usuários: ${users.length}`);
    console.log(`   Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`   Members: ${users.filter(u => u.role === 'member').length}`);
    console.log(`   Missionaries: ${users.filter(u => u.role === 'missionary').length}`);
    console.log(`   Interested: ${users.filter(u => u.role === 'interested').length}`);
    
    // Mostrar primeiros 5 usuários com seus pontos
    console.log('\n📋 Primeiros 5 usuários:');
    users.slice(0, 5).forEach((u, i) => {
      console.log(`   ${i+1}. ${u.name} (${u.role})`);
      console.log(`      Pontos: ${u.points || 0}`);
      console.log(`      ID: ${u.id}`);
    });
    
    // 2. Verificar configuração de pontos
    console.log('\n%c📊 [2/5] Verificando configuração de pontos...', 'font-size: 16px; color: #FF9800; font-weight: bold;');
    const configResponse = await fetch('/api/system/points-config');
    
    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log('✅ Configuração encontrada');
      console.log('   Engajamento:', config.engajamento);
      console.log('   Dizimista:', config.dizimista);
      console.log('   Ofertante:', config.ofertante);
    } else {
      console.error('❌ Configuração não encontrada! Status:', configResponse.status);
    }
    
    // 3. Testar cálculo de um usuário específico
    console.log('\n%c🔢 [3/5] Testando cálculo de pontos...', 'font-size: 16px; color: #9C27B0; font-weight: bold;');
    
    const nonAdminUser = users.find(u => u.role !== 'admin');
    if (nonAdminUser) {
      console.log(`   Testando com: ${nonAdminUser.name} (ID: ${nonAdminUser.id})`);
      
      const pointsResponse = await fetch(`/api/users/${nonAdminUser.id}/points-details`);
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        console.log('✅ Cálculo funcionando!');
        console.log('   Pontos calculados:', pointsData.points);
        console.log('   Breakdown:', pointsData.breakdown);
      } else {
        console.error('❌ Erro ao calcular pontos! Status:', pointsResponse.status);
        const error = await pointsResponse.text();
        console.error('   Erro:', error);
      }
    } else {
      console.warn('⚠️ Nenhum usuário não-admin encontrado para testar');
    }
    
    // 4. Testar endpoint de recálculo
    console.log('\n%c🔄 [4/5] Testando endpoint de recálculo...', 'font-size: 16px; color: #F44336; font-weight: bold;');
    
    const recalcResponse = await fetch('/api/system/recalculate-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('   Status HTTP:', recalcResponse.status, recalcResponse.statusText);
    
    if (recalcResponse.ok) {
      const recalcResult = await recalcResponse.json();
      console.log('✅ Resposta do recálculo:', recalcResult);
      
      if (recalcResult.success) {
        console.log(`   ✅ Sucesso: ${recalcResult.updatedCount || 0} usuários atualizados`);
        console.log(`   ⚠️ Erros: ${recalcResult.errorCount || 0}`);
        
        if (recalcResult.results && recalcResult.results.length > 0) {
          console.log('\n   📋 Detalhes dos usuários:');
          recalcResult.results.slice(0, 5).forEach(r => {
            if (r.updated) {
              console.log(`      ✅ ${r.name}: ${r.oldPoints} → ${r.newPoints} pontos`);
            } else if (r.error) {
              console.log(`      ❌ ${r.name}: ERRO - ${r.error}`);
            } else {
              console.log(`      ➖ ${r.name}: ${r.points} pontos (sem mudança)`);
            }
          });
        }
      } else {
        console.error('❌ Recálculo retornou success: false');
        console.error('   Mensagem:', recalcResult.message);
      }
    } else {
      console.error('❌ Erro HTTP ao recalcular!');
      const errorText = await recalcResponse.text();
      console.error('   Resposta:', errorText);
    }
    
    // 5. Verificar status do recálculo
    console.log('\n%c📈 [5/5] Verificando status do recálculo...', 'font-size: 16px; color: #00BCD4; font-weight: bold;');
    const statusResponse = await fetch('/api/system/recalculation-status');
    
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('✅ Status:', status);
      console.log(`   Em andamento: ${status.isRecalculating ? 'SIM' : 'NÃO'}`);
      console.log(`   Progresso: ${status.progress || 0}%`);
      console.log(`   Mensagem: ${status.message || 'N/A'}`);
    } else {
      console.error('❌ Erro ao buscar status');
    }
    
    // RESUMO FINAL
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('%c📊 RESUMO DO DIAGNÓSTICO', 'font-size: 20px; font-weight: bold; color: #4CAF50; background: #000; padding: 10px;');
    console.log('══════════════════════════════════════════════════════════════════════\n');
    
    console.log('Total de usuários no sistema:', users.length);
    console.log('Usuários não-admin:', users.filter(u => u.role !== 'admin').length);
    
    if (recalcResponse.ok) {
      const recalcResult = await recalcResponse.json();
      if (recalcResult.updatedCount === 0 && users.length > 1) {
        console.log('\n%c⚠️ PROBLEMA IDENTIFICADO:', 'font-size: 16px; font-weight: bold; color: #FF9800;');
        console.log('   Há usuários no banco, mas NENHUM foi atualizado.');
        console.log('   Possíveis causas:');
        console.log('   1. Pontos já estão corretos (sem mudança necessária)');
        console.log('   2. Erro na função de cálculo');
        console.log('   3. Configuração de pontos inválida');
        console.log('   4. Problema no banco de dados');
      } else if (recalcResult.updatedCount > 0) {
        console.log('\n%c✅ SISTEMA FUNCIONANDO!', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
        console.log(`   ${recalcResult.updatedCount} usuários tiveram pontos atualizados.`);
      } else if (users.length <= 1) {
        console.log('\n%c⚠️ ATENÇÃO:', 'font-size: 16px; font-weight: bold; color: #FF9800;');
        console.log('   Sistema tem apenas 1 usuário (provavelmente só admin).');
        console.log('   Adicione mais usuários para testar o cálculo.');
      }
    }
    
  } catch (error) {
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.error('%c❌ ERRO NO DIAGNÓSTICO!', 'font-size: 20px; font-weight: bold; color: #F44336; background: #000; padding: 10px;');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.log('══════════════════════════════════════════════════════════════════════');
  }
})();

console.log('\n%cℹ️ AGUARDE:', 'font-size: 14px; font-weight: bold; color: #2196F3;');
console.log('O diagnóstico está rodando e pode levar alguns segundos...');

