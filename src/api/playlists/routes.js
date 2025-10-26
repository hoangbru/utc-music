import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  createPlaylist,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderSongs,
} from "./controller.js";
import { validateRequest } from "../../utils/validation.js";
import {
  createPlaylistSchema,
  updatePlaylistSchema,
  addSongSchema,
  reorderSongsSchema,
} from "./validation.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();
/**
 * @swagger
 * /api/playlists:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageUri:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Playlist created
 */
router.post(
  "/",
  authMiddleware,
  upload.single("imageUri"),
  validateRequest(createPlaylistSchema),
  createPlaylist
);

/**
 * @swagger
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist details
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Playlist retrieved
 */
router.get("/:id", getPlaylist);

/**
 * @swagger
 * /api/playlists/{id}:
 *   put:
 *     summary: Update playlist
 *     tags: [Playlists]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageUri:
 *                 type: string
 *                 format: binary
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Playlist updated
 */
router.put(
  "/:id",
  authMiddleware,
  upload.single("imageUri"),
  validateRequest(updatePlaylistSchema),
  updatePlaylist
);

/**
 * @swagger
 * /api/playlists/{id}:
 *   delete:
 *     summary: Delete playlist
 *     tags: [Playlists]
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
 *         description: Playlist deleted
 */
router.delete("/:id", authMiddleware, deletePlaylist);

/**
 * @swagger
 * /api/playlists/{id}/add-song:
 *   post:
 *     summary: Add song to playlist
 *     tags: [Playlists]
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
 *               songId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Song added
 */
router.post("/:id/add-song", authMiddleware, validateRequest(addSongSchema), addSongToPlaylist);

/**
 * @swagger
 * /api/playlists/{id}/remove-song:
 *   delete:
 *     summary: Remove song from playlist
 *     tags: [Playlists]
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
 *               songId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Song removed
 */
router.delete("/:id/remove-song", authMiddleware, removeSongFromPlaylist);

/**
 * @swagger
 * /api/playlists/{id}/reorder:
 *   put:
 *     summary: Reorder songs in playlist
 *     tags: [Playlists]
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
 *               songs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     songId:
 *                       type: string
 *                     newPosition:
 *                       type: number
 *     responses:
 *       200:
 *         description: Songs reordered
 */
router.put("/:id/reorder", authMiddleware, validateRequest(reorderSongsSchema), reorderSongs);

export default router;
