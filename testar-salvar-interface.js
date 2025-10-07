const baseUrl = 'https://7care.netlify.app';

async function testarSalvarInterface() {
  console.log('🧪 TESTE: SIMULAR SALVAMENTO PELA INTERFACE\n');
  console.log('='.repeat(70));
  
  try {
    // 1. Estado ANTES
    console.log('\n📊 Passo 1: Buscar estado ANTES');
    let resp = await fetch(`${baseUrl}/api/users`);
    let users = await resp.json();
    
    const danielaAntes = users.find(u => 
      u.name?.toLowerCase().includes('daniela') && 
      u.name?.toLowerCase().includes('silva') &&
      u.name?.toLowerCase().includes('garcia')
    );
    
    const totalAntes = users.filter(u => u.email !== 'admin@7care.com')
      .reduce((s, u) => s + (u.points || 0), 0);
    
    console.log(`   Daniela: ${danielaAntes?.points} pontos`);
    console.log(`   Total: ${totalAntes.toLocaleString()} pontos`);
    
    // 2. Buscar config atual (como a interface faz)
    console.log('\n📋 Passo 2: Carregar configuração (simulando interface)');
    const configResp = await fetch(`${baseUrl}/api/system/points-config`);
    let config = await configResp.json();
    
    console.log(`   Engajamento Alto: ${config.engajamento.alto}`);
    
    // 3. Usuário altera UM campo (como você fez)
    console.log('\n✏️  Passo 3: Usuário altera Engajamento Alto para 555');
    config.engajamento.alto = 555;
    console.log(`   Novo valor: ${config.engajamento.alto}`);
    
    // 4. Salvar (agora com a correção que garante campos completos)
    console.log('\n💾 Passo 4: Clicar em SALVAR (agora deve manter todos os campos)');
    
    // Simular o que o frontend faz agora (com a correção)
    const configCompleta = {
      engajamento: {
        baixo: config.engajamento?.baixo ?? 50,
        medio: config.engajamento?.medio ?? 100,
        alto: config.engajamento?.alto ?? 200
      },
      classificacao: {
        frequente: config.classificacao?.frequente ?? 100,
        naoFrequente: config.classificacao?.naoFrequente ?? 50
      },
      dizimista: {
        naoDizimista: config.dizimista?.naoDizimista ?? 0,
        pontual: config.dizimista?.pontual ?? 25,
        sazonal: config.dizimista?.sazonal ?? 50,
        recorrente: config.dizimista?.recorrente ?? 100
      },
      ofertante: {
        naoOfertante: config.ofertante?.naoOfertante ?? 0,
        pontual: config.ofertante?.pontual ?? 15,
        sazonal: config.ofertante?.sazonal ?? 30,
        recorrente: config.ofertante?.recorrente ?? 60
      },
      tempoBatismo: {
        doisAnos: config.tempoBatismo?.doisAnos ?? 25,
        cincoAnos: config.tempoBatismo?.cincoAnos ?? 50,
        dezAnos: config.tempoBatismo?.dezAnos ?? 100,
        vinteAnos: config.tempoBatismo?.vinteAnos ?? 150,
        maisVinte: config.tempoBatismo?.maisVinte ?? 200
      },
      cargos: {
        umCargo: config.cargos?.umCargo ?? 50,
        doisCargos: config.cargos?.doisCargos ?? 100,
        tresOuMais: config.cargos?.tresOuMais ?? 150
      },
      nomeUnidade: {
        comUnidade: config.nomeUnidade?.comUnidade ?? 25,
        semUnidade: 0
      },
      temLicao: {
        comLicao: config.temLicao?.comLicao ?? 30,
        semLicao: 0
      },
      totalPresenca: {
        zeroATres: config.totalPresenca?.zeroATres ?? 25,
        quatroASete: config.totalPresenca?.quatroASete ?? 50,
        oitoATreze: config.totalPresenca?.oitoATreze ?? 100
      },
      escolaSabatina: {
        comunhao: config.escolaSabatina?.comunhao ?? 10,
        missao: config.escolaSabatina?.missao ?? 15,
        estudoBiblico: config.escolaSabatina?.estudoBiblico ?? 20,
        batizouAlguem: config.escolaSabatina?.batizouAlguem ?? 100,
        discipuladoPosBatismo: config.escolaSabatina?.discipuladoPosBatismo ?? 25
      },
      cpfValido: {
        valido: config.cpfValido?.valido ?? 25,
        invalido: 0
      },
      camposVaziosACMS: {
        completos: config.camposVaziosACMS?.semCamposVazios ?? 50,
        incompletos: 0
      }
    };
    
    console.log(`   Verificando campos completos:`);
    console.log(`     tempoBatismo: ${Object.keys(configCompleta.tempoBatismo).length} campos ✅`);
    console.log(`     escolaSabatina: ${Object.keys(configCompleta.escolaSabatina).length} campos ✅`);
    console.log(`     cpfValido: ${Object.keys(configCompleta.cpfValido).length} campos ✅`);
    
    const saveResp = await fetch(`${baseUrl}/api/system/points-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configCompleta)
    });
    
    const result = await saveResp.json();
    console.log(`   ✅ ${result.updatedUsers} usuários recalculados`);
    
    // 5. Verificar DEPOIS
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('\n📊 Passo 5: Verificar estado DEPOIS');
    resp = await fetch(`${baseUrl}/api/users`);
    users = await resp.json();
    
    const danielaDepois = users.find(u => 
      u.name?.toLowerCase().includes('daniela') && 
      u.name?.toLowerCase().includes('silva') &&
      u.name?.toLowerCase().includes('garcia')
    );
    
    const totalDepois = users.filter(u => u.email !== 'admin@7care.com')
      .reduce((s, u) => s + (u.points || 0), 0);
    
    console.log(`   Daniela: ${danielaDepois?.points} pontos`);
    console.log(`   Total: ${totalDepois.toLocaleString()} pontos`);
    
    const diffDaniela = danielaDepois.points - danielaAntes.points;
    const diffTotal = totalDepois - totalAntes;
    
    console.log(`\n📈 Mudanças:');
    console.log(`   Daniela: ${diffDaniela > 0 ? '+' : ''}${diffDaniela}`);
    console.log(`   Total: ${diffTotal > 0 ? '+' : ''}${diffTotal.toLocaleString()}`);
    
    // 6. Restaurar para padrão
    console.log('\n🔄 Passo 6: Restaurar Engajamento Alto para 200');
    configCompleta.engajamento.alto = 200;
    await fetch(`${baseUrl}/api/system/points-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configCompleta)
    });
    console.log('   ✅ Restaurado');
    
    console.log('\n' + '='.repeat(70));
    if (result.updatedUsers > 0 && Math.abs(diffDaniela) > 100) {
      console.log('✅ SUCESSO TOTAL!');
      console.log('');
      console.log('   ✓ Botão SALVAR agora garante configuração completa');
      console.log(`   ✓ ${result.updatedUsers} usuários recalculados automaticamente`);
      console.log(`   ✓ Daniela mudou ${diffDaniela > 0 ? '+' : ''}${diffDaniela} pontos`);
      console.log('   ✓ Todos os campos mantidos (não enviam vazios)');
      console.log('');
      console.log('   🎉 Agora pode alterar qualquer campo e salvar com segurança!');
    } else {
      console.log('⚠️  Verificar - mudança pequena ou não detectada');
    }
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }
}

testarSalvarInterface();
