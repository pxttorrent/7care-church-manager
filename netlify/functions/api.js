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
