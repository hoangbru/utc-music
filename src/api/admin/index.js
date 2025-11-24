import express from "express";

import songsRouter from "./songs/routes.js";
import artistsRouter from "./artists/routes.js";
import albumsRouter from "./albums/routes.js";
import genresRouter from "./genres/routes.js";
import usersRouter from "./users/routes.js";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { adminMiddleware } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.use("/songs", songsRouter);
router.use("/artists", artistsRouter);
router.use("/albums", albumsRouter);
router.use("/genres", genresRouter);
router.use("/users", usersRouter);

export default router;
