import express from "express"
import { authMiddleware } from "../../middlewares/authMiddleware.js"
import { adminMiddleware } from "../../middlewares/adminMiddleware.js"
import {
  createSong,
  getAllSongs,
  updateSong,
  deleteSong,
  createArtist,
  getAllArtists,
  updateArtist,
  deleteArtist,
  verifyArtist,
  createAlbum,
  getAllAlbums,
  updateAlbum,
  deleteAlbum,
  createGenre,
  getAllGenres,
  updateGenre,
  deleteGenre,
  getAllUsers,
  updateUserStatus,
} from "./controller.js"
import { validateRequest } from "../../utils/validation.js"
import {
  createSongSchema,
  createArtistSchema,
  createAlbumSchema,
  createGenreSchema,
  updateUserStatusSchema,
} from "./validation.js"

const router = express.Router()

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware)

// --- SONGS ---

/**
 * @swagger
 * /api/admin/songs:
 *   post:
 *     summary: Create song (Admin)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: number
 *               releaseDate:
 *                 type: string
 *               url:
 *                 type: string
 *               coverUri:
 *                 type: string
 *     responses:
 *       201:
 *         description: Song created
 */
router.post("/songs", validateRequest(createSongSchema), createSong)

/**
 * @swagger
 * /api/admin/songs:
 *   get:
 *     summary: Get all songs (Admin)
 *     tags: [Admin]
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
router.get("/songs", getAllSongs)

/**
 * @swagger
 * /api/admin/songs/{id}:
 *   put:
 *     summary: Update song (Admin)
 *     tags: [Admin]
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
 *         description: Song updated
 */
router.put("/songs/:id", updateSong)

/**
 * @swagger
 * /api/admin/songs/{id}:
 *   delete:
 *     summary: Delete song (Admin)
 *     tags: [Admin]
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
router.delete("/songs/:id", deleteSong)

// --- ARTISTS ---

/**
 * @swagger
 * /api/admin/artists:
 *   post:
 *     summary: Create artist (Admin)
 *     tags: [Admin]
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
 *               biography:
 *                 type: string
 *               avatarUri:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artist created
 */
router.post("/artists", validateRequest(createArtistSchema), createArtist)

/**
 * @swagger
 * /api/admin/artists:
 *   get:
 *     summary: Get all artists (Admin)
 *     tags: [Admin]
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
router.get("/artists", getAllArtists)

/**
 * @swagger
 * /api/admin/artists/{id}:
 *   put:
 *     summary: Update artist (Admin)
 *     tags: [Admin]
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
 *         description: Artist updated
 */
router.put("/artists/:id", updateArtist)

/**
 * @swagger
 * /api/admin/artists/{id}:
 *   delete:
 *     summary: Delete artist (Admin)
 *     tags: [Admin]
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
router.delete("/artists/:id", deleteArtist)

/**
 * @swagger
 * /api/admin/artists/{id}/verify:
 *   put:
 *     summary: Verify artist (Admin)
 *     tags: [Admin]
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
router.put("/artists/:id/verify", verifyArtist)

// --- ALBUMS ---

/**
 * @swagger
 * /api/admin/albums:
 *   post:
 *     summary: Create album (Admin)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *               coverUri:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Album created
 */
router.post("/albums", validateRequest(createAlbumSchema), createAlbum)

/**
 * @swagger
 * /api/admin/albums:
 *   get:
 *     summary: Get all albums (Admin)
 *     tags: [Admin]
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
router.get("/albums", getAllAlbums)

/**
 * @swagger
 * /api/admin/albums/{id}:
 *   put:
 *     summary: Update album (Admin)
 *     tags: [Admin]
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
 *         description: Album updated
 */
router.put("/albums/:id", updateAlbum)

/**
 * @swagger
 * /api/admin/albums/{id}:
 *   delete:
 *     summary: Delete album (Admin)
 *     tags: [Admin]
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
router.delete("/albums/:id", deleteAlbum)

// --- GENRES ---

/**
 * @swagger
 * /api/admin/genres:
 *   post:
 *     summary: Create genre (Admin)
 *     tags: [Admin]
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
router.post("/genres", validateRequest(createGenreSchema), createGenre)

/**
 * @swagger
 * /api/admin/genres:
 *   get:
 *     summary: Get all genres (Admin)
 *     tags: [Admin]
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
router.get("/genres", getAllGenres)

/**
 * @swagger
 * /api/admin/genres/{id}:
 *   put:
 *     summary: Update genre (Admin)
 *     tags: [Admin]
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
 *         description: Genre updated
 */
router.put("/genres/:id", updateGenre)

/**
 * @swagger
 * /api/admin/genres/{id}:
 *   delete:
 *     summary: Delete genre (Admin)
 *     tags: [Admin]
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
router.delete("/genres/:id", deleteGenre)

// --- USERS ---

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Admin]
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
 *         description: All users
 */
router.get("/users", getAllUsers)

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status (Admin)
 *     tags: [Admin]
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
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING]
 *     responses:
 *       200:
 *         description: User status updated
 */
router.put("/users/:id/status", validateRequest(updateUserStatusSchema), updateUserStatus)

export default router
