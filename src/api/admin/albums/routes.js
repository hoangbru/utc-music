import express from "express";
import {
  createAlbum,
  getAllAlbums,
  updateAlbum,
  deleteAlbum,
} from "./controller.js";
import { validateRequest } from "../../../utils/validation.js";
import { createAlbumSchema } from "./validation.js";
import upload from "../../../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/albums:
 *   post:
 *     summary: Create an album (Admin)
 *     tags: [Admin / Albums]
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
 *               - artistIds
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Midnight Memories"
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-12"
 *               coverUri:
 *                 type: string
 *                 format: binary
 *                 nullable: true
 *               artistIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Album created
 */
router.post(
  "/",
  upload.single("coverUri"),
  validateRequest(createAlbumSchema),
  createAlbum
);

/**
 * @swagger
 * /api/admin/albums:
 *   get:
 *     summary: Get all albums (Admin)
 *     tags: [Admin / Albums]
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
 *         description: All albums
 */
router.get("/", getAllAlbums);

/**
 * @swagger
 * /api/admin/albums/{id}:
 *   put:
 *     summary: Update album (Admin)
 *     tags: [Admin / Albums]
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
 *               coverUri:
 *                 type: string
 *                 format: binary
 *                 nullable: true
 *               artistIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Album updated
 */
router.put("/:id", upload.single("coverUri"), updateAlbum);

/**
 * @swagger
 * /api/admin/albums/{id}:
 *   delete:
 *     summary: Delete album (Admin)
 *     tags: [Admin / Albums]
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
 *         description: Album deleted
 */
router.delete("/:id", deleteAlbum);

export default router;
