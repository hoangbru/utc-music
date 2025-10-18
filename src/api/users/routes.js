import express from "express"
import { authMiddleware } from "../../middlewares/authMiddleware.js"
import { getCurrentUser, updateProfile, getUserPlaylists, getLikedSongs } from "./controller.js"
import { validateRequest } from "../../utils/validation.js"
import { updateProfileSchema } from "./validation.js"

const router = express.Router()

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get("/", authMiddleware, getCurrentUser)

/**
 * @swagger
 * /api/me:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               avatarUri:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/", authMiddleware, validateRequest(updateProfileSchema), updateProfile)

/**
 * @swagger
 * /api/me/playlists:
 *   get:
 *     summary: Get user's playlists
 *     tags: [Users]
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
 *         description: User playlists retrieved
 */
router.get("/playlists", authMiddleware, getUserPlaylists)

/**
 * @swagger
 * /api/me/liked-songs:
 *   get:
 *     summary: Get user's liked songs
 *     tags: [Users]
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
 *         description: Liked songs retrieved
 */
router.get("/liked-songs", authMiddleware, getLikedSongs)

export default router
