import crypto from 'crypto';
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';

// The secret used to sign API keys - should be set in environment variables
const API_KEY_SECRET = process.env.API_KEY_SECRET || 'default-secret-change-me-in-production';

/**
 * Validates an email address format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Generates a new API key for a user and stores it in the database
 */
export async function generateApiKey(email: string): Promise<string> {
  // Normalize the email (lowercase and trim)
  const normalizedEmail = email.toLowerCase().trim();
  
  // Validate email format
  if (!validateEmail(normalizedEmail)) {
    throw new Error('Invalid email format');
  }
  
  // Create a timestamp for the key
  const timestamp = Date.now();
  
  // Add a random UUID for uniqueness
  const uniqueId = uuidv4();
  
  // Create a hash of the email, timestamp, unique ID, and secret
  const hash = crypto
    .createHash('sha256')
    .update(`${normalizedEmail}:${timestamp}:${uniqueId}:${API_KEY_SECRET}`)
    .digest('hex');
  
  // Create a prefix for the key
  const prefix = 'sk-';
  
  // Combine the prefix and hash to create the key (use first 32 chars of hash)
  const apiKey = `${prefix}${hash.substring(0, 32)}`;
  
  // Store the API key in the database
  try {
    await query(
      'INSERT INTO api_keys (key, email, created_at) VALUES ($1, $2, NOW())',
      [apiKey, normalizedEmail]
    );
    
    console.log(`Generated API key for email: ${normalizedEmail}`);
    return apiKey;
  } catch (error) {
    console.error('Error storing API key in database:', error);
    throw new Error('Failed to generate API key');
  }
}

/**
 * Validates an API key against the database
 */
export async function validateApiKey(key: string): Promise<{ 
  valid: boolean; 
  data?: { 
    email: string;
    timestamp: number;
    is_active: boolean;
  } 
}> {
  try {
    // Check for the sk- prefix format
    const keyRegex = /^sk-([a-f0-9]{32})$/;
    if (!keyRegex.test(key)) {
      return { valid: false };
    }
    
    // Look up the key in the database
    const result = await query(
      'SELECT email, created_at, is_active FROM api_keys WHERE key = $1',
      [key]
    );
    
    if (result.length === 0) {
      return { valid: false };
    }
    
    const apiKey = result[0];
    
    // Update the last_used_at timestamp and increment usage_count
    await query(
      'UPDATE api_keys SET last_used_at = NOW(), usage_count = usage_count + 1 WHERE key = $1',
      [key]
    );
    
    return { 
      valid: apiKey.is_active, 
      data: {
        email: apiKey.email,
        timestamp: new Date(apiKey.created_at).getTime(),
        is_active: apiKey.is_active
      }
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false };
  }
}

/**
 * Gets all API keys for a specific email
 */
export async function getApiKeysByEmail(email: string): Promise<Array<{
  key: string;
  created_at: Date;
  last_used_at: Date | null;
  is_active: boolean;
  usage_count: number;
}>> {
  try {
    const result = await query(
      'SELECT key, created_at, last_used_at, is_active, usage_count FROM api_keys WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    
    // Convert the result to the expected type
    return result.map((row: any) => ({
      key: row.key,
      created_at: new Date(row.created_at),
      last_used_at: row.last_used_at ? new Date(row.last_used_at) : null,
      is_active: Boolean(row.is_active),
      usage_count: Number(row.usage_count)
    }));
  } catch (error) {
    console.error('Error fetching API keys:', error);
    throw new Error('Failed to fetch API keys');
  }
}

/**
 * Deactivates an API key
 */
export async function deactivateApiKey(key: string): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE api_keys SET is_active = FALSE WHERE key = $1 RETURNING *',
      [key]
    );
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deactivating API key:', error);
    throw new Error('Failed to deactivate API key');
  }
} 