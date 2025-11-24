import Joi from "joi"

export const createArtistSchema = Joi.object({
  name: Joi.string().required(),
  biography: Joi.string(),
  country: Joi.string(),
})
