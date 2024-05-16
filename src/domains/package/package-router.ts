import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth-middleware";
import { Roles } from "../user/user-types";
import { PackageController } from "./package-controller";
import { PackageService } from "./package-service";

const packageRouter = Router();

const packageController = new PackageController();
PackageService.scheduleCronJob();
packageRouter.post("/", packageController.submitPackageForDelivery);

packageRouter.get(
  "/",
  [AuthMiddleware.checkRole([Roles.ADMIN])],
  packageController.findAll
);

packageRouter.get(
  "/tracking/:trackingNumber",
  packageController.findByTrackingNumber
);

packageRouter.get("/:packageId", packageController.findById);

export default packageRouter;
