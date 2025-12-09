import Joi from "joi";

export const trackListeningSchema = Joi.object({
  duration: Joi.number().min(0).max(7200).optional().messages({
    "number.base": "Thời lượng phải là một số.",
    "number.min": "Thời lượng không được nhỏ hơn {#limit}.",
    "number.max": "Thời lượng không được lớn hơn {#limit}.",
  }),
});
