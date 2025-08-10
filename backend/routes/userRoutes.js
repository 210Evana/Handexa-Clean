import express from "express";
import { login, register, logout, getUser,updateUser } from "../controllers/userController.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for Cloudinary

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthorized, logout);
router.get("/getuser", isAuthorized, getUser);
router.get("/admin", isAuthorized, isAdmin, getUser);
router.put("/profile", isAuthorized, upload.single("avatar"), updateUser);

export default router;
