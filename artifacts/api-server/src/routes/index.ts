import { Router, type IRouter } from "express";
import { aiRateLimiter } from "../middlewares/security";
import healthRouter from "./health";
import accountsRouter from "./accounts";
import bioRouter from "./bio";
import contactRouter from "./contact";
import tempGmailRouter from "./temp-gmail";
import tempMailRouter from "./temp-mail";
import temptfRouter from "./temptf";
import adminRouter from "./admin";
import ogPreviewRouter from "./og-preview";
import onesecmailRouter from "./onesecmail";
import aiDetectorRouter from "./ai-detector";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountsRouter);
router.use(contactRouter);
router.use(tempGmailRouter);
router.use(tempMailRouter);
router.use(temptfRouter);
router.use(adminRouter);
router.use(ogPreviewRouter);
router.use(onesecmailRouter);

// AI-powered routes: 10 requests per IP per hour
router.use(aiRateLimiter, bioRouter);
router.use(aiRateLimiter, aiDetectorRouter);

export default router;
