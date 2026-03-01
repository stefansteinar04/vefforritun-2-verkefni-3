import { z } from 'zod'

export const AuthorInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
})

export type AuthorInput = z.infer<typeof AuthorInputSchema>