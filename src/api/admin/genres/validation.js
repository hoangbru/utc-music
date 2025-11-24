import Joi from "joi";

export const createGenreSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
})
