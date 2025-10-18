import express from "express"
import { search } from "./controller.js"

const router = express.Router()

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for songs, artists, albums
 *     tags: [Browse]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/", search)

export default router
