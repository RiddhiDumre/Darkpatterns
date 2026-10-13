import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './app'

const port = Number(process.env.API_PORT ?? 3001)

serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, (info) => {
  console.log(`[api] listening on http://127.0.0.1:${info.port}`)
  if (!process.env.GOOGLE_API_KEY?.trim()) {
    console.log('[api] GOOGLE_API_KEY not set - /api/analyze will return 503 until you add it to .env')
  }
})
