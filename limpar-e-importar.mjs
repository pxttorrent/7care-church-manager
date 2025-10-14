// Script para limpar dados e reimportar usuários
import XLSX from 'xlsx';
import https from 'https';
import fs from 'fs';

const EXCEL_FILE = '/Users/filipevitolapeixoto/Downloads/data 131025.xlsx';
const BASE_URL = 'https://7care.netlify.app';

console.log('🔄 LIMPEZA E REIMPORTAÇÃO COMPLETA\n');
console.log('═'.repeat(60));

// Função para fazer requisição
function request(url, method, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
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

// Funções auxiliares (mesmas do script anterior)
function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'sim' || lower === 'true' || lower === '1' || lower === 'yes';
  }
  return !!value;
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function parseExcelDate(value) {
  if (!value) return null;
  
  // Se já é uma data válida (string DD/MM/YYYY)
  if (typeof value === 'string' && value.includes('/')) {
    const parts = value.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Se é número serial do Excel
  if (typeof value === 'number') {
    // Excel armazena datas como dias desde 01/01/1900
    // Bug do Excel: considera 1900 como ano bissexto (não é)
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = value - 2; // -2 por causa do bug do Excel
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

function getRole(tipo) {
  if (!tipo) return 'member';
  const tipoLower = tipo.toLowerCase().trim();
  
  if (tipoLower.includes('admin') || tipoLower.includes('pastor')) return 'admin';
  if (tipoLower.includes('mission') || tipoLower.includes('missionário') || tipoLower.includes('diácon')) return 'missionary';
  if (tipoLower.includes('interest') || tipoLower.includes('interessado') || tipoLower.includes('visit')) return 'interested';
  
  return 'member';
}

function parseDizimista(value) {
  if (!value) return { isDonor: false, dizimistaType: 'Não dizimista' };
  const str = value.toString().toLowerCase();
  
  if (str.includes('recorrente') || str.includes('8-12')) {
    return { isDonor: true, dizimistaType: 'Recorrente (8-12)' };
  }
  if (str.includes('sazonal') || str.includes('4-7')) {
    return { isDonor: true, dizimistaType: 'Sazonal (4-7)' };
  }
  if (str.includes('pontual') || str.includes('1-3')) {
    return { isDonor: true, dizimistaType: 'Pontual (1-3)' };
  }
  
  return { isDonor: false, dizimistaType: 'Não dizimista' };
}

function parseOfertante(value) {
  if (!value) return { isOffering: false, ofertanteType: 'Não ofertante' };
  const str = value.toString().toLowerCase();
  
  if (str.includes('recorrente') || str.includes('8-12')) {
    return { isOffering: true, ofertanteType: 'Recorrente (8-12)' };
  }
  if (str.includes('sazonal') || str.includes('4-7')) {
    return { isOffering: true, ofertanteType: 'Sazonal (4-7)' };
  }
  if (str.includes('pontual') || str.includes('1-3')) {
    return { isOffering: true, ofertanteType: 'Pontual (1-3)' };
  }
  
  return { isOffering: false, ofertanteType: 'Não ofertante' };
}

async function limparEImportar() {
  try {
    // 1. LIMPAR DADOS
    console.log('\n🧹 [1/5] Limpando dados do sistema...');
    const clearRes = await request(`${BASE_URL}/api/system/clear-all`, 'POST');
    
    if (clearRes.status === 200) {
      console.log('✅ Dados limpos com sucesso!');
      console.log('   Aguardando 3 segundos...');
      await new Promise(r => setTimeout(r, 3000));
    } else {
      console.error('❌ Erro ao limpar dados:', clearRes.status);
      return;
    }
    
    // 2. LER EXCEL
    console.log('\n📂 [2/5] Lendo arquivo Excel...');
    
    if (!fs.existsSync(EXCEL_FILE)) {
      console.error('❌ Arquivo não encontrado:', EXCEL_FILE);
      return;
    }
    
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    console.log(`✅ ${data.length} linhas lidas`);
    
    // 3. PROCESSAR
    console.log('\n📊 [3/5] Processando dados...');
    
    const usuarios = data.map((row, index) => {
      const dizimistaInfo = parseDizimista(row.Dizimista);
      const ofertanteInfo = parseOfertante(row.Ofertante);
      
      return {
        name: row.Nome || `Usuário ${index + 1}`,
        email: row.Email || `usuario${index}@igreja.com`,
        password: '123456',
        role: getRole(row.Tipo),
        church: row.Igreja || 'Igreja Principal',
        phone: row.Celular,
        birthDate: parseExcelDate(row.Nascimento),
        baptismDate: parseExcelDate(row.Batismo),
        
        // Campos de pontuação
        engajamento: row.Engajamento,
        classificacao: row.Classificação,
        dizimistaType: dizimistaInfo.dizimistaType,
        ofertanteType: ofertanteInfo.ofertanteType,
        isDonor: dizimistaInfo.isDonor,
        isOffering: ofertanteInfo.isOffering,
        tempoBatismoAnos: parseNumber(row['Tempo de batismo - anos']),
        departamentosCargos: row['Departamentos e cargos'],
        nomeUnidade: row['Nome da unidade'],
        temLicao: parseBoolean(row['Tem lição']),
        totalPresenca: parseNumber(row['Total de presença']),
        comunhao: parseNumber(row.Comunhão),
        missao: parseNumber(row.Missão),
        estudoBiblico: parseNumber(row['Estudo bíblico']),
        batizouAlguem: parseBoolean(row['Batizou alguém']),
        discPosBatismal: parseNumber(row['Disc. pós batismal']),
        cpfValido: parseBoolean(row['CPF válido']),
        camposVazios: !parseBoolean(row['CPF válido'])
      };
    });
    
    console.log(`✅ ${usuarios.length} usuários processados`);
    
    // 4. IMPORTAR
    console.log('\n📡 [4/5] Importando usuários...');
    
    const batchSize = 50;
    let totalImportados = 0;
    
    for (let i = 0; i < usuarios.length; i += batchSize) {
      const batch = usuarios.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      console.log(`   Lote ${batchNum}: Enviando ${batch.length} usuários...`);
      
      const response = await request(`${BASE_URL}/api/users/bulk-import`, 'POST', { users: batch });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Resposta:`, JSON.stringify(response.data, null, 2));
      
      if (response.status === 200) {
        totalImportados += response.data.imported || 0;
        console.log(`   ✅ ${response.data.imported || 0} importados`);
        
        if (response.data.errors && response.data.errors.length > 0) {
          console.log(`   ⚠️ Erros: ${response.data.errors.length}`);
          response.data.errors.slice(0, 3).forEach(err => {
            console.log(`      - ${err.error}`);
          });
        }
      } else {
        console.error(`   ❌ Erro HTTP: ${response.status}`);
      }
      
      await new Promise(r => setTimeout(r, 500));
    }
    
    // 5. RECALCULAR
    console.log('\n🔄 [5/5] Recalculando pontos...');
    const recalcRes = await request(`${BASE_URL}/api/system/recalculate-points`, 'POST');
    
    if (recalcRes.status === 200) {
      console.log('✅ Recálculo concluído!');
      console.log(`   Usuários atualizados: ${recalcRes.data.updatedCount || recalcRes.data.updatedUsers}`);
    }
    
    // RESULTADO
    console.log('\n═'.repeat(60));
    console.log('🎉 PROCESSO COMPLETO!');
    console.log('═'.repeat(60));
    console.log(`✅ Importados: ${totalImportados}`);
    console.log(`✅ Pontos calculados: ${recalcRes.data.updatedCount || recalcRes.data.updatedUsers || 0}`);
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }
}

limparEImportar();

