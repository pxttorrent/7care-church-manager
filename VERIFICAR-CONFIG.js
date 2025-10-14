// Script simples para verificar configuração de pontos

console.clear();
console.log('🔍 VERIFICANDO CONFIGURAÇÃO DE PONTOS\n');

fetch('/api/system/points-config')
  .then(r => {
    console.log('Status HTTP:', r.status, r.statusText);
    return r.json();
  })
  .then(config => {
    console.log('═'.repeat(60));
    
    if (!config || Object.keys(config).length === 0) {
      console.log('❌ CONFIGURAÇÃO VAZIA OU INEXISTENTE!');
      console.log('═'.repeat(60));
      console.log('\n💡 ESTE É O PROBLEMA!');
      console.log('Sem configuração, todos os cálculos retornam 0 pontos.');
      console.log('Por isso 0 usuários são atualizados.\n');
      
      console.log('🔧 SOLUÇÃO:');
      console.log('Execute este comando para criar a configuração:\n');
      console.log('%cfetch("/api/system/points-config/reset", {method: "POST"})', 'color: #4CAF50; font-weight: bold;');
      console.log('%c  .then(r => r.json())', 'color: #4CAF50; font-weight: bold;');
      console.log('%c  .then(d => {', 'color: #4CAF50; font-weight: bold;');
      console.log('%c    console.log("✅ Config criada:", d);', 'color: #4CAF50; font-weight: bold;');
      console.log('%c    alert("Config criada! Agora teste o recálculo.");', 'color: #4CAF50; font-weight: bold;');
      console.log('%c  });', 'color: #4CAF50; font-weight: bold;');
      
    } else {
      console.log('✅ CONFIGURAÇÃO ENCONTRADA!');
      console.log('═'.repeat(60));
      console.log('\nCampos configurados:');
      console.log('   Engajamento:', config.engajamento);
      console.log('   Classificação:', config.classificacao);
      console.log('   Dizimista:', config.dizimista);
      console.log('   Ofertante:', config.ofertante);
      console.log('   Tempo Batismo:', config.tempoBatismo || config.tempobatismo);
      console.log('   Cargos:', config.cargos);
      console.log('   Nome Unidade:', config.nomeUnidade || config.nomeunidade);
      console.log('   Tem Lição:', config.temLicao || config.temlicao);
      console.log('   Total Presença:', config.totalPresenca || config.totalpresenca);
      console.log('   Escola Sabatina:', config.escolaSabatina || config.escolasabatina);
      console.log('   CPF Válido:', config.cpfValido || config.cpfvalido);
      console.log('   Campos Vazios:', config.camposVaziosACMS || config.camposvaziosacms);
      
      console.log('\n✅ A configuração existe e parece completa!');
      console.log('\n💡 Se retorna 0 usuários atualizados:');
      console.log('   Os pontos já devem estar corretos.');
      console.log('   Para forçar recálculo, zere os pontos primeiro.');
    }
    
    console.log('\n═'.repeat(60));
  })
  .catch(error => {
    console.error('❌ ERRO ao buscar configuração:', error);
  });

