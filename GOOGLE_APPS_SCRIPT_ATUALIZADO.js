/**
 * Google Apps Script ATUALIZADO para adicionar eventos automaticamente
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://script.google.com
 * 2. Abra seu projeto existente
 * 3. Cole este código ATUALIZADO (substitua todo o código anterior)
 * 4. Salve e implante novamente
 * 
 * Este código corrige o problema das datas NaN/NaN/NaN
 */

// SUBSTITUA PELO ID DA SUA PLANILHA
const SPREADSHEET_ID = '1i-x-0KiciwACRztoKX-YHlXT4FsrAzaKwuH-hHkD8go';
const SHEET_NAME = 'Agenda';

/**
 * Função para adicionar evento à planilha
 */
function addEvent(eventData) {
  try {
    console.log('📝 Adicionando evento:', eventData.title);
    
    // Abrir planilha
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { success: false, message: 'Aba "Agenda" não encontrada' };
    }
    
    // Função para formatar data de forma segura
    function formatarData(dataInput) {
      console.log('📅 Formatando data:', dataInput);
      
      if (!dataInput) {
        console.log('⚠️ Data vazia, usando data atual');
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        const resultado = `${dia}/${mes}/${ano}`;
        console.log('✅ Data formatada (atual):', resultado);
        return resultado;
      }
      
      // Tentar diferentes formatos de data
      let data;
      
      // Se já está no formato DD/MM/YYYY, retornar como está
      if (typeof dataInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dataInput)) {
        console.log('✅ Data já formatada:', dataInput);
        return dataInput;
      }
      
      // Tentar criar objeto Date
      data = new Date(dataInput);
      console.log('📅 Data criada:', data);
      
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        console.log('❌ Data inválida, usando data atual');
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        const resultado = `${dia}/${mes}/${ano}`;
        console.log('✅ Data formatada (fallback):', resultado);
        return resultado;
      }
      
      // Data válida, formatar normalmente
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const resultado = `${dia}/${mes}/${ano}`;
      console.log('✅ Data formatada:', resultado);
      return resultado;
    }
    
    // Preparar dados para adicionar
    const rowData = [
      eventData.title || '',           // Título do Evento
      formatarData(eventData.date),    // Data Início
      formatarData(eventData.date),    // Data Fim (mesma data)
      eventData.type || '',            // Categoria
      eventData.description || ''      // Descrição
    ];
    
    // Adicionar linha à planilha
    sheet.appendRow(rowData);
    
    console.log('✅ Evento adicionado com sucesso');
    return {
      success: true,
      message: 'Evento adicionado com sucesso',
      rowNumber: sheet.getLastRow()
    };
    
  } catch (error) {
    console.error('❌ Erro ao adicionar evento:', error);
    return { success: false, message: 'Erro: ' + error.message };
  }
}

/**
 * Função para adicionar múltiplos eventos
 */
function addMultipleEvents(events) {
  try {
    const results = [];
    let successCount = 0;
    
    for (const event of events) {
      const result = addEvent(event);
      results.push(result);
      if (result.success) {
        successCount++;
      }
    }
    
    return {
      success: successCount > 0,
      message: `${successCount} de ${events.length} eventos adicionados`,
      addedCount: successCount,
      totalEvents: events.length,
      results: results
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Erro: ${error.message}`
    };
  }
}

/**
 * Função para lidar com requisições HTTP POST
 */
function doPost(e) {
  try {
    // Configurar CORS
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
    
    // Verificar se há dados
    if (!e.postData) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'Nenhum dado recebido'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse dos dados
    const data = JSON.parse(e.postData.contents);
    console.log('📥 Dados recebidos:', data);
    
    let result;
    if (data.events && Array.isArray(data.events)) {
      // Múltiplos eventos
      result = addMultipleEvents(data.events);
    } else {
      // Evento único
      result = addEvent(data);
    }
    
    console.log('📤 Resultado:', result);
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ Erro no doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Erro no servidor: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para lidar com requisições HTTP GET
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Apps Script funcionando',
      timestamp: new Date().toISOString(),
      spreadsheetId: SPREADSHEET_ID,
      sheetName: SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Função de teste para verificar se está funcionando
 */
function testeCompleto() {
  console.log('🧪 Iniciando teste completo...');
  
  try {
    // Teste 1: Verificar acesso à planilha
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('❌ ERRO: Aba "Agenda" não encontrada');
      return { success: false, message: 'Aba não encontrada' };
    }
    
    console.log('✅ Teste 1: Acesso à planilha OK');
    
    // Teste 2: Adicionar evento de teste
    const eventoTeste = {
      title: 'TESTE FINAL - ' + new Date().toLocaleString(),
      date: new Date().toISOString(),
      type: 'teste',
      description: 'Teste de formatação de data corrigido'
    };
    
    const resultado = addEvent(eventoTeste);
    
    if (resultado.success) {
      console.log('✅ Teste 2: Evento adicionado com sucesso');
      console.log('✅ RESULTADO FINAL: TUDO FUNCIONANDO');
      return { success: true, message: 'Todos os testes passaram' };
    } else {
      console.log('❌ ERRO NO TESTE:', resultado.message);
      return resultado;
    }
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    return { success: false, message: 'Erro: ' + error.message };
  }
}
