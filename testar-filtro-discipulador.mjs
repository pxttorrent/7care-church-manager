// Testar filtro de discipuladores por igreja
import https from 'https';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'https://7care.netlify.app');
    
    https.get({
      hostname: url.hostname,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testar() {
  console.log('🔍 TESTANDO FILTRO DE DISCIPULADORES\n');
  console.log('═'.repeat(80));
  
  try {
    // Buscar todos os usuários
    const response = await makeRequest('/api/users');
    
    if (response.status !== 200) {
      console.error('❌ Erro ao buscar usuários:', response.status);
      return;
    }
    
    const users = response.data;
    console.log(`📊 Total de usuários no sistema: ${users.length}\n`);
    
    // Encontrar adao.guterres
    const adao = users.find(u => 
      u.email?.toLowerCase().includes('adao.guterres') || 
      u.name?.toLowerCase().includes('adao') && u.name?.toLowerCase().includes('guterres')
    );
    
    if (!adao) {
      console.log('❌ Usuário adao.guterres não encontrado');
      console.log('\nUsuários que contém "adao":');
      users.filter(u => u.name?.toLowerCase().includes('adao')).forEach(u => {
        console.log(`  - ${u.name} (${u.email}) - ${u.church}`);
      });
      return;
    }
    
    console.log('✅ Usuário encontrado:\n');
    console.log(`Nome: ${adao.name}`);
    console.log(`Email: ${adao.email}`);
    console.log(`Igreja: ${adao.church || 'SEM IGREJA ❌'}`);
    console.log(`Role: ${adao.role}`);
    console.log(`ID: ${adao.id}\n`);
    
    console.log('═'.repeat(80));
    
    if (!adao.church) {
      console.log('\n⚠️ PROBLEMA IDENTIFICADO:');
      console.log('O usuário NÃO TEM IGREJA cadastrada!');
      console.log('Isso faz com que o filtro user.church === interestedChurch falhe.');
      console.log('\nSolução: Cadastrar uma igreja para este usuário.');
      return;
    }
    
    // Filtrar membros da mesma igreja
    const membros = users.filter(u => 
      (u.role === 'member' || u.role === 'missionary') &&
      u.church === adao.church &&
      u.id !== adao.id
    );
    
    console.log(`\n📋 MEMBROS DA IGREJA "${adao.church}":\n`);
    console.log(`Total: ${membros.length} membros\n`);
    
    if (membros.length === 0) {
      console.log('❌ Nenhum membro encontrado nesta igreja!');
    } else {
      membros.slice(0, 10).forEach((m, i) => {
        console.log(`${i+1}. ${m.name}`);
        console.log(`   Email: ${m.email}`);
        console.log(`   Igreja: ${m.church}`);
        console.log(`   Role: ${m.role}`);
        console.log('');
      });
      
      if (membros.length > 10) {
        console.log(`... e mais ${membros.length - 10} membros`);
      }
    }
    
    // Verificar se há membros de outras igrejas
    console.log('\n═'.repeat(80));
    console.log('\n🔍 VERIFICANDO SE HÁ MEMBROS DE OUTRAS IGREJAS:\n');
    
    const outrasIgrejas = users.filter(u => 
      (u.role === 'member' || u.role === 'missionary') &&
      u.church !== adao.church &&
      u.id !== adao.id
    );
    
    console.log(`Total de membros em OUTRAS igrejas: ${outrasIgrejas.length}\n`);
    
    // Agrupar por igreja
    const igrejas = {};
    outrasIgrejas.forEach(u => {
      const igreja = u.church || 'SEM IGREJA';
      if (!igrejas[igreja]) igrejas[igreja] = [];
      igrejas[igreja].push(u);
    });
    
    console.log('Membros por igreja:');
    Object.entries(igrejas).forEach(([igreja, membros]) => {
      console.log(`  ${igreja}: ${membros.length} membros`);
    });
    
    console.log('\n═'.repeat(80));
    console.log('\n🎯 DIAGNÓSTICO:\n');
    
    if (!adao.church) {
      console.log('❌ Usuário sem igreja cadastrada');
      console.log('   O filtro não funciona sem igreja!');
    } else if (membros.length === 0) {
      console.log('⚠️ Nenhum membro na mesma igreja');
      console.log(`   A igreja "${adao.church}" não tem outros membros.`);
    } else {
      console.log(`✅ Filtro deveria funcionar corretamente!`);
      console.log(`   Deveria mostrar ${membros.length} membros da igreja "${adao.church}"`);
      console.log(`   E NÃO mostrar ${outrasIgrejas.length} membros de outras igrejas.`);
    }
    
    // Verificar valores exatos das igrejas para debug
    console.log('\n═'.repeat(80));
    console.log('\n🔬 DEBUG - Comparação de strings de igreja:\n');
    
    console.log(`Igreja do interessado: "${adao.church}"`);
    console.log(`Tipo: ${typeof adao.church}`);
    console.log(`Length: ${adao.church?.length || 0}`);
    console.log(`Hex: ${Buffer.from(adao.church || '', 'utf8').toString('hex')}\n`);
    
    const sample = membros[0] || outrasIgrejas[0];
    if (sample) {
      console.log(`Igreja do membro exemplo: "${sample.church}"`);
      console.log(`Tipo: ${typeof sample.church}`);
      console.log(`Length: ${sample.church?.length || 0}`);
      console.log(`Hex: ${Buffer.from(sample.church || '', 'utf8').toString('hex')}\n`);
      
      console.log(`Comparação direta: ${adao.church === sample.church ? '✅ Igual' : '❌ Diferente'}`);
      console.log(`Comparação normalizada: ${adao.church?.trim() === sample.church?.trim() ? '✅ Igual' : '❌ Diferente'}`);
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

testar();

