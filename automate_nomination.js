import fetch from 'node-fetch';

// Configuração da nomeação
const CONFIG_ID = 55;
const VOTERS = [2361, 2187, 2327, 2185, 2124, 2146, 2368, 2221, 2193];
const CANDIDATES = [2189, 2274, 2337, 2350, 2238, 2361, 2105, 2106, 2234, 2187];
const POSITIONS = [
  "Primeiro Ancião(ã)",
  "Ancião/Anciã Teen", 
  "Ancião/Anciã Jovem",
  "Secretário(a)",
  "Secretário(a) Associado(a)",
  "Secretário(a) Teen",
  "Tesoureiro(a)",
  "Tesoureiro(a) Associado(a)",
  "Tesoureiro(a) Teen",
  "Patrimônio",
  "Diáconos",
  "Diácono(s) Teen",
  "Primeiro Diácono",
  "Diaconisas",
  "Diaconisa(s) Teen",
  "Primeira Diaconisa",
  "Diretor(a)",
  "Diretor(a) Associado(a)",
  "Discípulo Teen",
  "Ministério da Criança – Coordenador(a)",
  "Ministério da Criança – Coordenador(a) Associado(a)",
  "Ministério dos Adolescentes – Coordenador(a)",
  "Ministério dos Adolescentes – Coordenador(a) Associado(a)",
  "Ministério Jovem – Diretor(a)",
  "Ministério Jovem – Diretor(a) Associado(a)",
  "Clube de Aventureiros – Diretor(a)",
  "Clube de Aventureiros – Diretor(a) Associado(a)",
  "Clube de Aventureiros – Discípulo Teen",
  "Clube de Desbravadores – Diretor(a)",
  "Clube de Desbravadores – Diretor(a) Associado(a)",
  "Clube de Desbravadores – Discípulo Teen",
  "Professores(as) das Unidades: Bebês",
  "Professores(as) das Unidades: Iniciantes",
  "Professores(as) das Unidades: Infantis",
  "Professores(as) das Unidades: Primários",
  "Professores(as) das Unidades: Pré-adolescentes",
  "Professores(as) das Unidades: Adolescentes",
  "Secretário(a) Escola Sabatina",
  "Diretor(a) Associado(a) Escola Sabatina",
  "Discípulo Teen Escola Sabatina",
  "Diretor(a) Ministério Pessoal",
  "Diretor(a) Associado(a) Ministério Pessoal",
  "Discípulo Teen Ministério Pessoal",
  "Evangelismo – Diretor(a)",
  "Evangelismo – Diretor(a) Associado(a)",
  "Evangelismo – Secretário(a)",
  "Evangelismo – Discípulo Teen",
  "Coordenador(a) de Classes Bíblicas",
  "Coordenador(a) de Interessados",
  "Diretor(a) ASA",
  "Diretor(a) Associado(a) ASA",
  "Discípulo Teen ASA",
  "Casal Diretor",
  "Casal Associado",
  "Discípulo Teen Ministério da Família",
  "Diretora Ministério da Mulher",
  "Diretora Associada Ministério da Mulher",
  "Discípulo Teen Ministério da Mulher",
  "Líder Ministério da Recepção",
  "Equipe Ministério da Recepção",
  "Diretor Ministério do Homem",
  "Diretor Associado Ministério do Homem",
  "Discípulo Teen Ministério do Homem",
  "Diretor(a) Ministério da Saúde",
  "Diretor(a) Associado(a) Ministério da Saúde",
  "Discípulo Teen Ministério da Saúde",
  "Diretor(a) Ministério das Possibilidades",
  "Diretor(a) Associado(a) Ministério das Possibilidades",
  "Discípulo Teen Ministério das Possibilidades",
  "Diretor(a) Ministério da Música",
  "Diretor(a) Associado(a) Ministério da Música",
  "Discípulo Teen Ministério da Música",
  "Diretor(a) Comunicação",
  "Diretor(a) Associado(a) Comunicação",
  "Social Media (redes sociais)",
  "Discípulo Teen Comunicação",
  "Diretor(a) Sonoplastia",
  "Diretor(a) Associado(a) Sonoplastia",
  "Equipe Sonoplastia"
];

// Função para fazer requisições
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Função para aguardar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para obter status da eleição
async function getElectionStatus() {
  const result = await makeRequest('https://7care.netlify.app/api/elections/status');
  return result;
}

