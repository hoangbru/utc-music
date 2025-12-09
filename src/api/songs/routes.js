import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  getSong,
  trackListening,
  likeSong,
  unlikeSong,
  getSongs,
} from "./controller.js";
import { validateRequest } from "../../utils/validation.js";
import { trackListeningSchema } from "./validation.js";

const router = express.Router();

/**
 * @swagger
 * /api/songs:
 *   get:
 *     summary: Get all songs
 *     tags: [Songs]
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
 *         description: List of songs
 */
router.get("/", getSongs);

/**
 * @swagger
 * /api/songs/{id}:
 *   get:
 *     summary: Get song details
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Song details retrieved
 */
router.get("/:id", getSong);

/**
 * @swagger
 * /api/songs/{id}/track:
 *   post:
 *     summary: Track song listening
 *     tags: [Songs]
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
 *               duration:
 *                 type: integer
 *                 description: Duration listened in seconds
 *                 format: int32
 *                 example: 120
 *     responses:
 *       200:
 *         description: Listening tracked successfully
 */

router.post(
  "/:id/track",
  authMiddleware,
  validateRequest(trackListeningSchema),
  trackListening
);

/**
 * @swagger
 * /api/songs/{id}/like:
 *   post:
 *     summary: Like a song
 *     tags: [Songs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Song liked
 */
router.post("/:id/like", authMiddleware, likeSong);

/**
 * @swagger
 * /api/songs/{id}/unlike:
 *   delete:
 *     summary: Unlike a song
 *     tags: [Songs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Song unliked
 */
router.delete("/:id/unlike", authMiddleware, unlikeSong);

export default router;
