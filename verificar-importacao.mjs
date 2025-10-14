// Verificar se importação foi correta
import https from 'https';

const BASE_URL = 'https://7care.netlify.app';

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
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

async function verificar() {
  console.log('🔍 VERIFICANDO IMPORTAÇÃO\n');
  console.log('═'.repeat(60));
  
  try {
    const response = await request('/api/users');
    
    if (response.status !== 200) {
      console.error('❌ Erro ao buscar usuários:', response.status);
      return;
    }
    
    const users = response.data;
    console.log(`📊 Total de usuários: ${users.length}\n`);
    
    // Filtrar não-admins
    const nonAdmins = users.filter(u => u.role !== 'admin');
    console.log(`👥 Usuários não-admin: ${nonAdmins.length}\n`);
    
    // Verificar campos de pontuação
    const camposPontuacao = [
      'engajamento',
      'classificacao', 
      'dizimista_type',
      'ofertante_type',
      'tempo_batismo_anos',
      'departamentos_cargos',
      'nome_unidade',
      'tem_licao',
      'total_presenca',
      'comunhao',
      'missao',
      'estudo_biblico',
      'batizou_alguem',
      'disc_pos_batismal',
      'cpf_valido',
      'campos_vazios'
    ];
    
    console.log('📋 ANÁLISE DOS CAMPOS DE PONTUAÇÃO:\n');
    
    camposPontuacao.forEach(campo => {
      const comValor = nonAdmins.filter(u => {
        const valor = u[campo];
        return valor !== null && valor !== undefined && valor !== '' && valor !== 0 && valor !== false;
      });
      
      const porcentagem = ((comValor.length / nonAdmins.length) * 100).toFixed(1);
      const status = comValor.length > 0 ? '✅' : '❌';
      
      console.log(`${status} ${campo.padEnd(25)} ${comValor.length.toString().padStart(3)}/${nonAdmins.length} (${porcentagem}%)`);
    });
    
    console.log('\n═'.repeat(60));
    console.log('📊 AMOSTRA DE 3 USUÁRIOS:\n');
    
    nonAdmins.slice(0, 3).forEach((u, i) => {
      console.log(`${i+1}. ${u.name}`);
      console.log(`   ID: ${u.id}`);
      console.log(`   Pontos: ${u.points || 0}`);
      console.log(`   Engajamento: ${u.engajamento || 'VAZIO ❌'}`);
      console.log(`   Classificação: ${u.classificacao || 'VAZIO ❌'}`);
      console.log(`   Dizimista: ${u.dizimista_type || 'VAZIO ❌'}`);
      console.log(`   Ofertante: ${u.ofertante_type || 'VAZIO ❌'}`);
      console.log(`   Tempo Batismo: ${u.tempo_batismo_anos || 'VAZIO ❌'}`);
      console.log(`   Nome Unidade: ${u.nome_unidade || 'VAZIO ❌'}`);
      console.log(`   Total Presença: ${u.total_presenca ?? 'VAZIO ❌'}`);
      console.log(`   Comunhão: ${u.comunhao ?? 'VAZIO ❌'}`);
      console.log(`   Missão: ${u.missao ?? 'VAZIO ❌'}`);
      console.log(`   Estudo Bíblico: ${u.estudo_biblico ?? 'VAZIO ❌'}`);
      console.log('');
    });
    
    // Diagnóstico final
    console.log('═'.repeat(60));
    console.log('🎯 DIAGNÓSTICO FINAL:\n');
    
    const comEngajamento = nonAdmins.filter(u => u.engajamento).length;
    const comClassificacao = nonAdmins.filter(u => u.classificacao).length;
    
    if (comEngajamento === 0 && comClassificacao === 0) {
      console.log('❌ PROBLEMA CRÍTICO:');
      console.log('   NENHUM usuário tem engajamento ou classificação!');
      console.log('\n💡 CAUSA PROVÁVEL:');
      console.log('   Os campos foram salvos no extraData (JSON)');
      console.log('   ao invés das colunas diretas do banco.');
      console.log('\n🔧 SOLUÇÃO:');
      console.log('   O código frontend foi corrigido, mas o backend');
      console.log('   pode estar usando código antigo (cache).');
      console.log('\n   Aguarde 5 minutos e reimporte, OU');
      console.log('   Reimporte usando o código deployado.');
      
    } else if (comEngajamento > 0 && comEngajamento < nonAdmins.length) {
      console.log('⚠️ IMPORTAÇÃO PARCIAL:');
      console.log(`   ${comEngajamento}/${nonAdmins.length} têm engajamento`);
      console.log(`   ${comClassificacao}/${nonAdmins.length} têm classificação`);
      console.log('\n💡 Alguns usuários foram importados corretamente.');
      
    } else {
      console.log('✅ IMPORTAÇÃO CORRETA:');
      console.log(`   ${comEngajamento}/${nonAdmins.length} têm engajamento`);
      console.log(`   ${comClassificacao}/${nonAdmins.length} têm classificação`);
      console.log('\n🎉 Campos estão nas colunas corretas!');
    }
    
    console.log('\n═'.repeat(60));
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

verificar();

