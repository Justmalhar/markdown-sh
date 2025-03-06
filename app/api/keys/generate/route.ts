import { NextRequest, NextResponse } from 'next/server'
import { generateApiKey, ApiKeyType, ApiKeyEnvironment } from '@/lib/api-key'
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
      await limiter.check(5, ip) // 5 requests per minute per IP
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // In a real application, you would authenticate the user here
    // For now, we'll use a mock user ID
    const userId = 'user_' + Math.random().toString(36).substring(2, 15)

    // Parse request body
    const { type, environment, name } = await req.json()

    // Validate input
    if (!type || !['public', 'secret'].includes(type)) {
      return NextResponse.json({ error: "Invalid key type" }, { status: 400 })
    }

    if (!environment || !['test', 'live'].includes(environment)) {
      return NextResponse.json({ error: "Invalid environment" }, { status: 400 })
    }

    // Generate the API key
    const apiKey = generateApiKey(
      type as ApiKeyType,
      environment as ApiKeyEnvironment,
      userId,
      name
    )

    // In a real application, you would store the API key in a database
    // For security, you would store a hash of the key, not the key itself

    // Return the API key
    // Note: This is the only time the full key will be shown to the user
    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        key: apiKey.key,
        type: apiKey.type,
        environment: apiKey.environment,
        createdAt: apiKey.createdAt,
        name: apiKey.name,
        permissions: apiKey.permissions
      }
    })
  } catch (error) {
    console.error('Error generating API key:', error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
} 