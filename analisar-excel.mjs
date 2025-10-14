// Analisar estrutura do arquivo Excel
import { readFile } from 'fs/promises';
import { read, utils } from 'xlsx';

async function analisarExcel() {
  console.log('📊 ANALISANDO ARQUIVO EXCEL\n');
  console.log('═'.repeat(80));
  
  try {
    // Ler arquivo
    const filePath = '/Users/filipevitolapeixoto/Downloads/data 131025.xlsx';
    const buffer = await readFile(filePath);
    const workbook = read(buffer);
    
    // Pegar primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const data = utils.sheet_to_json(worksheet);
    
    console.log(`📄 Planilha: ${sheetName}`);
    console.log(`📈 Total de linhas: ${data.length}\n`);
    
    // Analisar colunas
    if (data.length > 0) {
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      
      console.log('📋 COLUNAS ENCONTRADAS:\n');
      console.log(`Total de colunas: ${columns.length}\n`);
      
      columns.forEach((col, idx) => {
        const sampleValue = firstRow[col];
        const type = typeof sampleValue;
        const valuePreview = String(sampleValue).substring(0, 40);
        console.log(`${String(idx + 1).padStart(3)}. ${col.padEnd(35)} | Tipo: ${type.padEnd(8)} | Exemplo: ${valuePreview}`);
      });
      
      console.log('\n' + '═'.repeat(80));
      console.log('\n📊 ANÁLISE DE VALORES POR COLUNA:\n');
      
      // Analisar valores únicos em colunas importantes
      const importantColumns = [
        'Engajamento',
        'Classificação',
        'Dizimista',
        'Ofertante',
        'Tipo',
        'Tem lição',
        'Batizou alguém',
        'CPF válido'
      ];
      
      importantColumns.forEach(col => {
        if (columns.includes(col)) {
          const uniqueValues = [...new Set(data.map(row => row[col]).filter(v => v !== null && v !== undefined))];
          console.log(`\n${col}:`);
          console.log(`  Valores únicos: ${uniqueValues.length}`);
          if (uniqueValues.length <= 20) {
            uniqueValues.forEach(v => console.log(`    - ${v}`));
          } else {
            console.log(`  (Muitos valores - primeiros 10):`);
            uniqueValues.slice(0, 10).forEach(v => console.log(`    - ${v}`));
          }
        }
      });
      
      console.log('\n' + '═'.repeat(80));
      console.log('\n📝 AMOSTRA DE 3 LINHAS COMPLETAS:\n');
      
      data.slice(0, 3).forEach((row, idx) => {
        console.log(`\n${idx + 1}. ${row.Nome || row.name || 'Sem nome'}`);
        Object.entries(row).forEach(([key, value]) => {
          const preview = String(value).substring(0, 60);
          console.log(`   ${key}: ${preview}`);
        });
      });
      
      console.log('\n' + '═'.repeat(80));
      console.log('\n🔍 VERIFICAÇÃO DE TIPOS DE DADOS:\n');
      
      // Verificar tipos de datas
      const dateColumns = columns.filter(col => 
        col.toLowerCase().includes('data') || 
        col.toLowerCase().includes('nascimento') ||
        col.toLowerCase().includes('batismo')
      );
      
      console.log('Colunas de data identificadas:');
      dateColumns.forEach(col => {
        const sample = data[0][col];
        console.log(`  ${col}: ${sample} (tipo: ${typeof sample})`);
      });
      
      // Verificar tipos numéricos
      const numericColumns = [
        'Tempo de batismo - anos',
        'Total de presença',
        'Comunhão',
        'Missão',
        'Estudo bíblico',
        'Disc. pós batismal'
      ];
      
      console.log('\nColunas numéricas:');
      numericColumns.forEach(col => {
        if (columns.includes(col)) {
          const sample = data[0][col];
          console.log(`  ${col}: ${sample} (tipo: ${typeof sample})`);
        }
      });
      
    } else {
      console.log('⚠️ Nenhum dado encontrado na planilha');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

analisarExcel();

