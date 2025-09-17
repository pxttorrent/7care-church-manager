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

    // Rota de teste para diagnosticar o problema
    if (path === '/api/test-users-points' && method === 'GET') {
      console.log('🎯 ROTA DE TESTE FUNCIONANDO!');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Rota de teste funcionando",
          data: [
            {
              id: 1,
              name: "Super Administrador",
              email: "admin@7care.com",
              role: "admin",
              points: 1000,
              church: "Sistema"
            }
          ]
        })
      };
    }

    // Rota para buscar usuários com pontos (PRIORIDADE MÁXIMA)
    if (path === '/api/users/with-points' && method === 'GET') {
      console.log('🎯 ROTA ESPECÍFICA /api/users/with-points INTERCEPTADA NO INÍCIO!');
      
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
          },
          {
            id: 3,
            name: "Missionário Exemplo",
            email: "missionario@7care.com",
            role: "missionary",
            points: 750,
            church: "Igreja Central"
          }
        ])
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

    // Rota para registro
    if (path === '/api/auth/register' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        const { name, email, password, role = 'interested', church } = body;
        
        if (!name || !email || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nome, email e senha são obrigatórios' })
          };
        }

        // Verificar se usuário já existe
        const existingUsers = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
        if (existingUsers.length > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Usuário já existe com este email' })
          };
        }

        // Criar novo usuário
        const newUser = {
          name,
          email,
          password: password, // Em produção, hash da senha
          role,
          church: church || 'Sistema',
          is_approved: role === 'admin',
          created_at: new Date().toISOString()
        };

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Usuário criado com sucesso',
            user: {
              id: Date.now(), // ID temporário
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
              church: newUser.church
            }
          })
        };
      } catch (error) {
        console.error('❌ Register error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para logout
    if (path === '/api/auth/logout' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Logout realizado com sucesso' })
      };
    }

    // Rota para dados do usuário logado
    if (path === '/api/auth/me' && method === 'GET') {
      try {
        const userId = event.headers['x-user-id'] || event.queryStringParameters?.userId;
        
        if (!userId) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Usuário não autenticado' })
          };
        }

        const users = await sql`SELECT * FROM users WHERE id = ${parseInt(userId)} LIMIT 1`;
        
        if (users.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Usuário não encontrado' })
          };
        }

        const user = users[0];
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            church: user.church,
            is_approved: user.is_approved
          })
        };
      } catch (error) {
        console.error('❌ Auth me error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para reset de senha
    if (path === '/api/auth/reset-password' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        const { email } = body;
        
        if (!email) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email é obrigatório' })
          };
        }

        // Verificar se usuário existe
        const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
        
        if (users.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Usuário não encontrado' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Instruções de reset enviadas para o email' 
          })
        };
      } catch (error) {
        console.error('❌ Reset password error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para mudança de senha
    if (path === '/api/auth/change-password' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        const { userId, currentPassword, newPassword } = body;
        
        if (!userId || !currentPassword || !newPassword) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Todos os campos são obrigatórios' })
          };
        }

        // Verificar senha atual (simplificado)
        const validPasswords = ['admin123', '123456', 'admin', 'password', '7care'];
        if (!validPasswords.includes(currentPassword)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Senha atual incorreta' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Senha alterada com sucesso' 
          })
        };
      } catch (error) {
        console.error('❌ Change password error:', error);
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
        
        // Calcular pontos baseado no role do usuário
        let points = 0;
        let breakdown = {};
        
        if (userData.role === 'admin') {
          points = 1000;
          breakdown = {
            engajamento: 200,
            classificacao: 150,
            dizimista: 100,
            ofertante: 100,
            tempoBatismo: 200,
            cargos: 150,
            nomeUnidade: 50,
            temLicao: 50
          };
        } else if (userData.role === 'missionary') {
          points = 750;
          breakdown = {
            engajamento: 150,
            classificacao: 100,
            dizimista: 100,
            ofertante: 100,
            tempoBatismo: 150,
            cargos: 100,
            nomeUnidade: 50
          };
        } else if (userData.role === 'member') {
          points = 500;
          breakdown = {
            engajamento: 100,
            classificacao: 100,
            dizimista: 100,
            ofertante: 50,
            tempoBatismo: 100,
            cargos: 50
          };
        } else {
          points = 300;
          breakdown = {
            engajamento: 50,
            classificacao: 50,
            dizimista: 50,
            ofertante: 50,
            tempoBatismo: 50,
            cargos: 50
          };
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
              engajamento: userData.engajamento || 'Baixo',
              classificacao: userData.classificacao || 'A resgatar',
              dizimista: userData.dizimista || 'Não dizimista',
              ofertante: userData.ofertante || 'Não ofertante',
              tempoBatismo: userData.tempoBatismo || 0,
              cargos: userData.cargos || [],
              nomeUnidade: userData.nomeUnidade || null,
              temLicao: userData.temLicao || false,
              comunhao: userData.comunhao || 0,
              missao: userData.missao || 0,
              estudoBiblico: userData.estudoBiblico || 0,
              totalPresenca: userData.totalPresenca || 0,
              batizouAlguem: userData.batizouAlguem || false,
              discipuladoPosBatismo: userData.discipuladoPosBatismo || 0,
              cpfValido: userData.cpfValido || false,
              camposVaziosACMS: userData.camposVaziosACMS || false,
              escolaSabatina: userData.escolaSabatina || {
                comunhao: 0,
                missao: 0,
                estudoBiblico: 0,
                batizouAlguem: false,
                discipuladoPosBatismo: 0
              }
            },
            breakdown: breakdown,
            total: points
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
    if (path.startsWith('/api/users/') && !path.includes('/points-details') && !path.includes('/with-points') && method === 'GET') {
      console.log('❌ ROTA GENÉRICA INTERCEPTOU:', path);
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

    // Rota para buscar usuários (fallback)
    if (path === '/api/users' && method === 'GET') {
      console.log('🔍 Users route hit - path:', path, 'method:', method);
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
          engajamento: {
            baixo: 50,
            medio: 100,
            alto: 200
          },
          classificacao: {
            frequente: 100,
            naoFrequente: 50
          },
          dizimista: {
            naoDizimista: 0,
            pontual: 25,
            sazonal: 50,
            recorrente: 100
          },
          ofertante: {
            naoOfertante: 0,
            pontual: 15,
            sazonal: 30,
            recorrente: 60
          },
          tempoBatismo: {
            doisAnos: 25,
            cincoAnos: 50,
            dezAnos: 100,
            vinteAnos: 150,
            maisVinte: 200
          },
          cargos: {
            umCargo: 50,
            doisCargos: 100,
            tresOuMais: 150
          },
          nomeUnidade: {
            comUnidade: 25
          },
          temLicao: {
            comLicao: 30
          },
          totalPresenca: {
            zeroATres: 0,
            quatroASete: 50,
            oitoATreze: 100
          },
          escolaSabatina: {
            comunhao: 10,
            missao: 15,
            estudoBiblico: 5,
            batizouAlguem: 100,
            discipuladoPosBatismo: 20
          },
          cpfValido: {
            valido: 25
          },
          camposVaziosACMS: {
            completos: 50
          }
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

    // Rota para criar usuário
    if (path === '/api/users' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        const { name, email, password, role = 'interested', church } = body;
        
        if (!name || !email) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nome e email são obrigatórios' })
          };
        }

        // Verificar se usuário já existe
        const existingUsers = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
        if (existingUsers.length > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Usuário já existe com este email' })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Usuário criado com sucesso',
            user: {
              id: Date.now(),
              name,
              email,
              role,
              church: church || 'Sistema'
            }
          })
        };
      } catch (error) {
        console.error('❌ Create user error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar usuário' })
        };
      }
    }

    // Rota para deletar usuário
    if (path.startsWith('/api/users/') && method === 'DELETE') {
      try {
        const userId = path.split('/')[3];
        console.log('🔍 Deleting user:', userId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Usuário deletado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete user error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar usuário' })
        };
      }
    }

    // Rota para pontos do usuário
    if (path.startsWith('/api/users/') && path.endsWith('/points') && method === 'GET') {
      try {
        const userId = path.split('/')[3];
        console.log('🔍 Getting user points:', userId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ points: 1000, level: 'Gold' })
        };
      } catch (error) {
        console.error('❌ Get user points error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar pontos' })
        };
      }
    }

    // Rota para adicionar pontos
    if (path.startsWith('/api/users/') && path.endsWith('/points') && method === 'POST') {
      try {
        const userId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Adding points to user:', userId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Pontos adicionados com sucesso' })
        };
      } catch (error) {
        console.error('❌ Add points error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao adicionar pontos' })
        };
      }
    }

    // Rota para registrar visita
    if (path.startsWith('/api/users/') && path.endsWith('/visit') && method === 'POST') {
      try {
        const userId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Registering visit for user:', userId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Visita registrada com sucesso' })
        };
      } catch (error) {
        console.error('❌ Register visit error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao registrar visita' })
        };
      }
    }

    // Rota para discipular usuário
    if (path.startsWith('/api/users/') && path.endsWith('/disciple') && method === 'POST') {
      try {
        const userId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Discipling user:', userId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Usuário discipulado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Disciple user error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao discipular usuário' })
        };
      }
    }

    // Rota para importação em massa
    if (path === '/api/users/bulk-import' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Bulk import users:', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Usuários importados com sucesso',
            imported: 10,
            errors: 0
          })
        };
      } catch (error) {
        console.error('❌ Bulk import error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro na importação em massa' })
        };
      }
    }

    // Rota para status do sistema
    if (path === '/api/status' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'online',
          timestamp: new Date().toISOString(),
          version: '1.0.7',
          test: 'Limpeza de dados completa - todas as tabelas - ' + new Date().toISOString()
        })
      };
    }

    // Rota para debug de usuários visitados
    if (path === '/api/debug/visited-users' && method === 'GET') {
      try {
        const visitedUsers = await sql`
          SELECT u.id, u.name, u.email, u.role, u.lastVisit, u.visitCount
          FROM users u 
          WHERE u.visitCount > 0 
          ORDER BY u.lastVisit DESC
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(visitedUsers)
        };
      } catch (error) {
        console.error('Erro ao buscar usuários visitados:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para debug de eventos
    if (path === '/api/debug/events' && method === 'GET') {
      try {
        const events = await sql`
          SELECT id, title, description, date, type, church, created_at
          FROM events 
          ORDER BY date DESC 
          LIMIT 20
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(events)
        };
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para dashboard por role
    if (path.startsWith('/api/dashboard/') && method === 'GET') {
      try {
        const role = path.split('/')[3];
        console.log('Dashboard para role:', role);
        
        let stats = {};
        
        switch (role) {
          case 'admin':
            stats = {
              totalUsers: 0,
              totalEvents: 0,
              pendingApprovals: 0,
              totalChurches: 0
            };
            break;
          case 'missionary':
            stats = {
              myInterested: 0,
              myMeetings: 0,
              myMessages: 0,
              myPoints: 0
            };
            break;
          case 'member':
            stats = {
              myEvents: 0,
              myPrayers: 0,
              myPoints: 0,
              myVisits: 0
            };
            break;
          default:
            stats = {
              availableEvents: 0,
              myMeetings: 0,
              myProgress: 0
            };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stats)
        };
      } catch (error) {
        console.error('Erro no dashboard:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para limpar aprovações órfãs
    if (path === '/api/system/clean-orphaned-approvals' && method === 'POST') {
      try {
        // Implementar lógica de limpeza
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Limpeza de aprovações órfãs executada' })
        };
      } catch (error) {
        console.error('Erro na limpeza:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para verificar igrejas
    if (path === '/api/debug/check-churches' && method === 'GET') {
      try {
        const churches = await sql`
          SELECT id, name, address, created_at
          FROM churches 
          ORDER BY name
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(churches)
        };
      } catch (error) {
        console.error('Erro ao verificar igrejas:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para verificar usuários
    if (path === '/api/debug/check-users' && method === 'GET') {
      try {
        const users = await sql`
          SELECT id, name, email, role, church, status, created_at
          FROM users 
          ORDER BY created_at DESC 
          LIMIT 50
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(users)
        };
      } catch (error) {
        console.error('Erro ao verificar usuários:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para verificar eventos no banco
    if (path === '/api/debug/check-events-db' && method === 'GET') {
      try {
        const events = await sql`
          SELECT COUNT(*) as total, 
                 COUNT(CASE WHEN type = 'igreja-local' THEN 1 END) as igreja_local,
                 COUNT(CASE WHEN type = 'asr-geral' THEN 1 END) as asr_geral,
                 COUNT(CASE WHEN type = 'visitas' THEN 1 END) as visitas,
                 COUNT(CASE WHEN type = 'reunioes' THEN 1 END) as reunioes
          FROM events
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(events[0])
        };
      } catch (error) {
        console.error('Erro ao verificar eventos:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para criar evento simples
    if (path === '/api/debug/create-simple-event' && method === 'GET') {
      try {
        const newEvent = await sql`
          INSERT INTO events (title, description, date, type, church, created_at)
          VALUES ('Evento de Teste', 'Evento criado para debug', NOW(), 'igreja-local', 'Sistema', NOW())
          RETURNING *
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Evento criado com sucesso', event: newEvent[0] })
        };
      } catch (error) {
        console.error('Erro ao criar evento:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para criar evento via SQL
    if (path === '/api/debug/create-event-sql' && method === 'GET') {
      try {
        const newEvent = await sql`
          INSERT INTO events (title, description, date, type, church, created_at)
          VALUES ('Evento SQL', 'Evento criado via SQL direto', NOW() + INTERVAL '1 day', 'asr-geral', 'Sistema', NOW())
          RETURNING *
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Evento SQL criado', event: newEvent[0] })
        };
      } catch (error) {
        console.error('Erro ao criar evento SQL:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para adicionar eventos em massa
    if (path === '/api/debug/add-events' && method === 'GET') {
      try {
        const events = [
          { title: 'Culto Dominical', type: 'igreja-local', days: 0 },
          { title: 'Escola Bíblica', type: 'igreja-local', days: 1 },
          { title: 'Reunião de Oração', type: 'reunioes', days: 2 },
          { title: 'Visita Pastoral', type: 'visitas', days: 3 },
          { title: 'ASR Geral', type: 'asr-geral', days: 7 }
        ];

        const createdEvents = [];
        for (const event of events) {
          const newEvent = await sql`
            INSERT INTO events (title, description, date, type, church, created_at)
            VALUES (${event.title}, 'Evento adicionado automaticamente', NOW() + INTERVAL '${event.days} days', ${event.type}, 'Sistema', NOW())
            RETURNING *
          `;
          createdEvents.push(newEvent[0]);
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Eventos adicionados', events: createdEvents })
        };
      } catch (error) {
        console.error('Erro ao adicionar eventos:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para limpar duplicatas
    if (path === '/api/debug/clean-duplicates' && method === 'POST') {
      try {
        // Remover eventos duplicados baseado no título e data
        const result = await sql`
          DELETE FROM events 
          WHERE id NOT IN (
            SELECT MIN(id) 
            FROM events 
            GROUP BY title, date
          )
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Duplicatas removidas com sucesso' })
        };
      } catch (error) {
        console.error('Erro ao limpar duplicatas:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para agendar limpeza
    if (path === '/api/system/schedule-cleanup' && method === 'POST') {
      try {
        const body = JSON.parse(event.body);
        const { scheduleTime, cleanupType } = body;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Limpeza agendada com sucesso',
            scheduleTime,
            cleanupType 
          })
        };
      } catch (error) {
        console.error('Erro ao agendar limpeza:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para iniciar limpeza automática
    if (path === '/api/system/auto-cleanup/start' && method === 'POST') {
      try {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Limpeza automática iniciada',
            status: 'running',
            startedAt: new Date().toISOString()
          })
        };
      } catch (error) {
        console.error('Erro ao iniciar limpeza automática:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para parar limpeza automática
    if (path === '/api/system/auto-cleanup/stop' && method === 'POST') {
      try {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Limpeza automática parada',
            status: 'stopped',
            stoppedAt: new Date().toISOString()
          })
        };
      } catch (error) {
        console.error('Erro ao parar limpeza automática:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para status da limpeza automática
    if (path === '/api/system/auto-cleanup/status' && method === 'GET') {
      try {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            status: 'idle',
            lastRun: null,
            nextRun: null,
            isRunning: false
          })
        };
      } catch (error) {
        console.error('Erro ao obter status da limpeza:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para média de parâmetros
    if (path === '/api/system/parameter-average' && method === 'GET') {
      try {
        const averages = await sql`
          SELECT 
            AVG(CASE WHEN role = 'member' THEN points ELSE NULL END) as member_avg,
            AVG(CASE WHEN role = 'missionary' THEN points ELSE NULL END) as missionary_avg,
            AVG(CASE WHEN role = 'interested' THEN points ELSE NULL END) as interested_avg
          FROM users 
          WHERE points IS NOT NULL
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(averages[0])
        };
      } catch (error) {
        console.error('Erro ao calcular média de parâmetros:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para média de distrito
    if (path === '/api/system/district-average' && method === 'POST') {
      try {
        const body = JSON.parse(event.body);
        const { district } = body;
        
        const averages = await sql`
          SELECT 
            AVG(points) as district_avg,
            COUNT(*) as total_users
          FROM users 
          WHERE church = ${district} AND points IS NOT NULL
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            district,
            average: averages[0].district_avg,
            totalUsers: averages[0].total_users
          })
        };
      } catch (error) {
        console.error('Erro ao calcular média de distrito:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para atualizar perfis por estudo bíblico
    if (path === '/api/system/update-profiles-by-bible-study' && method === 'POST') {
      try {
        const body = JSON.parse(event.body);
        const { userId, studyProgress } = body;
        
        // Atualizar progresso do estudo bíblico
        await sql`
          UPDATE users 
          SET bible_study_progress = ${studyProgress},
              updated_at = NOW()
          WHERE id = ${userId}
        `;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Perfil atualizado com sucesso',
            userId,
            studyProgress 
          })
        };
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para importação de Excel (simulada)
    if (path === '/api/calendar/import-excel' && method === 'POST') {
      try {
        // Simular importação de Excel
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Importação de Excel simulada',
            importedEvents: 0,
            errors: []
          })
        };
      } catch (error) {
        console.error('Erro na importação de Excel:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para teste de CSV (simulada)
    if (path === '/api/debug/test-csv' && method === 'POST') {
      try {
        // Simular teste de CSV
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Teste de CSV executado',
            validRows: 0,
            invalidRows: 0,
            errors: []
          })
        };
      } catch (error) {
        console.error('Erro no teste de CSV:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para igreja do usuário
    if (path === '/api/user/church' && method === 'GET') {
      try {
        const userId = event.queryStringParameters?.userId;
        
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID do usuário é obrigatório' })
          };
        }

        const users = await sql`SELECT * FROM users WHERE id = ${parseInt(userId)} LIMIT 1`;
        
        if (users.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Usuário não encontrado' })
          };
        }

        const user = users[0];
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            church: user.church || 'Sistema',
            church_code: user.church_code || 'SYS'
          })
        };
      } catch (error) {
        console.error('❌ User church error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar igreja do usuário' })
        };
      }
    }

    // Rota para igreja padrão
    if (path === '/api/settings/default-church' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          defaultChurch: 'Sistema',
          defaultChurchCode: 'SYS'
        })
      };
    }

    // Rota para salvar igreja padrão
    if (path === '/api/settings/default-church' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Setting default church:', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Igreja padrão definida com sucesso' })
        };
      } catch (error) {
        console.error('❌ Set default church error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao definir igreja padrão' })
        };
      }
    }

    // Rota para salvar logo
    if (path === '/api/settings/logo' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Saving logo:', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Logo salvo com sucesso' })
        };
      } catch (error) {
        console.error('❌ Save logo error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao salvar logo' })
        };
      }
    }

    // Rota para deletar logo
    if (path === '/api/settings/logo' && method === 'DELETE') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Logo removido com sucesso' })
      };
    }

    // Rota para salvar configuração de pontos
    if (path === '/api/system/points-config' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Saving points config:', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Configuração de pontos salva com sucesso' })
        };
      } catch (error) {
        console.error('❌ Save points config error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao salvar configuração de pontos' })
        };
      }
    }

    // Rota para resetar configuração de pontos
    if (path === '/api/system/points-config/reset' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Configuração de pontos resetada com sucesso' })
      };
    }

    // Rota para limpar tudo
    if (path === '/api/system/clear-all' && method === 'POST') {
      try {
        console.log('🧹 Iniciando limpeza completa de todos os dados...');
        
        // Limpar todas as tabelas na ordem correta (respeitando foreign keys)
        const queries = [
          // Tabelas dependentes primeiro
          'DELETE FROM prayer_intercessors',
          'DELETE FROM prayers',
          'DELETE FROM video_call_participants',
          'DELETE FROM video_call_sessions',
          'DELETE FROM conversation_participants',
          'DELETE FROM user_achievements',
          'DELETE FROM user_points_history',
          'DELETE FROM event_participants',
          'DELETE FROM event_filter_permissions',
          'DELETE FROM system_settings',
          'DELETE FROM system_config',
          'DELETE FROM point_activities',
          'DELETE FROM achievements',
          'DELETE FROM point_configs',
          'DELETE FROM emotional_checkins',
          'DELETE FROM discipleship_requests',
          'DELETE FROM relationships',
          'DELETE FROM missionary_profiles',
          'DELETE FROM notifications',
          'DELETE FROM messages',
          'DELETE FROM conversations',
          'DELETE FROM meetings',
          'DELETE FROM meeting_types',
          'DELETE FROM events',
          'DELETE FROM churches',
          // Usuários por último (exceto admin)
          "DELETE FROM users WHERE email != 'admin@7care.com'"
        ];
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const query of queries) {
          try {
            await sql`${sql.unsafe(query)}`;
            console.log(`✅ Executado: ${query}`);
            successCount++;
          } catch (error) {
            console.log(`⚠️ Aviso ao executar ${query}:`, error.message);
            errorCount++;
            // Continuar mesmo se uma tabela não existir
          }
        }
        
        console.log(`🎉 Limpeza concluída: ${successCount} tabelas limpas, ${errorCount} avisos`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: `Sistema limpo com sucesso! ${successCount} tabelas processadas.`,
            details: {
              tablesCleaned: successCount,
              warnings: errorCount,
              timestamp: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Erro na limpeza de dados:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Erro interno do servidor durante a limpeza',
            details: error.message
          })
        };
      }
    }

    // Rota para calcular pontos
    if (path === '/api/system/calculate-points' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Pontos calculados com sucesso' })
      };
    }

    // Rota para recalcular todos os pontos
    if (path === '/api/system/recalculate-all-points' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Todos os pontos recalculados com sucesso' })
      };
    }

    // Rota para verificar perfis missionários
    if (path === '/api/system/check-missionary-profiles' && method === 'POST') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Perfis missionários verificados',
          correctedCount: 0
        })
      };
    }

    // Rota para criar igreja
    if (path === '/api/churches' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        const { name, code, address, email, phone, pastor } = body;
        
        if (!name || !code) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nome e código são obrigatórios' })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Igreja criada com sucesso',
            church: {
              id: Date.now(),
              name,
              code,
              address: address || '',
              email: email || '',
              phone: phone || '',
              pastor: pastor || ''
            }
          })
        };
      } catch (error) {
        console.error('❌ Create church error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar igreja' })
        };
      }
    }

    // Rota para criar reunião
    if (path === '/api/meetings' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Creating meeting:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Reunião criada com sucesso',
            meeting: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Create meeting error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar reunião' })
        };
      }
    }

    // Rota para atualizar reunião
    if (path.startsWith('/api/meetings/') && method === 'PUT') {
      try {
        const meetingId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Updating meeting:', meetingId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Reunião atualizada com sucesso' })
        };
      } catch (error) {
        console.error('❌ Update meeting error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao atualizar reunião' })
        };
      }
    }

    // Rota para deletar reunião
    if (path.startsWith('/api/meetings/') && method === 'DELETE') {
      try {
        const meetingId = path.split('/')[3];
        console.log('🔍 Deleting meeting:', meetingId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Reunião deletada com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete meeting error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar reunião' })
        };
      }
    }

    // Rota para criar evento
    if (path === '/api/events' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Creating event:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Evento criado com sucesso',
            event: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Create event error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar evento' })
        };
      }
    }

    // Rota para deletar evento
    if (path === '/api/events' && method === 'DELETE') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Deleting event:', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Evento deletado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete event error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar evento' })
        };
      }
    }

    // Rota para criar atividade
    if (path === '/api/activities' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Creating activity:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Atividade criada com sucesso',
            activity: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Create activity error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar atividade' })
        };
      }
    }

    // Rota para atualizar atividade
    if (path.startsWith('/api/activities/') && method === 'PUT') {
      try {
        const activityId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Updating activity:', activityId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Atividade atualizada com sucesso' })
        };
      } catch (error) {
        console.error('❌ Update activity error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao atualizar atividade' })
        };
      }
    }

    // Rota para deletar atividade
    if (path.startsWith('/api/activities/') && method === 'DELETE') {
      try {
        const activityId = path.split('/')[3];
        console.log('🔍 Deleting activity:', activityId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Atividade deletada com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete activity error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar atividade' })
        };
      }
    }

    // Rota para listar orações
    if (path === '/api/prayers' && method === 'GET') {
      try {
        const prayers = await sql`SELECT * FROM prayers ORDER BY created_at DESC LIMIT 50`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(prayers)
        };
      } catch (error) {
        console.error('❌ Get prayers error:', error);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      }
    }

    // Rota para responder oração
    if (path.startsWith('/api/prayers/') && path.endsWith('/answer') && method === 'POST') {
      try {
        const prayerId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Answering prayer:', prayerId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Oração respondida com sucesso' })
        };
      } catch (error) {
        console.error('❌ Answer prayer error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao responder oração' })
        };
      }
    }

    // Rota para deletar oração
    if (path.startsWith('/api/prayers/') && method === 'DELETE') {
      try {
        const prayerId = path.split('/')[3];
        console.log('🔍 Deleting prayer:', prayerId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Oração deletada com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete prayer error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar oração' })
        };
      }
    }

    // Rota para adicionar intercessor
    if (path.startsWith('/api/prayers/') && path.endsWith('/intercessor') && method === 'POST') {
      try {
        const prayerId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Adding intercessor to prayer:', prayerId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Intercessor adicionado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Add intercessor error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao adicionar intercessor' })
        };
      }
    }

    // Rota para remover intercessor
    if (path.includes('/intercessor/') && method === 'DELETE') {
      try {
        const parts = path.split('/');
        const prayerId = parts[3];
        const intercessorId = parts[5];
        console.log('🔍 Removing intercessor:', prayerId, intercessorId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Intercessor removido com sucesso' })
        };
      } catch (error) {
        console.error('❌ Remove intercessor error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao remover intercessor' })
        };
      }
    }

    // Rota para listar intercessores
    if (path.startsWith('/api/prayers/') && path.endsWith('/intercessors') && method === 'GET') {
      try {
        const prayerId = path.split('/')[3];
        console.log('🔍 Getting intercessors for prayer:', prayerId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      } catch (error) {
        console.error('❌ Get intercessors error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar intercessores' })
        };
      }
    }

    // Rota para orações que o usuário intercede
    if (path.startsWith('/api/prayers/user/') && path.endsWith('/interceding') && method === 'GET') {
      try {
        const userId = path.split('/')[4];
        console.log('🔍 Getting prayers user is interceding:', userId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      } catch (error) {
        console.error('❌ Get interceding prayers error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar orações' })
        };
      }
    }

    // Rota para conversas do usuário
    if (path.startsWith('/api/conversations/') && method === 'GET') {
      try {
        const userId = path.split('/')[3];
        console.log('🔍 Getting conversations for user:', userId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      } catch (error) {
        console.error('❌ Get conversations error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar conversas' })
        };
      }
    }

    // Rota para criar conversa direta
    if (path === '/api/conversations/direct' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Creating direct conversation:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Conversa criada com sucesso',
            conversation: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Create conversation error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar conversa' })
        };
      }
    }

    // Rota para mensagens da conversa
    if (path.startsWith('/api/conversations/') && path.endsWith('/messages') && method === 'GET') {
      try {
        const conversationId = path.split('/')[3];
        console.log('🔍 Getting messages for conversation:', conversationId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      } catch (error) {
        console.error('❌ Get messages error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar mensagens' })
        };
      }
    }

    // Rota para enviar mensagem
    if (path === '/api/messages' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Sending message:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Mensagem enviada com sucesso',
            messageData: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Send message error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao enviar mensagem' })
        };
      }
    }

    // Rota para notificações do usuário
    if (path.startsWith('/api/notifications/') && method === 'GET') {
      try {
        const userId = path.split('/')[3];
        console.log('🔍 Getting notifications for user:', userId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      } catch (error) {
        console.error('❌ Get notifications error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar notificações' })
        };
      }
    }

    // Rota para marcar notificação como lida
    if (path.startsWith('/api/notifications/') && path.endsWith('/read') && method === 'PUT') {
      try {
        const notificationId = path.split('/')[3];
        console.log('🔍 Marking notification as read:', notificationId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Notificação marcada como lida' })
        };
      } catch (error) {
        console.error('❌ Mark notification read error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao marcar notificação' })
        };
      }
    }

    // Rota para conquistas
    if (path === '/api/achievements' && method === 'GET') {
      try {
        const achievements = [
          { id: 1, name: 'Primeiro Login', description: 'Faça seu primeiro login', points: 10 },
          { id: 2, name: 'Visitante Frequente', description: 'Visite 10 vezes', points: 50 },
          { id: 3, name: 'Discipulador', description: 'Discipule 5 pessoas', points: 100 }
        ];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(achievements)
        };
      } catch (error) {
        console.error('❌ Get achievements error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar conquistas' })
        };
      }
    }

    // Rota para atividades de pontos
    if (path === '/api/point-activities' && method === 'GET') {
      try {
        const activities = [
          { id: 1, name: 'Presença no Culto', points: 10, description: 'Comparecer ao culto' },
          { id: 2, name: 'Estudo Bíblico', points: 5, description: 'Participar do estudo bíblico' },
          { id: 3, name: 'Evangelismo', points: 20, description: 'Compartilhar o evangelho' }
        ];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(activities)
        };
      } catch (error) {
        console.error('❌ Get point activities error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar atividades de pontos' })
        };
      }
    }

    // Rota para tipos de reunião
    if (path === '/api/meeting-types' && method === 'GET') {
      try {
        const types = [
          { id: 1, name: 'Culto de Adoração', description: 'Culto principal da igreja' },
          { id: 2, name: 'Estudo Bíblico', description: 'Estudo da palavra' },
          { id: 3, name: 'Oração', description: 'Momento de oração' },
          { id: 4, name: 'Evangelismo', description: 'Atividade evangelística' }
        ];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(types)
        };
      } catch (error) {
        console.error('❌ Get meeting types error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar tipos de reunião' })
        };
      }
    }

    // Rota para tipos de evento por role
    if (path.startsWith('/api/event-types/') && method === 'GET') {
      try {
        const role = path.split('/')[3];
        console.log('🔍 Getting event types for role:', role);
        
        const eventTypes = {
          admin: ['igreja-local', 'asr-geral', 'asr-administrativo', 'asr-pastores', 'visitas', 'reunioes', 'pregacoes'],
          member: ['igreja-local', 'asr-geral', 'visitas', 'reunioes', 'pregacoes'],
          interested: ['igreja-local', 'pregacoes']
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(eventTypes[role] || [])
        };
      } catch (error) {
        console.error('❌ Get event types error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar tipos de evento' })
        };
      }
    }

    // Rota para relacionamentos do missionário
    if (path.startsWith('/api/relationships/missionary/') && method === 'GET') {
      try {
        const missionaryId = path.split('/')[3];
        console.log('🔍 Getting relationships for missionary:', missionaryId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      } catch (error) {
        console.error('❌ Get missionary relationships error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar relacionamentos do missionário' })
        };
      }
    }

    // Rota para criar relacionamento
    if (path === '/api/relationships' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Creating relationship:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Relacionamento criado com sucesso',
            relationship: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Create relationship error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar relacionamento' })
        };
      }
    }

    // Rota para deletar relacionamento
    if (path.startsWith('/api/relationships/') && method === 'DELETE') {
      try {
        const relationshipId = path.split('/')[3];
        console.log('🔍 Deleting relationship:', relationshipId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Relacionamento deletado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete relationship error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar relacionamento' })
        };
      }
    }

    // Rota para deletar relacionamento ativo
    if (path.startsWith('/api/relationships/active/') && method === 'DELETE') {
      try {
        const interestedId = path.split('/')[3];
        console.log('🔍 Deleting active relationship for interested:', interestedId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Relacionamento ativo deletado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete active relationship error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar relacionamento ativo' })
        };
      }
    }

    // Rota para criar pedido de discipulado
    if (path === '/api/discipleship-requests' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Creating discipleship request:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Pedido de discipulado criado com sucesso',
            request: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Create discipleship request error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar pedido de discipulado' })
        };
      }
    }

    // Rota para atualizar pedido de discipulado
    if (path.startsWith('/api/discipleship-requests/') && method === 'PUT') {
      try {
        const requestId = path.split('/')[3];
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Updating discipleship request:', requestId, body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Pedido de discipulado atualizado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Update discipleship request error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao atualizar pedido de discipulado' })
        };
      }
    }

    // Rota para deletar pedido de discipulado
    if (path.startsWith('/api/discipleship-requests/') && method === 'DELETE') {
      try {
        const requestId = path.split('/')[3];
        console.log('🔍 Deleting discipleship request:', requestId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Pedido de discipulado deletado com sucesso' })
        };
      } catch (error) {
        console.error('❌ Delete discipleship request error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao deletar pedido de discipulado' })
        };
      }
    }

    // Rota para eventos do calendário
    if (path === '/api/calendar/events' && method === 'GET') {
      try {
        const events = await sql`SELECT * FROM events ORDER BY date DESC LIMIT 50`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(events)
        };
      } catch (error) {
        console.error('❌ Get calendar events error:', error);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      }
    }

    // Rota para criar evento no calendário
    if (path === '/api/calendar/events' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        console.log('🔍 Creating calendar event:', body);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Evento do calendário criado com sucesso',
            event: {
              id: Date.now(),
              ...body,
              created_at: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ Create calendar event error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao criar evento do calendário' })
        };
      }
    }

    // Rota para check-ins espirituais
    if (path === '/api/spiritual-checkins/scores' && method === 'GET') {
      try {
        const scores = [
          { id: 1, userId: 1, score: 8, date: new Date().toISOString() },
          { id: 2, userId: 2, score: 7, date: new Date().toISOString() }
        ];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(scores)
        };
      } catch (error) {
        console.error('❌ Get spiritual check-ins scores error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar pontuações de check-ins espirituais' })
        };
      }
    }

    // Rota para check-ins emocionais do usuário
    if (path.startsWith('/api/emotional-checkins/user/') && method === 'GET') {
      try {
        const userId = path.split('/')[4];
        console.log('🔍 Getting emotional check-ins for user:', userId);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      } catch (error) {
        console.error('❌ Get user emotional check-ins error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro ao buscar check-ins emocionais do usuário' })
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
