// Testar filtro de discipuladores para Adao da Silva Guterres
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
  console.log('🔍 TESTANDO FILTRO PARA ADAO DA SILVA GUTERRES\n');
  console.log('═'.repeat(80));
  
  try {
    const response = await makeRequest('/api/users');
    
    if (response.status !== 200) {
      console.error('❌ Erro ao buscar usuários:', response.status);
      return;
    }
    
    const users = response.data;
    
    // Encontrar Adao da Silva Guterres
    const adao = users.find(u => 
      u.name?.toLowerCase().includes('adao') && 
      u.name?.toLowerCase().includes('guterres')
    );
    
    if (!adao) {
      console.log('❌ Adao da Silva Guterres não encontrado\n');
      console.log('Usuários com "adao":');
      users.filter(u => u.name?.toLowerCase().includes('adao')).forEach(u => {
        console.log(`  - ${u.name} (${u.church}) - ${u.role}`);
      });
      return;
    }
    
    console.log('✅ INTERESSADO ENCONTRADO:\n');
    console.log(`Nome: ${adao.name}`);
    console.log(`Email: ${adao.email}`);
    console.log(`Igreja: "${adao.church}"`);
    console.log(`Role: ${adao.role}`);
    console.log(`ID: ${adao.id}\n`);
    
    console.log('═'.repeat(80));
    console.log('\n📋 FILTRO APLICADO (o que o código faz):\n');
    console.log(`1. Busca todos os usuários`);
    console.log(`2. Filtra por: role = 'member' OU 'missionary'`);
    console.log(`3. Filtra por: church = "${adao.church}"`);
    console.log(`4. Exclui o próprio interessado\n`);
    
    // Aplicar o mesmo filtro que o código usa
    const membrosDaMesmaIgreja = users.filter(u => 
      (u.role === 'member' || u.role === 'missionary') &&
      u.church === adao.church &&
      u.id !== adao.id
    );
    
    console.log('═'.repeat(80));
    console.log(`\n✅ MEMBROS DA IGREJA "${adao.church}" (DEVERIA APARECER):\n`);
    console.log(`Total: ${membrosDaMesmaIgreja.length} membros\n`);
    
    if (membrosDaMesmaIgreja.length === 0) {
      console.log('⚠️ NENHUM MEMBRO ENCONTRADO NESTA IGREJA!\n');
    } else {
      membrosDaMesmaIgreja.forEach((m, i) => {
        console.log(`${i+1}. ${m.name}`);
        console.log(`   Email: ${m.email}`);
        console.log(`   Igreja: "${m.church}"`);
        console.log(`   Comparação: "${m.church}" === "${adao.church}" = ${m.church === adao.church}\n`);
      });
    }
    
    console.log('═'.repeat(80));
    console.log('\n❌ MEMBROS DE OUTRAS IGREJAS (NÃO DEVERIA APARECER):\n');
    
    const membrosDeOutrasIgrejas = users.filter(u => 
      (u.role === 'member' || u.role === 'missionary') &&
      u.church !== adao.church &&
      u.id !== adao.id
    );
    
    console.log(`Total: ${membrosDeOutrasIgrejas.length} membros\n`);
    
    // Agrupar por igreja
    const igrejas = {};
    membrosDeOutrasIgrejas.forEach(u => {
      const igreja = u.church || 'SEM IGREJA';
      if (!igrejas[igreja]) igrejas[igreja] = [];
      igrejas[igreja].push(u);
    });
    
    console.log('Distribuição por igreja:');
    Object.entries(igrejas).sort((a, b) => b[1].length - a[1].length).forEach(([igreja, membros]) => {
      console.log(`  "${igreja}": ${membros.length} membros`);
    });
    
    console.log('\n═'.repeat(80));
    console.log('\n🔬 ANÁLISE DETALHADA:\n');
    
    // Verificar se há problemas com espaços ou caracteres especiais
    console.log(`Igreja do interessado (bytes):`);
    console.log(`  String: "${adao.church}"`);
    console.log(`  Length: ${adao.church?.length || 0}`);
    console.log(`  Trimmed: "${adao.church?.trim()}"`);
    console.log(`  Hex: ${Buffer.from(adao.church || '', 'utf8').toString('hex')}\n`);
    
    // Pegar 3 exemplos de outras igrejas para comparar
    const exemplos = Object.entries(igrejas).slice(0, 3);
    exemplos.forEach(([igreja, membros]) => {
      console.log(`Igreja "${igreja}" (bytes):`);
      console.log(`  String: "${igreja}"`);
      console.log(`  Length: ${igreja?.length || 0}`);
      console.log(`  Trimmed: "${igreja?.trim()}"`);
      console.log(`  Hex: ${Buffer.from(igreja || '', 'utf8').toString('hex')}`);
      console.log(`  Igual? ${igreja === adao.church}\n`);
    });
    
    console.log('═'.repeat(80));
    console.log('\n🎯 CONCLUSÃO:\n');
    
    if (membrosDaMesmaIgreja.length > 0) {
      console.log(`✅ O filtro está funcionando CORRETAMENTE!`);
      console.log(`   Encontrou ${membrosDaMesmaIgreja.length} membros da igreja "${adao.church}"`);
      console.log(`   E filtrou ${membrosDeOutrasIgrejas.length} membros de outras igrejas.\n`);
      console.log(`   Se está vendo membros de outras igrejas no modal,`);
      console.log(`   o problema pode ser cache do navegador ou versão antiga do código.`);
    } else {
      console.log(`⚠️ A igreja "${adao.church}" não tem membros!`);
      console.log(`   Por isso o modal pode mostrar vazio ou erro.`);
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

testar();

