import Joi from "joi"

export const createSongSchema = Joi.object({
  title: Joi.string().required(),
  duration: Joi.number().required(),
  releaseDate: Joi.date().required(),
  albumId: Joi.string().uuid(),
  url: Joi.string().uri().required(),
  coverUri: Joi.string().uri().required(),
  lyrics: Joi.string(),
  trackNumber: Joi.number(),
  artistIds: Joi.array().items(Joi.string().uuid()),
  genreIds: Joi.array().items(Joi.string().uuid()),
})

export const updateSongSchema = Joi.object({
  title: Joi.string(),
  duration: Joi.number(),
  releaseDate: Joi.date(),
  lyrics: Joi.string(),
})
