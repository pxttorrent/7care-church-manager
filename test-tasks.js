#!/usr/bin/env node

/**
 * Script de teste para verificar contagem de tarefas
 */

const API_BASE = 'https://7care.netlify.app';

async function fetchAPI(endpoint) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`\n🌐 GET ${endpoint}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Erro ${response.status}:`, data);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║         🔍 TESTE DE CONTAGEM DE TAREFAS                  ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n🌐 API Base: ${API_BASE}`);
  console.log(`⏰ Hora: ${new Date().toLocaleString('pt-BR')}`);
  
  try {
    // Buscar estatísticas do dashboard
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  Verificando estatísticas do dashboard                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    const stats = await fetchAPI('/api/dashboard/stats');
    if (!stats) {
      console.log('\n❌ Não foi possível buscar estatísticas');
      return;
    }
    
    console.log('\n📊 Estatísticas de Tarefas:');
    console.log(`   Tarefas Pendentes: ${stats.pendingApprovals || 0}`);
    console.log(`   Tarefas Concluídas: ${stats.completedTasks || 0}`);
    console.log(`   Total de Tarefas: ${(stats.pendingApprovals || 0) + (stats.completedTasks || 0)}`);
    
    console.log('\n📊 Outras Estatísticas:');
    console.log(`   Total de Interessados: ${stats.totalInterested || 0}`);
    console.log(`   Interessados Sendo Discipulados: ${stats.interestedBeingDiscipled || 0}`);
    
    // Resumo
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMO DO CARD                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    console.log('\n📋 Card de Pessoas interessadas:');
    console.log(`   [${stats.totalInterested}] Interessados`);
    console.log(`   [${stats.interestedBeingDiscipled}] Estão Sendo Discipuladas`);
    
    console.log('\n📋 Card de Tarefas:');
    console.log(`   [${stats.pendingApprovals}] Pendentes`);
    console.log(`   [${stats.completedTasks}] Concluídas`);
    
    console.log('\n✅ Cards do Dashboard configurados corretamente!');
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
    console.error(error.stack);
  }
}

runTests();

