// Buscar interessados da igreja Argeni
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

async function buscar() {
  console.log('🔍 BUSCANDO INTERESSADOS DA IGREJA ARGENI\n');
  console.log('═'.repeat(80));
  
  try {
    const response = await makeRequest('/api/users');
    
    if (response.status !== 200) {
      console.error('❌ Erro ao buscar usuários:', response.status);
      return;
    }
    
    const users = response.data;
    
    // Buscar usuários com "guterres"
    console.log('📋 USUÁRIOS COM "GUTERRES":\n');
    const guterres = users.filter(u => u.name?.toLowerCase().includes('guterres'));
    
    if (guterres.length > 0) {
      guterres.forEach(u => {
        console.log(`Nome: ${u.name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Igreja: "${u.church}"`);
        console.log(`Role: ${u.role}`);
        console.log(`ID: ${u.id}\n`);
      });
    } else {
      console.log('Nenhum usuário encontrado com "guterres"\n');
    }
    
    console.log('═'.repeat(80));
    console.log('\n📋 TODOS OS INTERESSADOS DA IGREJA ARGENI:\n');
    
    // Buscar interessados da igreja Argeni (várias variações possíveis)
    const argeniVariations = users.filter(u => 
      u.role === 'interested' && 
      u.church?.toLowerCase().includes('argeni')
    );
    
    if (argeniVariations.length > 0) {
      argeniVariations.forEach((u, i) => {
        console.log(`${i+1}. ${u.name}`);
        console.log(`   Email: ${u.email}`);
        console.log(`   Igreja: "${u.church}"`);
        console.log(`   ID: ${u.id}\n`);
      });
    } else {
      console.log('Nenhum interessado encontrado na igreja Argeni\n');
    }
    
    console.log('═'.repeat(80));
    console.log('\n📋 TODAS AS IGREJAS NO SISTEMA:\n');
    
    const igrejas = [...new Set(users.map(u => u.church).filter(Boolean))].sort();
    igrejas.forEach((igreja, i) => {
      const count = users.filter(u => u.church === igreja).length;
      console.log(`${i+1}. "${igreja}" (${count} usuários)`);
    });
    
    console.log('\n═'.repeat(80));
    console.log('\n📋 INTERESSADOS POR IGREJA:\n');
    
    const interessadosPorIgreja = {};
    users.filter(u => u.role === 'interested').forEach(u => {
      const igreja = u.church || 'SEM IGREJA';
      if (!interessadosPorIgreja[igreja]) interessadosPorIgreja[igreja] = [];
      interessadosPorIgreja[igreja].push(u);
    });
    
    Object.entries(interessadosPorIgreja)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([igreja, interessados]) => {
        console.log(`"${igreja}": ${interessados.length} interessados`);
      });
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

buscar();

