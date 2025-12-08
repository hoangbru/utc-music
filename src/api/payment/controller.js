import prisma from "../../config/db.js";
import {
  createVNPayPaymentUrl,
  verifyVNPaySignature,
  verifyZaloPaySignature,
  handleSuccessfulPayment,
  handleFailedPayment,
  createZaloPayPayment,
} from "../../utils/payment.js";
import { generateOrderId, successResponse } from "../../utils/helpers.js";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
} from "../../constants/payment.js";
import { frontendUrl } from "../../constants/index.js";

export async function getSubscriptionTiers(req, res, next) {
  try {
    const includeFree = req.query.includeFree !== "false";

    const whereClause = {
      isActive: true,
    };

    if (!includeFree) {
      whereClause.plan = {
        not: "FREE",
      };
    }
    
    const tiers = await prisma.subscriptionTier.findMany({
      where: whereClause,
      orderBy: { price: "desc" },
    });

    successResponse(res, tiers);
  } catch (error) {
    next(error);
  }
}

export async function createPayment(req, res, next) {
  try {
    const userId = req.user.userId;
    const { tierId, paymentMethod } = req.body;

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment method. Must be VNPAY or ZALOPAY.",
      });
    }

    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: tierId },
    });

    if (!tier || !tier.isActive) {
      return res.status(404).json({
        success: false,
        error: "Subscription tier not found or inactive",
      });
    }

    if (tier.plan === "FREE") {
      return res.status(400).json({
        success: false,
        error: "Cannot create payment for FREE tier",
      });
    }

    const subscriptionPremium = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      },
      include: { tier: true },
      orderBy: [{ tier: { price: "desc" } }, { endDate: "desc" }],
    });

    if (subscriptionPremium.tier.plan !== SUBSCRIPTION_PLAN.FREE) {
      return res.status(400).json({
        success: false,
        error: "You already have an active Premium subscription",
      });
    }

    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "Unknown";

    const orderId = generateOrderId();

    const payment = await prisma.payment.create({
      data: {
        userId,
        tierId,
        amount: tier.price,
        status: PAYMENT_STATUS.PENDING,
        paymentMethod: paymentMethod,
        gatewayOrderId: orderId,
        description: `Thanh toan goi ${tier.name}`,
        ipAddress,
        userAgent,
      },
    });

    let paymentUrl = "";

    if (paymentMethod === "VNPAY") {
      paymentUrl = createVNPayPaymentUrl(
        orderId,
        tier.price,
        `Thanh toan goi ${tier.name}`,
        ipAddress
      );
    } else if (paymentMethod === "ZALOPAY") {
      const zaloPayResponse = await createZaloPayPayment(
        orderId,
        userId,
        tier.price,
        `Thanh toan goi ${tier.name}`
      );

      if (zaloPayResponse.return_code !== 1) {
        return res.status(400).json({
          success: false,
          error: "Failed to create ZaloPay payment",
          details: zaloPayResponse,
        });
      }

      paymentUrl = zaloPayResponse.order_url;
    }

    const data = {
      paymentId: payment.id,
      orderId: payment.gatewayOrderId,
      paymentUrl,
      amount: payment.amount,
      tier: tier.name,
    };

    successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

export async function vnpayCallback(req, res, next) {
  try {
    const vnpParams = req.query;

    const isValid = verifyVNPaySignature(vnpParams);

    if (!isValid) {
      console.error("Invalid VNPay signature");
      return res.redirect(
        `${frontendUrl}/payment/result?status=error&message=invalid_signature`
      );
    }

    const orderId = vnpParams["vnp_TxnRef"];
    const responseCode = vnpParams["vnp_ResponseCode"];
    const transactionId = vnpParams["vnp_TransactionNo"];
    const amount = parseInt(vnpParams["vnp_Amount"]) / 100;

    const payment = await prisma.payment.findUnique({
      where: { gatewayOrderId: orderId },
      include: { tier: true },
    });

    if (!payment) {
      console.error("Payment not found:", orderId);
      return res.redirect(
        `${frontendUrl}/payment/result?status=error&message=payment_not_found`
      );
    }

    if (Math.abs(amount - payment.amount) > 0.01) {
      console.error("Amount mismatch detected!", {
        expected: payment.amount,
        received: amount,
        orderId,
        difference: Math.abs(amount - payment.amount),
      });

      return res.redirect(
        `${frontendUrl}/payment/result?status=error&message=amount_mismatch`
      );
    }

    if (responseCode === "00") {
      await handleSuccessfulPayment(payment.id, transactionId, vnpParams);
      return res.redirect(
        `${frontendUrl}/payment/result?status=success&orderId=${orderId}`
      );
    } else {
      await handleFailedPayment(payment.id, vnpParams);
      return res.redirect(
        `${frontendUrl}/payment/result?status=failed&orderId=${orderId}&code=${responseCode}`
      );
    }
  } catch (error) {
    console.error("VNPay callback error:", error);
    res.redirect(`${frontendUrl}/payment/result?status=error`);
  }
}

