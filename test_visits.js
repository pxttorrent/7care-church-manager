// Script de teste para verificar o sistema de visitas
// Execute com: node test_visits.js

const BASE_URL = 'https://7care.netlify.app';

async function testVisits() {
  console.log('🧪 Iniciando teste do sistema de visitas...\n');

  try {
    // 1. Testar rota de debug de usuários visitados
    console.log('1️⃣ Testando rota de debug de usuários visitados...');
    const debugResponse = await fetch(`${BASE_URL}/api/debug/visited-users`);
    const debugData = await debugResponse.json();
    console.log('✅ Debug de usuários visitados:', debugData.length, 'usuários encontrados');
    
    if (debugData.length > 0) {
      const firstUser = debugData[0];
      console.log('📋 Primeiro usuário:', {
        id: firstUser.id,
        name: firstUser.name,
        visited: firstUser.visited,
        visitCount: firstUser.visitCount,
        lastVisitDate: firstUser.lastVisitDate
      });
    }

    // 2. Testar rota de estatísticas de visitas
    console.log('\n2️⃣ Testando rota de estatísticas de visitas...');
    const statsResponse = await fetch(`${BASE_URL}/api/visits/stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Estatísticas de visitas:', {
      totalUsers: statsData.summary.totalUsers,
      visitedUsers: statsData.summary.visitedUsers,
      totalVisits: statsData.summary.totalVisits,
      percentage: statsData.summary.percentage
    });

    // 3. Testar rota de teste de visitas
    console.log('\n3️⃣ Testando rota de teste de visitas...');
    const testResponse = await fetch(`${BASE_URL}/api/test/visits`);
    const testData = await testResponse.json();
    console.log('✅ Teste de visitas:', testData.message);
    console.log('📋 Usuário de teste:', {
      id: testData.testUser.id,
      name: testData.testUser.name,
      visited: testData.testUser.visited,
      visitCount: testData.testUser.visitCount,
      lastVisitDate: testData.testUser.lastVisitDate
    });

    // 4. Testar rota de usuários
    console.log('\n4️⃣ Testando rota de usuários...');
    const usersResponse = await fetch(`${BASE_URL}/api/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Usuários carregados:', usersData.length);
    
    if (usersData.length > 0) {
      const firstUser = usersData[0];
      console.log('📋 Primeiro usuário da lista:', {
        id: firstUser.id,
        name: firstUser.name,
        extraData: firstUser.extraData
      });
    }

    // 5. Testar rota de visitômetro
    console.log('\n5️⃣ Testando rota de visitômetro...');
    const visitsResponse = await fetch(`${BASE_URL}/api/dashboard/visits`);
    const visitsData = await visitsResponse.json();
    console.log('✅ Dados do visitômetro:', {
      completed: visitsData.completed,
      expected: visitsData.expected,
      totalVisits: visitsData.totalVisits,
      percentage: visitsData.percentage
    });

    console.log('\n✅ Todos os testes concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar os testes
testVisits();
