import express from "express";
import {
  newReleases,
  featuredAlbums,
  popularArtists,
  getTop50SongsByViews,
  getTop50SongsByGenres,
  getArtistMonthlyListeners,
  getTrendingSongs,
  getTopChartSongs,
} from "./controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/stats/songs/new-releases:
 *   get:
 *     summary: Get new release songs
 *     tags: ["Stats / Public"]
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *         type: integer
 *         default: 20
 *     responses:
 *       200:
 *         description: List of new release songs
 */
router.get("/songs/new-releases", newReleases);

/**
 * @swagger
 * /api/stats/albums/featured:
 *   get:
 *     summary: Get featured albums
 *     tags: ["Stats / Public"]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of featured albums
 */
router.get("/albums/featured", featuredAlbums);

/**
 * @swagger
 * /api/stats/artists/popular:
 *   get:
 *     summary: Get popular artists
 *     tags: ["Stats / Public"]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of popular artists
 */
router.get("/artists/popular", popularArtists);

/**
 * @swagger
 * /api/stats/top-50/songs/by-views:
 *   get:
 *     summary: Get top songs
 *     tags: ["Stats / Public"]
 *     responses:
 *       200:
 *         description: List of songs
 */
router.get("/top-50/songs/by-views", getTop50SongsByViews);

/**
 * @swagger
 * /api/stats/top-50/songs/by-genre/{genreId}:
 *   get:
 *     summary: Get top songs by genre
 *     tags: ["Stats / Public"]
 *     parameters:
 *       - in: path
 *         name: genreId
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *     responses:
 *       200:
 *         description: List of songs
 */
router.get("/top-50/songs/by-genre/:genreId", getTop50SongsByGenres);

/**
 * @swagger
 * /api/stats/artists/{artistId}/monthly-listeners:
 *   get:
 *     summary: Get artist monthly listeners
 *     tags: ["Stats / Public"]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: Monthly listeners count
 */
router.get("/artists/:artistId/monthly-listeners", getArtistMonthlyListeners);

/**
 * @swagger
 * /api/stats/songs/trending:
 *   get:
 *     summary: Get trending songs
 *     tags: ["Stats / Public"]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of trending songs
 */
router.get("/songs/trending", getTrendingSongs);

/**
 * @swagger
 * /api/stats/charts/top-songs:
 *   get:
 *     summary: Get top chart songs
 *     tags: ["Stats / Public"]
 *     parameters:
 *       - in: query
 *         name: period
 *         description: Time period for the chart
 *         schema:
 *           type: string
 *           enum: [week, month, all]
 *           default: week
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of top chart songs
 */
router.get("/charts/top-songs", getTopChartSongs);

export default router;