export async function zaloPayCallback(req, res) {
  const result = {
    return_code: 0,
    return_message: "error",
  };

  try {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    const isValid = verifyZaloPaySignature(dataStr, reqMac);
    if (!isValid) {
      console.error("Invalid ZaloPay signature");
      result.return_code = -1;
      result.return_message = "Invalid signature";
      return res.json(result);
    }

    const dataJson = JSON.parse(dataStr);
    const appTransId = dataJson["app_trans_id"];
    const orderId = appTransId.split("_")[1];
    const amount = dataJson["amount"];

    const payment = await prisma.payment.findUnique({
      where: { gatewayOrderId: orderId },
      include: { tier: true },
    });

    if (!payment) {
      console.error("Payment not found:", orderId);
      result.return_message = "Payment not found";
    }

    if (Math.abs(amount - payment.amount) > 0.01) {
      console.error("Amount mismatch:", {
        expected: payment.amount,
        received: amount,
        orderId,
      });
      result.return_message = "Amount mismatch";
      return res.json(result);
    }

    await handleSuccessfulPayment(payment.id, appTransId, dataJson);

    result.return_code = 1;
    result.return_message = "success";
    return res.json(result);
  } catch (error) {
    console.error("ZaloPay callback error:", error);
    return res.json({
      return_code: 0,
      return_message: "Internal server error",
    });
  }
}

export async function getPaymentStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const payment = await prisma.payment.findFirst({
      where: {
        gatewayOrderId: orderId,
        userId,
      },
      include: {
        tier: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    successResponse(res, payment)
  } catch (error) {
    next(error);
  }
}

export async function getPaymentHistory(req, res, next) {
  try {
    const userId = req.user.userId;
    const limit = Number.parseInt(req.query.limit) || 20;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: { tier: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    successResponse(res, payments)
  } catch (error) {
    next(error);
  }
}

export async function getCurrentSubscription(req, res, next) {
  try {
    const userId = req.user.userId;

    const activeSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      },
      include: { tier: true },
      orderBy: [{ tier: { price: "desc" } }, { endDate: "desc" }],
    });

    const primarySubscription = activeSubscriptions[0];
    const isPremium = primarySubscription.tier.plan !== SUBSCRIPTION_PLAN.FREE;

    let daysRemaining = null;
    if (isPremium && primarySubscription.endDate) {
      const now = new Date();
      const endDate = new Date(primarySubscription.endDate);
      daysRemaining = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining < 0) daysRemaining = 0;
    }

    successResponse(res, {
      plan: primarySubscription.tier.name,
      isPremium: primarySubscription.tier.plan !== SUBSCRIPTION_PLAN.FREE,
      status: primarySubscription.status,
      startDate: primarySubscription.startDate,
      endDate:
        primarySubscription.tier.plan !== SUBSCRIPTION_PLAN.FREE
          ? primarySubscription.endDate
          : null,
      autoRenew: primarySubscription.autoRenew,
      features: primarySubscription.tier.features,
      daysRemaining,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelSubscription(req, res, next) {
  try {
    const userId = req.user.userId;
    const { reason } = req.body;

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      },
      include: { tier: true },
      orderBy: [{ tier: { price: "desc" } }, { endDate: "desc" }],
    });

    if (subscription.tier.plan === SUBSCRIPTION_PLAN.FREE) {
      return res.status(404).json({
        success: false,
        error: "No active premium subscription found",
      });
    }

    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        autoRenew: false,
        cancelledAt: new Date(),
        cancellationReason: reason || "User requested",
      },
    });

    const data = {
      currentPlan: subscription.tier.name,
      expiresAt: subscription.endDate,
      daysRemaining: Math.ceil(
        (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    };

    successResponse(
      res,
      data,
      "Subscription cancelled. You can continue using premium until the end date"
    );
  } catch (error) {
    next(error);
  }
}
