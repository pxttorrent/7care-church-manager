#!/usr/bin/env node

/**
 * Script de teste para diagnosticar notificações
 * 
 * Este script vai:
 * 1. Buscar o usuário filipe.peixoto
 * 2. Verificar todas as notificações no banco
 * 3. Enviar uma notificação de teste
 * 4. Verificar se foi salva corretamente
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

async function findFilipeUser() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 1: Buscando usuário filipe.peixoto                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const data = await fetchAPI('/api/users');
  if (!data) return null;
  
  const users = data.users || data;
  const filipe = users.find(u => 
    u.name?.toLowerCase().includes('filipe') || 
    u.email?.toLowerCase().includes('filipe')
  );
  
  if (filipe) {
    console.log('\n✅ Usuário encontrado:');
    console.log(`   🆔 ID: ${filipe.id}`);
    console.log(`   👤 Nome: ${filipe.name}`);
    console.log(`   📧 Email: ${filipe.email}`);
    console.log(`   🎭 Role: ${filipe.role}`);
  } else {
    console.log('\n❌ Usuário filipe.peixoto NÃO encontrado!');
    console.log('\n📋 Usuários disponíveis:');
    users.slice(0, 10).forEach(u => {
      console.log(`   - ${u.id}: ${u.name} (${u.email})`);
    });
  }
  
  return filipe;
}

async function checkAllNotifications() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 2: Verificando TODAS as notificações no BD        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const data = await fetchAPI('/api/debug/notifications');
  if (!data) return;
  
  console.log(`\n📊 Total de notificações no banco: ${data.count}`);
  
  if (data.count > 0) {
    console.log('\n📋 Últimas 5 notificações:');
    data.notifications.slice(0, 5).forEach(notif => {
      console.log(`   - ID ${notif.id}: "${notif.title}" para user_id ${notif.userId || notif.user_id}`);
      console.log(`     Criada em: ${notif.createdAt || notif.created_at}`);
    });
  } else {
    console.log('\n⚠️  Banco de notificações está VAZIO!');
  }
}

async function sendTestNotification(userId) {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 3: Enviando notificação de teste                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const payload = {
    title: `Teste Debug ${Date.now()}`,
    message: 'Esta é uma notificação de teste automático para verificar o histórico',
    type: 'general',
    userId: userId
  };
  
  console.log('\n📤 Enviando payload:');
  console.log(JSON.stringify(payload, null, 2));
  
  const data = await fetchAPI('/api/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (data) {
    console.log('\n✅ Resposta da API:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.notificationIds && data.notificationIds.length > 0) {
      console.log(`\n🎉 Notificação salva com ID: ${data.notificationIds[0]}`);
      return data.notificationIds[0];
    }
  }
  
  return null;
}

async function checkUserNotifications(userId) {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║  PASSO 4: Verificando notificações do usuário ${userId}      ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const data = await fetchAPI(`/api/debug/notifications?userId=${userId}`);
  if (!data) return;
  
  console.log(`\n📥 Total de notificações do usuário: ${data.count}`);
  
  if (data.count > 0) {
    console.log('\n📋 Notificações:');
    data.notifications.forEach((notif, idx) => {
      console.log(`\n   ${idx + 1}. ID: ${notif.id}`);
      console.log(`      Título: ${notif.title}`);
      console.log(`      Mensagem: ${notif.message}`);
      console.log(`      Tipo: ${notif.type}`);
      console.log(`      User ID: ${notif.userId || notif.user_id}`);
      console.log(`      Lida: ${notif.isRead || notif.is_read ? 'Sim' : 'Não'}`);
      console.log(`      Criada: ${notif.createdAt || notif.created_at}`);
    });
  } else {
    console.log('\n❌ Nenhuma notificação encontrada para este usuário!');
    console.log('   ESTE É O PROBLEMA! A notificação não está sendo salva corretamente.');
  }
}

async function checkAPIEndpoint(userId) {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PASSO 5: Testando endpoint usado pela página            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const data = await fetchAPI(`/api/notifications/${userId}?limit=50`);
  
  if (data) {
    console.log(`\n📥 Endpoint /api/notifications/${userId} retornou:`);
    console.log(`   Total: ${Array.isArray(data) ? data.length : 'N/A'} notificações`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\n✅ Formato correto! Notificações encontradas:');
      data.forEach((notif, idx) => {
        console.log(`   ${idx + 1}. ${notif.title} (ID: ${notif.id})`);
      });
    } else {
      console.log('\n❌ Endpoint retornou vazio ou formato incorreto!');
      console.log('   Resposta:', JSON.stringify(data, null, 2));
    }
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║         🔍 TESTE DE DIAGNÓSTICO DE NOTIFICAÇÕES          ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n🌐 API Base: ${API_BASE}`);
  console.log(`⏰ Hora: ${new Date().toLocaleString('pt-BR')}`);
  
  try {
    // Passo 1: Encontrar o usuário
    const filipe = await findFilipeUser();
    if (!filipe) {
      console.log('\n❌ Não foi possível continuar sem encontrar o usuário.');
      return;
    }
    
    // Passo 2: Ver todas as notificações
    await checkAllNotifications();
    
    // Passo 3: Enviar notificação de teste
    const notificationId = await sendTestNotification(filipe.id);
    
    // Aguardar 2 segundos para garantir que foi salvo
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Passo 4: Verificar notificações do usuário
    await checkUserNotifications(filipe.id);
    
    // Passo 5: Testar endpoint da página
    await checkAPIEndpoint(filipe.id);
    
    // Resumo final
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMO DO TESTE                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n✅ Teste completo!');
    console.log('\n📊 Próximos passos:');
    console.log('   1. Verifique os logs acima');
    console.log('   2. Se notificação foi salva mas não aparece: problema no frontend');
    console.log('   3. Se notificação NÃO foi salva: problema no backend');
    console.log('   4. Compartilhe o output deste script para análise');
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
    console.error(error.stack);
  }
}

// Executar testes
runTests();

