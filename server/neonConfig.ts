import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configuração do Neon Database - string de conexão atualizada
const connectionString = 'postgresql://neondb_owner:npg_enihr4YBSDm8@ep-still-glade-ac5u1r48-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Criar conexão com Neon - versão mais simples
export const sql = neon(connectionString);
export const db = drizzle(sql);

// Configuração para desenvolvimento local
export const isDevelopment = process.env.NODE_ENV === 'development';

// Configuração para produção (Netlify)
export const isProduction = process.env.NODE_ENV === 'production';

console.log('🔗 Neon Database configurado (versão simplificada):', {
  environment: process.env.NODE_ENV,
  hasConnectionString: !!process.env.DATABASE_URL,
  isDevelopment,
  isProduction,
  connectionStringLength: connectionString.length
});
