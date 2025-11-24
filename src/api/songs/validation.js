import Joi from "joi";

export const trackListeningSchema = Joi.object({
  duration: Joi.number().min(0).max(7200).optional().messages({
    "number.base": "Thời lượng phải là một số.",
    "number.min": "Thời lượng không được nhỏ hơn {#limit}.",
    "number.max": "Thời lượng không được lớn hơn {#limit}.",
  }),

  completionRate: Joi.number().min(0).max(100).optional().messages({
    "number.base": "Tỷ lệ hoàn thành phải là một số.",
    "number.min": "Tỷ lệ hoàn thành không được nhỏ hơn {#limit}.",
    "number.max": "Tỷ lệ hoàn thành không được lớn hơn {#limit}.",
  }),
});
