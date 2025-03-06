export function rateLimit(options: {
  interval: number
  uniqueTokenPerInterval: number
}) {
  const tokenCache = new Map()
  let nextReset = Date.now() + options.interval

  return {
    check: (limit: number, token: string) =>
      new Promise<boolean>((resolve, reject) => {
        const now = Date.now()
        if (now >= nextReset) {
          tokenCache.clear()
          nextReset = now + options.interval
        }

        const tokenCount = tokenCache.get(token) || 0

        if (tokenCount >= limit) {
          reject(new Error("Rate limit exceeded"))
          return
        }

        tokenCache.set(token, tokenCount + 1)
        resolve(true)
      }),
  }
}

