#!/usr/bin/env node

/**
 * Script de teste para diagnosticar contagem de relacionamentos
 * 
 * Este script vai:
 * 1. Buscar estatísticas do dashboard
 * 2. Buscar todos os relacionamentos
 * 3. Analisar status e contagens
 * 4. Verificar interessados com discipuladores
 */

const API_BASE = 'https://7care.netlify.app';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`\n🌐 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, options);
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

async function testDashboardStats() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 1: Verificando estatísticas do dashboard          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const stats = await fetchAPI('/api/dashboard/stats');
  if (!stats) return null;
  
  console.log('\n📊 Estatísticas retornadas:');
  console.log(`   Total de Usuários: ${stats.totalUsers || 0}`);
  console.log(`   Total de Interessados: ${stats.totalInterested || 0}`);
  console.log(`   Interessados Sendo Discipulados: ${stats.interestedBeingDiscipled || 0}`);
  console.log(`   Total de Missionários: ${stats.totalMissionaries || 0}`);
  
  return stats;
}

async function testRelationships() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 2: Buscando todos os relacionamentos              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const relationships = await fetchAPI('/api/relationships');
  if (!relationships) return null;
  
  const relArray = Array.isArray(relationships) ? relationships : [];
  
  console.log(`\n📋 Total de relacionamentos: ${relArray.length}`);
  
  if (relArray.length === 0) {
    console.log('\n⚠️  Nenhum relacionamento encontrado!');
    return relArray;
  }
  
  // Analisar status
  const statusCount = relArray.reduce((acc, rel) => {
    const status = rel.status || 'null';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Contagem por status:');
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });
  
  // Mostrar primeiros 5 relacionamentos
  console.log('\n📋 Primeiros 5 relacionamentos:');
  relArray.slice(0, 5).forEach((rel, idx) => {
    console.log(`\n   ${idx + 1}. ID: ${rel.id}`);
    console.log(`      Interested ID: ${rel.interested_id || rel.interestedId}`);
    console.log(`      Missionary ID: ${rel.missionary_id || rel.missionaryId}`);
    console.log(`      Status: ${rel.status}`);
    console.log(`      Created: ${rel.created_at || rel.createdAt}`);
  });
  
  return relArray;
}

async function analyzeActiveRelationships(relationships) {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 3: Analisando relacionamentos ativos              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  if (!relationships || relationships.length === 0) {
    console.log('\n❌ Sem relacionamentos para analisar');
    return;
  }
  
  // Filtrar por status 'active'
  const activeRels = relationships.filter(rel => rel.status === 'active');
  console.log(`\n✅ Relacionamentos com status 'active': ${activeRels.length}`);
  
  if (activeRels.length === 0) {
    console.log('\n⚠️  Nenhum relacionamento com status "active" encontrado!');
    console.log('\n💡 Possíveis motivos:');
    console.log('   1. Status pode ser diferente (ex: "approved", "accepted", "confirmed")');
    console.log('   2. Relacionamentos ainda estão "pending"');
    console.log('   3. Uso de sistema de solicitações ao invés de relacionamentos diretos');
  } else {
    // Mostrar relacionamentos ativos
    console.log('\n📋 Relacionamentos ativos:');
    activeRels.forEach((rel, idx) => {
      console.log(`   ${idx + 1}. Interessado ${rel.interested_id || rel.interestedId} ← Missionário ${rel.missionary_id || rel.missionaryId}`);
    });
    
    // Contar interessados únicos
    const uniqueInterested = new Set(
      activeRels.map(rel => rel.interested_id || rel.interestedId)
    );
    
    console.log(`\n👥 Interessados únicos com discipulador: ${uniqueInterested.size}`);
    console.log(`📋 IDs dos interessados: [${Array.from(uniqueInterested).join(', ')}]`);
  }
  
  // Verificar outros status que possam indicar relacionamento ativo
  const possibleActiveStatuses = ['approved', 'accepted', 'confirmed', 'active'];
  console.log('\n🔍 Verificando outros possíveis status ativos:');
  
  possibleActiveStatuses.forEach(status => {
    const count = relationships.filter(rel => rel.status === status).length;
    if (count > 0) {
      console.log(`   ✓ Status "${status}": ${count} relacionamentos`);
    }
  });
}

async function testInterestedUsers() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 4: Verificando usuários interessados              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const users = await fetchAPI('/api/users');
  if (!users) return;
  
  const userArray = users.users || users || [];
  const interested = userArray.filter(u => u.role === 'interested');
  
  console.log(`\n👥 Total de usuários com role 'interested': ${interested.length}`);
  
  if (interested.length > 0) {
    console.log('\n📋 Primeiros 5 interessados:');
    interested.slice(0, 5).forEach((user, idx) => {
      console.log(`   ${idx + 1}. ID ${user.id}: ${user.name}`);
    });
  }
}

async function testDiscipleshipRequests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 5: Verificando solicitações de discipulado        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const requests = await fetchAPI('/api/discipleship-requests');
  if (!requests) {
    console.log('\n⚠️  Endpoint de solicitações não disponível ou vazio');
    return;
  }
  
  const reqArray = Array.isArray(requests) ? requests : [];
  console.log(`\n📋 Total de solicitações: ${reqArray.length}`);
  
  if (reqArray.length > 0) {
    // Contar por status
    const statusCount = reqArray.reduce((acc, req) => {
      const status = req.status || 'null';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Solicitações por status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Solicitações aprovadas
    const approved = reqArray.filter(req => req.status === 'approved');
    console.log(`\n✅ Solicitações aprovadas: ${approved.length}`);
    
    if (approved.length > 0) {
      console.log('\n💡 DICA: Solicitações aprovadas podem indicar que o sistema usa');
      console.log('   "discipleship_requests" ao invés de "relationships" diretos!');
    }
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║    🔍 TESTE DE DIAGNÓSTICO DE RELACIONAMENTOS            ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n🌐 API Base: ${API_BASE}`);
  console.log(`⏰ Hora: ${new Date().toLocaleString('pt-BR')}`);
  
  try {
    // Passo 1: Stats do dashboard
    const stats = await testDashboardStats();
    
    // Passo 2: Todos os relacionamentos
    const relationships = await testRelationships();
    
    // Passo 3: Analisar relacionamentos ativos
    await analyzeActiveRelationships(relationships);
    
    // Passo 4: Verificar interessados
    await testInterestedUsers();
    
    // Passo 5: Verificar solicitações de discipulado
    await testDiscipleshipRequests();
    
    // Resumo final
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMO DO DIAGNÓSTICO                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    if (stats) {
      console.log(`\n✅ Dashboard mostra:`);
      console.log(`   - ${stats.totalInterested} interessados no total`);
      console.log(`   - ${stats.interestedBeingDiscipled || 0} sendo discipulados`);
    }
    
    if (relationships) {
      console.log(`\n✅ Banco de relacionamentos tem:`);
      console.log(`   - ${relationships.length} relacionamentos no total`);
      const active = relationships.filter(r => r.status === 'active').length;
      console.log(`   - ${active} com status "active"`);
    }
    
    console.log('\n📊 Conclusões:');
    
    if (!relationships || relationships.length === 0) {
      console.log('   ❌ PROBLEMA: Nenhum relacionamento encontrado!');
      console.log('   💡 SOLUÇÃO: Verificar se está usando outro sistema');
    } else if (relationships.filter(r => r.status === 'active').length === 0) {
      console.log('   ❌ PROBLEMA: Nenhum relacionamento com status "active"!');
      console.log('   💡 SOLUÇÃO: Verificar qual status correto usar');
    } else {
      console.log('   ✅ Relacionamentos ativos encontrados!');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
    console.error(error.stack);
  }
}

// Executar testes
runTests();

