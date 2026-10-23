import { handle } from 'hono/vercel'
import app from '../server/app'

export const runtime = 'edge'

export default handle(app)