// Função para obter dashboard
async function getDashboard() {
  const result = await makeRequest(`https://7care.netlify.app/api/elections/dashboard?configId=${CONFIG_ID}`);
  return result;
}

// Função para simular indicação
async function simulateNomination(voterId, positionId, candidateId) {
  const result = await makeRequest('https://7care.netlify.app/api/elections/nominate', {
    method: 'POST',
    body: JSON.stringify({
      positionId,
      candidateId
    })
  });
  return result;
}

// Função para simular voto
async function simulateVote(voterId, positionId, candidateId) {
  const result = await makeRequest('https://7care.netlify.app/api/elections/vote', {
    method: 'POST',
    body: JSON.stringify({
      positionId,
      candidateId
    })
  });
  return result;
}

// Função para avançar para próxima posição
async function advanceToNextPosition() {
  const result = await makeRequest('https://7care.netlify.app/api/elections/next-position', {
    method: 'POST'
  });
  return result;
}

// Função principal de automação
async function automateNomination() {
  console.log('🚀 Iniciando automação da nomeação...');
  console.log(`📊 Configuração ID: ${CONFIG_ID}`);
  console.log(`👥 Votantes: ${VOTERS.length}`);
  console.log(`🎯 Cargos: ${POSITIONS.length}`);
  
  // Obter status inicial
  const initialStatus = await getDashboard();
  if (!initialStatus.success) {
    console.error('❌ Erro ao obter status inicial:', initialStatus.error);
    return;
  }
  
  console.log('📋 Status inicial:', initialStatus.data);
  
  // Processar cada posição
  for (let positionIndex = 0; positionIndex < POSITIONS.length; positionIndex++) {
    const positionId = POSITIONS[positionIndex];
    console.log(`\n🎯 Processando cargo ${positionIndex + 1}/${POSITIONS.length}: ${positionId}`);
    
    // FASE 1: INDICAÇÕES
    console.log('📝 Fase 1: Simulando indicações...');
    
    // Simular indicações de alguns votantes
    const numIndications = Math.min(5, VOTERS.length); // 5 indicações por cargo
    for (let i = 0; i < numIndications; i++) {
      const voterId = VOTERS[i];
      const candidateId = CANDIDATES[i % CANDIDATES.length];
      
      console.log(`   👤 Votante ${voterId} indica candidato ${candidateId}`);
      
      const indicationResult = await simulateNomination(voterId, positionId, candidateId);
      if (indicationResult.success) {
        console.log(`   ✅ Indicação realizada`);
      } else {
        console.log(`   ❌ Erro na indicação:`, indicationResult.error || indicationResult.data);
      }
      
      await sleep(100); // Pequena pausa entre indicações
    }
    
    // FASE 2: VOTAÇÕES (se houver candidatos indicados)
    console.log('🗳️ Fase 2: Simulando votações...');
    
    // Simular votações de todos os votantes
    for (const voterId of VOTERS) {
      const candidateId = CANDIDATES[Math.floor(Math.random() * CANDIDATES.length)];
      
      console.log(`   🗳️ Votante ${voterId} vota no candidato ${candidateId}`);
      
      const voteResult = await simulateVote(voterId, positionId, candidateId);
      if (voteResult.success) {
        console.log(`   ✅ Voto registrado`);
      } else {
        console.log(`   ❌ Erro no voto:`, voteResult.error || voteResult.data);
      }
      
      await sleep(100); // Pequena pausa entre votos
    }
    
    // Avançar para próxima posição
    console.log('⏭️ Avançando para próxima posição...');
    const advanceResult = await advanceToNextPosition();
    if (advanceResult.success) {
      console.log(`   ✅ Avançou para posição ${positionIndex + 2}`);
    } else {
      console.log(`   ❌ Erro ao avançar:`, advanceResult.error || advanceResult.data);
    }
    
    await sleep(500); // Pausa entre posições
  }
  
  // Obter resultados finais
  console.log('\n📊 Obtendo resultados finais...');
  const finalResults = await getDashboard();
  if (finalResults.success) {
    console.log('🎉 Nomeação automatizada concluída!');
    console.log('📋 Resultados finais:', JSON.stringify(finalResults.data, null, 2));
  } else {
    console.error('❌ Erro ao obter resultados finais:', finalResults.error);
  }
}

// Executar automação
automateNomination().catch(console.error);
