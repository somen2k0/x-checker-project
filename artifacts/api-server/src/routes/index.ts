import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accountsRouter from "./accounts";
import bioRouter from "./bio";
import contactRouter from "./contact";
import tempGmailRouter from "./temp-gmail";
import tempMailRouter from "./temp-mail";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountsRouter);
router.use(bioRouter);
router.use(contactRouter);
router.use(tempGmailRouter);
router.use(tempMailRouter);

export default router;
