import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '../lib/prisma.js'
import { sanitizeString } from '../lib/sanitize.js'
import { NewsInputSchema } from '../schemas/news.js'
import { parsePaging, makePaging } from '../utils/paging.js'

export function newsRoutes(): Hono {
  const app = new Hono()

  const makeSlug = (s: string): string =>
    s
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9\s-]/g, '')
      .replaceAll(/\s+/g, '-')
      .replaceAll(/-+/g, '-')

  app.get('/', async (c) => {
    try {
      const { limit, offset } = parsePaging(c.req.query())
      const total = await prisma.news.count()
      const data = await prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { author: true },
      })

      return c.json({ data, paging: makePaging(limit, offset, total) }, 200)
    } catch {
      return c.json({ error: 'Internal Error' }, 500)
    }
  })

  app.get('/:slug', async (c) => {
    try {
      const slug = c.req.param('slug')

      const news = await prisma.news.findUnique({
        where: { slug },
        include: { author: true },
      })

      if (!news) return c.json({ error: 'Not Found' }, 404)
      return c.json(news, 200)
    } catch {
      return c.json({ error: 'Internal Error' }, 500)
    }
  })

  app.post(
    '/',
    zValidator('json', NewsInputSchema, (result, c) => {
      if (!result.success) return c.json({ error: 'Bad Request', issues: result.error.issues }, 400)
    }),
    async (c) => {
      try {
        const body = c.req.valid('json')
        const author = await prisma.author.findUnique({ where: { id: body.authorId } })
        if (!author) return c.json({ error: 'Bad Request', message: 'authorId does not exist' }, 400)

        const title = sanitizeString(body.title)
        const excerpt = sanitizeString(body.excerpt)
        const content = sanitizeString(body.content)
        const published = body.published
        const slug = makeSlug(title)
        const created = await prisma.news.create({
          data: { title, slug, excerpt, content, published, authorId: body.authorId },
          include: { author: true },
        })

        return c.json(created, 201)
      } catch {
        return c.json({ error: 'Internal Error' }, 500)
      }
    },
  )

  app.put(
    '/:slug',
    zValidator('json', NewsInputSchema, (result, c) => {
      if (!result.success) return c.json({ error: 'Bad Request', issues: result.error.issues }, 400)
    }),
    async (c) => {
      try {
        const slug = c.req.param('slug')
        const existing = await prisma.news.findUnique({ where: { slug } })
        if (!existing) return c.json({ error: 'Not Found' }, 404)

        const body = c.req.valid('json')
        const author = await prisma.author.findUnique({ where: { id: body.authorId } })
        if (!author) return c.json({ error: 'Bad Request', message: 'authorId does not exist' }, 400)

        const title = sanitizeString(body.title)
        const excerpt = sanitizeString(body.excerpt)
        const content = sanitizeString(body.content)
        const published = body.published
        const updated = await prisma.news.update({
          where: { slug },
          data: { title, excerpt, content, published, authorId: body.authorId },
          include: { author: true },
        })

        return c.json(updated, 200)
      } catch {
        return c.json({ error: 'Internal Error' }, 500)
      }
    },
  )

  app.delete('/:slug', async (c) => {
    try {
      const slug = c.req.param('slug')
      const existing = await prisma.news.findUnique({ where: { slug } })
      if (!existing) return c.json({ error: 'Not Found' }, 404)

      await prisma.news.delete({ where: { slug } })
      return c.body(null, 204)
    } catch {
      return c.json({ error: 'Internal Error' }, 500)
    }
  })

  return app
}