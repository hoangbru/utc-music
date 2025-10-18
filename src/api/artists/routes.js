import express from "express"
import { getArtists, getArtist, getArtistSongs, getArtistAlbums } from "./controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/artists:
 *   get:
 *     summary: Get all artists
 *     tags: [Artists]
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
 *         description: List of artists
 */
router.get("/", getArtists)

/**
 * @swagger
 * /api/artists/{id}:
 *   get:
 *     summary: Get artist details
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artist details
 */
router.get("/:id", getArtist)

/**
 * @swagger
 * /api/artists/{id}/songs:
 *   get:
 *     summary: Get artist's songs
 *     tags: [Artists]
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
 *         description: Artist's songs
 */
router.get("/:id/songs", getArtistSongs)

/**
 * @swagger
 * /api/artists/{id}/albums:
 *   get:
 *     summary: Get artist's albums
 *     tags: [Artists]
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
 *         description: Artist's albums
 */
router.get("/:id/albums", getArtistAlbums)

export default router
