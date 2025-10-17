/**
 * Endpoint de teste para funcionalidades offline
 */

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
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
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : null;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${method} /api/test-offline`, body);

    // Simular diferentes tipos de resposta baseado no método
    switch (method) {
      case 'GET':
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Teste offline GET funcionando!',
            timestamp,
            method,
            data: {
              testId: Math.random().toString(36).substr(2, 9),
              serverTime: timestamp,
              randomValue: Math.floor(Math.random() * 1000)
            }
          })
        };

      case 'POST':
        return {
          statusCode: 201,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Teste offline POST funcionando!',
            timestamp,
            method,
            receivedData: body,
            createdId: Math.random().toString(36).substr(2, 9)
          })
        };

      case 'PUT':
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Teste offline PUT funcionando!',
            timestamp,
            method,
            updatedData: body
          })
        };

      case 'DELETE':
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            message: 'Teste offline DELETE funcionando!',
            timestamp,
            method,
            deleted: true
          })
        };

      default:
        return {
          statusCode: 405,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: false,
            message: 'Método não permitido',
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
          })
        };
    }
  } catch (error) {
    console.error('Erro no endpoint test-offline:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
