import Joi from "joi"

export const createAlbumSchema = Joi.object({
  title: Joi.string().required(),
  releaseDate: Joi.string().required(),
  coverUri: Joi.string().uri(),
  description: Joi.string(),
  artistIds: Joi.string().required(),
  type: Joi.string().valid("ALBUM", "SINGLE", "EP").required(),
})
