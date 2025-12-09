import express from "express";
import { getAllUsers, updateUserStatus } from "./controller.js";
import { validateRequest } from "../../../utils/validation.js";
import { updateUserStatusSchema } from "./validation.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Admin / Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: All users
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status (Admin)
 *     tags: [Admin / Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING]
 *     responses:
 *       200:
 *         description: User status updated
 */
router.put(
  "/:id/status",
  validateRequest(updateUserStatusSchema),
  updateUserStatus
);

export default router;
