import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const router = express.Router()

function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body

    const errors: Record<string, string> = {}

    if (
      !firstName ||
      typeof firstName !== 'string' ||
      firstName.trim() === ''
    ) {
      errors.firstName = 'First name is required.'
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      errors.lastName = 'Last name is required.'
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      errors.email = 'Email is required.'
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'Email must be a valid email address.'
    }
    if (!password || typeof password !== 'string') {
      errors.password = 'Password is required.'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.'
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors,
      })
    }

    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedEmail = email.trim()

    const userExists = await User.findOne({ email: trimmedEmail })
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'Korisnik sa ovim email-om već postoji.' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      password: hashedPassword,
    })

    await newUser.save()

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'tajna_rec',
      { expiresIn: '1h' }
    )

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Greška na serveru.' })
  }
})

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' })
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'tajna_rec'

    let decoded: { id: string }
    try {
      decoded = jwt.verify(token, secret) as { id: string }
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token.' })
    }

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Greška na serveru.' })
  }
})

export default router
