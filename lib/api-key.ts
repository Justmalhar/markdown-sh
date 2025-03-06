import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

export type ApiKeyType = 'public' | 'secret'
export type ApiKeyEnvironment = 'test' | 'live'

export interface ApiKey {
  id: string
  key: string
  type: ApiKeyType
  environment: ApiKeyEnvironment
  createdAt: Date
  lastUsed?: Date
  userId: string
  name?: string
  permissions?: string[]
}

/**
 * Generates a new API key with the specified type and environment
 */
export function generateApiKey(
  type: ApiKeyType,
  environment: ApiKeyEnvironment,
  userId: string,
  name?: string
): ApiKey {
  // Create a unique ID for the key
  const id = uuidv4()
  
  // Generate a random string for the key
  const randomBytes = crypto.randomBytes(24).toString('hex')
  
  // Create a prefix based on the key type and environment
  const prefix = `${type === 'public' ? 'pk' : 'sk'}_${environment}_`
  
  // Combine the prefix and random string to create the key
  const key = `${prefix}${randomBytes}`
  
  return {
    id,
    key,
    type,
    environment,
    createdAt: new Date(),
    userId,
    name: name || `${environment} ${type} key`,
    permissions: getDefaultPermissions(type)
  }
}

/**
 * Validates an API key format
 */
export function validateApiKeyFormat(key: string): boolean {
  // Check if the key has the correct format
  const regex = /^(pk|sk)_(test|live)_[a-f0-9]{48}$/
  return regex.test(key)
}

/**
 * Extracts information from an API key
 */
export function parseApiKey(key: string): { type: ApiKeyType; environment: ApiKeyEnvironment } | null {
  if (!validateApiKeyFormat(key)) {
    return null
  }
  
  const parts = key.split('_')
  const type = parts[0] === 'pk' ? 'public' : 'secret'
  const environment = parts[1] as ApiKeyEnvironment
  
  return { type, environment }
}

/**
 * Gets default permissions for a key type
 */
function getDefaultPermissions(type: ApiKeyType): string[] {
  if (type === 'public') {
    return ['read:usage', 'convert:image', 'convert:pdf']
  } else {
    return ['read:usage', 'convert:image', 'convert:pdf', 'admin:keys']
  }
}

/**
 * Masks an API key for display
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) return key
  
  const parts = key.split('_')
  if (parts.length !== 3) return key
  
  const prefix = `${parts[0]}_${parts[1]}_`
  const lastFour = parts[2].slice(-4)
  
  return `${prefix}${'•'.repeat(parts[2].length - 4)}${lastFour}`
}

/**
 * Generates a hash of an API key for storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
} 