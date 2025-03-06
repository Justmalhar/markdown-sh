import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { generateApiKey } from '@/lib/api-key-service'

// Rate limiter to prevent abuse
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
})

// The secret used to sign API keys - should be set in environment variables
const API_KEY_SECRET = process.env.API_KEY_SECRET || 'default-secret-change-me-in-production'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip ?? "127.0.0.1"
    try {
      await limiter.check(5, ip) // 5 requests per minute per IP
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Parse request body
    const { email } = await req.json()

    // Validate input
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Generate the API key and store it in the database
    const apiKey = await generateApiKey(email)

    // Return the API key
    return NextResponse.json({
      success: true,
      apiKey: apiKey,
      message: "Keep this API key secure. You can regenerate it using the same email if needed."
    })
  } catch (error) {
    console.error('Error generating API key:', error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}

/**
 * Generates an API key based on the user's email and server secret
 */
function generateEmailBasedApiKey(email: string): string {
  // Normalize the email (lowercase)
  const normalizedEmail = email.toLowerCase().trim()
  
  // Create a timestamp prefix (changes every day for the same email)
  // This ensures keys expire and can be refreshed
  const datePrefix = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  // Combine the email with the secret and date
  const dataToHash = `${normalizedEmail}:${API_KEY_SECRET}:${datePrefix}`
  
  // Create a SHA-256 hash
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex')
  
  // Create a prefix for the key
  const prefix = 'pk_'
  
  // Return the formatted API key
  return `${prefix}${hash.substring(0, 32)}`
}

/**
 * Validates an email-based API key
 */
export function validateEmailBasedApiKey(apiKey: string, email: string): boolean {
  // Check if the key has the correct format
  if (!apiKey || !apiKey.startsWith('pk_') || apiKey.length !== 35) {
    return false
  }
  
  // Generate a key with the provided email and check if it matches
  const expectedKey = generateEmailBasedApiKey(email)
  
  // Compare the keys (constant-time comparison to prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(expectedKey)
  )
} 