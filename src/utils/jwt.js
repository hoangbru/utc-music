import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const JWT_EXPIRY = "30d"
const JWT_REFRESH_EXPIRY = "90d"

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY })
}

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Invalid or expired access token")
  }
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (error) {
    throw new Error("Invalid or expired refresh token")
  }
}
