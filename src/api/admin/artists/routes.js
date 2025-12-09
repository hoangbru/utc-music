import express from "express";
import {
  createArtist,
  getAllArtists,
  updateArtist,
  deleteArtist,
  verifyArtist,
} from "./controller.js";
import { validateRequest } from "../../../utils/validation.js";
import { createArtistSchema } from "./validation.js";
import upload from "../../../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/artists:
 *   post:
 *     summary: Create artist with optional avatar upload (Admin)
 *     tags: [Admin / Artists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               country:
 *                 type: string
 *               avatarUri:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Artist created
 */
router.post(
  "/",
  upload.single("avatarUri"),
  validateRequest(createArtistSchema),
  createArtist
);

/**
 * @swagger
 * /api/admin/artists:
 *   get:
 *     summary: Get all artists (Admin)
 *     tags: [Admin / Artists]
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
 *         description: All artists
 */
router.get("/", getAllArtists);

/**
 * @swagger
 * /api/admin/artists/{id}:
 *   put:
 *     summary: Update an artist (Admin)
 *     tags: [Admin / Artists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The artist ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               country:
 *                 type: string
 *               avatarUri:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Artist updated
 */
router.put(
  "/:id",
  upload.single("avatarUri"),
  validateRequest(createArtistSchema),
  updateArtist
);

/**
 * @swagger
 * /api/admin/artists/{id}:
 *   delete:
 *     summary: Delete artist (Admin)
 *     tags: [Admin / Artists]
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
 *         description: Artist deleted
 */
router.delete("/:id", deleteArtist);

/**
 * @swagger
 * /api/admin/artists/{id}/verify:
 *   put:
 *     summary: Verify artist (Admin)
 *     tags: [Admin / Artists]
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
 *         description: Artist verified
 */
router.put("/:id/verify", verifyArtist);

export default router;
