import { verifyAccessToken } from "../utils/jwt.js"

/**
 * Middleware to verify JWT token
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: error.message })
  }
}
