// ============================================
// GOOGLE APPS SCRIPT - 7CARE TASKS
// Adicionar ao Google Apps Script como Web App
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { action, spreadsheetId, sheetName, taskData, taskId } = data;
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Planilha não encontrada: ' + sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ============================================
    // AÇÃO: ADICIONAR TAREFA
    // ============================================
    if (action === 'addTask') {
      const lastRow = sheet.getLastRow();
      const newRow = lastRow + 1;
      
      sheet.getRange(newRow, 1).setValue(taskData.id);
      sheet.getRange(newRow, 2).setValue(taskData.titulo);
      sheet.getRange(newRow, 3).setValue(taskData.descricao);
      sheet.getRange(newRow, 4).setValue(taskData.status);
      sheet.getRange(newRow, 5).setValue(taskData.prioridade);
      sheet.getRange(newRow, 6).setValue(taskData.responsavel);
      sheet.getRange(newRow, 7).setValue(taskData.criador);
      sheet.getRange(newRow, 8).setValue(taskData.data_criacao);
      sheet.getRange(newRow, 9).setValue(taskData.data_vencimento);
      sheet.getRange(newRow, 10).setValue(taskData.data_conclusao);
      sheet.getRange(newRow, 11).setValue(taskData.tags);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Tarefa adicionada com sucesso',
        linha: newRow
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ============================================
    // AÇÃO: DELETAR TAREFA ESPECÍFICA POR ID
    // ============================================
    if (action === 'deleteTask') {
      if (!taskId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'taskId não fornecido'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const lastRow = sheet.getLastRow();
      const data = sheet.getRange(1, 1, lastRow, 1).getValues(); // Coluna A (IDs)
      
      // Procurar a linha com o ID da tarefa (começar da linha 2, pular cabeçalho se houver)
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
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Tarefa deletada com sucesso',
          taskId: taskId,
          linha: rowToDelete
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Tarefa não encontrada no Google Sheets',
          taskId: taskId
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ============================================
    // AÇÃO: LIMPAR TODAS AS TAREFAS
    // ============================================
    if (action === 'clearAllTasks') {
      const lastRow = sheet.getLastRow();
      
      // Se tiver mais de 1 linha (cabeçalho ou dados), deletar tudo exceto cabeçalho
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Todas as tarefas foram limpas',
        linhasDeletadas: lastRow > 1 ? lastRow - 1 : 0
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ============================================
    // AÇÃO NÃO RECONHECIDA
    // ============================================
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Ação não reconhecida: ' + action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FUNÇÃO PARA TESTAR (opcional)
// ============================================
function testar() {
  Logger.log('Script configurado corretamente!');
}

