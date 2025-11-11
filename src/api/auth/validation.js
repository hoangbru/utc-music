import Joi from "joi";

export const registerSchema = Joi.object({
  userName: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "Tên người dùng phải là chuỗi ký tự.",
    "string.alphanum":
      "Tên người dùng chỉ được chứa chữ và số, không có ký tự đặc biệt.",
    "string.empty": "Vui lòng nhập tên người dùng.",
    "string.min": "Tên người dùng phải có ít nhất {#limit} ký tự.",
    "string.max": "Tên người dùng không được vượt quá {#limit} ký tự.",
    "any.required": "Trường 'userName' là bắt buộc.",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "Email phải là chuỗi ký tự.",
    "string.email": "Email không hợp lệ.",
    "string.empty": "Vui lòng nhập email.",
    "any.required": "Trường 'email' là bắt buộc.",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Mật khẩu phải là chuỗi ký tự.",
    "string.empty": "Vui lòng nhập mật khẩu.",
    "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự.",
    "any.required": "Trường 'password' là bắt buộc.",
  }),

  displayName: Joi.string().max(100).allow(null, "").optional().messages({
    "string.base": "Tên hiển thị phải là chuỗi ký tự.",
    "string.max": "Tên hiển thị không được vượt quá {#limit} ký tự.",
  }),
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email phải là chuỗi ký tự.",
    "string.email": "Email không hợp lệ.",
    "string.empty": "Vui lòng nhập email.",
    "any.required": "Trường 'email' là bắt buộc.",
  }),

  code: Joi.string().length(6).required().messages({
    "string.base": "Mã xác minh phải là chuỗi ký tự.",
    "string.length": "Mã xác minh phải có đúng {#limit} ký tự.",
    "string.empty": "Vui lòng nhập mã xác minh.",
    "any.required": "Trường 'code' là bắt buộc.",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email phải là chuỗi ký tự.",
    "string.email": "Email không hợp lệ.",
    "string.empty": "Vui lòng nhập email.",
    "any.required": "Trường 'email' là bắt buộc.",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Mật khẩu phải là chuỗi ký tự.",
    "string.empty": "Vui lòng nhập mật khẩu.",
    "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự.",
    "any.required": "Trường 'password' là bắt buộc.",
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
