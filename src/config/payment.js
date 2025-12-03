export const VNPAY_CONFIG = {
  tmnCode: process.env.VNPAY_TMN_CODE || "",
  hashSecret: process.env.VNPAY_HASH_SECRET || "",
  url:
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl:
    `${process.env.API_URL}/${process.env.VNPAY_RETURN_URL}` ||
    "http://localhost:3000/api/payment/vnpay/callback",
};

export const ZALOPAY_CONFIG = {
  appId: process.env.ZALOPAY_APP_ID || "",
  key1: process.env.ZALOPAY_KEY1 || "",
  key2: process.env.ZALOPAY_KEY2 || "",
  apiUrl:
    process.env.ZALOPAY_API_URL || "https://sb-openapi.zalopay.vn/v2/create",
  callbackUrl:
    `${process.env.API_URL}/${process.env.ZALOPAY_RETURN_URL}` ||
    "http://localhost:3000/api/payment/zalopay/callback",
};
