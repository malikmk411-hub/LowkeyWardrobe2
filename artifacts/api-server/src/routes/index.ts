import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import newsletterRouter from "./newsletter";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(newsletterRouter);

export default router;
