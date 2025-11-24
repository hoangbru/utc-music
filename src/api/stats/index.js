import express from "express";
import personalRoutes from "./personal/route.js";
import publicRoutes from "./public/routes.js";

const router = express.Router();

router.use("/me", personalRoutes);
router.use("/", publicRoutes);

export default router;
