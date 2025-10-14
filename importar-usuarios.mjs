// Script para importar usuários do Excel
import XLSX from 'xlsx';
import https from 'https';
import fs from 'fs';

const EXCEL_FILE = '/Users/filipevitolapeixoto/Downloads/data 131025.xlsx';
const API_URL = 'https://7care.netlify.app/api/users/bulk-import';

console.log('📊 IMPORTAÇÃO DE USUÁRIOS DO EXCEL\n');
console.log('═'.repeat(60));

// Função para fazer requisição
function request(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
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
    req.write(JSON.stringify(body));
    req.end();
  });
}

// Funções auxiliares
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
  
  if (str.includes('recorrente') || str.includes('8-12') || str.includes('8 a 12')) {
    return { isDonor: true, dizimistaType: 'Recorrente (8-12)' };
  }
  if (str.includes('sazonal') || str.includes('4-7') || str.includes('4 a 7')) {
    return { isDonor: true, dizimistaType: 'Sazonal (4-7)' };
  }
  if (str.includes('pontual') || str.includes('1-3') || str.includes('1 a 3')) {
    return { isDonor: true, dizimistaType: 'Pontual (1-3)' };
  }
  
  return { isDonor: false, dizimistaType: 'Não dizimista' };
}

function parseOfertante(value) {
  if (!value) return { isOffering: false, ofertanteType: 'Não ofertante' };
  
  const str = value.toString().toLowerCase();
  
  if (str.includes('recorrente') || str.includes('8-12') || str.includes('8 a 12')) {
    return { isOffering: true, ofertanteType: 'Recorrente (8-12)' };
  }
  if (str.includes('sazonal') || str.includes('4-7') || str.includes('4 a 7')) {
    return { isOffering: true, ofertanteType: 'Sazonal (4-7)' };
  }
  if (str.includes('pontual') || str.includes('1-3') || str.includes('1 a 3')) {
    return { isOffering: true, ofertanteType: 'Pontual (1-3)' };
  }
  
  return { isOffering: false, ofertanteType: 'Não ofertante' };
}

