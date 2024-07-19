import { NextFunction, Response } from "express";
import { ResourceNotFound } from "../../middlewares/error-middleware";
import { AuthenticatedRequest } from "../auth/auth-types";
import { PackageService } from "./package-service";
import { PackageStatus } from "./package-types";

export class PackageController {
  submitPackageForDelivery = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.authUser!;

      const submittedPackage = await PackageService.submitPackageForDelivery(
        user,
        req.body
      );
      res.status(201).json({
        success: true,
        package: submittedPackage,
        message: "Package submitted successfully"
      });

      PackageService.updatePackageStatus(
        submittedPackage.id,
        PackageStatus.PENDING,
        user
      );
    } catch (error) {
      next(error);
    }
  };

  findAll = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const packages = await PackageService.findAll(req.query);
      res.status(200).json({ success: true, packages });
    } catch (error) {
      next(error);
    }
  };

  findById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { packageId } = req.params;
      const user = req.authUser!;

      const vpackage = await PackageService.findById(packageId, user);

      res.status(200).json({ success: true, package: vpackage });
    } catch (error) {
      next(error);
    }
  };

  findByTrackingNumber = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = req.authUser!;
      const { trackingNumber } = req.params;
      const vpackage =
        await PackageService.findByTrackingNumber(trackingNumber);
      if (vpackage.senderId !== user.id) {
        throw new ResourceNotFound("Package not found");
      }
      res.status(200).json({ success: true, package: vpackage });
    } catch (error) {
      next(error);
    }
  };
}
