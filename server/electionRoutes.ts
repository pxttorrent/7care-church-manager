import { sql } from './neonConfig';

export const electionRoutes = (app: any) => {
  // Rota para configurar eleição
  app.post("/api/elections/config", async (req: any, res: any) => {
    try {
      const body = req.body;
      
      // Criar tabela de configuração se não existir
      await sql`
        CREATE TABLE IF NOT EXISTS election_configs (
          id SERIAL PRIMARY KEY,
          church_id INTEGER NOT NULL,
          church_name VARCHAR(255) NOT NULL,
          voters INTEGER[] NOT NULL,
          criteria JSONB NOT NULL,
          positions TEXT[] NOT NULL,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Inserir configuração
      const result = await sql`
        INSERT INTO election_configs (church_id, church_name, voters, criteria, positions, status)
        VALUES (${body.churchId || 1}, ${body.churchName || 'Igreja Central'}, ${body.voters}, ${JSON.stringify(body.criteria)}, ${body.positions}, ${body.status || 'draft'})
        RETURNING *
      `;

      console.log('✅ Configuração de eleição salva:', result[0].id);

      return res.status(200).json(result[0]);

    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // GET /api/elections/config/:id - Buscar uma configuração específica
  app.get("/api/elections/config/:id", async (req: any, res: any) => {
    try {
      const configId = parseInt(req.params.id);
      
      const config = await sql`
        SELECT ec.*, e.status as election_status, e.created_at as election_created_at
        FROM election_configs ec
        LEFT JOIN (
          SELECT DISTINCT ON (config_id) config_id, status, created_at
          FROM elections
          ORDER BY config_id, created_at DESC
        ) e ON ec.id = e.config_id
        WHERE ec.id = ${configId}
        ORDER BY ec.created_at DESC
      `;
      
      if (config.length === 0) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }
      
      return res.json(config[0]);
    } catch (error) {
      console.error('❌ Erro ao buscar configuração:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // GET /api/elections/config - Buscar configuração específica ou última
  app.get("/api/elections/config", async (req: any, res: any) => {
    try {
      const configId = req.query.id;
      
      if (configId) {
        // Buscar configuração específica por ID
        const config = await sql`
          SELECT ec.*, e.status as election_status, e.created_at as election_created_at
          FROM election_configs ec
          LEFT JOIN (
            SELECT DISTINCT ON (config_id) config_id, status, created_at
            FROM elections
            ORDER BY config_id, created_at DESC
          ) e ON ec.id = e.config_id
          WHERE ec.id = ${parseInt(configId)}
          ORDER BY ec.created_at DESC
        `;
        
        if (config.length === 0) {
          return res.status(404).json({ error: 'Configuração não encontrada' });
        }
        
        return res.json(config[0]);
      } else {
        // Buscar última configuração criada
        const config = await sql`
          SELECT ec.*, e.status as election_status, e.created_at as election_created_at
          FROM election_configs ec
          LEFT JOIN (
            SELECT DISTINCT ON (config_id) config_id, status, created_at
            FROM elections
            ORDER BY config_id, created_at DESC
          ) e ON ec.id = e.config_id
          ORDER BY ec.created_at DESC
          LIMIT 1
        `;
        
        if (config.length === 0) {
          return res.status(404).json({ error: 'Nenhuma configuração encontrada' });
        }
        
        return res.json(config[0]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar configuração:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // GET /api/elections/configs - Listar todas as configurações
  app.get("/api/elections/configs", async (req: any, res: any) => {
    try {
      const configs = await sql`
        SELECT ec.*, e.status as election_status, e.created_at as election_created_at
        FROM election_configs ec
        LEFT JOIN (
          SELECT DISTINCT ON (config_id) config_id, status, created_at
          FROM elections
          ORDER BY config_id, created_at DESC
        ) e ON ec.id = e.config_id
        ORDER BY ec.created_at DESC
      `;

      return res.status(200).json(configs);

    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para iniciar eleição
  app.post("/api/elections/start", async (req: any, res: any) => {
    try {
      const body = req.body;
      
      // Criar tabelas de eleição se não existirem
      await sql`
        CREATE TABLE IF NOT EXISTS elections (
          id SERIAL PRIMARY KEY,
          config_id INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          current_position INTEGER DEFAULT 0,
          current_phase VARCHAR(20) DEFAULT 'nomination',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      await sql`
        DROP TABLE IF EXISTS election_votes
      `;
      
      await sql`
        CREATE TABLE election_votes (
          id SERIAL PRIMARY KEY,
          election_id INTEGER NOT NULL,
          voter_id INTEGER NOT NULL,
          position_id VARCHAR(255) NOT NULL,
          candidate_id INTEGER NOT NULL,
          vote_type VARCHAR(20) DEFAULT 'nomination',
          voted_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(election_id, voter_id, position_id, candidate_id, vote_type)
        )
      `;

      await sql`
        DROP TABLE IF EXISTS election_candidates
      `;
      
      await sql`
        CREATE TABLE election_candidates (
          id SERIAL PRIMARY KEY,
          election_id INTEGER NOT NULL,
          position_id VARCHAR(255) NOT NULL,
          candidate_id INTEGER NOT NULL,
          candidate_name VARCHAR(255) NOT NULL,
          faithfulness_punctual BOOLEAN DEFAULT false,
          faithfulness_seasonal BOOLEAN DEFAULT false,
          faithfulness_recurring BOOLEAN DEFAULT false,
          attendance_percentage INTEGER DEFAULT 0,
          months_in_church INTEGER DEFAULT 0,
          nominations INTEGER DEFAULT 0,
          votes INTEGER DEFAULT 0,
          phase VARCHAR(20) DEFAULT 'nomination',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Buscar configuração
      let config;
      if (body.configId) {
        config = await sql`
          SELECT * FROM election_configs 
          WHERE id = ${body.configId}
        `;
      } else {
        config = await sql`
          SELECT * FROM election_configs 
          ORDER BY created_at DESC 
          LIMIT 1
        `;
      }

      if (config.length === 0) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }

      // Desativar todas as eleições ativas
      console.log('🔄 Desativando todas as eleições ativas...');
      await sql`
        UPDATE elections 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'active'
      `;

      // Criar eleição
      const election = await sql`
        INSERT INTO elections (config_id, status, current_position)
        VALUES (${config[0].id}, 'active', 0)
        RETURNING *
      `;

      // Buscar candidatos elegíveis para cada posição
      console.log('🔍 Buscando membros da igreja:', config[0].church_name);
      const churchMembers = await sql`
        SELECT id, name, email, church, role, status, created_at, is_tither, is_donor, attendance, extra_data
        FROM users 
        WHERE church = ${config[0].church_name} 
        AND role = 'member'
        AND status = 'approved'
      `;

      console.log(`✅ Encontrados ${churchMembers.length} membros elegíveis`);

      // Garantir que positions seja um array
      const positions = Array.isArray(config[0].positions) 
        ? config[0].positions 
        : JSON.parse(config[0].positions || '[]');
      
      if (!positions || positions.length === 0) {
        console.log('❌ Nenhuma posição configurada na eleição');
        return res.status(400).json({ error: 'Configuração inválida: nenhuma posição encontrada' });
      }

      // Inserir candidatos para cada posição
      const candidatesToInsert = [];
      
      for (const position of positions) {
        for (const member of churchMembers) {
          // Processar dados de gestão do extraData
          let extraData = {};
          try {
            extraData = member.extra_data ? JSON.parse(member.extra_data) : {};
          } catch (e) {
            console.log(`⚠️ Erro ao processar extraData para ${member.name}:`, e.message);
          }

          // Extrair dados de gestão do extraData
          const dizimistaRecorrente = extraData.dizimistaType === 'Recorrente (8-12)' || extraData.dizimistaType === 'recorrente';
          const ofertanteRecorrente = extraData.ofertanteType === 'Recorrente (8-12)' || extraData.ofertanteType === 'recorrente';
          const engajamento = extraData.engajamento || 'baixo';
          const classificacao = extraData.classificacao || 'não frequente';
          const tempoBatismoAnos = extraData.tempoBatismoAnos || 0;
          const presencaTotal = extraData.totalPresenca || 0;
          const comunhao = extraData.comunhao || 0;
          const missao = extraData.missao || 0;
          const estudoBiblico = extraData.estudoBiblico || 0;
          const discPosBatismal = extraData.discPosBatismal || 0;

          // Verificar critérios de elegibilidade
          const criteria = typeof config[0].criteria === 'object' 
            ? config[0].criteria 
            : JSON.parse(config[0].criteria || '{}');
          let isEligible = true;
          
          // Calcular meses na igreja
          const monthsInChurch = member.created_at ? 
            Math.floor((Date.now() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;
          
          // Aplicar filtros de elegibilidade baseados no extraData
          if (criteria.dizimistaRecorrente && !dizimistaRecorrente) {
            isEligible = false;
          }
          
          if (criteria.mustBeTither && !dizimistaRecorrente) {
            isEligible = false;
          }
          
          if (criteria.mustBeDonor && !ofertanteRecorrente) {
            isEligible = false;
          }
          
          if (criteria.minAttendance && presencaTotal < criteria.minAttendance) {
            isEligible = false;
          }
          
          if (criteria.minMonthsInChurch && monthsInChurch < criteria.minMonthsInChurch) {
            isEligible = false;
          }
          
          // Filtros adicionais baseados no extraData
          if (criteria.minEngagement && engajamento === 'baixo') {
            isEligible = false;
          }
          
          if (criteria.minClassification && classificacao === 'não frequente') {
            isEligible = false;
          }
          
          if (criteria.minBaptismYears && tempoBatismoAnos < criteria.minBaptismYears) {
            isEligible = false;
          }
          
          console.log(`🔍 Candidato ${member.name}: elegível=${isEligible}, dizimistaRecorrente=${dizimistaRecorrente}, engajamento=${engajamento}, classificacao=${classificacao}, tempoBatismo=${tempoBatismoAnos} anos, presenca=${presencaTotal}, months=${monthsInChurch}`);
          
          if (isEligible) {
            candidatesToInsert.push({
              election_id: election[0].id,
              position_id: position,
              candidate_id: member.id,
              candidate_name: member.name,
              faithfulness_punctual: dizimistaRecorrente,
              faithfulness_seasonal: ofertanteRecorrente,
              faithfulness_recurring: (dizimistaRecorrente && ofertanteRecorrente),
              attendance_percentage: presencaTotal,
              months_in_church: monthsInChurch
            });
          }
        }
      }

      // Inserir candidatos um por um (mais confiável)
      if (candidatesToInsert.length > 0) {
        for (const candidate of candidatesToInsert) {
          await sql`
            INSERT INTO election_candidates (election_id, position_id, candidate_id, candidate_name, faithfulness_punctual, faithfulness_seasonal, faithfulness_recurring, attendance_percentage, months_in_church, nominations, phase)
            VALUES (${candidate.election_id}, ${candidate.position_id}, ${candidate.candidate_id}, ${candidate.candidate_name}, ${candidate.faithfulness_punctual}, ${candidate.faithfulness_seasonal}, ${candidate.faithfulness_recurring}, ${candidate.attendance_percentage}, ${candidate.months_in_church}, 0, 'nomination')
          `;
        }
        console.log(`✅ ${candidatesToInsert.length} candidatos inseridos`);
      }

      // Atualizar status da configuração
      await sql`
        UPDATE election_configs 
        SET status = 'active' 
        WHERE id = ${config[0].id}
      `;

      console.log('✅ Eleição iniciada:', election[0].id);

      return res.status(200).json({ 
        electionId: election[0].id,
        message: 'Nomeação iniciada com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao iniciar eleição:', error);
      console.error('❌ Stack trace:', error.stack);
      return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  });

  // Rota para dashboard do admin com configId específico
  app.get("/api/elections/dashboard/:configId", async (req: any, res: any) => {
    try {
      const configId = parseInt(req.params.configId);
      
      // Buscar eleição ativa para o configId específico
      const election = await sql`
        SELECT e.*, ec.voters, ec.positions, ec.church_name
        FROM elections e
        JOIN election_configs ec ON e.config_id = ec.id
        WHERE e.config_id = ${configId}
        AND e.status = 'active'
        ORDER BY e.created_at DESC
        LIMIT 1
      `;

      if (election.length === 0) {
        return res.status(404).json({ error: 'Nenhuma eleição ativa para esta configuração' });
      }

      // Garantir que voters seja um array
      const voters = Array.isArray(election[0].voters) 
        ? election[0].voters 
        : JSON.parse(election[0].voters || '[]');

      // Buscar estatísticas
      const totalVoters = voters.length;
      const votedVoters = await sql`
        SELECT COUNT(DISTINCT voter_id) as count
        FROM election_votes
        WHERE election_id = ${election[0].id}
      `;

      // Buscar todos os resultados de uma vez (otimizado)
      const allResults = await sql`
        SELECT 
          ev.position_id,
          ev.candidate_id,
          COALESCE(u.name, 'Usuário não encontrado') as candidate_name,
          COUNT(CASE WHEN ev.vote_type = 'nomination' THEN 1 END) as nominations,
          COUNT(CASE WHEN ev.vote_type = 'vote' THEN 1 END) as votes
        FROM election_votes ev
        LEFT JOIN users u ON ev.candidate_id = u.id
        WHERE ev.election_id = ${election[0].id}
        GROUP BY ev.position_id, ev.candidate_id, u.name
        HAVING COUNT(CASE WHEN ev.vote_type = 'nomination' THEN 1 END) > 0 
           OR COUNT(CASE WHEN ev.vote_type = 'vote' THEN 1 END) > 0
        ORDER BY ev.position_id, votes DESC, nominations DESC
      `;

      // Garantir que positions seja um array
      const electionPositions = Array.isArray(election[0].positions) 
        ? election[0].positions 
        : JSON.parse(election[0].positions || '[]');
      
      // Agrupar resultados por posição
      const positions = [];
      const resultsByPosition = new Map();
      
      // Agrupar resultados por posição
      allResults.forEach(result => {
        if (!resultsByPosition.has(result.position_id)) {
          resultsByPosition.set(result.position_id, []);
        }
        resultsByPosition.get(result.position_id).push(result);
      });

      // Processar cada posição
      for (const position of electionPositions) {
        const results = resultsByPosition.get(position) || [];
        
        // Converter votos para números e calcular percentuais
        results.forEach(r => {
          r.votes = parseInt(r.votes) || 0;
          r.nominations = parseInt(r.nominations) || 0;
        });
        
        const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
        results.forEach(r => {
          r.percentage = totalVotes > 0 ? (r.votes / totalVotes * 100) : 0;
        });

        const winner = results.length > 0 && results[0].votes > 0 ? results[0] : null;
        const totalNominations = results.reduce((sum, r) => sum + r.nominations, 0);

        positions.push({
          position: position,
          totalNominations: totalNominations,
          winner: winner ? {
            id: winner.candidate_id,
            name: winner.candidate_name,
            votes: winner.votes,
            percentage: winner.percentage
          } : null,
          results: results.map(r => ({
            id: r.candidate_id,
            name: r.candidate_name,
            nominations: r.nominations,
            votes: r.votes,
            percentage: r.percentage
          }))
        });
      }

      const response = {
        election: {
          id: election[0].id,
          config_id: election[0].config_id,
          status: election[0].status,
          current_position: election[0].current_position,
          current_phase: election[0].current_phase || 'nomination',
          church_name: election[0].church_name,
          created_at: election[0].created_at
        },
        totalVoters,
        votedVoters: votedVoters[0].count,
        currentPosition: election[0].current_position,
        totalPositions: electionPositions.length,
        positions
      };

      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ Erro ao buscar dashboard com configId:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // POST /api/elections/advance-phase - Avançar fase (Admin)
  app.post("/api/elections/advance-phase", async (req: any, res: any) => {
    try {
      const body = req.body;
      const { configId, phase } = body;
      const adminId = parseInt(req.headers['x-user-id']);

      if (!adminId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;

      if (!admin[0] || !admin[0].role.includes('admin')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem avançar fases' });
      }

      // Buscar eleição ativa para o configId
      const election = await sql`
        SELECT * FROM elections 
        WHERE config_id = ${configId}
        AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (election.length === 0) {
        return res.status(404).json({ error: 'Nenhuma eleição ativa para esta configuração' });
      }

      console.log(`🔄 Atualizando fase da eleição ${election[0].id} para: ${phase}`);

      // Garantir que a coluna current_phase existe (migration)
      try {
        await sql`
          ALTER TABLE elections 
          ADD COLUMN IF NOT EXISTS current_phase VARCHAR(20) DEFAULT 'nomination'
        `;
      } catch (alterError) {
        console.log('⚠️ Coluna current_phase já existe ou erro ao adicionar:', alterError.message);
      }

      // Atualizar fase da eleição
      await sql`
        UPDATE elections 
        SET current_phase = ${phase}, updated_at = NOW()
        WHERE id = ${election[0].id}
      `;

      console.log(`✅ Fase da eleição ${election[0].id} avançada para: ${phase}`);

      return res.status(200).json({ 
        message: `Fase avançada para: ${phase}`,
        phase: phase,
        electionId: election[0].id
      });

    } catch (error) {
      console.error('❌ Erro ao avançar fase:', error);
      return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  });

  // POST /api/elections/advance-position - Avançar posição (Admin)
  app.post("/api/elections/advance-position", async (req: any, res: any) => {
    try {
      const body = req.body;
      const { configId, position } = body;
      const adminId = parseInt(req.headers['x-user-id']);

      if (!adminId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;

      if (!admin[0] || !admin[0].role.includes('admin')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem avançar posições' });
      }

      // Buscar eleição ativa para o configId
      const election = await sql`
        SELECT * FROM elections 
        WHERE config_id = ${configId}
        AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (election.length === 0) {
        return res.status(404).json({ error: 'Nenhuma eleição ativa para esta configuração' });
      }

      // Atualizar posição atual da eleição e resetar fase para nomination
      await sql`
        UPDATE elections 
        SET current_position = ${position}, 
            current_phase = 'nomination',
            updated_at = NOW()
        WHERE id = ${election[0].id}
      `;

      console.log(`✅ Posição avançada para ${position} e fase resetada para nomination`);

      return res.status(200).json({ 
        message: `Posição avançada para: ${position}`,
        currentPosition: position,
        currentPhase: 'nomination'
      });

    } catch (error) {
      console.error('❌ Erro ao avançar posição:', error);
      return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  });

  // POST /api/elections/reset-voting - Repetir votação da posição atual (Admin)
  app.post("/api/elections/reset-voting", async (req: any, res: any) => {
    try {
      const body = req.body;
      const { configId } = body;
      const adminId = parseInt(req.headers['x-user-id']);

      if (!adminId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;

      if (!admin[0] || !admin[0].role.includes('admin')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem repetir votações' });
      }

      // Buscar eleição ativa para o configId
      const election = await sql`
        SELECT e.*, ec.positions
        FROM elections e
        JOIN election_configs ec ON e.config_id = ec.id
        WHERE e.config_id = ${configId}
        AND e.status = 'active'
        ORDER BY e.created_at DESC
        LIMIT 1
      `;

      if (election.length === 0) {
        return res.status(404).json({ error: 'Nenhuma eleição ativa para esta configuração' });
      }

      // Garantir que positions seja um array
      const positions = Array.isArray(election[0].positions) 
        ? election[0].positions 
        : JSON.parse(election[0].positions || '[]');
      
      const currentPositionIndex = election[0].current_position || 0;
      if (currentPositionIndex >= positions.length) {
        return res.status(400).json({ error: 'Posição atual inválida' });
      }

      const currentPositionName = positions[currentPositionIndex];

      console.log(`🔄 Resetando votos para a posição: ${currentPositionName}`);

      // Deletar todos os votos (vote_type = 'vote') da posição atual
      await sql`
        DELETE FROM election_votes
        WHERE election_id = ${election[0].id}
        AND position_id = ${currentPositionName}
        AND vote_type = 'vote'
      `;

      // Resetar a fase para 'voting' (mantém as indicações)
      await sql`
        UPDATE elections 
        SET current_phase = 'voting',
            updated_at = NOW()
        WHERE id = ${election[0].id}
      `;

      console.log(`✅ Votação resetada para a posição: ${currentPositionName}`);

      return res.status(200).json({ 
        message: `Votação repetida com sucesso para: ${currentPositionName}`,
        currentPosition: currentPositionName,
        currentPhase: 'voting'
      });

    } catch (error) {
      console.error('❌ Erro ao resetar votação:', error);
      return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  });

  // POST /api/elections/set-max-nominations - Configurar número máximo de indicações por votante
  app.post("/api/elections/set-max-nominations", async (req: any, res: any) => {
    try {
      const { configId, maxNominations } = req.body;
      const adminId = parseInt(req.headers['x-user-id']);

      if (!adminId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;

      if (!admin[0] || !admin[0].role.includes('admin')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem alterar configurações' });
      }

      if (!maxNominations || maxNominations < 1) {
        return res.status(400).json({ error: 'Número de indicações deve ser maior que 0' });
      }

      // Criar coluna se não existir
      try {
        await sql`
          ALTER TABLE election_configs 
          ADD COLUMN IF NOT EXISTS max_nominations_per_voter INTEGER DEFAULT 1
        `;
      } catch (alterError) {
        console.log('⚠️ Coluna max_nominations_per_voter já existe ou erro ao adicionar:', alterError.message);
      }

      // Atualizar configuração da eleição
      await sql`
        UPDATE election_configs 
        SET max_nominations_per_voter = ${maxNominations}
        WHERE id = ${configId}
      `;

      console.log(`✅ Máximo de indicações atualizado para ${maxNominations} na eleição ${configId}`);

      return res.status(200).json({ 
        message: `Máximo de indicações atualizado para ${maxNominations}`,
        maxNominations
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar configuração:', error);
      return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  });

  // POST /api/elections/nominate - Indicação de candidatos (Fase 1)
  app.post("/api/elections/nominate", async (req: any, res: any) => {
    try {
      const body = req.body;
      const { electionId, positionId, candidateId } = body;
      const voterId = parseInt(req.headers['x-user-id']);

      if (!voterId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se a eleição está ativa
      const election = await sql`
        SELECT * FROM elections 
        WHERE id = ${electionId}
        AND status = 'active'
      `;

      if (election.length === 0) {
        return res.status(404).json({ error: 'Eleição não encontrada ou inativa' });
      }

      // Verificar se o usuário já indicou para esta posição
      const existingNomination = await sql`
        SELECT * FROM election_votes
        WHERE election_id = ${electionId}
        AND voter_id = ${voterId}
        AND position_id = ${positionId}
        AND vote_type = 'nomination'
      `;

      if (existingNomination.length > 0) {
        return res.status(400).json({ error: 'Você já indicou um candidato para esta posição' });
      }

      // Registrar indicação
      await sql`
        INSERT INTO election_votes (election_id, voter_id, position_id, candidate_id, vote_type)
        VALUES (${electionId}, ${voterId}, ${positionId}, ${candidateId}, 'nomination')
      `;

      // Atualizar contador de indicações
      await sql`
        UPDATE election_candidates 
        SET nominations = nominations + 1
        WHERE election_id = ${electionId}
        AND position_id = ${positionId}
        AND candidate_id = ${candidateId}
      `;

      return res.status(200).json({ message: 'Indicação registrada com sucesso' });

    } catch (error) {
      console.error('❌ Erro ao registrar indicação:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para excluir uma configuração específica
  app.delete("/api/elections/config/:configId", async (req: any, res: any) => {
    try {
      const configId = parseInt(req.params.configId);
      const adminId = parseInt(req.headers['x-user-id']);

      if (!adminId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;

      if (!admin[0] || !admin[0].role.includes('admin')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem excluir configurações' });
      }

      // Verificar se a configuração existe
      const config = await sql`
        SELECT * FROM election_configs WHERE id = ${configId}
      `;

      if (config.length === 0) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }

      // Finalizar eleições ativas primeiro
      await sql`
        UPDATE elections 
        SET status = 'completed', updated_at = NOW()
        WHERE config_id = ${configId} AND status = 'active'
      `;

      // Excluir todas as eleições relacionadas
      await sql`DELETE FROM election_votes WHERE election_id IN (SELECT id FROM elections WHERE config_id = ${configId})`;
      await sql`DELETE FROM election_candidates WHERE election_id IN (SELECT id FROM elections WHERE config_id = ${configId})`;
      await sql`DELETE FROM elections WHERE config_id = ${configId}`;
      
      // Excluir a configuração
      await sql`DELETE FROM election_configs WHERE id = ${configId}`;

      console.log(`✅ Configuração ${configId} excluída com sucesso`);

      return res.status(200).json({ message: 'Configuração excluída com sucesso' });

    } catch (error) {
      console.error('❌ Erro ao excluir configuração:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para aprovar todos os membros
  app.post("/api/elections/approve-all-members", async (req: any, res: any) => {
    try {
      const adminId = parseInt(req.headers['x-user-id']);

      if (!adminId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin
      const admin = await sql`
        SELECT role FROM users WHERE id = ${adminId}
      `;

      if (!admin[0] || !admin[0].role.includes('admin')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem aprovar membros' });
      }

      console.log('🔓 Aprovando todos os membros do sistema...');

      // Aprovar todos os membros
      await sql`
        UPDATE users 
        SET status = 'approved', is_approved = true, updated_at = NOW()
        WHERE status != 'approved' OR is_approved = false
      `;

      // Contar total de membros aprovados
      const totalApproved = await sql`
        SELECT COUNT(*) as count FROM users WHERE is_approved = true
      `;

      const approvedCount = parseInt(totalApproved[0].count);
      console.log(`✅ ${approvedCount} membros aprovados no total!`);

      return res.json({ 
        message: `Todos os membros foram aprovados! Total: ${approvedCount} membros aprovados.`,
        approved_count: approvedCount
      });
    } catch (error) {
      console.error('❌ Erro ao aprovar membros:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para limpar todas as votações
  app.get("/api/elections/cleanup", async (req: any, res: any) => {
    try {
      console.log('🧹 Iniciando limpeza de todas as votações...');
      
      // Limpar tabelas de eleições
      await sql`DELETE FROM election_votes`;
      console.log('✅ Tabela election_votes limpa');
      
      await sql`DELETE FROM election_candidates`;
      console.log('✅ Tabela election_candidates limpa');
      
      await sql`DELETE FROM elections`;
      console.log('✅ Tabela elections limpa');
      
      await sql`DELETE FROM election_configs`;
      console.log('✅ Tabela election_configs limpa');
      
      console.log('🎉 Limpeza concluída com sucesso!');
      
      return res.status(200).json({ 
        message: 'Todas as votações foram limpas com sucesso',
        cleaned: {
          election_votes: true,
          election_candidates: true,
          elections: true,
          election_configs: true
        }
      });
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para listar eleições ativas para membros
  app.get("/api/elections/active", async (req: any, res: any) => {
    try {
      const voterId = req.headers['x-user-id'];
      
      if (!voterId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      // Buscar eleições ativas onde o usuário é votante
      const activeElections = await sql`
        SELECT 
          e.id as election_id,
          e.config_id,
          e.current_position,
          e.current_phase,
          ec.church_name,
          ec.positions,
          ec.voters
        FROM elections e
        JOIN election_configs ec ON e.config_id = ec.id
        WHERE e.status = 'active'
        AND ${parseInt(voterId)} = ANY(ec.voters)
        ORDER BY e.created_at DESC
      `;
      
      if (activeElections.length === 0) {
        return res.status(404).json({ error: 'Nenhuma eleição ativa encontrada' });
      }
      
      // Retornar a primeira eleição ativa (pode haver apenas uma)
      const election = activeElections[0];
      
      return res.json({
        election: {
          id: election.election_id,
          config_id: election.config_id,
          current_position: election.current_position,
          current_phase: election.current_phase,
          church_name: election.church_name,
          positions: election.positions
        },
        hasActiveElection: true
      });
      
    } catch (error) {
      console.error('❌ Erro ao buscar eleições ativas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para interface de votação dos membros
  app.get("/api/elections/voting/:configId", async (req: any, res: any) => {
    try {
      const { configId } = req.params;
      const voterId = req.headers['x-user-id'];
      
      console.log(`🔍 Interface de votação para configId: ${configId}, voterId: ${voterId}`);
      
      // Buscar eleição ativa real
      const election = await sql`
        SELECT * FROM elections 
        WHERE config_id = ${configId} AND status = 'active'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      if (election.length === 0) {
        return res.status(404).json({ error: 'Nenhuma eleição ativa encontrada' });
      }
      
      // Buscar configuração para obter posições
      const config = await sql`
        SELECT * FROM election_configs WHERE id = ${configId}
      `;
      
      if (config.length === 0) {
        return res.status(404).json({ error: 'Configuração de eleição não encontrada' });
      }
      
      // Garantir que positions seja um array
      const positions = Array.isArray(config[0].positions) 
        ? config[0].positions 
        : JSON.parse(config[0].positions || '[]');
      
      if (!positions || positions.length === 0) {
        console.log('❌ Nenhuma posição configurada na eleição');
        return res.status(400).json({ error: 'Configuração inválida: nenhuma posição encontrada' });
      }
      
      const currentPositionIndex = election[0].current_position || 0;
      
      if (currentPositionIndex >= positions.length) {
        console.log('❌ Posição atual inválida:', currentPositionIndex, 'de', positions.length);
        return res.status(400).json({ error: 'Posição atual inválida na eleição' });
      }
      
      const currentPositionName = positions[currentPositionIndex];
      const currentPhase = election[0].current_phase || 'nomination';
      
      // Buscar candidatos com base na fase
      let candidates;
      
      if (currentPhase === 'voting') {
        // Na fase de votação, mostrar apenas os candidatos que foram indicados
        candidates = await sql`
          SELECT DISTINCT
            ev.candidate_id as id,
            u.name,
            u.church as unit,
            0 as points,
            COUNT(*) as nominations
          FROM election_votes ev
          LEFT JOIN users u ON ev.candidate_id = u.id
          WHERE ev.election_id = ${election[0].id}
          AND ev.position_id = ${currentPositionName}
          AND ev.vote_type = 'nomination'
          GROUP BY ev.candidate_id, u.name, u.church
          ORDER BY u.name
        `;
      } else {
        // Na fase de indicação, mostrar todos os candidatos elegíveis
        candidates = await sql`
          SELECT 
            ec.candidate_id as id,
            u.name,
            u.church as unit,
            ec.faithfulness_punctual as points
          FROM election_candidates ec
          LEFT JOIN users u ON ec.candidate_id = u.id
          WHERE ec.election_id = ${election[0].id}
          AND ec.position_id = ${currentPositionName}
          ORDER BY u.name
        `;
      }
      
      // Verificar se o votante já votou para a posição atual
      const hasVoted = await sql`
        SELECT COUNT(*) FROM election_votes
        WHERE election_id = ${election[0].id}
        AND position_id = ${currentPositionName}
        AND voter_id = ${voterId}
        AND vote_type = 'vote'
      `;
      
      const hasNominated = await sql`
        SELECT COUNT(*) FROM election_votes
        WHERE election_id = ${election[0].id}
        AND position_id = ${currentPositionName}
        AND voter_id = ${voterId}
        AND vote_type = 'nomination'
      `;

      const nominationCount = parseInt(hasNominated[0].count) || 0;
      
      // Buscar nome do candidato votado
      let votedCandidateName = null;
      if (parseInt(hasVoted[0].count) > 0) {
        const userVote = await sql`
          SELECT ev.candidate_id, u.name
          FROM election_votes ev
          LEFT JOIN users u ON ev.candidate_id = u.id
          WHERE ev.election_id = ${election[0].id}
          AND ev.position_id = ${currentPositionName}
          AND ev.voter_id = ${voterId}
          AND ev.vote_type = 'vote'
          LIMIT 1
        `;
        if (userVote.length > 0) {
          votedCandidateName = userVote[0].name;
        }
      }
      
      // Normalizar estrutura dos candidatos
      const normalizedCandidates = candidates.map((c: any) => ({
        id: c.id || c.candidate_id,
        name: c.name || c.candidate_name || 'Candidato',
        unit: c.unit || c.church || 'N/A',
        points: c.points || 0,
        nominations: c.nominations || 0,
        votes: c.votes || 0,
        percentage: c.percentage || 0
      }));

      const maxNominationsPerVoter = config[0].max_nominations_per_voter || 1;
      const hasReachedNominationLimit = nominationCount >= maxNominationsPerVoter;

      const response = {
        election: {
          id: election[0].id,
          config_id: election[0].config_id,
          status: election[0].status,
          current_phase: election[0].current_phase
        },
        currentPosition: election[0].current_position,
        totalPositions: positions.length,
        currentPositionName: currentPositionName,
        candidates: normalizedCandidates,
        phase: election[0].current_phase || 'nomination',
        hasVoted: parseInt(hasVoted[0].count) > 0,
        hasNominated: hasReachedNominationLimit,
        nominationCount: nominationCount,
        maxNominationsPerVoter: maxNominationsPerVoter,
        userVote: null,
        votedCandidateName: votedCandidateName
      };
      
      console.log(`✅ Interface de votação carregada: ${normalizedCandidates.length} candidatos com nomes reais`);
      
      return res.json(response);
    } catch (error) {
      console.error('❌ Erro na interface de votação:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para obter log de votos
  app.get("/api/elections/vote-log/:electionId", async (req: any, res: any) => {
    try {
      const { electionId } = req.params;
      
      console.log(`🔍 Buscando log de votos para eleição: ${electionId}`);
      
      // Buscar todos os votos E indicações da eleição com informações do votante e candidato
      const votes = await sql`
        SELECT 
          ev.id,
          ev.voter_id,
          ev.candidate_id,
          ev.position_id,
          ev.vote_type,
          ev.voted_at as created_at,
          u_voter.name as voter_name,
          u_candidate.name as candidate_name
        FROM election_votes ev
        LEFT JOIN users u_voter ON ev.voter_id = u_voter.id
        LEFT JOIN users u_candidate ON ev.candidate_id = u_candidate.id
        WHERE ev.election_id = ${electionId}
        ORDER BY ev.voted_at DESC
      `;
      
      console.log(`✅ Log encontrado: ${votes.length} registro(s) (votos + indicações)`);
      
      return res.json(votes);
    } catch (error) {
      console.error('❌ Erro ao buscar log de votos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota de debug para verificar candidatos
  app.get("/api/elections/debug/:electionId", async (req: any, res: any) => {
    try {
      const electionId = parseInt(req.params.electionId);
      
      const candidates = await sql`
        SELECT * FROM election_candidates 
        WHERE election_id = ${electionId}
        ORDER BY position_id, candidate_name
      `;
      
      const votes = await sql`
        SELECT * FROM election_votes 
        WHERE election_id = ${electionId}
        ORDER BY position_id, voter_id
      `;
      
      return res.status(200).json({
        electionId,
        candidates,
        votes,
        totalCandidates: candidates.length,
        totalVotes: votes.length
      });
      
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // POST /api/elections/vote - Votação (Fase 3)
  app.post("/api/elections/vote", async (req: any, res: any) => {
    try {
      const body = req.body;
      const { electionId, positionId, candidateId, configId, phase } = body;
      const voterId = parseInt(req.headers['x-user-id']);

      console.log('📥 Recebendo voto/indicação:', { configId, candidateId, phase, voterId });

      if (!voterId) {
        console.log('❌ Usuário não autenticado');
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      let election: any;
      let currentPositionName: string;
      let voteType: string;

      // Suportar dois formatos: antigo (electionId+positionId) e novo (configId+phase)
      if (configId && phase) {
        console.log('🔍 Formato novo: configId + phase');
        // Formato novo: configId + phase
        election = await sql`
          SELECT 
            e.id as election_id,
            e.config_id,
            e.status,
            e.current_position,
            e.current_phase,
            e.created_at,
            e.updated_at,
            ec.positions,
            ec.max_nominations_per_voter
          FROM elections e
          JOIN election_configs ec ON e.config_id = ec.id
          WHERE e.config_id = ${configId}
          AND e.status = 'active'
          ORDER BY e.created_at DESC
          LIMIT 1
        `;

        console.log('🔍 Eleição encontrada:', election.length > 0 ? 'SIM' : 'NÃO');
        if (election.length > 0) {
          console.log('🔍 Dados brutos da eleição:', JSON.stringify(election[0]));
        }

        if (election.length === 0) {
          console.log('❌ Eleição não encontrada');
          return res.status(404).json({ error: 'Eleição não encontrada ou inativa' });
        }

        // Garantir que positions seja um array
        const positions = Array.isArray(election[0].positions) 
          ? election[0].positions 
          : JSON.parse(election[0].positions || '[]');
        
        if (!positions || positions.length === 0) {
          console.log('❌ Nenhuma posição configurada na eleição');
          return res.status(400).json({ error: 'Configuração inválida: nenhuma posição encontrada' });
        }

        const currentPos = election[0].current_position || 0;
        if (currentPos >= positions.length) {
          console.log('❌ Posição atual inválida:', currentPos, 'de', positions.length);
          return res.status(400).json({ error: 'Posição atual inválida na eleição' });
        }

        currentPositionName = positions[currentPos];
        voteType = phase === 'nomination' ? 'nomination' : 'vote';

        console.log('🔍 Dados da eleição:', {
          electionId: election[0].election_id,
          currentPosition: election[0].current_position,
          currentPositionName,
          voteType,
          maxNominations: election[0].max_nominations_per_voter
        });

        // Verificar limite de indicações para fase de nomination
        if (phase === 'nomination') {
          const maxNominations = election[0].max_nominations_per_voter || 1;
          
          const existingNominations = await sql`
            SELECT COUNT(*) as count FROM election_votes
            WHERE election_id = ${election[0].election_id}
            AND voter_id = ${voterId}
            AND position_id = ${currentPositionName}
            AND vote_type = 'nomination'
          `;

          const nominationCount = parseInt(existingNominations[0].count) || 0;
          
          console.log(`🔍 Limite de indicações: ${nominationCount}/${maxNominations}`);
          
          if (nominationCount >= maxNominations) {
            console.log('❌ Limite de indicações atingido');
            return res.status(400).json({ 
              error: `Você já atingiu o limite de ${maxNominations} indicação(ões) para esta posição` 
            });
          }
        } else {
          // Verificar se já votou (fase de votação)
          const existingVote = await sql`
            SELECT * FROM election_votes
            WHERE election_id = ${election[0].election_id}
            AND voter_id = ${voterId}
            AND position_id = ${currentPositionName}
            AND vote_type = 'vote'
          `;

          if (existingVote.length > 0) {
            console.log('❌ Já votou para esta posição');
            return res.status(400).json({ error: 'Você já votou para esta posição' });
          }
        }

        console.log('✅ Registrando indicação/voto...');

        // Registrar voto ou indicação
        await sql`
          INSERT INTO election_votes (election_id, voter_id, position_id, candidate_id, vote_type)
          VALUES (${election[0].election_id}, ${voterId}, ${currentPositionName}, ${candidateId}, ${voteType})
        `;
        
        console.log('✅ Indicação/voto registrado com sucesso');

      } else {
        // Formato antigo: electionId + positionId
        election = await sql`
          SELECT * FROM elections 
          WHERE id = ${electionId}
          AND status = 'active'
        `;

        if (election.length === 0) {
          return res.status(404).json({ error: 'Eleição não encontrada ou inativa' });
        }

        // Verificar se o usuário já votou para esta posição
        const existingVote = await sql`
          SELECT * FROM election_votes
          WHERE election_id = ${electionId}
          AND voter_id = ${voterId}
          AND position_id = ${positionId}
          AND vote_type = 'vote'
        `;

        if (existingVote.length > 0) {
          return res.status(400).json({ error: 'Você já votou para esta posição' });
        }

        // Registrar voto
        await sql`
          INSERT INTO election_votes (election_id, voter_id, position_id, candidate_id, vote_type)
          VALUES (${electionId}, ${voterId}, ${positionId}, ${candidateId}, 'vote')
        `;

        // Atualizar contador de votos
        await sql`
          UPDATE election_candidates 
          SET votes = votes + 1
          WHERE election_id = ${electionId}
          AND position_id = ${positionId}
          AND candidate_id = ${candidateId}
        `;
      }

      console.log('✅ Retornando sucesso');
      return res.status(200).json({ message: 'Voto registrado com sucesso' });

    } catch (error) {
      console.error('❌ Erro ao registrar voto:', error);
      console.error('❌ Stack trace:', error.stack);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  });
};
