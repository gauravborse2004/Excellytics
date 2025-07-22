import express from "express";
import { login, logout, signup, checkAuth, forgotPassword, resetPassword, dashboard ,userData, deleteUser} from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/forgotpassword",forgotPassword);

router.post('/resetpassword', resetPassword);

router.get("/check", protectRoute, checkAuth);

router.get("/dashboard", protectRoute, dashboard)

router.get("/userdata", protectRoute, userData)

router.delete('/deleteuser/:id' , protectRoute, deleteUser);

export default router;