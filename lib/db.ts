import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';

// Configure neon to use WebSockets for serverless environments
neonConfig.fetchConnectionCache = true;

// Get the database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL as string;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a SQL query executor using neon
export const sql = neon(DATABASE_URL);

// Create a connection pool for more complex operations
export const pool = new Pool({ connectionString: DATABASE_URL });

// Helper function to execute a query with parameters
export async function query(text: string, params: any[] = []) {
  try {
    return await sql(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute a transaction
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} 