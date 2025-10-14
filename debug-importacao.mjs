// Debug detalhado da importação
import XLSX from 'xlsx';
import https from 'https';
import fs from 'fs';

const EXCEL_FILE = '/Users/filipevitolapeixoto/Downloads/data 131025.xlsx';
const API_URL = 'https://7care.netlify.app/api/users/bulk-import';

function request(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(body);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
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
    req.write(bodyStr);
    req.end();
  });
}

async function debugImportacao() {
  try {
    console.log('🔍 DEBUG: IMPORTAÇÃO DE USUÁRIOS\n');
    
    // Ler Excel
    const workbook = XLSX.readFile(EXCEL_FILE);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    console.log(`📊 ${data.length} linhas no Excel\n`);
    
    // Testar com apenas 1 usuário para ver o erro
    const primeiroUsuario = data[0];
    
    console.log('📋 Primeiro usuário do Excel:');
    console.log('   Nome:', primeiroUsuario.Nome);
    console.log('   Email:', primeiroUsuario.Email);
    console.log('   Igreja:', primeiroUsuario.Igreja);
    console.log('   Engajamento:', primeiroUsuario.Engajamento);
    console.log('   Classificação:', primeiroUsuario.Classificação);
    
    const usuarioParaEnviar = {
      name: primeiroUsuario.Nome,
      email: primeiroUsuario.Email,
      password: '123456',
      role: 'member',
      church: primeiroUsuario.Igreja,
      engajamento: primeiroUsuario.Engajamento,
      classificacao: primeiroUsuario.Classificação
    };
    
    console.log('\n📤 Enviando para API...');
    console.log('   Dados:', JSON.stringify(usuarioParaEnviar, null, 2));
    
    const response = await request(API_URL, 'POST', { users: [usuarioParaEnviar] });
    
    console.log('\n📥 RESPOSTA DA API:');
    console.log('   Status HTTP:', response.status);
    console.log('   Resposta completa:', JSON.stringify(response.data, null, 2));
    
    if (response.data.errors && response.data.errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      response.data.errors.forEach((err, i) => {
        console.log(`   ${i+1}. ${err.error}`);
        console.log(`      Email: ${err.userId}`);
        console.log(`      Nome: ${err.userName}`);
      });
    }
    
    if (response.data.imported === 0 && response.data.errors && response.data.errors.length > 0) {
      console.log('\n💡 CAUSA IDENTIFICADA:');
      console.log('   ', response.data.errors[0].error);
    }
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }
}

debugImportacao();

