import express from "express"; 
import { getAllUsers, 
         updateUserStatus, 
         getAllJobs, 
         updateJobStatus, 
         adminGetAllApplications, 
         
 } from "../controllers/adminController.js";
import { isAuthorized, isAdmin } from "../middlewares/auth.js";


const router = express.Router();

router.get("/users", isAuthorized, isAdmin, getAllUsers); 
router.put("/users/:id/status", isAuthorized, isAdmin, updateUserStatus); 
router.get("/jobs", isAuthorized, isAdmin, getAllJobs);
router.put("/jobs/:id/status", isAuthorized, isAdmin, updateJobStatus);
router.get("/applications", isAuthorized, isAdmin, adminGetAllApplications);

export default router;