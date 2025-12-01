import { formatDate } from "./format.js";
import crypto from "crypto";
import querystring from "qs";
import prisma from "../config/db.js";
import { VNPAY_CONFIG, ZALOPAY_CONFIG } from "../config/payment.js";
import { sortObject } from "./helpers.js";

export const createVNPayPaymentUrl = (
  orderId,
  amount,
  orderInfo,
  ipAddress
) => {
  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 minutes

  let vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPAY_CONFIG.tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
    vnp_IpAddr: ipAddress,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  vnpParams = sortObject(vnpParams);

  const signData = querystring.stringify(vnpParams, { encode: false });

  const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnpParams["vnp_SecureHash"] = signed;

  const paymentUrl =
    VNPAY_CONFIG.url + "?" + querystring.stringify(vnpParams, { encode: false });
  return paymentUrl;
};

export const verifyVNPaySignature = (vnpParams) => {
  const secureHash = vnpParams["vnp_SecureHash"];

  const paramsToVerify = { ...vnpParams };
  delete paramsToVerify["vnp_SecureHash"];
  delete paramsToVerify["vnp_SecureHashType"];

  const sortedParams = sortObject(paramsToVerify);
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", VNPAY_CONFIG.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
};

export const createZaloPayPayment = async(orderId, amount, orderInfo) => {
  const embedData = {
    redirecturl: ZALOPAY_CONFIG.callbackUrl,
  };

  const items = [
    {
      itemid: orderId,
      itemname: orderInfo,
      itemprice: amount,
      itemquantity: 1,
    },
  ];

  const transId = formatDate(new Date()).substring(0, 6);
  const appTransId = `${transId}_${orderId}`; // yyMMdd_orderId

  const order = {
    app_id: ZALOPAY_CONFIG.appId,
    app_trans_id: appTransId,
    app_user: "demo",
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embedData),
    amount: amount,
    description: orderInfo,
    bank_code: "",
    callback_url: ZALOPAY_CONFIG.callbackUrl,
  };

  // Create mac (signature)
  const data =
    order.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;

  order.mac = crypto
    .createHmac("sha256", ZALOPAY_CONFIG.key1)
    .update(data)
    .digest("hex");

  try {
    const response = await fetch(ZALOPAY_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(order).toString(),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error("Failed to create ZaloPay payment");
  }
}

export const verifyZaloPaySignature = (dataStr, reqMac) => {
  const mac = crypto
    .createHmac("sha256", ZALOPAY_CONFIG.key2)
    .update(dataStr)
    .digest("hex");
  return mac === reqMac;
}

export const handleSuccessfulPayment = async (
  paymentId,
  transactionId,
  gatewayResponse
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { tier: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "SUCCESS",
      transactionId,
      paidAt: new Date(),
      gatewayResponse,
    },
  });

  if (payment.tierId) {
    const tier = payment.tier;
    const now = new Date();
    const endDate = new Date(
      now.getTime() + tier.duration * 24 * 60 * 60 * 1000
    );

    await prisma.userSubscription.create({
      data: {
        userId: payment.userId,
        tierId: payment.tierId,
        status: "ACTIVE",
        startDate: now,
        endDate: endDate,
        autoRenew: false,
      },
    });

    await prisma.user.update({
      where: { id: payment.userId },
      data: {
        isPremium: true,
        premiumUntil: endDate,
      },
    });
  }

  console.log("Payment successful:", paymentId);
};

export const handleFailedPayment = async (paymentId, gatewayResponse) => {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "FAILED",
      failedAt: new Date(),
      gatewayResponse,
    },
  });

  console.log("Payment failed:", paymentId);
};
