// This script initializes the database tables for the API key service
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function initializeDatabase() {
  try {
    // Get the database URL from environment variables
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('Connecting to database...');
    
    // Create a SQL query executor using neon
    const sql = neon(DATABASE_URL);
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement separately
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await sql(statement);
    }
    
    console.log('Database initialized successfully!');
    
    // Check if the table was created
    const tables = await sql('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 