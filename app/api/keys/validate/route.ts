import { NextRequest, NextResponse } from 'next/server'
import { validateApiKeyFormat, parseApiKey } from '@/lib/api-key'
import { validateEmailBasedApiKey } from '../quick-generate/route'
import { rateLimit } from '@/lib/rate-limit'

// Rate limiter to prevent abuse
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip ?? "127.0.0.1"
    try {
      await limiter.check(10, ip) // 10 requests per minute per IP
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Parse request body
    const { apiKey, email } = await req.json()

    // Check if API key is provided
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Check if it's an email-based API key (starts with pk_)
    if (apiKey.startsWith('pk_') && apiKey.length === 35) {
      // If it's an email-based key, email is required for validation
      if (!email) {
        return NextResponse.json({ error: "Email is required for validating this type of API key" }, { status: 400 })
      }
      
      // Validate the email-based API key
      const isValid = validateEmailBasedApiKey(apiKey, email)
      
      return NextResponse.json({
        valid: isValid,
        type: 'public',
        keyType: 'email-based'
      })
    } 
    // Otherwise, validate using the standard API key format
    else {
      // Validate API key format
      if (!validateApiKeyFormat(apiKey)) {
        return NextResponse.json({ 
          valid: false,
          error: "Invalid API key format"
        })
      }

      // Parse API key to get type and environment
      const keyInfo = parseApiKey(apiKey)
      
      if (!keyInfo) {
        return NextResponse.json({ 
          valid: false,
          error: "Could not parse API key"
        })
      }

      // In a real application, you would check if the API key exists in your database
      // For this example, we'll just return that it's valid based on the format

      return NextResponse.json({
        valid: true,
        type: keyInfo.type,
        environment: keyInfo.environment,
        keyType: 'standard'
      })
    }
  } catch (error) {
    console.error('Error validating API key:', error)
    return NextResponse.json({ error: "Failed to validate API key" }, { status: 500 })
  }
} 