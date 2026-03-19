import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().email('Email must be a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
})
