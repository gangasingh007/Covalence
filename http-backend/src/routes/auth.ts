import express from 'express';

const router = express.Router();

router.post("/register");
router.post("/login");
router.put("/update");
router.get("/me");

export default router;