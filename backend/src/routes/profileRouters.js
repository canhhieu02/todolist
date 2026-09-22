import express from "express";
import { getProfile, updateProfile, changePassword, exportData } from "../controllers/profileControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/password", changePassword);
router.get("/export", exportData); // ?format=json|csv

export default router;
