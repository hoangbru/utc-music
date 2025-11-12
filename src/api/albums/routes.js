import express from "express"
import { getAlbums, getAlbum } from "./controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/albums:
 *   get:
 *     summary: Get all albums
 *     tags: [Albums]
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
 *         description: List of albums
 */
router.get("/", getAlbums)

/**
 * @swagger
 * /api/albums/{id}:
 *   get:
 *     summary: Get album details
 *     tags: [Albums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Album details with songs
 */
router.get("/:id", getAlbum)

export default router
