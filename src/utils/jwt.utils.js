import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
const JWT_EXPIRY = "15m"
const JWT_REFRESH_EXPIRY = "7d"

/**
 * Generate Access Token
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY })
}

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Invalid or expired access token")
  }
}

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (error) {
    throw new Error("Invalid or expired refresh token")
  }
}
