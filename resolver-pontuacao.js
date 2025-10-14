// Script Node.js para diagnosticar e resolver problema de pontuação
const https = require('https');

const BASE_URL = 'https://7care.netlify.app';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
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

async function diagnosticarEResolver() {
  console.log('🔍 DIAGNÓSTICO E SOLUÇÃO AUTOMÁTICA\n');
  console.log('═'.repeat(60));
  
  try {
    // 1. Verificar usuários
    console.log('\n📊 [1/4] Verificando usuários...');
    const usersRes = await request('/api/users');
    
    if (usersRes.status === 200) {
      const users = usersRes.data;
      console.log(`✅ Total de usuários: ${users.length}`);
      console.log(`   Admins: ${users.filter(u => u.role === 'admin').length}`);
      console.log(`   Não-admins: ${users.filter(u => u.role !== 'admin').length}`);
      
      const sample = users.find(u => u.role !== 'admin');
      if (sample) {
        console.log(`\n📋 Exemplo de usuário:`);
        console.log(`   Nome: ${sample.name}`);
        console.log(`   Pontos: ${sample.points || 0}`);
        console.log(`   Engajamento: ${sample.engajamento || 'NÃO DEFINIDO'}`);
        console.log(`   Classificação: ${sample.classificacao || 'NÃO DEFINIDO'}`);
      }
    } else {
      console.error('❌ Erro ao buscar usuários:', usersRes.status);
      return;
    }
    
    // 2. Verificar configuração
    console.log('\n📊 [2/4] Verificando configuração de pontos...');
    const configRes = await request('/api/system/points-config');
    
    let configExists = false;
    if (configRes.status === 200 && configRes.data.engajamento) {
      console.log('✅ Configuração existe');
      console.log('   Engajamento:', configRes.data.engajamento);
      console.log('   Dizimista:', configRes.data.dizimista);
      configExists = true;
    } else {
      console.log('❌ Configuração NÃO existe ou está vazia!');
      console.log('   Status:', configRes.status);
    }
    
    // 3. Criar configuração se necessário
    if (!configExists) {
      console.log('\n🔧 [3/4] Criando configuração padrão...');
      const resetRes = await request('/api/system/points-config/reset', 'POST');
      
      if (resetRes.status === 200) {
        console.log('✅ Configuração padrão criada!');
        console.log('   Resultado:', resetRes.data);
        
        // Aguardar 2 segundos
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.error('❌ Erro ao criar configuração:', resetRes.status);
        return;
      }
    } else {
      console.log('\n✅ [3/4] Configuração já existe, pulando...');
    }
    
    // 4. Recalcular pontos
    console.log('\n🔄 [4/4] Recalculando pontos de todos os usuários...');
    console.log('Aguarde... (pode levar 20-30 segundos)\n');
    
    const startTime = Date.now();
    const recalcRes = await request('/api/system/recalculate-points', 'POST');
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n═'.repeat(60));
    console.log('🎉 RESULTADO FINAL');
    console.log('═'.repeat(60));
    
    if (recalcRes.status === 200) {
      const result = recalcRes.data;
      console.log('✅ Sucesso:', result.success);
      console.log('👥 Total de usuários:', result.totalUsers || 0);
      console.log('📈 Usuários atualizados:', result.updatedCount || result.updatedUsers || 0);
      console.log('❌ Erros:', result.errors || result.errorCount || 0);
      console.log('⏱️ Duração:', duration, 'segundos');
      
      if ((result.updatedCount || result.updatedUsers || 0) > 0) {
        console.log('\n✅ PROBLEMA RESOLVIDO!');
        console.log(`${result.updatedCount || result.updatedUsers} usuários foram atualizados com sucesso!`);
      } else {
        console.log('\n⚠️ Ainda 0 usuários atualizados.');
        console.log('Possíveis causas:');
        console.log('1. Pontos já estão corretos (normal)');
        console.log('2. Campos dos usuários estão vazios');
        console.log('3. Configuração ainda não foi aplicada');
      }
    } else {
      console.error('❌ Erro no recálculo. Status:', recalcRes.status);
      console.error('   Resposta:', recalcRes.data);
    }
    
    console.log('\n═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
  }
}

// Executar
diagnosticarEResolver().catch(console.error);

