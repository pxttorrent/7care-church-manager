// Função de visitas recriada - VERSÃO SIMPLIFICADA E ROBUSTA
const visitUser = async (sql, userId, visitDate) => {
  try {
    console.log(`🔍 [VISIT] Registrando visita para usuário ID: ${userId}`);
    
    if (isNaN(userId)) {
      throw new Error('ID de usuário inválido');
    }
    
    // Buscar usuário
    const user = await sql`SELECT id, name, extra_data FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    console.log(`🔍 [VISIT] Usuário encontrado: ${user[0].name}`);
    
    // Parse do extraData existente
    let extraData = {};
    if (user[0].extra_data) {
      try {
        extraData = typeof user[0].extra_data === 'string' 
          ? JSON.parse(user[0].extra_data) 
          : user[0].extra_data;
      } catch (e) {
        console.log(`⚠️ [VISIT] Erro ao parsear extraData:`, e.message);
        extraData = {};
      }
    }
    
    // Atualizar informações de visita
    const previousVisitCount = extraData.visitCount || 0;
    extraData.visited = true;
    extraData.lastVisitDate = visitDate;
    extraData.visitCount = previousVisitCount + 1;
    
    console.log(`🔍 [VISIT] Atualizando: ${user[0].name} - ${previousVisitCount} → ${extraData.visitCount} visitas`);
    
    // Atualizar no banco de dados
    const extraDataString = JSON.stringify(extraData);
    const updateResult = await sql`
      UPDATE users 
      SET extra_data = ${extraDataString}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    console.log('✅ [VISIT] Update executado:', updateResult);
    
    // Verificar se foi salvo corretamente
    const verifyUser = await sql`SELECT id, name, extra_data FROM users WHERE id = ${userId}`;
    const savedExtraData = verifyUser[0]?.extra_data ? JSON.parse(verifyUser[0].extra_data) : {};
    
    console.log('🔍 [VISIT] Verificação - Dados salvos:', savedExtraData);
    
    // Retornar resposta
    const responseUser = {
      ...user[0],
      extraData: extraData
    };
    
    return {
      success: true,
      message: 'Visita registrada com sucesso',
      user: responseUser,
      extraData: extraData
    };
  } catch (error) {
    console.error('❌ [VISIT] Erro ao registrar visita:', error);
    throw error;
  }
};

module.exports = { visitUser };
