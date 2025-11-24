import express from "express";

import authRoutes from "../api/auth/routes.js";
import userRoutes from "../api/users/routes.js";
import songRoutes from "../api/songs/routes.js";
import playlistRoutes from "../api/playlists/routes.js";
import artistRoutes from "../api/artists/routes.js";
import albumRoutes from "../api/albums/routes.js";
import genreRoutes from "../api/genres/routes.js";
import browseRoutes from "../api/browse/routes.js";
import adminRoutes from "../api/admin/index.js";
import statRoutes from "../api/stats/index.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/me", userRoutes);
router.use("/songs", songRoutes);
router.use("/playlists", playlistRoutes);
router.use("/artists", artistRoutes);
router.use("/albums", albumRoutes);
router.use("/genres", genreRoutes);
router.use("/search", browseRoutes);
router.use("/admin", adminRoutes);
router.use("/stats", statRoutes);

export default router;
