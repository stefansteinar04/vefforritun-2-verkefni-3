import { Hono } from 'hono'
import { authorsRoutes } from './routes/authors.js'
import { newsRoutes } from './routes/news.js'

export function createApp(): Hono {
  const app = new Hono()

  app.get('/', (c) =>
    c.json({
      routes: {
        authors: [
          'GET /authors',
          'GET /authors/:id',
          'POST /authors',
          'PUT /authors/:id',
          'DELETE /authors/:id',
        ],
        news: [
          'GET /news',
          'GET /news/:slug',
          'POST /news',
          'PUT /news/:slug',
          'DELETE /news/:slug',
        ],
      },
    }),
  )

  app.route('/authors', authorsRoutes())
  app.route('/news', newsRoutes())

  return app
}