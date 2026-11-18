import jwt from "jsonwebtoken"

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Access denied. Missing or invalid token." })
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: "Token expired or invalid." })
  }
}

const authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: `Forbidden. Requires ${role} role.` })
  }
  next()
}

export { authenticate, authorizeRole }
