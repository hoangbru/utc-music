import express from "express";
import { register, login, refreshToken } from "./controller.js";
import { validateRequest } from "../../utils/validation.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./validation.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/register", validateRequest(registerSchema), register);

// =========================================================================
// FEATURE DISABLED
// =========================================================================
// TODO: Re-enable email verification feature.
// /**
//  * @swagger
//  * /api/auth/verify-email:
//  *   post:
//  *     summary: Verify user email
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *               code:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Email verified successfully
//  */
// router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail)
// =========================================================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", validateRequest(loginSchema), login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 */
router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  refreshToken
);

export default router;
