import express from "express";
import {
  getTopSongs,
  getTopArtists,
  getTopGenres,
  getListeningHistory,
  getRecentlyPlayed,
  getDiscoveryStats,
  getYearWrapped,
  getTopAlbums,
} from "./controller.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/stats/me/top-songs:
 *   get:
 *     summary: Get top songs
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enums: [day, week, month]
 *           default: month
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of songs
 */
router.get("/top-songs", getTopSongs);

/**
 * @swagger
 * /api/stats/me/top-artists:
 *   get:
 *     summary: Get top artists
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enums: [day, week, month]
 *           default: month
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of artists
 */
router.get("/top-artists", getTopArtists);

/**
 * @swagger
 * /api/stats/me/top-genres:
 *   get:
 *     summary: Get top genres
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enums: [day, week, month]
 *           default: month
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of genres
 */
router.get("/top-genres", getTopGenres);

/**
 * @swagger
 * /api/stats/me/top-albums:
 *   get:
 *     summary: Get top albums
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enums: [day, week, month]
 *           default: month
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of albums
 */
router.get("/top-albums", getTopAlbums);

/**
 * @swagger
 * /api/stats/me/listening-history:
 *   get:
 *     summary: Get listening history
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Listening history data
 */
router.get("/listening-history", getListeningHistory);

/**
 * @swagger
 * /api/stats/me/recently-played:
 *   get:
 *     summary: Get recently played songs
 *     tags: ["Stats / Personal"]
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
 *         description: List of recently played songs
 */
router.get("/recently-played", getRecentlyPlayed);

/**
 * @swagger
 * /api/stats/me/discovery:
 *   get:
 *     summary: Get discovery stats
 *     tags: ["Stats / Personal"]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enums: [day, week, month]
 *           default: week
 *     responses:
 *       200:
 *         description: Discovery stats data
 */
router.get("/discovery", getDiscoveryStats);

/**
 * @swagger
 * /api/stats/me/wrapped/{year}:
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
 *     responses:
 *       200:
 *         description: Year wrapped stats data
 */
router.get("/wrapped/:year", getYearWrapped);

export default router;
