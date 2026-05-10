import { Router, type IRouter } from "express";
import healthRouter from "./health";
import accountsRouter from "./accounts";
import bioRouter from "./bio";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accountsRouter);
router.use(bioRouter);
router.use(contactRouter);

export default router;
