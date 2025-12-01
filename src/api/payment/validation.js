import Joi from "joi";

export const createPaymentSchema = Joi.object({
  tierId: Joi.string().uuid().messages({
    "string.base": "Tier ID phải là một chuỗi.",
    "string.guid": "Tier ID phải là một UUID hợp lệ.",
  }),

  paymentMethod: Joi.string()
    .valid("VNPAY", "ZALOPAY")
    .messages({
      "string.base": "Phương thức thanh toán phải là một chuỗi.",
      "any.only":
        "Phương thức thanh toán phải là một trong các giá trị sau: VNPAY, ZALOPAY",
    }),
});
