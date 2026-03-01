import { z } from 'zod'

export const NewsInputSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(300),
  content: z.string().min(1),
  authorId: z.number().int().positive(),
  published: z.boolean(),
})

export type NewsInput = z.infer<typeof NewsInputSchema>