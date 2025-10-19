import Joi from "joi"

export const createSongSchema = Joi.object({
  title: Joi.string().required(),
  releaseDate: Joi.date().required(),
  albumId: Joi.string().required(),
  lyrics: Joi.string(),
  trackNumber: Joi.number().allow(''),
  artistIds: Joi.string().required(),
  genreIds: Joi.string().required(),
})

export const createArtistSchema = Joi.object({
  name: Joi.string().required(),
  biography: Joi.string(),
  country: Joi.string(),
})

export const createAlbumSchema = Joi.object({
  title: Joi.string().required(),
  releaseDate: Joi.date().required(),
  coverUri: Joi.string().uri(),
  description: Joi.string(),
  artistIds: Joi.string().required(),
})

export const createGenreSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
})

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("ACTIVE", "INACTIVE", "PENDING").required(),
})
