import express from "express";
import {
  getTopSongs,
  getTopArtists,
  getTopGenres,
  getListeningHistory,
  getRecentlyPlayed,
  getDiscoveryStats,
  getYearWrapped,
} from "./controller.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/stats/personal/top-songs:
 *   get:
 *     summary: Get top songs
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of songs
 */
router.get("/top-songs", getTopSongs);

/**
 * @swagger
 * /api/stats/personal/top-artists:
 *   get:
 *     summary: Get top artists
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of artists
 */
router.get("/top-artists", getTopArtists);

/**
 * @swagger
 * /api/stats/personal/top-genres:
 *   get:
 *     summary: Get top genres
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of genres
 */
router.get("/top-genres", getTopGenres);

/**
 * @swagger
 * /api/stats/personal/listening-history:
 *   get:
 *     summary: Get listening history
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Listening history data
 */
router.get("/listening-history", getListeningHistory);

/**
 * @swagger
 * /api/stats/personal/recently-played:
 *   get:
 *     summary: Get recently played songs
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of recently played songs
 */
router.get("/recently-played", getRecentlyPlayed);

/**
 * @swagger
 * /api/stats/personal/discovery:
 *   get:
 *     summary: Get discovery stats
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Discovery stats data
 */
router.get("/discovery", getDiscoveryStats);

/**
 * @swagger
 * /api/stats/personal/wrapped/{year}:
 *   get:
 *     summary: Get year wrapped stats
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year for the wrapped stats
 *     responses:
 *       200:
 *         description: Year wrapped stats data
 */
router.get("/wrapped/:year", getYearWrapped);

export default router;
