import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth'

dotenv.config()
const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000

app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running!')
})

app.use('/api/auth', authRoutes)

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined')
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`)
})

mongoose
  .connect(MONGO_URI, {
    family: 4,
  })
  .then(() => {
    console.log('Connected to MongoDB.')
  })
  .catch((err) => {
    console.error('Database connection error:', err)
  })
