import Joi from "joi";

export const playlistSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.base": "Tên playlist phải là chuỗi.",
    "string.empty": "Vui lòng nhập tên playlist.",
    "any.required": "Trường 'title' là bắt buộc.",
  }),

  imageUri: Joi.string().uri().allow(null, "").optional().messages({
    "string.uri": "Đường dẫn hình ảnh không hợp lệ.",
  }),

  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "Mô tả phải là chuỗi.",
  }),

  isPublic: Joi.boolean().optional().messages({
    "boolean.base": "Trường 'isPublic' phải là kiểu true/false.",
  }),
});

export const addSongSchema = Joi.object({
  songId: Joi.string().uuid().required(),
});

export const reorderSongsSchema = Joi.object({
  songs: Joi.array()
    .items(
      Joi.object({
        songId: Joi.string().uuid().required(),
        newPosition: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});
