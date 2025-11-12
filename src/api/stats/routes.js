import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { getTop100SongsByGenres, getTop100SongsByViews } from "./controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/stats/top-100/songs:
 *   get:
 *     summary: Get top 100 songs by views
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: List of songs
 */
router.get("/top-100/songs", getTop100SongsByViews);

/**
 * @swagger
 * /api/stats/top-100/songs/by-genre/{genreId}:
 *   get:
 *     summary: Get top 100 songs by genres
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: List of songs
 */
router.get("/top-100/songs/by-genre/:genreId", getTop100SongsByGenres);

export default router;