async function importarUsuarios() {
  try {
    // 1. Ler arquivo Excel
    console.log('\n📂 [1/4] Lendo arquivo Excel...');
    console.log('   Arquivo:', EXCEL_FILE);
    
    if (!fs.existsSync(EXCEL_FILE)) {
      console.error('❌ Arquivo não encontrado:', EXCEL_FILE);
      return;
    }
    
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Arquivo lido: ${data.length} linhas`);
    console.log(`   Planilha: "${sheetName}"`);
    
    // Mostrar colunas disponíveis
    if (data.length > 0) {
      const colunas = Object.keys(data[0]);
      console.log(`\n📋 Colunas encontradas (${colunas.length}):`);
      colunas.slice(0, 10).forEach((col, i) => {
        console.log(`   ${i+1}. ${col}`);
      });
      if (colunas.length > 10) {
        console.log(`   ... e mais ${colunas.length - 10} colunas`);
      }
    }
    
    // 2. Processar dados
    console.log('\n📊 [2/4] Processando dados...');
    
    const usuarios = data.map((row, index) => {
      const dizimistaInfo = parseDizimista(row.Dizimista || row.dizimista);
      const ofertanteInfo = parseOfertante(row.Ofertante || row.ofertante);
      
      return {
        // Campos básicos
        name: row.Nome || row.nome || `Usuário ${index + 1}`,
        email: row.Email || row.email || `usuario${index}@igreja.com`,
        password: '123456',
        role: getRole(row.Tipo || row.tipo),
        
        // Igreja
        church: row.Igreja || row.igreja || 'Igreja Principal',
        churchCode: row.Código || row.codigo,
        
        // Contato
        phone: row.Celular || row.celular,
        cpf: row.CPF || row.cpf,
        address: row.Endereço || row.endereco,
        
        // Datas
        birthDate: row.Nascimento || row.nascimento,
        baptismDate: row.Batismo || row.batismo,
        
        // Informações pessoais
        civilStatus: row['Estado civil'] || row.estadoCivil,
        occupation: row.Ocupação || row.ocupacao,
        education: row['Grau de educação'] || row.educacao,
        
        // ===== CAMPOS DE PONTUAÇÃO (COLUNAS DIRETAS) =====
        engajamento: row.Engajamento || row.engajamento,
        classificacao: row.Classificação || row.classificacao,
        dizimistaType: dizimistaInfo.dizimistaType,
        ofertanteType: ofertanteInfo.ofertanteType,
        isDonor: dizimistaInfo.isDonor,
        isOffering: ofertanteInfo.isOffering,
        tempoBatismoAnos: parseNumber(row['Tempo de batismo - anos'] || row.tempoBatismoAnos),
        departamentosCargos: row['Departamentos e cargos'] || row.departamentosCargos,
        nomeUnidade: row['Nome da unidade'] || row.nomeUnidade,
        temLicao: parseBoolean(row['Tem lição'] || row.temLicao),
        totalPresenca: parseNumber(row['Total de presença'] || row.totalPresenca),
        comunhao: parseNumber(row.Comunhão || row.comunhao),
        missao: parseNumber(row.Missão || row.missao),
        estudoBiblico: parseNumber(row['Estudo bíblico'] || row.estudoBiblico),
        batizouAlguem: parseBoolean(row['Batizou alguém'] || row.batizouAlguem),
        discPosBatismal: parseNumber(row['Disc. pós batismal'] || row.discPosBatismal),
        cpfValido: parseBoolean(row['CPF válido'] || row.cpfValido),
        camposVazios: !parseBoolean(row['CPF válido'] || row.cpfValido),
        
        // Dados espirituais
        previousReligion: row['Religião anterior'] || row.religiaoAnterior,
        biblicalInstructor: row['Instrutor bíblico'] || row.instrutorBiblico,
        departments: row['Departamentos e cargos'] || row.departamentos
      };
    });
    
    console.log(`✅ ${usuarios.length} usuários processados`);
    
    // Mostrar exemplo
    console.log('\n📋 Exemplo de usuário processado:');
    const exemplo = usuarios[0];
    console.log('   Nome:', exemplo.name);
    console.log('   Email:', exemplo.email);
    console.log('   Igreja:', exemplo.church);
    console.log('   Engajamento:', exemplo.engajamento || 'não definido');
    console.log('   Classificação:', exemplo.classificacao || 'não definido');
    console.log('   Dizimista:', exemplo.dizimistaType);
    
    // 3. Enviar para API em lotes
    console.log('\n📡 [3/4] Enviando para API...');
    console.log('   URL:', API_URL);
    console.log('   Processando em lotes de 50...\n');
    
    const batchSize = 50;
    let totalImportados = 0;
    let totalErros = 0;
    
    for (let i = 0; i < usuarios.length; i += batchSize) {
      const batch = usuarios.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(usuarios.length / batchSize);
      
      console.log(`   Lote ${batchNum}/${totalBatches}: Enviando ${batch.length} usuários...`);
      
      try {
        const response = await request(API_URL, 'POST', { users: batch });
        
        if (response.status === 200) {
          const result = response.data;
          const importados = result.imported || 0;
          totalImportados += importados;
          
          console.log(`   ✅ Lote ${batchNum}: ${importados} usuários importados`);
          
          if (result.errors && result.errors.length > 0) {
            console.log(`   ⚠️ ${result.errors.length} erros neste lote`);
            totalErros += result.errors.length;
          }
        } else {
          console.error(`   ❌ Lote ${batchNum}: Erro HTTP ${response.status}`);
          totalErros += batch.length;
        }
        
        // Aguardar 1 segundo entre lotes
        if (i + batchSize < usuarios.length) {
          await new Promise(r => setTimeout(r, 1000));
        }
        
      } catch (error) {
        console.error(`   ❌ Lote ${batchNum}: Erro -`, error.message);
        totalErros += batch.length;
      }
    }
    
    // 4. Resultado final
    console.log('\n═'.repeat(60));
    console.log('🎉 IMPORTAÇÃO CONCLUÍDA!');
    console.log('═'.repeat(60));
    console.log(`📊 Total processado: ${usuarios.length}`);
    console.log(`✅ Importados com sucesso: ${totalImportados}`);
    console.log(`❌ Erros: ${totalErros}`);
    console.log('═'.repeat(60));
    
    if (totalImportados > 100) {
      console.log('\n✅✅✅ IMPORTAÇÃO BEM-SUCEDIDA! ✅✅✅');
      console.log(`\n${totalImportados} usuários foram importados para o sistema!`);
      console.log('\n📋 Próximo passo:');
      console.log('   Recalcule os pontos dos usuários em:');
      console.log('   https://7care.netlify.app/settings');
      console.log('   Aba "Base de Cálculo" → Botão "Salvar"');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error);
  }
}

// Executar
importarUsuarios();

