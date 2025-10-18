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

export const createArtistSchema = Joi.object({
  name: Joi.string().required(),
  biography: Joi.string(),
  avatarUri: Joi.string().uri(),
  country: Joi.string(),
})

export const createAlbumSchema = Joi.object({
  title: Joi.string().required(),
  releaseDate: Joi.date().required(),
  coverUri: Joi.string().uri(),
  description: Joi.string(),
  artistIds: Joi.array().items(Joi.string().uuid()),
})

export const createGenreSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
})

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("ACTIVE", "INACTIVE", "PENDING").required(),
})
