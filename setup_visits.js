// Script para configurar o novo sistema de visitas
import { neon } from '@neondatabase/serverless';

async function setupVisits() {
  try {
    console.log('🔧 Iniciando configuração do novo sistema de visitas...');
    
    // Conectar ao banco
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente');
      return;
    }
    
    if (dbUrl.startsWith('psql ')) {
      dbUrl = dbUrl.replace('psql ', '');
    }
    if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
      dbUrl = dbUrl.slice(1, -1);
    }
    if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
      dbUrl = dbUrl.slice(1, -1);
    }
    
    const sql = neon(dbUrl);
    
    // 1. Criar tabela de visitas
    console.log('📋 Criando tabela de visitas...');
    await sql`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        visit_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, visit_date)
      )
    `;
    
    // Criar índices
    await sql`CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date)`;
    console.log('✅ Tabela de visitas criada com sucesso');
    
    // 2. Migrar visitas existentes do extraData para a nova tabela
    console.log('🔄 Migrando visitas existentes...');
    const usersWithVisits = await sql`
      SELECT id, name, extra_data 
      FROM users 
      WHERE extra_data IS NOT NULL 
      AND (extra_data::text LIKE '%"visited":true%' OR extra_data::text LIKE '%"visitCount"%')
    `;
    
    console.log(`📊 Encontrados ${usersWithVisits.length} usuários com visitas no extraData`);
    
    let migratedCount = 0;
    for (const user of usersWithVisits) {
      try {
        let extraData = {};
        if (user.extra_data) {
          if (typeof user.extra_data === 'string') {
            extraData = JSON.parse(user.extra_data);
          } else if (typeof user.extra_data === 'object') {
            extraData = user.extra_data;
          }
        }
        
        if (extraData.visited === true && extraData.lastVisitDate) {
          // Inserir visita na nova tabela
          await sql`
            INSERT INTO visits (user_id, visit_date)
            VALUES (${user.id}, ${extraData.lastVisitDate})
            ON CONFLICT (user_id, visit_date) DO NOTHING
          `;
          
          // Se há múltiplas visitas, criar registros adicionais
          const visitCount = extraData.visitCount || 1;
          if (visitCount > 1) {
            for (let i = 1; i < visitCount; i++) {
              const additionalDate = new Date(extraData.lastVisitDate);
              additionalDate.setDate(additionalDate.getDate() - i);
              const dateStr = additionalDate.toISOString().split('T')[0];
              
              await sql`
                INSERT INTO visits (user_id, visit_date)
                VALUES (${user.id}, ${dateStr})
                ON CONFLICT (user_id, visit_date) DO NOTHING
              `;
            }
          }
          
          migratedCount++;
          console.log(`✅ Migrado usuário ${user.name} (ID: ${user.id}) - ${visitCount} visitas`);
        }
      } catch (error) {
        console.error(`❌ Erro ao migrar usuário ${user.name}:`, error.message);
      }
    }
    
    console.log(`✅ Migração concluída: ${migratedCount} usuários migrados`);
    
    // 3. Limpar dados de visita do extraData
    console.log('🧹 Limpando dados de visita do extraData...');
    let cleanedCount = 0;
    
    for (const user of usersWithVisits) {
      try {
        let extraData = {};
        if (user.extra_data) {
          if (typeof user.extra_data === 'string') {
            extraData = JSON.parse(user.extra_data);
          } else if (typeof user.extra_data === 'object') {
            extraData = user.extra_data;
          }
        }
        
        // Remover campos de visita do extraData
        delete extraData.visited;
        delete extraData.visitCount;
        delete extraData.lastVisitDate;
        delete extraData.firstVisitDate;
        
        // Atualizar usuário
        await sql`
          UPDATE users 
          SET extra_data = ${JSON.stringify(extraData)}, updated_at = NOW()
          WHERE id = ${user.id}
        `;
        
        cleanedCount++;
        console.log(`✅ Limpo extraData do usuário ${user.name} (ID: ${user.id})`);
      } catch (error) {
        console.error(`❌ Erro ao limpar usuário ${user.name}:`, error.message);
      }
    }
    
    console.log(`✅ Limpeza concluída: ${cleanedCount} usuários processados`);
    
    // 4. Verificar resultado
    console.log('🔍 Verificando resultado...');
    const visitStats = await sql`
      SELECT 
        COUNT(DISTINCT user_id) as users_with_visits,
        COUNT(*) as total_visits
      FROM visits
    `;
    
    console.log(`📊 Resultado final:`);
    console.log(`   - Usuários com visitas: ${visitStats[0].users_with_visits}`);
    console.log(`   - Total de visitas: ${visitStats[0].total_visits}`);
    
    console.log('🎉 Configuração do novo sistema de visitas concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

// Executar configuração
setupVisits();
