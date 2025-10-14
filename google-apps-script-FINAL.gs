/**
 * Google Apps Script para adicionar eventos automaticamente
 * Sistema Church Plus - Integração Google Sheets
 */

// SUBSTITUA PELO ID DA SUA PLANILHA
const SPREADSHEET_ID = '1i-x-0KiciwACRztoKX-YHlXT4FsrAzaKwuH-hHkD8go';
const SHEET_NAME = 'Agenda';
const TASKS_SHEET_NAME = 'tarefas';

/**
 * 🔧 PREENCHER IDs VAZIOS - Gera IDs simples para todos os eventos sem ID
 * Execute esta função uma vez para corrigir a planilha
 */
function preencherIDsVazios() {
  try {
    console.log('🔧 PREENCHENDO IDs VAZIOS...\n');
    console.log('═'.repeat(60));
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('❌ Aba "Agenda" não encontrada');
      return { success: false, message: 'Aba não encontrada' };
    }
    
    const lastRow = sheet.getLastRow();
    console.log(`✅ Planilha encontrada: ${lastRow - 1} eventos`);
    
    let preenchidos = 0;
    
    // Percorrer todas as linhas (pular cabeçalho)
    for (let i = 2; i <= lastRow; i++) {
      const idCell = sheet.getRange(i, 1); // Coluna A (ID)
      const idValue = idCell.getValue();
      
      if (!idValue || idValue.toString().trim() === '') {
        // ID vazio - gerar um novo
        const newId = Date.now() + i; // Timestamp + número da linha
        idCell.setValue(newId);
        console.log(`   ${i-1}. ID preenchido: ${newId}`);
        preenchidos++;
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`\n✅ CONCLUÍDO!`);
    console.log(`   Total de IDs preenchidos: ${preenchidos}`);
    console.log(`   Total de eventos: ${lastRow - 1}`);
    
    return {
      success: true,
      totalEventos: lastRow - 1,
      idsPreenchidos: preenchidos
    };
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 DIAGNÓSTICO - Verificar planilha e eventos
 * Execute esta função no Google Apps Script para diagnosticar problemas
 */
function diagnosticarAgenda() {
  try {
    console.log('🔍 DIAGNÓSTICO DA PLANILHA AGENDA...\n');
    console.log('═'.repeat(60));
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('✅ Planilha principal:', spreadsheet.getName());
    console.log('   ID:', SPREADSHEET_ID);
    
    // Verificar aba Agenda
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('\n❌ ABA "Agenda" NÃO EXISTE!');
      console.log('\nAbas disponíveis:');
      spreadsheet.getSheets().forEach((s, i) => {
        console.log(`   ${i + 1}. "${s.getName()}" (${s.getLastRow()} linhas)`);
      });
      return { success: false, message: 'Aba Agenda não encontrada' };
    }
    
    console.log('\n✅ Aba "Agenda" encontrada');
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    console.log(`   Linhas: ${lastRow}`);
    console.log(`   Colunas: ${lastCol}`);
    
    if (lastRow < 2) {
      console.log('\n⚠️ PLANILHA VAZIA (sem eventos)');
      return { success: false, message: 'Planilha sem dados' };
    }
    
    // Ler cabeçalhos
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    console.log('\n📋 Cabeçalhos:', headers.join(' | '));
    
    // Contar eventos
    const totalEventos = lastRow - 1;
    console.log(`\n📊 Total de eventos: ${totalEventos}`);
    
    // Mostrar primeiros 5 eventos
    console.log('\n📋 Primeiros 5 eventos:\n');
    for (let i = 2; i <= Math.min(6, lastRow); i++) {
      const row = sheet.getRange(i, 1, 1, lastCol).getValues()[0];
      console.log(`${i-1}. [ID: ${row[0]}] ${row[1]}`);
      console.log(`   Data: ${row[2]} até ${row[3]}`);
      console.log(`   Categoria: ${row[4]}`);
    }
    
    // Testar função getAllEvents
    console.log('\n\n🧪 TESTANDO getAllEvents()...\n');
    const events = getAllEvents(sheet);
    console.log(`✅ getAllEvents() retornou ${events.length} eventos`);
    
    if (events.length > 0) {
      console.log('\nPrimeiro evento retornado:');
      console.log(JSON.stringify(events[0], null, 2));
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
    console.log(`   Total de eventos na planilha: ${totalEventos}`);
    console.log(`   getAllEvents() retorna: ${events.length}`);
    
    return {
      success: true,
      totalLinhas: lastRow,
      totalEventos: totalEventos,
      getAllEventsCount: events.length
    };
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Função para configurar a planilha (execute uma vez)
 */
function configurarPlanilha() {
  try {
    console.log('🔧 Configurando planilha...');
    
    // Abrir planilha
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('❌ Aba "Agenda" não encontrada');
      return { success: false, message: 'Aba não encontrada' };
    }
    
    // Verificar se já tem cabeçalhos
    const firstRow = sheet.getRange(1, 1, 1, 5).getValues()[0];
    const hasHeaders = firstRow[0] && firstRow[0].toString().trim() !== '';
    
    if (hasHeaders) {
      console.log('✅ Cabeçalhos já existem');
      return { success: true, message: 'Planilha já configurada' };
    }
    
    // Configurar cabeçalhos corretos
    const headers = ['Título do Evento', 'Data Início', 'Data Fim', 'Categoria', 'Descrição'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatar cabeçalhos
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    // Ajustar largura das colunas
    sheet.autoResizeColumns(1, headers.length);
    
    console.log('✅ Planilha configurada com sucesso!');
    return { success: true, message: 'Planilha configurada' };
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return { success: false, message: 'Erro: ' + error.message };
  }
}

/**
 * 🧹 FUNÇÃO AUXILIAR - Limpar todos os eventos da planilha (mantém apenas cabeçalho)
 */
function limparEventosTeste() {
  try {
    console.log('🧹 LIMPANDO EVENTOS DE TESTE...');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('⚠️ Aba "Agenda" não existe');
      return { success: false, message: 'Aba não encontrada' };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      // Deletar todas as linhas exceto o cabeçalho
      sheet.deleteRows(2, lastRow - 1);
      console.log(`✅ ${lastRow - 1} eventos removidos`);
    } else {
      console.log('✅ Planilha já está vazia');
    }
    
    return {
      success: true,
      message: 'Eventos limpos com sucesso',
      removedCount: lastRow - 1
    };
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🧪 FUNÇÃO DE TESTE COMPLETA - Adiciona um evento de cada categoria
 * Execute esta função para popular a planilha com eventos de teste de MÚLTIPLOS DIAS
 */
function testarTodasCategorias() {
  try {
    console.log('🧪 TESTANDO TODAS AS CATEGORIAS (EVENTOS DE MÚLTIPLOS DIAS)...');
    console.log('═'.repeat(60));
    
    // Abrir planilha
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('✅ Planilha aberta: ' + spreadsheet.getName());
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Criar aba se não existir
    if (!sheet) {
      console.log('📝 Criando aba "Agenda"...');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    } else {
      // Limpar eventos existentes
      console.log('🧹 Limpando eventos existentes...');
      const result = limparEventosTeste();
      if (result.success && result.removedCount > 0) {
        console.log(`✅ ${result.removedCount} eventos removidos`);
      }
    }
    
    // SEMPRE recriar cabeçalhos corretos (limpar primeira linha)
    console.log('📋 Configurando cabeçalhos...');
    sheet.getRange(1, 1, 1, 7).setValues([
      ['ID', 'Título', 'Data Início', 'Data Fim', 'Categoria', 'Descrição', 'Local']
    ]);
    
    // Formatar cabeçalhos
    const headerRange = sheet.getRange(1, 1, 1, 7);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    headerRange.setHorizontalAlignment('center');
    
    // Ajustar larguras
    sheet.setColumnWidth(1, 80);   // ID
    sheet.setColumnWidth(2, 250);  // Título
    sheet.setColumnWidth(3, 110);  // Data Início
    sheet.setColumnWidth(4, 110);  // Data Fim
    sheet.setColumnWidth(5, 150);  // Categoria
    sheet.setColumnWidth(6, 300);  // Descrição
    sheet.setColumnWidth(7, 150);  // Local
    
    console.log('✅ Cabeçalhos configurados');
    
    // Categorias do Calendar (mesmas do app)
    const categorias = [
      { id: 'igreja-local', nome: 'Igreja Local', local: 'Templo Central' },
      { id: 'asr-geral', nome: 'ASR Geral', local: 'Sede ASR' },
      { id: 'asr-administrativo', nome: 'ASR Administrativo', local: 'Escritório ASR' },
      { id: 'asr-pastores', nome: 'ASR Pastores', local: 'Sala de Reuniões' },
      { id: 'visitas', nome: 'Visitas', local: 'A definir' },
      { id: 'reunioes', nome: 'Reuniões', local: 'Sala de Reuniões' },
      { id: 'pregacoes', nome: 'Pregações', local: 'Púlpito' }
    ];
    
    const hoje = new Date();
    let eventosAdicionados = 0;
    
    // Adicionar um evento de cada categoria
    categorias.forEach((cat, index) => {
      const dataInicio = new Date(hoje);
      dataInicio.setDate(hoje.getDate() + (index * 3)); // Eventos espaçados de 3 em 3 dias
      
      const dataFim = new Date(dataInicio);
      dataFim.setDate(dataInicio.getDate() + 2); // Cada evento dura 3 dias
      
      const id = Date.now() + index;
      
      sheet.appendRow([
        id,
        'Teste ' + cat.nome,
        dataInicio.toLocaleDateString('pt-BR'),
        dataFim.toLocaleDateString('pt-BR'), // Data de fim diferente!
        cat.id,
        'Evento de teste para categoria ' + cat.nome + ' (3 dias)',
        cat.local
      ]);
      
      eventosAdicionados++;
      console.log(`✅ ${eventosAdicionados}. ${cat.nome} (${cat.id}) - ${dataInicio.toLocaleDateString('pt-BR')} até ${dataFim.toLocaleDateString('pt-BR')}`);
    });
    
    console.log('═'.repeat(60));
    console.log(`🎉 TESTE CONCLUÍDO! ${eventosAdicionados} eventos adicionados`);
    console.log('📊 Total de linhas na planilha:', sheet.getLastRow());
    console.log('═'.repeat(60));
    
    return {
      success: true,
      message: `${eventosAdicionados} eventos de teste adicionados`,
      categorias: categorias.map(c => c.nome),
      totalLinhas: sheet.getLastRow()
    };
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 🧪 FUNÇÃO DE TESTE SIMPLES - Adiciona um evento
 */
function testarAdicionarEvento() {
  try {
    console.log('🧪 TESTE SIMPLES - Adicionando 1 evento...');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, 7).setValues([
        ['ID', 'Título', 'Data Início', 'Data Fim', 'Categoria', 'Descrição', 'Local']
      ]);
    }
    
    const agora = new Date();
    const id = agora.getTime();
    
    sheet.appendRow([
      id,
      'Teste Manual - ' + agora.toLocaleTimeString('pt-BR'),
      agora.toLocaleDateString('pt-BR'),
      agora.toLocaleDateString('pt-BR'),
      'reunioes',
      'Evento de teste criado manualmente',
      'Local Teste'
    ]);
    
    console.log('✅ Evento adicionado na linha:', sheet.getLastRow());
    
    return {
      success: true,
      id: id,
      linha: sheet.getLastRow()
    };
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Função principal para adicionar evento (DESCONTINUADA - usar handleAddEvent)
 * Mantida apenas para compatibilidade com código antigo
 * 
 * ⚠️ NÃO EXECUTE ESTA FUNÇÃO DIRETAMENTE!
 * Para testar, use a função testarAdicionarEvento() acima
 */
function adicionarEvento(dadosEvento) {
  console.log('⚠️ adicionarEvento chamada diretamente - isto não deve acontecer!');
  console.log('💡 Use testarAdicionarEvento() para testar ou faça requisição HTTP POST');
  
  if (!dadosEvento) {
    console.error('❌ Sem argumentos! Use testarAdicionarEvento() para testar.');
    return { 
      success: false, 
      message: 'Esta função não deve ser executada diretamente. Use testarAdicionarEvento() ou faça requisição HTTP POST com action: addEvent'
    };
  }
  
  // Se tiver argumentos, processar normalmente
  return handleAddEvent(dadosEvento);
}

// ===== FUNÇÕES AUXILIARES PARA EVENTOS =====

/**
 * Função para obter ou criar aba de eventos
 */
function getOrCreateEventsSheet(spreadsheetId, sheetName) {
  try {
    console.log(`📋 getOrCreateEventsSheet: ${spreadsheetId} / ${sheetName}`);
    
    if (!spreadsheetId) {
      console.error('❌ spreadsheetId é obrigatório!');
      return null;
    }
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log(`✅ Planilha aberta: ${spreadsheet.getName()}`);
    
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      console.log(`📝 Aba "${sheetName}" não existe, criando...`);
      sheet = spreadsheet.insertSheet(sheetName);
      
      // Criar cabeçalhos para eventos
      sheet.getRange(1, 1, 1, 7).setValues([
        ['ID', 'Título', 'Data Início', 'Data Fim', 'Categoria', 'Descrição', 'Local']
      ]);
      
      // Formatar cabeçalhos
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 7).setBackground('#4285f4');
      sheet.getRange(1, 1, 1, 7).setFontColor('white');
      
      // Ajustar largura das colunas
      sheet.autoResizeColumns(1, 7);
      
      console.log(`✅ Aba "${sheetName}" criada com cabeçalhos`);
    } else {
      console.log(`✅ Aba "${sheetName}" já existe`);
    }
    
    return sheet;
  } catch (error) {
    console.error('❌ Erro em getOrCreateEventsSheet:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

/**
 * Função auxiliar para formatar data no formato brasileiro (DD/MM/YYYY)
 */
function formatarDataBrasileira(dataStr) {
  try {
    if (!dataStr) return '';
    
    let data;
    
    // Se já for uma data do tipo Date
    if (dataStr instanceof Date) {
      data = dataStr;
    } 
    // Se for string ISO (2025-10-16T00:00:00.000Z ou 2025-10-16)
    else if (typeof dataStr === 'string') {
      data = new Date(dataStr);
    } 
    // Outros casos
    else {
      return dataStr.toString();
    }
    
    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      console.warn('⚠️ Data inválida:', dataStr);
      return dataStr.toString();
    }
    
    // Formatar no padrão brasileiro DD/MM/YYYY
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    
    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error('❌ Erro ao formatar data:', error.message);
    return dataStr ? dataStr.toString() : '';
  }
}

/**
 * Função para adicionar evento à planilha
 */
function addEventToSheet(sheet, eventData) {
  try {
    // Validar sheet
    if (!sheet) {
      console.error('❌ addEventToSheet: sheet é null ou undefined');
      throw new Error('Sheet não fornecida');
    }
    
    // Validar eventData
    if (!eventData) {
      console.error('❌ addEventToSheet: eventData é null ou undefined');
      throw new Error('EventData não fornecido');
    }
    
    console.log(`📝 Adicionando evento: ${eventData.titulo || 'Sem título'}`);
    
    // Formatar as datas para o padrão brasileiro
    const dataInicioFormatada = formatarDataBrasileira(eventData.data_inicio);
    const dataFimFormatada = formatarDataBrasileira(eventData.data_fim);
    
    console.log(`📅 Data início: ${eventData.data_inicio} → ${dataInicioFormatada}`);
    console.log(`📅 Data fim: ${eventData.data_fim} → ${dataFimFormatada}`);
    
    sheet.appendRow([
      eventData.id || '',
      eventData.titulo || '',
      dataInicioFormatada,
      dataFimFormatada,
      eventData.categoria || '',
      eventData.descricao || '',
      eventData.local || ''
    ]);
    
    console.log(`✅ Evento adicionado na linha ${sheet.getLastRow()}`);
    
    return eventData.id;
  } catch (error) {
    console.error('❌ Erro em addEventToSheet:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Função para obter todos os eventos
 */
function getAllEvents(sheet) {
  try {
    // Validar se sheet existe
    if (!sheet) {
      console.error('❌ getAllEvents: sheet é null ou undefined');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const events = [];
    
    // Pular cabeçalho
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Verificar se tem pelo menos título (coluna 1)
      if (row[1] && row[1].toString().trim() !== '') {
        // Gerar ID se não existir (usar linha como ID)
        const eventId = row[0] || (i + 1000); // Se não tem ID, usar número da linha + 1000
        
        // Formatar datas para o padrão brasileiro ao retornar
        const dataInicioFormatada = formatarDataBrasileira(row[2]);
        const dataFimFormatada = formatarDataBrasileira(row[3]);
        
        events.push({
          id: eventId,
          titulo: row[1],
          data_inicio: dataInicioFormatada,
          data_fim: dataFimFormatada,
          categoria: row[4],
          descricao: row[5] || '',
          local: row[6] || ''
        });
      }
    }
    
    console.log(`📊 getAllEvents: ${events.length} eventos processados de ${data.length - 1} linhas`);
    
    return events;
  } catch (error) {
    console.error('❌ Erro em getAllEvents:', error.message);
    console.error('Stack:', error.stack);
    return [];
  }
}

/**
 * Função para deletar evento específico por ID
 */
function deleteEventFromSheet(spreadsheetId, sheetName, eventId) {
  try {
    console.log('🗑️ Deletando evento ID:', eventId);
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return { 
        success: false, 
        error: 'Planilha não encontrada: ' + sheetName 
      };
    }
    
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(1, 1, lastRow, 1).getValues(); // Coluna A (IDs)
    
    // Procurar a linha com o ID do evento
    let rowToDelete = -1;
    for (let i = 0; i < data.length; i++) {
      const cellValue = data[i][0];
      if (String(cellValue) === String(eventId)) {
        rowToDelete = i + 1;
        break;
      }
    }
    
    if (rowToDelete > 0) {
      sheet.deleteRow(rowToDelete);
      console.log('✅ Evento deletado na linha:', rowToDelete);
      return {
        success: true,
        message: 'Evento deletado com sucesso',
        eventId: eventId,
        linha: rowToDelete
      };
    } else {
      console.log('⚠️ Evento não encontrado:', eventId);
      return {
        success: false,
        error: 'Evento não encontrado no Google Sheets',
        eventId: eventId
      };
    }
    
  } catch (error) {
    console.error('❌ Erro ao deletar evento:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Função para limpar TODOS os eventos da planilha
 */
function clearAllEventsFromSheet(spreadsheetId, sheetName) {
  try {
    console.log('🗑️ Limpando TODOS os eventos...');
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return { 
        success: false, 
        error: 'Planilha não encontrada: ' + sheetName 
      };
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
      console.log('✅ Deletadas', lastRow - 1, 'linhas');
      return {
        success: true,
        message: 'Todos os eventos foram limpos',
        linhasDeletadas: lastRow - 1
      };
    } else {
      console.log('ℹ️ Nenhum evento para deletar');
      return {
        success: true,
        message: 'Nenhum evento para deletar',
        linhasDeletadas: 0
      };
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar eventos:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

// ===== HANDLERS PARA EVENTOS =====

/**
 * Handler para adicionar evento (compatível com múltiplos formatos)
 */
function handleAddEvent(data) {
  try {
    console.log('📥 handleAddEvent - type of data:', typeof data);
    console.log('📥 handleAddEvent - data:', data ? JSON.stringify(data) : 'NULL/UNDEFINED');
    
    // Validar se data existe
    if (!data) {
      throw new Error('Dados não fornecidos (data é null ou undefined)');
    }
    
    // Tentar extrair eventData ou usar data diretamente
    let eventData = (typeof data === 'object' && data.eventData) ? data.eventData : data;
    
    console.log('🔍 eventData extraído:', eventData ? JSON.stringify(eventData) : 'NULL/UNDEFINED');
    
    // Normalizar dados (aceitar vários formatos)
    const normalizado = {
      id: (eventData && eventData.id) || '',
      titulo: (eventData && (eventData.titulo || eventData.title)) || 'Sem título',
      data_inicio: (eventData && (eventData.data_inicio || eventData.date || eventData.startDate)) || new Date().toISOString(),
      data_fim: (eventData && (eventData.data_fim || eventData.end_date || eventData.endDate)) || new Date().toISOString(),
      categoria: (eventData && (eventData.categoria || eventData.type || eventData.category)) || 'igreja-local',
      descricao: (eventData && (eventData.descricao || eventData.description)) || '',
      local: (eventData && (eventData.local || eventData.location)) || ''
    };
    
    console.log('✅ Dados normalizados:', JSON.stringify(normalizado));
    
    // Obter spreadsheetId e sheetName de forma segura
    const sid = (data && data.spreadsheetId) || SPREADSHEET_ID;
    const sname = (data && data.sheetName) || SHEET_NAME;
    
    // Obter ou criar sheet
    const sheet = getOrCreateEventsSheet(sid, sname);
    
    if (!sheet) {
      throw new Error('Não foi possível obter/criar a planilha');
    }
    
    // Adicionar evento
    const eventId = addEventToSheet(sheet, normalizado);
    
    console.log('✅ Evento adicionado com ID:', eventId);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Evento adicionado com sucesso',
      eventId: eventId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ ERRO COMPLETO em handleAddEvent:', error.message);
    console.error('Stack trace:', error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message || error.toString(),
      details: 'Erro ao processar dados do evento'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler para obter eventos
 */
function handleGetEvents(data) {
  try {
    console.log('📊 handleGetEvents - dados recebidos:', JSON.stringify(data));
    
    const { spreadsheetId, sheetName } = data || {};
    const sid = spreadsheetId || SPREADSHEET_ID;
    const sname = sheetName || SHEET_NAME;
    
    console.log(`📋 Buscando planilha: ${sid} / ${sname}`);
    
    const sheet = getOrCreateEventsSheet(sid, sname);
    
    if (!sheet) {
      console.error('❌ Sheet retornou null/undefined');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Erro: Não foi possível obter a planilha'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('✅ Sheet obtida, chamando getAllEvents...');
    const events = getAllEvents(sheet);
    
    console.log(`✅ Retornando ${events.length} eventos`);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      events: events,
      total: events.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ Erro em handleGetEvents:', error.message);
    console.error('Stack:', error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao obter eventos: ' + error.toString(),
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler para deletar evento específico
 */
function handleDeleteEvent(data) {
  try {
    console.log('🗑️ handleDeleteEvent - dados recebidos:', JSON.stringify(data));
    
    const { spreadsheetId, sheetName, eventId } = data;
    
    if (!eventId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'eventId é obrigatório'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const result = deleteEventFromSheet(spreadsheetId || SPREADSHEET_ID, sheetName || SHEET_NAME, eventId);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ Erro em handleDeleteEvent:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Erro ao deletar evento: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler para limpar todos os eventos
 */
function handleClearAllEvents(data) {
  try {
    console.log('🗑️ handleClearAllEvents - dados recebidos:', JSON.stringify(data));
    
    const { spreadsheetId, sheetName } = data;
    
    const result = clearAllEventsFromSheet(spreadsheetId || SPREADSHEET_ID, sheetName || SHEET_NAME);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ Erro em handleClearAllEvents:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Erro ao limpar eventos: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== FUNÇÕES PARA TAREFAS =====

/**
 * Função para obter ou criar aba de tarefas
 */
function getOrCreateTasksSheet(spreadsheetId, sheetName) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Criar cabeçalhos
    sheet.getRange(1, 1, 1, 11).setValues([
      ['ID', 'Título', 'Descrição', 'Status', 'Prioridade', 'Responsável', 'Criador', 'Data Criação', 'Data Vencimento', 'Data Conclusão', 'Tags']
    ]);
    
    // Formatar cabeçalhos
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 11).setBackground('#f0f0f0');
    
    // Ajustar largura das colunas
    sheet.autoResizeColumns(1, 11);
  }
  
  return sheet;
}

/**
 * Função para adicionar tarefa à planilha
 */
function addTaskToSheet(sheet, taskData) {
  sheet.appendRow([
    taskData.id || '',
    taskData.titulo || '',
    taskData.descricao || '',
    taskData.status || 'Pendente',
    taskData.prioridade || 'Média',
    taskData.responsavel || 'Não atribuída',
    taskData.criador || 'Sistema',
    taskData.data_criacao || new Date().toLocaleDateString('pt-BR'),
    taskData.data_vencimento || 'Sem prazo',
    taskData.data_conclusao || '',
    taskData.tags || ''
  ]);
  
  return taskData.id;
}

/**
 * Função para obter todas as tarefas
 */
function getAllTasks(sheet) {
  const data = sheet.getDataRange().getValues();
  const tasks = [];
  
  // Pular cabeçalho
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // Se tem ID
      tasks.push({
        id: row[0],
        titulo: row[1],
        descricao: row[2],
        status: row[3],
        prioridade: row[4],
        responsavel: row[5],
        criador: row[6],
        data_criacao: row[7],
        data_vencimento: row[8],
        data_conclusao: row[9],
        tags: row[10]
      });
    }
  }
  
  return tasks;
}

/**
 * Função para atualizar tarefa na planilha
 */
function updateTaskInSheet(sheet, taskId, taskData) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[0]) === String(taskId)) {
      // Atualizar linha
      sheet.getRange(i + 1, 1, 1, 11).setValues([[
        taskId,
        taskData.titulo || row[1],
        taskData.descricao || row[2],
        taskData.status || row[3],
        taskData.prioridade || row[4],
        taskData.responsavel || row[5],
        taskData.criador || row[6],
        taskData.data_criacao || row[7],
        taskData.data_vencimento || row[8],
        taskData.data_conclusao || row[9],
        taskData.tags || row[10]
      ]]);
      return true;
    }
  }
  return false;
}

/**
 * 🆕 NOVA FUNÇÃO: Deletar uma tarefa específica por ID
 */
function deleteTaskFromSheet(spreadsheetId, sheetName, taskId) {
  try {
    console.log('🗑️ Deletando tarefa ID:', taskId);
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return { 
        success: false, 
        error: 'Planilha não encontrada: ' + sheetName 
      };
    }
    
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(1, 1, lastRow, 1).getValues(); // Coluna A (IDs)
    
    // Procurar a linha com o ID da tarefa
    let rowToDelete = -1;
    for (let i = 0; i < data.length; i++) {
      const cellValue = data[i][0];
      // Converter ambos para string para comparação
      if (String(cellValue) === String(taskId)) {
        rowToDelete = i + 1; // +1 porque array é 0-based, mas sheet é 1-based
        break;
      }
    }
    
    if (rowToDelete > 0) {
      sheet.deleteRow(rowToDelete);
      console.log('✅ Tarefa deletada na linha:', rowToDelete);
      return {
        success: true,
        message: 'Tarefa deletada com sucesso',
        taskId: taskId,
        linha: rowToDelete
      };
    } else {
      console.log('⚠️ Tarefa não encontrada:', taskId);
      return {
        success: false,
        error: 'Tarefa não encontrada no Google Sheets',
        taskId: taskId
      };
    }
    
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * 🆕 NOVA FUNÇÃO: Limpar TODAS as tarefas da planilha
 */
function clearAllTasksFromSheet(spreadsheetId, sheetName) {
  try {
    console.log('🗑️ Limpando TODAS as tarefas...');
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return { 
        success: false, 
        error: 'Planilha não encontrada: ' + sheetName 
      };
    }
    
    const lastRow = sheet.getLastRow();
    
    // Se tiver mais de 1 linha (cabeçalho ou dados), deletar tudo exceto cabeçalho
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
      console.log('✅ Deletadas', lastRow - 1, 'linhas');
      return {
        success: true,
        message: 'Todas as tarefas foram limpas',
        linhasDeletadas: lastRow - 1
      };
    } else {
      console.log('ℹ️ Nenhuma tarefa para deletar');
      return {
        success: true,
        message: 'Nenhuma tarefa para deletar',
        linhasDeletadas: 0
      };
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar tarefas:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

// ===== HANDLERS PARA TAREFAS =====

/**
 * Handler para adicionar tarefa
 */
function handleAddTask(data) {
  try {
    const { spreadsheetId, sheetName, taskData } = data;
    
    if (!spreadsheetId || !taskData) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = getOrCreateTasksSheet(spreadsheetId, sheetName || TASKS_SHEET_NAME);
    const taskId = addTaskToSheet(sheet, taskData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Tarefa adicionada com sucesso',
      taskId: taskId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao adicionar tarefa: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler para obter tarefas
 */
function handleGetTasks(data) {
  try {
    const { spreadsheetId, sheetName } = data;
    
    if (!spreadsheetId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'ID da planilha não fornecido'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = getOrCreateTasksSheet(spreadsheetId, sheetName || TASKS_SHEET_NAME);
    const tasks = getAllTasks(sheet);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tasks: tasks,
      total: tasks.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao obter tarefas: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler para atualizar tarefa
 */
function handleUpdateTask(data) {
  try {
    const { spreadsheetId, sheetName, taskId, taskData } = data;
    
    if (!spreadsheetId || !taskId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = getOrCreateTasksSheet(spreadsheetId, sheetName || TASKS_SHEET_NAME);
    const updated = updateTaskInSheet(sheet, taskId, taskData);
    
    if (updated) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Tarefa atualizada com sucesso'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Tarefa não encontrada'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Erro ao atualizar tarefa: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 🆕 NOVO HANDLER: Deletar tarefa específica
 */
function handleDeleteTask(data) {
  try {
    const { spreadsheetId, sheetName, taskId } = data;
    
    if (!spreadsheetId || !taskId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'spreadsheetId e taskId são obrigatórios'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const result = deleteTaskFromSheet(spreadsheetId, sheetName || TASKS_SHEET_NAME, taskId);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Erro ao deletar tarefa: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 🆕 NOVO HANDLER: Limpar todas as tarefas
 */
function handleClearAllTasks(data) {
  try {
    const { spreadsheetId, sheetName } = data;
    
    if (!spreadsheetId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'spreadsheetId é obrigatório'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const result = clearAllTasksFromSheet(spreadsheetId, sheetName || TASKS_SHEET_NAME);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Erro ao limpar tarefas: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para receber dados via HTTP POST
 */
function doPost(e) {
  try {
    console.log('📨 Recebendo dados...');
    
    // Verificar se há dados
    if (!e.postData) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'Nenhum dado recebido'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Converter dados
    const dados = JSON.parse(e.postData.contents);
    console.log('📋 Dados recebidos:', dados);
    
    // Verificar ação
    switch (dados.action) {
      // ===== EVENTOS =====
      case 'addEvent':
        return handleAddEvent(dados);
        
      case 'getEvents':
        return handleGetEvents(dados);
        
      case 'deleteEvent':
        return handleDeleteEvent(dados);
        
      case 'clearAllEvents':
        return handleClearAllEvents(dados);
        
      // ===== TAREFAS =====
      case 'addTask':
        return handleAddTask(dados);
        
      case 'getTasks':
        return handleGetTasks(dados);
        
      case 'updateTask':
        return handleUpdateTask(dados);
        
      case 'deleteTask':
        return handleDeleteTask(dados);
        
      case 'clearAllTasks':
        return handleClearAllTasks(dados);
        
      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: 'Ação não reconhecida: ' + dados.action,
            availableActions: ['addEvent', 'getEvents', 'deleteEvent', 'clearAllEvents', 'addTask', 'getTasks', 'updateTask', 'deleteTask', 'clearAllTasks']
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    console.error('❌ Erro no servidor:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Erro no servidor: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função para receber dados via HTTP GET (teste)
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: '7care - Google Apps Script v3.0 (Eventos + Tarefas)',
      timestamp: new Date().toISOString(),
      actions: {
        events: ['addEvent', 'getEvents', 'deleteEvent', 'clearAllEvents'],
        tasks: ['addTask', 'getTasks', 'updateTask', 'deleteTask', 'clearAllTasks']
      }
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Função de teste para deletar tarefa
 */
function testarDeleteTask() {
  console.log('🧪 TESTANDO DELEÇÃO DE TAREFA...');
  
  try {
    // 1. Listar tarefas atuais
    const sheet = getOrCreateTasksSheet(SPREADSHEET_ID, TASKS_SHEET_NAME);
    const tasks = getAllTasks(sheet);
    
    console.log('📊 Tarefas antes da deleção:', tasks.length);
    tasks.forEach((task, index) => {
      console.log(`   ${index + 1}. [ID: ${task.id}] ${task.titulo}`);
    });
    
    if (tasks.length === 0) {
      console.log('⚠️ Nenhuma tarefa para deletar');
      return { success: false, message: 'Nenhuma tarefa disponível' };
    }
    
    // 2. Deletar a primeira tarefa
    const taskToDelete = tasks[0];
    console.log('🗑️ Deletando:', taskToDelete.titulo);
    
    const result = deleteTaskFromSheet(SPREADSHEET_ID, TASKS_SHEET_NAME, taskToDelete.id);
    console.log('📋 Resultado:', result);
    
    // 3. Listar tarefas após deleção
    const tasksAfter = getAllTasks(sheet);
    console.log('📊 Tarefas após deleção:', tasksAfter.length);
    
    console.log('🎉 TESTE DE DELEÇÃO: SUCESSO!');
    return { success: true, message: 'Teste passou!', result: result };
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    return { success: false, message: 'Erro: ' + error.message };
  }
}

/**
 * Função de teste para limpar todas as tarefas
 */
function testarClearAllTasks() {
  console.log('🧪 TESTANDO LIMPEZA DE TODAS AS TAREFAS...');
  
  try {
    // 1. Listar tarefas atuais
    const sheet = getOrCreateTasksSheet(SPREADSHEET_ID, TASKS_SHEET_NAME);
    const tasksBefore = getAllTasks(sheet);
    console.log('📊 Tarefas antes da limpeza:', tasksBefore.length);
    
    // 2. Limpar todas
    const result = clearAllTasksFromSheet(SPREADSHEET_ID, TASKS_SHEET_NAME);
    console.log('📋 Resultado:', result);
    
    // 3. Verificar
    const tasksAfter = getAllTasks(sheet);
    console.log('📊 Tarefas após limpeza:', tasksAfter.length);
    
    console.log('🎉 TESTE DE LIMPEZA: SUCESSO!');
    return { success: true, message: 'Teste passou!', result: result };
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    return { success: false, message: 'Erro: ' + error.message };
  }
}

