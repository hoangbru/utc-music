import Joi from "joi";

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("ACTIVE", "INACTIVE", "PENDING").required(),
});
