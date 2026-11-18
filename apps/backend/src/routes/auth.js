import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Project from "../models/Project.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// User registration
// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." })
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      email,
      passwordHash,
      role: role === "admin" ? "admin" : "user",
    })

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (err) {
    res.status(500).json({ error: "Internal server error." })
  }
})

// User login
// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." })
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials." })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ error: "Internal server error." })
  }
})

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash")
    if (!user) return res.status(404).json({ error: "User not found." })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: "Internal server error." })
  }
})

// DELETE /api/auth/me
router.delete("/me", authenticate, async (req, res) => {
  try {
    await Project.deleteMany({ user: req.user.id })
    await User.findByIdAndDelete(req.user.id)
    res.json({ message: "User account and associated projects deleted." })
  } catch (err) {
    res.status(500).json({ error: "Internal server error." })
  }
})

export default router
