import Joi from "joi";

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().max(100).allow("", null).optional().messages({
    "string.base": "Tên hiển thị phải là chuỗi ký tự.",
    "string.max": "Tên hiển thị không được vượt quá {#limit} ký tự.",
  }),

  avatarUri: Joi.string().uri().allow("", null).optional().messages({
    "string.base": "Đường dẫn ảnh đại diện phải là chuỗi ký tự.",
    "string.uri": "Đường dẫn ảnh đại diện không hợp lệ (phải là dạng URL).",
  }),
});
