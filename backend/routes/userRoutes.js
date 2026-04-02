import express from "express";
import {
  login,
  register,
  logout,
  getUser,
  updateUser,
} from "../controllers/userController.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register",  register);
router.post("/login",     login);
router.get("/logout",     isAuthorized, logout);
router.get("/getuser",    isAuthorized, getUser);
router.get("/admin",      isAuthorized, isAdmin, getUser);
router.put("/profile",    isAuthorized, updateUser); // uses express-fileupload (already in app.js)

export default router;
