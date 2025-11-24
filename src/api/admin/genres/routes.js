import express from "express";
import {
  createGenre,
  getAllGenres,
  updateGenre,
  deleteGenre,
} from "./controller.js";
import { validateRequest } from "../../../utils/validation.js";
import { createGenreSchema } from "./validation.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/genres:
 *   post:
 *     summary: Create genre (Admin)
 *     tags: [Admin / Genres]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Genre created
 */
router.post("/genres", validateRequest(createGenreSchema), createGenre);

/**
 * @swagger
 * /api/admin/genres:
 *   get:
 *     summary: Get all genres (Admin)
 *     tags: [Admin / Genres]
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
 *         description: All genres
 */
router.get("/genres", getAllGenres);

/**
 * @swagger
 * /api/admin/genres/{id}:
 *   put:
 *     summary: Update genre (Admin)
 *     tags: [Admin / Genres]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Genre updated
 */
router.put("/genres/:id", updateGenre);

/**
 * @swagger
 * /api/admin/genres/{id}:
 *   delete:
 *     summary: Delete genre (Admin)
 *     tags: [Admin / Genres]
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
 *         description: Genre deleted
 */
router.delete("/genres/:id", deleteGenre);

export default router;
