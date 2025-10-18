import express from "express"
import { getGenres, getGenreSongs } from "./controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Get all genres
 *     tags: [Genres]
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
 *         description: List of genres
 */
router.get("/", getGenres)

/**
 * @swagger
 * /api/genres/{id}/songs:
 *   get:
 *     summary: Get songs by genre
 *     tags: [Genres]
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
 *         description: Songs in genre
 */
router.get("/:id/songs", getGenreSongs)

export default router
