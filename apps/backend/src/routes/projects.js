import express from "express"
import Project from "../models/Project.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// GET /api/projects (Public read access)
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 })
    res.json({ projects })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects." })
  }
})

// POST /api/projects (Protected)
router.post("/", authenticate, async (req, res) => {
  const { title, description, techStack } = req.body
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required." })
  }

  try {
    const project = await Project.create({
      title,
      description,
      techStack: Array.isArray(techStack) ? techStack : [],
      owner: req.user.id,
    })
    res.status(201).json({ project })
  } catch (err) {
    console.error("Create project error:", err)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/projects/:id (Owner or Admin only)
router.put("/:id", authenticate, async (req, res) => {
  const { title, description, techStack } = req.body
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ error: "Project not found." })
    }
    if (project.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update this project." })
    }

    if (title) project.title = title
    if (description) project.description = description
    if (Array.isArray(techStack)) project.techStack = techStack

    await project.save()
    res.json({ project })
  } catch (err) {
    res.status(500).json({ error: "Failed to update project." })
  }
})
// DELETE /api/projects/:id (Owner or Admin only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ error: "Project not found." })
    }
    if (
      project.owner.toString() !== req.user._id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this project." })
    }

    await project.deleteOne()
    res.json({ message: "Project deleted." })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project." })
  }
})

export default router
