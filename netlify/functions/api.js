const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('../../server/schema.ts');

// Configurar conexão com Neon
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// Importar as rotas do servidor
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar e configurar as rotas
const routes = require('../../server/routes.ts');
routes(app, db);

// Handler para Netlify Functions
exports.handler = async (event, context) => {
  // Converter evento do Netlify para formato Express
  const request = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body,
    query: event.queryStringParameters || {}
  };

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: ''
  };

  try {
    // Processar requisição
    const result = await new Promise((resolve, reject) => {
      app(request, response, (err) => {
        if (err) reject(err);
        else resolve(response);
      });
    });

    return {
      statusCode: result.statusCode || 200,
      headers: result.headers,
      body: result.body
    };
  } catch (error) {
    console.error('Erro na função:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};
