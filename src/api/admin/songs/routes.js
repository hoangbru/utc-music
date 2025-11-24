import express from "express";
import {
  createSong,
  getAllSongs,
  updateSong,
  deleteSong,
} from "./controller.js";
import { validateRequest } from "../../../utils/validation.js";
import { createSongSchema } from "./validation.js";
import upload from "../../../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/songs:
 *   post:
 *     summary: Create song with audio and cover image upload (Admin)
 *     tags: [Admin / Songs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - releaseDate
 *               - albumId
 *               - songFile
 *               - coverImage
 *               - artistIds
 *               - genreIds
 *             properties:
 *               title:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               albumId:
 *                 type: string
 *               lyrics:
 *                 type: string
 *               trackNumber:
 *                 type: integer
 *               artistIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               songFile:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Song created
 */
router.post(
  "/songs",
  upload.fields([
    { name: "songFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validateRequest(createSongSchema),
  createSong
);

/**
 * @swagger
 * /api/admin/songs:
 *   get:
 *     summary: Get all songs (Admin)
 *     tags: [Admin / Songs]
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
 *         description: All songs
 */
router.get("/songs", getAllSongs);

/**
 * @swagger
 * /api/admin/songs/{id}:
 *   put:
 *     summary: Update song with optional file uploads (Admin)
 *     tags: [Admin / Songs]
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
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               lyrics:
 *                 type: string
 *               trackNumber:
 *                 type: integer
 *               songFile:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Song updated
 */
router.put(
  "/songs/:id",
  upload.fields([
    { name: "songFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateSong
);

/**
 * @swagger
 * /api/admin/songs/{id}:
 *   delete:
 *     summary: Delete song (Admin)
 *     tags: [Admin / Songs]
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
 *         description: Song deleted
 */
router.delete("/songs/:id", deleteSong);

export default router;
