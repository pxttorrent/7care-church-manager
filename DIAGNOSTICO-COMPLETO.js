// ==========================================
// DIAGNÓSTICO COMPLETO - SISTEMA DE PONTUAÇÃO
// ==========================================
// Cole no Console (F12) em https://7care.netlify.app
// ==========================================

console.clear();
console.log('%c🔍 DIAGNÓSTICO COMPLETO DO SISTEMA DE PONTUAÇÃO', 'font-size: 20px; font-weight: bold; color: #FF9800; background: #000; padding: 10px;');
console.log('═'.repeat(80));

(async () => {
  try {
    // 1. Verificar usuários
    console.log('\n%c👥 [1/4] Verificando usuários...', 'font-size: 16px; color: #2196F3; font-weight: bold;');
    const usersResponse = await fetch('/api/users');
    const users = await usersResponse.json();
    
    console.log(`✅ Total de usuários: ${users.length}`);
    console.log(`   Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`   Não-admins: ${users.filter(u => u.role !== 'admin').length}`);
    
    // Verificar campos de pontuação de alguns usuários
    console.log('\n📋 Primeiros 3 usuários não-admin:');
    users.filter(u => u.role !== 'admin').slice(0, 3).forEach((u, i) => {
      console.log(`\n   ${i+1}. ${u.name}`);
      console.log(`      Pontos atuais: ${u.points || 0}`);
      console.log(`      Engajamento: ${u.engajamento || 'não definido'}`);
      console.log(`      Classificação: ${u.classificacao || 'não definido'}`);
      console.log(`      Dizimista: ${u.dizimista_type || u.dizimistaType || 'não definido'}`);
      console.log(`      Ofertante: ${u.ofertante_type || u.ofertanteType || 'não definido'}`);
    });
    
    // 2. Verificar configuração de pontos
    console.log('\n%c📊 [2/4] Verificando configuração de pontos...', 'font-size: 16px; color: #FF9800; font-weight: bold;');
    const configResponse = await fetch('/api/system/points-config');
    
    if (!configResponse.ok) {
      console.error('❌ ERRO: Configuração de pontos NÃO encontrada!');
      console.error('   Status HTTP:', configResponse.status);
      console.log('\n💡 SOLUÇÃO:');
      console.log('   A tabela points_configuration pode estar vazia!');
      console.log('   Execute este comando para criar:');
      console.log('\n   fetch("/api/system/points-config/reset", {method: "POST"})');
      console.log('     .then(r => r.json())');
      console.log('     .then(d => console.log("✅ Config criada:", d));');
      return;
    }
    
    const config = await configResponse.json();
    console.log('✅ Configuração encontrada!');
    console.log('   Engajamento:', config.engajamento);
    console.log('   Dizimista:', config.dizimista);
    console.log('   Classificação:', config.classificacao);
    
    // 3. Testar cálculo de um usuário
    console.log('\n%c🔢 [3/4] Testando cálculo de pontos...', 'font-size: 16px; color: #9C27B0; font-weight: bold;');
    const testUser = users.find(u => u.role !== 'admin');
    
    if (testUser) {
      console.log(`   Testando com: ${testUser.name} (ID: ${testUser.id})`);
      console.log(`   Pontos atuais: ${testUser.points || 0}`);
      
      const pointsResponse = await fetch(`/api/users/${testUser.id}/points-details`);
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        console.log('✅ Cálculo funcionando!');
        console.log(`   Pontos calculados: ${pointsData.points}`);
        console.log(`   Diferença: ${(pointsData.points || 0) - (testUser.points || 0)}`);
        
        if (testUser.points === pointsData.points) {
          console.log('\n⚠️ PONTOS JÁ ESTÃO CORRETOS!');
          console.log('   Por isso retorna 0 usuários atualizados.');
          console.log('   Os pontos já foram calculados anteriormente.');
        } else {
          console.log('\n✅ PONTOS PRECISAM SER ATUALIZADOS!');
          console.log(`   ${testUser.points} → ${pointsData.points}`);
        }
      } else {
        console.error('❌ Erro ao calcular pontos!');
        const error = await pointsResponse.text();
        console.error('   Erro:', error);
      }
    }
    
    // 4. Disparar recálculo e monitorar
    console.log('\n%c🔄 [4/4] Testando recálculo completo...', 'font-size: 16px; color: #F44336; font-weight: bold;');
    console.log('Disparando recálculo de TODOS os usuários...\n');
    
    const recalcStart = Date.now();
    const recalcResponse = await fetch('/api/system/recalculate-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!recalcResponse.ok) {
      console.error('❌ ERRO HTTP:', recalcResponse.status);
      const errorText = await recalcResponse.text();
      console.error('   Resposta:', errorText);
      return;
    }
    
    const recalcResult = await recalcResponse.json();
    const recalcDuration = ((Date.now() - recalcStart) / 1000).toFixed(1);
    
    console.log('═'.repeat(80));
    console.log('%c📊 RESULTADO DO RECÁLCULO', 'font-size: 18px; font-weight: bold; color: #4CAF50;');
    console.log('═'.repeat(80));
    console.log('✅ Sucesso:', recalcResult.success);
    console.log('👥 Total de usuários:', recalcResult.totalUsers || 0);
    console.log('📈 Usuários atualizados:', recalcResult.updatedCount || recalcResult.updatedUsers || 0);
    console.log('❌ Erros:', recalcResult.errors || recalcResult.errorCount || 0);
    console.log('⏱️ Duração:', recalcDuration, 'segundos');
    console.log('═'.repeat(80));
    
    // DIAGNÓSTICO FINAL
    console.log('\n%c🎯 DIAGNÓSTICO FINAL:', 'font-size: 18px; font-weight: bold; color: #2196F3;');
    
    if (recalcResult.totalUsers === 0) {
      console.log('❌ PROBLEMA: Nenhum usuário foi encontrado!');
      console.log('   Verifique se há usuários no banco.');
    } else if ((recalcResult.updatedCount || recalcResult.updatedUsers || 0) === 0) {
      console.log('⚠️ ATENÇÃO: 0 usuários atualizados pode significar:');
      console.log('\n   OPÇÃO 1: Pontos já estão corretos ✅');
      console.log('   - Todos os usuários já têm os pontos calculados corretamente');
      console.log('   - Nenhuma atualização necessária');
      console.log('   - Isso é NORMAL se já calculou antes');
      console.log('\n   OPÇÃO 2: Configuração de pontos está vazia ❌');
      console.log('   - Tabela points_configuration está vazia');
      console.log('   - Função retorna 0 para todos');
      console.log('   - SOLUÇÃO: Executar reset da config');
      console.log('\n   OPÇÃO 3: Campos dos usuários estão vazios ❌');
      console.log('   - Usuários não têm engajamento, classificação, etc.');
      console.log('   - Cálculo resulta em 0 pontos');
      console.log('   - SOLUÇÃO: Preencher dados dos usuários');
      
      // Verificar qual é o caso
      if (testUser && testUser.points === 0) {
        console.log('\n💡 PROVÁVEL CAUSA: Configuração vazia ou campos vazios');
        console.log('\n🔧 SOLUÇÃO RÁPIDA:');
        console.log('   Execute este comando para resetar a config:');
        console.log('\n   fetch("/api/system/points-config/reset", {method: "POST"})');
        console.log('     .then(r => r.json())');
        console.log('     .then(d => console.log("✅", d));');
      } else if (testUser && testUser.points > 0) {
        console.log('\n✅ NORMAL: Pontos já foram calculados anteriormente');
        console.log('   Para forçar recálculo, zere os pontos primeiro:');
        console.log('\n   // Zerar pontos de todos');
        console.log('   fetch("/api/system/zero-all-points", {method: "POST"})');
        console.log('     .then(() => fetch("/api/system/recalculate-points", {method: "POST"}))');
        console.log('     .then(r => r.json())');
        console.log('     .then(d => console.log("✅", d));');
      }
    } else {
      console.log('✅ SISTEMA FUNCIONANDO!');
      console.log(`   ${recalcResult.updatedCount || recalcResult.updatedUsers} usuários foram atualizados com sucesso.`);
    }
    
  } catch (error) {
    console.log('\n' + '═'.repeat(80));
    console.error('%c❌ ERRO NO DIAGNÓSTICO!', 'font-size: 20px; font-weight: bold; color: #F44336;');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.log('═'.repeat(80));
  }
})();

console.log('\n%cℹ️ AGUARDE:', 'font-size: 14px; font-weight: bold; color: #2196F3;');
console.log('O diagnóstico completo está em execução...');

