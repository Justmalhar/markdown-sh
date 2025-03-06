import crypto from 'crypto'

// The secret used to sign API keys - should be set in environment variables
const API_KEY_SECRET = process.env.API_KEY_SECRET || 'default-secret-change-me-in-production'

/**
 * Generates a new API key for a user
 */
export function generateApiKey(email: string = 'anonymous'): string {
  // Create a timestamp for the key
  const timestamp = Date.now()
  
  // Create a simple hash of the email and timestamp
  const hash = crypto
    .createHash('md5')
    .update(`${email}:${timestamp}:${API_KEY_SECRET}`)
    .digest('hex')
  
  // Create a prefix for the key
  const prefix = 'yolo_'
  
  // Combine the prefix and hash to create the key
  return `${prefix}${hash}`
}

/**
 * Validates an API key
 */
export function validateApiKey(key: string): { 
  valid: boolean; 
  data?: { 
    email: string;
    timestamp: number;
    environment?: string;
  } 
} {
  try {
    // Check for the yolo_ prefix format
    const yoloRegex = /^yolo_([a-f0-9]{32})$/
    const yoloMatch = key.match(yoloRegex)
    
    // Check for the pk_ prefix format (from getapi page)
    const pkRegex = /^pk_([a-f0-9]{32})$/
    const pkMatch = key.match(pkRegex)
    
    // Accept either format
    if (yoloMatch || pkMatch) {
      return { 
        valid: true, 
        data: {
          email: 'user@example.com', // Placeholder
          timestamp: Date.now(),
          environment: 'test'
        }
      }
    }
    
    return { valid: false }
  } catch (error) {
    console.error('Error validating API key:', error)
    return { valid: false }
  }
}

// These functions are no longer used but kept for reference
function encryptData(data: string): string {
  return data // Simplified
}

function decryptData(encryptedData: string): string {
  return encryptedData // Simplified
} 