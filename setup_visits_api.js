// Script para configurar o novo sistema de visitas usando as rotas da API
const BASE_URL = 'https://7care.netlify.app';

async function setupVisits() {
  try {
    console.log('🔧 Iniciando configuração do novo sistema de visitas via API...');
    
    // 1. Criar tabela de visitas
    console.log('📋 Criando tabela de visitas...');
    try {
      const createResponse = await fetch(`${BASE_URL}/api/setup/visits-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const createResult = await createResponse.json();
      console.log('✅ Tabela criada:', createResult.message);
    } catch (error) {
      console.log('⚠️ Erro ao criar tabela (pode já existir):', error.message);
    }
    
    // 2. Limpar dados antigos do extraData
    console.log('🧹 Limpando dados antigos do extraData...');
    try {
      const cleanupResponse = await fetch(`${BASE_URL}/api/cleanup/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const cleanupResult = await cleanupResponse.json();
      console.log('✅ Limpeza concluída:', cleanupResult.message);
    } catch (error) {
      console.log('⚠️ Erro na limpeza:', error.message);
    }
    
    // 3. Verificar visitômetro atual
    console.log('🔍 Verificando visitômetro atual...');
    const visitsResponse = await fetch(`${BASE_URL}/api/dashboard/visits`);
    const visitsData = await visitsResponse.json();
    console.log('📊 Visitômetro atual:', {
      completed: visitsData.completed,
      expected: visitsData.expected,
      totalVisits: visitsData.totalVisits,
      percentage: visitsData.percentage
    });
    
    // 4. Testar nova funcionalidade
    console.log('🧪 Testando nova funcionalidade...');
    try {
      // Buscar um usuário para testar
      const usersResponse = await fetch(`${BASE_URL}/api/users`);
      const users = await usersResponse.json();
      const testUser = users.find(u => u.role === 'member' || u.role === 'missionary');
      
      if (testUser) {
        console.log(`📝 Testando com usuário: ${testUser.name} (ID: ${testUser.id})`);
        
        // Marcar uma visita de teste
        const testVisitResponse = await fetch(`${BASE_URL}/api/users/${testUser.id}/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitDate: '2025-01-15' })
        });
        
        if (testVisitResponse.ok) {
          const testResult = await testVisitResponse.json();
          console.log('✅ Teste de visita bem-sucedido:', {
            visitId: testResult.visitId,
            totalVisits: testResult.totalVisits,
            lastVisitDate: testResult.lastVisitDate
          });
        } else {
          const errorResult = await testVisitResponse.json();
          console.log('⚠️ Teste de visita falhou:', errorResult);
        }
      }
    } catch (error) {
      console.log('⚠️ Erro no teste:', error.message);
    }
    
    // 5. Verificar visitômetro após teste
    console.log('🔍 Verificando visitômetro após teste...');
    const finalVisitsResponse = await fetch(`${BASE_URL}/api/dashboard/visits`);
    const finalVisitsData = await finalVisitsResponse.json();
    console.log('📊 Visitômetro final:', {
      completed: finalVisitsData.completed,
      expected: finalVisitsData.expected,
      totalVisits: finalVisitsData.totalVisits,
      percentage: finalVisitsData.percentage
    });
    
    console.log('🎉 Configuração do novo sistema de visitas concluída!');
    console.log('📋 Próximos passos:');
    console.log('   1. Acesse https://7care.netlify.app/users');
    console.log('   2. Teste marcar visitas nos usuários');
    console.log('   3. Verifique se as marcações estão persistindo');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

// Executar configuração
setupVisits();
