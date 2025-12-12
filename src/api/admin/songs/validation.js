import Joi from "joi";

export const createSongSchema = Joi.object({
  title: Joi.string().required(),
  releaseDate: Joi.string().required(),
  albumId: Joi.string().required(),
  lyrics: Joi.string(),
  trackNumber: Joi.number().allow(""),
  artistIds: Joi.string().required(),
  genreIds: Joi.string().required(),
});
