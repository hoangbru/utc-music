import Joi from "joi"

export const registerSchema = Joi.object({
  userName: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  displayName: Joi.string().max(100),
})

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
})
