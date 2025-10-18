import Joi from "joi"

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().max(100),
  avatarUri: Joi.string().uri(),
})
