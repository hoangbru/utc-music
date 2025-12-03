import { Router } from "express";
import {
  getSubscriptionTiers,
  createPayment,
  vnpayCallback,
  getPaymentStatus,
  getPaymentHistory,
  getCurrentSubscription,
  cancelSubscription,
  zaloPayCallback,
} from "./controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../utils/validation.js";
import { createPaymentSchema } from "./validation.js";

const router = Router();

/**
 * @swagger
 * /api/payment/tiers:
 *   get:
 *     summary: Get all available subscription tiers
 *     tags: ["Payment"]
 *     parameters:
 *       - in: query
 *         name: includeFree
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         required: false
 *     responses:
 *       200:
 *         description: List of subscription tiers
 */
router.get("/tiers", getSubscriptionTiers);

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create a payment order
 *     tags: ["Payment"]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tierId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [VNPAY, ZALOPAY]
 *     responses:
 *       200:
 *         description: Payment order created
 */
router.post(
  "/create",
  authMiddleware,
  validateRequest(createPaymentSchema),
  createPayment
);

router.get("/vnpay/callback", vnpayCallback);
router.post("/zalopay/callback", zaloPayCallback);

/**
 * @swagger
 * /api/payment/status/{orderId}:
 *   get:
 *     summary: Check payment status
 *     tags: ["Payment"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 */
router.get("/status/:orderId", authMiddleware, getPaymentStatus);

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     summary: Get user payment history
 *     tags: ["Payment"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: User payment history
 */
router.get("/history", authMiddleware, getPaymentHistory);

/**
 * @swagger
 * /api/payment/subscription:
 *   get:
 *     summary: Get current user subscription
 *     tags: ["Payment"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user subscription
 */
router.get("/subscription", authMiddleware, getCurrentSubscription);

/**
 * @swagger
 * /api/payment/subscription/cancel:
 *   post:
 *     summary: Cancel user subscription (stop auto-renewal)
 *     tags: ["Payment"]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.post("/subscription/cancel", authMiddleware, cancelSubscription);

export default router;
