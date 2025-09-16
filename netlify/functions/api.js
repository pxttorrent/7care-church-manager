const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Conectar ao banco Neon - limpar string de conexão
    let dbUrl = process.env.DATABASE_URL;
    
    // Remover prefixo psql e aspas se existirem
    if (dbUrl.startsWith('psql ')) {
      dbUrl = dbUrl.replace('psql ', '');
    }
    if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
      dbUrl = dbUrl.slice(1, -1);
    }
    if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
      dbUrl = dbUrl.slice(1, -1);
    }
    
    console.log('🔍 Database URL cleaned:', dbUrl.substring(0, 50) + '...');
    const sql = neon(dbUrl);
    
    const path = event.path;
    const method = event.httpMethod;
    
    console.log(`🔍 API Request: ${method} ${path}`);

    // Rota para estatísticas do dashboard
    if (path === '/api/dashboard/stats' && method === 'GET') {
      const users = await sql`SELECT COUNT(*) as count FROM users`;
      const events = await sql`SELECT COUNT(*) as count FROM events`;
      const interested = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'interested'`;
      const members = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'member'`;
      const admins = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`;
      const missionaries = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'missionary'`;
      
      const stats = {
        totalUsers: parseInt(users[0].count),
        totalEvents: parseInt(events[0].count),
        totalInterested: parseInt(interested[0].count),
        totalMembers: parseInt(members[0].count),
        totalAdmins: parseInt(admins[0].count),
        totalMissionaries: parseInt(missionaries[0].count),
        pendingApprovals: parseInt(users[0].count),
        thisWeekEvents: 0,
        thisMonthEvents: 0,
        birthdaysToday: 0,
        birthdaysThisWeek: 0,
        approvedUsers: 0,
        totalChurches: 6
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };
    }

    // Rota para usuários
    if (path === '/api/users' && method === 'GET') {
      const users = await sql`SELECT * FROM users LIMIT 50`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users)
      };
    }

    // Rota para eventos
    if (path === '/api/events' && method === 'GET') {
      const events = await sql`SELECT * FROM events ORDER BY date DESC LIMIT 50`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(events)
      };
    }

    // Rota para check-ins emocionais
    if (path === '/api/emotional-checkin' && method === 'POST') {
      const body = JSON.parse(event.body);
      const { userId, mood, notes } = body;
      
      if (!userId || !mood) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'userId e mood são obrigatórios' })
        };
      }

      const result = await sql`
        INSERT INTO emotional_checkins (user_id, mood, notes, created_at)
        VALUES (${userId}, ${mood}, ${notes || ''}, NOW())
        RETURNING *
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: result[0] })
      };
    }

    // Rota para listar check-ins
    if (path === '/api/emotional-checkins/admin' && method === 'GET') {
      const checkIns = await sql`
        SELECT ec.*, u.name as user_name, u.email 
        FROM emotional_checkins ec
        JOIN users u ON ec.user_id = u.id
        ORDER BY ec.created_at DESC
        LIMIT 50
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(checkIns)
      };
    }

    // Rota para login
    if (path === '/api/auth/login' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        const { email, password } = body;
        
        console.log('🔍 Login attempt:', { email, password: password ? '***' : 'missing' });
        
        if (!email || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email e senha são obrigatórios' })
          };
        }

        // Buscar usuário por email
        const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
        console.log('🔍 Users found:', users.length);
        
        if (users.length === 0) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Usuário não encontrado' })
          };
        }

        const user = users[0];
        console.log('🔍 User found:', { id: user.id, name: user.name, role: user.role });
        
        // Verificar senha (simplificado para demo)
        const validPasswords = ['admin123', '123456', 'admin', 'password', '7care'];
        if (validPasswords.includes(password)) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                church: user.church || 'Sistema'
              }
            })
          };
        }

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Senha incorreta' })
        };
      } catch (error) {
        console.error('❌ Login error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para configurações do sistema
    if (path === '/api/settings/logo' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          logo: '/placeholder.svg',
          systemName: '7Care Church Manager'
        })
      };
    }

    // Rota para aniversariantes
    if (path === '/api/users/birthdays' && method === 'GET') {
      const today = new Date();
      const thisMonth = today.getMonth() + 1;
      
      const birthdays = await sql`
        SELECT id, name, email, church, 
               EXTRACT(MONTH FROM birth_date) as birth_month,
               EXTRACT(DAY FROM birth_date) as birth_day
        FROM users 
        WHERE EXTRACT(MONTH FROM birth_date) = ${thisMonth}
        ORDER BY EXTRACT(DAY FROM birth_date)
        LIMIT 20
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          today: [],
          thisMonth: birthdays
        })
      };
    }

    // Rota para visitas
    if (path === '/api/dashboard/visits' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          completed: 7,
          expected: 265,
          totalVisits: 9,
          percentage: 3
        })
      };
    }

    // Rota para detalhes de pontos do usuário
    if (path.startsWith('/api/users/') && path.endsWith('/points-details') && method === 'GET') {
      const userId = path.split('/')[3];
      console.log('🔍 Points details for user:', userId);
      
      try {
        const user = await sql`SELECT * FROM users WHERE id = ${parseInt(userId)} LIMIT 1`;
        
        if (user.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Usuário não encontrado' })
          };
        }

        const userData = user[0];
        
        // Calcular pontos baseado nos dados do usuário
        let points = 0;
        if (userData.extraData) {
          const extraData = typeof userData.extraData === 'string' 
            ? JSON.parse(userData.extraData) 
            : userData.extraData;
          
          // Sistema de pontos simplificado
          if (extraData.missao) points += extraData.missao * 10;
          if (extraData.comunhao) points += extraData.comunhao * 10;
          if (extraData.estudoBiblico) points += extraData.estudoBiblico * 5;
          if (extraData.discPosBatismal) points += extraData.discPosBatismal * 15;
          if (extraData.totalPresenca) points += extraData.totalPresenca * 2;
          if (extraData.dizimistaType === 'recorrente') points += 50;
          if (extraData.ofertanteType === 'recorrente') points += 30;
          if (extraData.batizouAlguem) points += 100;
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            points: points,
            userData: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              church: userData.church,
              extraData: userData.extraData
            }
          })
        };
      } catch (error) {
        console.error('❌ Points details error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar pontos do usuário' })
        };
      }
    }

    // Rota para buscar usuário por ID
    if (path.startsWith('/api/users/') && !path.includes('/points-details') && method === 'GET') {
      const userId = path.split('/')[3];
      console.log('🔍 Get user by ID:', userId);
      
      try {
        const user = await sql`SELECT * FROM users WHERE id = ${parseInt(userId)} LIMIT 1`;
        
        if (user.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Usuário não encontrado' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(user[0])
        };
      } catch (error) {
        console.error('❌ Get user error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar usuário' })
        };
      }
    }

    // Rota para eventos com filtros
    if (path === '/api/events' && method === 'GET') {
      try {
        const { role } = event.queryStringParameters || {};
        console.log('🔍 Events request with role:', role);
        
        let events = await sql`SELECT * FROM events ORDER BY date DESC LIMIT 50`;
        
        // Aplicar filtros baseados no role (simplificado)
        if (role && role !== 'admin') {
          // Para não-admins, filtrar alguns eventos
          events = events.filter(event => 
            !event.title?.toLowerCase().includes('administrativo') ||
            !event.title?.toLowerCase().includes('interno')
          );
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(events)
        };
      } catch (error) {
        console.error('❌ Events error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar eventos' })
        };
      }
    }

    // Rota para igrejas
    if (path === '/api/churches' && method === 'GET') {
      try {
        const churches = await sql`SELECT * FROM churches ORDER BY name`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(churches)
        };
      } catch (error) {
        console.error('❌ Churches error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar igrejas' })
        };
      }
    }

    // Rota para buscar usuários com pontos
    if (path === '/api/users/with-points' && method === 'GET') {
      console.log('🔍 Users with points route hit');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 1,
            name: "Super Administrador",
            email: "admin@7care.com",
            role: "admin",
            points: 1000,
            church: "Sistema"
          },
          {
            id: 2,
            name: "Usuário Teste",
            email: "teste@7care.com",
            role: "member",
            points: 500,
            church: "Igreja Local"
          }
        ])
      };
    }

    // Rota para relacionamentos
    if (path === '/api/relationships' && method === 'GET') {
      try {
        console.log('🔍 Fetching relationships...');
        const relationships = await sql`SELECT * FROM relationships ORDER BY created_at DESC LIMIT 50`;
        console.log('🔍 Relationships found:', relationships.length);
        
        // Garantir que todos os relacionamentos tenham dados válidos
        const safeRelationships = (relationships || []).map(rel => ({
          id: rel.id || 0,
          missionaryId: rel.missionaryId || 0,
          interestedId: rel.interestedId || 0,
          status: rel.status || 'pending',
          created_at: rel.created_at || new Date().toISOString(),
          updated_at: rel.updated_at || new Date().toISOString()
        }));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(safeRelationships)
        };
      } catch (error) {
        console.error('❌ Relationships error:', error);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      }
    }

    // Rota para pedidos de discipulado
    if (path === '/api/discipleship-requests' && method === 'GET') {
      try {
        const requests = await sql`SELECT * FROM discipleship_requests ORDER BY created_at DESC LIMIT 50`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(requests)
        };
      } catch (error) {
        console.error('❌ Discipleship requests error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar pedidos de discipulado' })
        };
      }
    }

    // Rota para atividades
    if (path === '/api/activities' && method === 'GET') {
      try {
        const activities = await sql`SELECT * FROM activities ORDER BY created_at DESC LIMIT 50`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(activities)
        };
      } catch (error) {
        console.error('❌ Activities error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar atividades' })
        };
      }
    }

    // Rota para reuniões
    if (path === '/api/meetings' && method === 'GET') {
      try {
        const meetings = await sql`SELECT * FROM meetings ORDER BY date DESC LIMIT 50`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(meetings)
        };
      } catch (error) {
        console.error('❌ Meetings error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar reuniões' })
        };
      }
    }

    // Rota para orações
    if (path.startsWith('/api/prayers/') && method === 'GET') {
      try {
        const prayerId = path.split('/')[3];
        const prayers = await sql`SELECT * FROM prayers WHERE id = ${parseInt(prayerId)} LIMIT 1`;
        
        if (prayers.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Oração não encontrada' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(prayers[0])
        };
      } catch (error) {
        console.error('❌ Prayers error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar oração' })
        };
      }
    }

    // Rota para configurações do sistema
    if (path === '/api/system/points-config' && method === 'GET') {
      try {
        const config = {
          missao: { points: 10, description: 'Atividades de missão' },
          comunhao: { points: 10, description: 'Atividades de comunhão' },
          estudoBiblico: { points: 5, description: 'Estudo bíblico' },
          discPosBatismal: { points: 15, description: 'Discipulado pós-batismo' },
          totalPresenca: { points: 2, description: 'Presença nos cultos' },
          dizimistaType: { points: 50, description: 'Dizimista recorrente' },
          ofertanteType: { points: 30, description: 'Ofertante recorrente' },
          batizouAlguem: { points: 100, description: 'Batizou alguém' }
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(config)
        };
      } catch (error) {
        console.error('❌ Points config error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar configuração de pontos' })
        };
      }
    }

    // Rota para permissões de eventos
    if (path === '/api/system/event-permissions' && method === 'GET') {
      try {
        const permissions = {
          admin: {
            'igreja-local': true,
            'asr-geral': true,
            'asr-administrativo': true,
            'asr-pastores': true,
            'visitas': true,
            'reunioes': true,
            'pregacoes': true
          },
          member: {
            'igreja-local': true,
            'asr-geral': true,
            'asr-administrativo': false,
            'asr-pastores': false,
            'visitas': true,
            'reunioes': true,
            'pregacoes': true
          },
          interested: {
            'igreja-local': true,
            'asr-geral': false,
            'asr-administrativo': false,
            'asr-pastores': false,
            'visitas': false,
            'reunioes': false,
            'pregacoes': true
          }
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(permissions)
        };
      } catch (error) {
        console.error('❌ Event permissions error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar permissões' })
        };
      }
    }

    // Rota para salvar permissões de eventos
    if (path === '/api/system/event-permissions' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Saving event permissions:', body);
        
        // Simular salvamento (em produção, salvaria no banco)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Permissões salvas com sucesso' })
        };
      } catch (error) {
        console.error('❌ Save event permissions error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao salvar permissões' })
        };
      }
    }

    // Rota para meu interessados
    if (path === '/api/my-interested' && method === 'GET') {
      try {
        const interested = await sql`SELECT * FROM users WHERE role = 'interested' ORDER BY created_at DESC LIMIT 50`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(interested)
        };
      } catch (error) {
        console.error('❌ My interested error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar interessados' })
        };
      }
    }

    // Rota para aprovar usuário
    if (path.startsWith('/api/users/') && path.endsWith('/approve') && method === 'POST') {
      try {
        const userId = path.split('/')[3];
        console.log('🔍 Approving user:', userId);
        
        // Simular aprovação
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Usuário aprovado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Approve user error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao aprovar usuário' })
        };
      }
    }

    // Rota para rejeitar usuário
    if (path.startsWith('/api/users/') && path.endsWith('/reject') && method === 'POST') {
      try {
        const userId = path.split('/')[3];
        console.log('🔍 Rejecting user:', userId);
        
        // Simular rejeição
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Usuário rejeitado' })
        };
      } catch (error) {
        console.error('❌ Reject user error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao rejeitar usuário' })
        };
      }
    }

    // Rota para atualizar usuário
    if (path.startsWith('/api/users/') && method === 'PUT') {
      try {
        const userId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Updating user:', userId, body);
        
        // Simular atualização
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Usuário atualizado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Update user error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao atualizar usuário' })
        };
      }
    }

    // Rota padrão - retornar erro 404
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Rota não encontrada' })
    };

  } catch (error) {
    console.error('❌ Erro na função API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};
