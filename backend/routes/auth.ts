import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { registerSchema, loginSchema } from '../schemas/auth'
import { z } from 'zod'

const router = express.Router()
type JwtPayload = {
  id: string
}

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body)

    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors

      return res.status(400).json({
        message: 'Validation failed.',
        errors: {
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        },
      })
    }

    const { email, password } = parsed.data

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' })

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login route error:', error)
    return res.status(500).json({ message: 'Server error.' })
  }
})

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body)

    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors

      return res.status(400).json({
        message: 'Validation failed.',
        errors: {
          firstName: fieldErrors.firstName?.[0],
          lastName: fieldErrors.lastName?.[0],
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        },
      })
    }

    const { firstName, lastName, email, password } = parsed.data

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'A user with this email already exists.' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    })

    const JWT_SECRET = process.env.JWT_SECRET

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }
    await newUser.save()

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' })

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error('Register route error:', error)
    return res.status(500).json({ message: 'Server error.' })
  }
})

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    const JWT_SECRET = process.env.JWT_SECRET

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    let verified: JwtPayload

    try {
      verified = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token.' })
    }

    const user = await User.findById(verified.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }

    return res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return res.status(500).json({ message: 'Server error.' })
  }
})
export default router
