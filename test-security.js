import https from 'https';

const BASE_URL = '7care.netlify.app';
let authToken = null;

// Helper para fazer requisições
function makeRequest(path, method = 'GET', body = null, useAuth = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Adicionar token se necessário
    if (useAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                   ║');
  console.log('║        🔒 TESTE DE SEGURANÇA JWT - 7care 🔒                      ║');
  console.log('║                                                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // TESTE 1: Login e obter JWT
  console.log('1️⃣ TESTANDO LOGIN E OBTENÇÃO DE JWT...');
  try {
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@7care.com',
      password: 'admin123'
    });
    
    if (loginResult.status === 200 && loginResult.data.token) {
      authToken = loginResult.data.token;
      console.log('✅ Login bem-sucedido');
      console.log(`✅ JWT recebido: ${authToken.substring(0, 20)}...`);
      results.passed++;
      results.tests.push({ name: 'Login + JWT', status: 'PASS' });
    } else {
      console.log('❌ Login falhou ou JWT não retornado');
      results.failed++;
      results.tests.push({ name: 'Login + JWT', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
    results.failed++;
    results.tests.push({ name: 'Login + JWT', status: 'ERROR' });
  }

  // TESTE 2: Acessar rota protegida SEM token (deve falhar)
  console.log('\n2️⃣ TESTANDO ACESSO SEM TOKEN (deve falhar)...');
  try {
    const result = await makeRequest('/api/users', 'GET', null, false);
    
    if (result.status === 401) {
      console.log('✅ Acesso negado corretamente (401)');
      results.passed++;
      results.tests.push({ name: 'Bloqueio sem token', status: 'PASS' });
    } else {
      console.log('❌ Rota deveria estar bloqueada mas retornou:', result.status);
      results.failed++;
      results.tests.push({ name: 'Bloqueio sem token', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
    results.failed++;
    results.tests.push({ name: 'Bloqueio sem token', status: 'ERROR' });
  }

  // TESTE 3: Acessar rota protegida COM token (deve funcionar)
  console.log('\n3️⃣ TESTANDO ACESSO COM TOKEN (deve funcionar)...');
  try {
    const result = await makeRequest('/api/users', 'GET', null, true);
    
    if (result.status === 200) {
      console.log('✅ Acesso permitido com token (200)');
      console.log(`✅ Usuários retornados: ${result.data.users?.length || 0}`);
      results.passed++;
      results.tests.push({ name: 'Acesso com token', status: 'PASS' });
    } else {
      console.log('❌ Acesso com token falhou:', result.status);
      results.failed++;
      results.tests.push({ name: 'Acesso com token', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
    results.failed++;
    results.tests.push({ name: 'Acesso com token', status: 'ERROR' });
  }

  // TESTE 4: Acessar rota pública (deve funcionar sem token)
  console.log('\n4️⃣ TESTANDO ROTA PÚBLICA (deve funcionar)...');
  try {
    const result = await makeRequest('/api/system/logo', 'GET', null, false);
    
    if (result.status === 200 || result.status === 404) {
      console.log('✅ Rota pública acessível sem token');
      results.passed++;
      results.tests.push({ name: 'Rota pública', status: 'PASS' });
    } else {
      console.log('❌ Rota pública bloqueada incorretamente:', result.status);
      results.failed++;
      results.tests.push({ name: 'Rota pública', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
    results.failed++;
    results.tests.push({ name: 'Rota pública', status: 'ERROR' });
  }

  // TESTE 5: Testar notificações com token
  console.log('\n5️⃣ TESTANDO NOTIFICAÇÕES COM TOKEN...');
  try {
    const result = await makeRequest('/api/push/subscriptions', 'GET', null, true);
    
    if (result.status === 200) {
      console.log('✅ Notificações acessíveis com token');
      console.log(`✅ Subscriptions: ${result.data.subscriptions?.length || 0}`);
      results.passed++;
      results.tests.push({ name: 'Notificações', status: 'PASS' });
    } else {
      console.log('❌ Notificações falharam:', result.status);
      results.failed++;
      results.tests.push({ name: 'Notificações', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
    results.failed++;
    results.tests.push({ name: 'Notificações', status: 'ERROR' });
  }

  // TESTE 6: Testar eventos com token
  console.log('\n6️⃣ TESTANDO EVENTOS COM TOKEN...');
  try {
    const result = await makeRequest('/api/events', 'GET', null, true);
    
    if (result.status === 200) {
      console.log('✅ Eventos acessíveis com token');
      console.log(`✅ Eventos: ${result.data.events?.length || 0}`);
      results.passed++;
      results.tests.push({ name: 'Eventos', status: 'PASS' });
    } else {
      console.log('❌ Eventos falharam:', result.status);
      results.failed++;
      results.tests.push({ name: 'Eventos', status: 'FAIL' });
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
    results.failed++;
    results.tests.push({ name: 'Eventos', status: 'ERROR' });
  }

  // RESUMO
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMO DOS TESTES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  results.tests.forEach((test, i) => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${i + 1}. ${test.name}: ${test.status}`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Testes passados: ${results.passed}`);
  console.log(`❌ Testes falhados: ${results.failed}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (results.failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Sistema de segurança JWT funcionando perfeitamente!\n');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM!');
    console.log('❌ Verifique os logs acima para detalhes.\n');
  }
}

runTests().catch(console.error);
