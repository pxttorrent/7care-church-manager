// ═══════════════════════════════════════════════════════════════
// SCRIPT PARA REATIVAR SERVICE WORKER E MODO OFFLINE
// Cole isto no Console (F12) de https://7care.netlify.app
// ═══════════════════════════════════════════════════════════════

(async function reativarOfflineMode() {
  console.log('═'.repeat(70));
  console.log('🔧 REATIVANDO MODO OFFLINE - 7CARE');
  console.log('═'.repeat(70));
  
  // 1. Verificar suporte
  if (!('serviceWorker' in navigator)) {
    console.log('❌ Service Worker não suportado neste navegador');
    return;
  }
  
  console.log('✅ Service Worker suportado');
  
  // 2. Verificar estado atual
  console.log('\n📊 VERIFICANDO ESTADO ATUAL...\n');
  
  const currentRegs = await navigator.serviceWorker.getRegistrations();
  console.log('Service Workers atuais:', currentRegs.length);
  
  if (currentRegs.length > 0) {
    console.log('ℹ️ Service Worker já registrado:');
    currentRegs.forEach(reg => {
      console.log('  Scope:', reg.scope);
      console.log('  Ativo?', reg.active ? '✅' : '❌');
    });
    
    // Desregistrar todos antes de re-registrar
    console.log('\n🧹 Limpando registros antigos...');
    for (const reg of currentRegs) {
      await reg.unregister();
      console.log('  ✅ Desregistrado:', reg.scope);
    }
  }
  
  // 3. Registrar Service Worker
  console.log('\n📝 REGISTRANDO SERVICE WORKER...\n');
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    
    console.log('✅ Service Worker registrado com sucesso!');
    console.log('  Scope:', registration.scope);
    console.log('  Estado:', registration.installing ? 'Instalando...' : 
                          registration.waiting ? 'Aguardando...' : 
                          registration.active ? 'Ativo' : 'Desconhecido');
    
    // 4. Aguardar ativação
    if (registration.installing) {
      console.log('⏳ Aguardando instalação...');
      
      return new Promise((resolve) => {
        registration.installing.addEventListener('statechange', function() {
          console.log('  Estado mudou para:', this.state);
          
          if (this.state === 'activated') {
            console.log('\n✅ Service Worker ATIVADO!');
            resolve(true);
          }
        });
      }).then(() => {
        console.log('\n🎉 MODO OFFLINE REATIVADO COM SUCESSO!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('  1. Recarregue a página: location.reload()');
        console.log('  2. Navegue pelas páginas');
        console.log('  3. Teste criar tarefa em /tasks');
        console.log('  4. Simule offline (DevTools > Network > Offline)');
        console.log('  5. Veja se Tasks funciona offline');
        
        console.log('\n🔄 Recarregando página em 3 segundos...');
        setTimeout(() => location.reload(), 3000);
      });
    }
    
    if (registration.active) {
      console.log('\n✅ Service Worker JÁ ESTÁ ATIVO!');
      console.log('\n🎉 MODO OFFLINE JÁ ESTÁ FUNCIONANDO!');
      console.log('\n📋 TESTE:');
      console.log('  1. Vá para /tasks');
      console.log('  2. DevTools > Network > Offline');
      console.log('  3. Crie uma tarefa');
      console.log('  4. Deve funcionar mesmo offline!');
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('  - Arquivo sw.js não encontrado');
    console.log('  - HTTPS necessário (não funciona em HTTP)');
    console.log('  - Bloqueado por configuração do navegador');
    return false;
  }
  
})().then(success => {
  if (success) {
    console.log('\n═'.repeat(70));
    console.log('✅ CONCLUÍDO! Modo offline está ativo.');
    console.log('═'.repeat(70));
  }
});

// ═══════════════════════════════════════════════════════════════
// FIM DO SCRIPT
// ═══════════════════════════════════════════════════════════════


