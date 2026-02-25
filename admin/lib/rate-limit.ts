// lib/rate-limit.ts
// Rate limiter in-memory — funciona bem na Vercel (instâncias por região)
// Para produção de alta escala, use Redis (Upstash)

interface RateLimitEntry {
  count: number
  resetAt: number
  blocked: boolean
  blockedUntil?: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  maxRequests: number   // máximo de requests no window
  windowMs: number      // janela em ms
  blockDurationMs?: number // tempo de bloqueio após exceder (ms)
}

export function rateLimit(key: string, config: RateLimitConfig): {
  allowed: boolean
  remaining: number
  retryAfter?: number
} {
  const now = Date.now()
  const entry = store.get(key)

  // Verifica bloqueio ativo
  if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    }
  }

  // Janela expirou ou entrada nova
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs, blocked: false })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }

  // Incrementa contador
  entry.count++

  if (entry.count > config.maxRequests) {
    if (config.blockDurationMs) {
      entry.blocked = true
      entry.blockedUntil = now + config.blockDurationMs
    }
    store.set(key, entry)
    return {
      allowed: false,
      remaining: 0,
      retryAfter: config.blockDurationMs
        ? Math.ceil(config.blockDurationMs / 1000)
        : Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  store.set(key, entry)
  return { allowed: true, remaining: config.maxRequests - entry.count }
}

// Limpa entradas expiradas periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt && (!entry.blockedUntil || now > entry.blockedUntil)) {
      store.delete(key)
    }
  }
}, 60_000)
