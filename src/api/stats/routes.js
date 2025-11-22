import express from "express";
import personalRoutes from "./personal/route.js";
import publicRoutes from "./public/routes.js";

const router = express.Router();

router.use("/personal", personalRoutes);
router.use("/public", publicRoutes);

export default router;
