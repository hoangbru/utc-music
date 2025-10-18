import Joi from "joi"

export const createPlaylistSchema = Joi.object({
  title: Joi.string().required(),
  imageUri: Joi.string().uri(),
  isPublic: Joi.boolean(),
})

export const updatePlaylistSchema = Joi.object({
  title: Joi.string(),
  imageUri: Joi.string().uri(),
  isPublic: Joi.boolean(),
})

export const addSongSchema = Joi.object({
  songId: Joi.string().uuid().required(),
})

export const reorderSongsSchema = Joi.object({
  songs: Joi.array()
    .items(
      Joi.object({
        songId: Joi.string().uuid().required(),
        newPosition: Joi.number().required(),
      }),
    )
    .required(),
})
