/**
 * Middleware to validate request body using Joi schema
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      const messages = error.details.map((detail) => detail.message)
      return res.status(400).json({ errors: messages })
    }

    req.body = value
    next()
  }
}
