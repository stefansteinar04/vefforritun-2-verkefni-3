import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AuthorInputSchema } from '../schemas/author.js'
import { prisma } from '../lib/prisma.js'
import { sanitizeString } from '../lib/sanitize.js'
import { parsePaging, makePaging } from '../utils/paging.js'

export function authorsRoutes(): Hono {
  const app = new Hono()

  app.get('/', async (c) => {
    try {
      const { limit, offset } = parsePaging(c.req.query())
      const total = await prisma.author.count()
      const data = await prisma.author.findMany({
        orderBy: { id: 'desc' },
        take: limit,
        skip: offset,
      })

      return c.json({ data, paging: makePaging(limit, offset, total) }, 200)
    } catch {
      return c.json({ error: 'Internal Error' }, 500)
    }
  })

  app.get('/:id', async (c) => {
    try {
      const id = Number(c.req.param('id'))
      if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'Not Found' }, 404)

      const author = await prisma.author.findUnique({ where: { id } })
      if (!author) return c.json({ error: 'Not Found' }, 404)

      return c.json(author, 200)
    } catch {
      return c.json({ error: 'Internal Error' }, 500)
    }
  })

  app.post(
    '/',
    zValidator('json', AuthorInputSchema, (result, c) => {
      if (!result.success) return c.json({ error: 'Bad Request', issues: result.error.issues }, 400)
    }),
    async (c) => {
      try {
        const body = c.req.valid('json')
        const name = sanitizeString(body.name)
        const email = sanitizeString(body.email)
        const created = await prisma.author.create({ data: { name, email } })
        return c.json(created, 201)
      } catch {
        return c.json({ error: 'Internal Error' }, 500)
      }
    },
  )

  app.put(
    '/:id',
    zValidator('json', AuthorInputSchema, (result, c) => {
      if (!result.success) return c.json({ error: 'Bad Request', issues: result.error.issues }, 400)
    }),
    async (c) => {
      try {
        const id = Number(c.req.param('id'))
        if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'Not Found' }, 404)

        const exists = await prisma.author.findUnique({ where: { id } })
        if (!exists) return c.json({ error: 'Not Found' }, 404)

        const body = c.req.valid('json')
        const name = sanitizeString(body.name)
        const email = sanitizeString(body.email)
        const updated = await prisma.author.update({ where: { id }, data: { name, email } })
        return c.json(updated, 200)
      } catch {
        return c.json({ error: 'Internal Error' }, 500)
      }
    },
  )

  app.delete('/:id', async (c) => {
    try {
      const id = Number(c.req.param('id'))
      if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'Not Found' }, 404)

      const exists = await prisma.author.findUnique({ where: { id } })
      if (!exists) return c.json({ error: 'Not Found' }, 404)
      await prisma.author.delete({ where: { id } })
      return c.body(null, 204)
    } catch {
      return c.json({ error: 'Internal Error' }, 500)
    }
  })

  return app
}