// Recalcular pontos de todos os usuários
import https from 'https';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'https://7care.netlify.app');
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function recalcular() {
  console.log('🔄 RECALCULANDO PONTOS DE TODOS OS USUÁRIOS\n');
  console.log('═'.repeat(60));
  
  try {
    const response = await makeRequest('/api/system/recalculate-points', 'POST');
    
    if (response.status !== 200) {
      console.error('❌ Erro ao recalcular:', response.status);
      console.error(response.data);
      return;
    }
    
    const result = response.data;
    
    console.log('\n✅ RECÁLCULO CONCLUÍDO!\n');
    console.log(`📊 Total de usuários: ${result.totalUsers || result.total}`);
    console.log(`✅ Atualizados: ${result.updatedCount || result.updatedUsers || result.updated}`);
    console.log(`⏱️  Tempo: ${result.executionTime || 'N/A'}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️  Erros: ${result.errors.length}`);
      result.errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err}`);
      });
    }
    
    console.log('\n═'.repeat(60));
    
    // Buscar alguns usuários para verificar pontos
    console.log('\n📊 VERIFICANDO PONTOS...\n');
    
    const usersResponse = await makeRequest('/api/users');
    if (usersResponse.status === 200) {
      const users = usersResponse.data;
      const nonAdmins = users.filter(u => u.role !== 'admin');
      
      // Estatísticas
      const comPontos = nonAdmins.filter(u => u.points > 0);
      const semPontos = nonAdmins.filter(u => !u.points || u.points === 0);
      
      console.log(`Total de usuários: ${nonAdmins.length}`);
      console.log(`✅ Com pontos: ${comPontos.length} (${((comPontos.length/nonAdmins.length)*100).toFixed(1)}%)`);
      console.log(`❌ Sem pontos: ${semPontos.length} (${((semPontos.length/nonAdmins.length)*100).toFixed(1)}%)`);
      
      // Mostrar top 5
      console.log('\n🏆 TOP 5 USUÁRIOS:\n');
      const top5 = [...nonAdmins].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);
      
      top5.forEach((u, i) => {
        console.log(`${i+1}. ${u.name}`);
        console.log(`   Pontos: ${u.points || 0}`);
        console.log(`   Monte: ${u.level || 'N/A'}`);
        console.log('');
      });
      
      // Distribuição de montes
      const montes = {};
      nonAdmins.forEach(u => {
        const monte = u.level || 'Sem Monte';
        montes[monte] = (montes[monte] || 0) + 1;
      });
      
      console.log('📊 DISTRIBUIÇÃO DE MONTES:\n');
      Object.entries(montes).sort((a, b) => b[1] - a[1]).forEach(([monte, count]) => {
        console.log(`   ${monte}: ${count} usuários`);
      });
      
      console.log('\n═'.repeat(60));
      
      if (comPontos.length > 300) {
        console.log('\n🎉🎉🎉 SUCESSO TOTAL! 🎉🎉🎉');
        console.log('Mais de 300 usuários com pontos calculados!');
      } else if (comPontos.length > 200) {
        console.log('\n✅ Bom resultado!');
        console.log(`${comPontos.length} usuários com pontos.`);
      } else {
        console.log('\n⚠️ Poucos usuários com pontos.');
        console.log('Verifique a configuração de pontos.');
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

recalcular();

