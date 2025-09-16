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
    // Conectar ao banco Neon
    const sql = neon(process.env.DATABASE_URL);
    
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
