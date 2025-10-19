import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  getCurrentUser,
  updateProfile,
  getUserPlaylists,
  getLikedSongs,
  deleteAvatar,
} from "./controller.js";
import upload from "../../middlewares/upload.js";
import { validateRequest } from "../../utils/validation.js";
import { updateProfileSchema } from "./validation.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

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
router.get("/", getCurrentUser);

/**
 * @swagger
 * /api/me:
 *   put:
 *     summary: Update user profile with optional avatar upload
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put(
  "/",
  upload.single("avatar"),
  validateRequest(updateProfileSchema),
  updateProfile
);

/**
 * @swagger
 * /api/me/avatar:
 *   delete:
 *     summary: Delete user avatar
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted
 */
router.delete("/avatar", deleteAvatar);

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
router.get("/playlists", getUserPlaylists);

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
router.get("/liked-songs", getLikedSongs);

export default router;
