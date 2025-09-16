import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configuração do Neon Database
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/church_plus';

// Criar conexão com Neon
export const sql = neon(connectionString);
export const db = drizzle(sql);

// Configuração para desenvolvimento local
export const isDevelopment = process.env.NODE_ENV === 'development';

// Configuração para produção (Netlify)
export const isProduction = process.env.NODE_ENV === 'production';

console.log('🔗 Neon Database configurado:', {
  environment: process.env.NODE_ENV,
  hasConnectionString: !!process.env.DATABASE_URL,
  isDevelopment,
  isProduction
});
