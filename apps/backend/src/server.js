import dotenv from "dotenv"
dotenv.config({ path: ".env.example" })

import express from "express"
import cors from "cors"
import helmet from "helmet"
import mongoose from "mongoose"
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.js"
import projectRoutes from "./routes/projects.js"

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
}
app.use(cors(corsOptions))
app.use(express.json())

// DevOps Health & Readiness Probe
app.get("/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1
  if (isConnected) {
    return res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  }
  return res.status(503).json({ status: "unhealthy", database: "disconnected" })
})

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
})
