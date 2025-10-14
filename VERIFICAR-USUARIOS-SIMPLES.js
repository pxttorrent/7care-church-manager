// Script super simples para verificar quantos usuários existem

fetch('/api/users')
  .then(r => r.json())
  .then(users => {
    console.log('═'.repeat(60));
    console.log('👥 TOTAL DE USUÁRIOS:', users.length);
    console.log('═'.repeat(60));
    
    if (users.length === 0) {
      console.log('❌ NENHUM USUÁRIO NO BANCO!');
      console.log('\nℹ️ Você precisa adicionar usuários primeiro.');
      console.log('Vá para: https://7care.netlify.app/users');
      console.log('E clique em "+ Novo Usuário"');
    } else if (users.length === 1 && users[0].role === 'admin') {
      console.log('⚠️ APENAS 1 USUÁRIO (ADMIN)!');
      console.log('\nℹ️ O recálculo pula usuários admin.');
      console.log('Por isso retornou 0 usuários calculados.');
      console.log('\n💡 SOLUÇÃO:');
      console.log('Adicione mais usuários para testar o cálculo:');
      console.log('https://7care.netlify.app/users');
    } else {
      console.log('✅ Usuários encontrados:\n');
      users.forEach((u, i) => {
        console.log(`${i+1}. ${u.name} (${u.role})`);
        console.log(`   Pontos: ${u.points || 0}`);
        console.log(`   ID: ${u.id}\n`);
      });
      
      const nonAdmins = users.filter(u => u.role !== 'admin');
      console.log(`📊 Usuários não-admin: ${nonAdmins.length}`);
      console.log('   (Estes seriam recalculados)');
    }
    
    console.log('\n═'.repeat(60));
  })
  .catch(err => {
    console.error('❌ Erro:', err);
  });

