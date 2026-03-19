import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Email must be a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export type LoginFormData = z.infer<typeof loginSchema>
