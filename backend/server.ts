import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Backend server radi! 🚀')
})

app.use('/api/auth', authRoutes)

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/my-auth-app'

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server sluša na portu ${PORT} 🎧`)
})

mongoose
  .connect(MONGO_URI, {
    family: 4,
  })
  .then(() => {
    console.log('Povezani smo sa MongoDB bazom! 🍃')
  })
  .catch((err) => {
    console.error('Greška pri povezivanju sa bazom:', err)
  })
