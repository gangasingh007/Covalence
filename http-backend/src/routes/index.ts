import express from 'express'
import authRouter from './auth';

const router = express.Router();

router.use("/auth",authRouter)
router.use("/")

export default router;