import express from "express"
import { authMiddleware } from "../../middlewares/authMiddleware.js"
import { getSong, playSong, likeSong, unlikeSong } from "./controller.js"

const router = express.Router()

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
router.get("/:id", getSong)

/**
 * @swagger
 * /api/songs/{id}/play:
 *   post:
 *     summary: Record song play
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
 *         description: Play recorded
 */
router.post("/:id/play", authMiddleware, playSong)

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
router.post("/:id/like", authMiddleware, likeSong)

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
router.delete("/:id/unlike", authMiddleware, unlikeSong)

export default router
