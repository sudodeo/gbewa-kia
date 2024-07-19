import cron from "node-cron";
import { ParsedQs } from "qs";

import { ResourceNotFound } from "../../middlewares/error-middleware";
import { generateRandomString } from "../../utils/helpers";
import { EmailService } from "../../utils/mail-service";
import { validatePayload } from "../../utils/validator";
import { UserService } from "../user/user-service";
import { IUser } from "../user/user-types";
import { PackageModel } from "./package-model";
import {
  CreatePackage,
  IPackage,
  IPackageQueryResult,
  PackageStatus
} from "./package-types";
import { CreatePackageValidationSchema } from "./package-validator";

export class PackageService {
  private static packageModel: PackageModel = new PackageModel();

  static async submitPackageForDelivery(
    user: IUser,
    reqBody: CreatePackage
  ): Promise<IPackage> {
    const payload = (await validatePayload(
      reqBody,
      CreatePackageValidationSchema
    )) as unknown as CreatePackage;

    payload.trackingNumber = await this.generateTrackingNumber();
    console.log("Tracking Number:", payload.trackingNumber);
    payload.senderId = user.id;
    payload.pickupDate = new Date(payload.pickupDate).toISOString();

    const submittedPackage = await this.packageModel.create(payload);

    const interval = 2 * 60 * 1000; // 2 minutes in milliseconds

    cron.schedule(`*/${interval} * * * *`, async () => {
      try {
        await this.updatePackageStatus(
          submittedPackage.id,
          PackageStatus.PENDING,
          user
        );
      } catch (error) {
        console.error("Error executing updatePackageStatus:", error);
      }
    });
    return submittedPackage;
  }

  static async findAll(
    query: ParsedQs | Record<string, any>
  ): Promise<IPackageQueryResult> {
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const offset = query.offset ? parseInt(query.offset as string) : 0;

    return this.packageModel.findAll(limit, offset);
  }

  static async findById(packageId: string, user: IUser): Promise<IPackage> {
    const existingPackage = await this.packageModel.findById(packageId);
    if (
      !existingPackage ||
      (existingPackage.senderId !== user.id && user.role !== "admin")
    ) {
      throw new ResourceNotFound("Package not found");
    }

    return existingPackage;
  }

  static async findByTrackingNumber(trackingNumber: string): Promise<IPackage> {
    return this.packageModel.findByTrackingNumber(trackingNumber);
  }

  private static async generateTrackingNumber(): Promise<string> {
    const length = 25;
    let trackingNumberSet = false;

    let trackingNumber = "";
    while (!trackingNumberSet) {
      trackingNumber = generateRandomString(length);
      const existingPackage = await this.findByTrackingNumber(trackingNumber);

      if (!existingPackage) {
        trackingNumberSet = true;
      }
    }

    return trackingNumber;
  }

  static async updatePackageStatus(
    packageId: string,
    status: PackageStatus,
    user: IUser
  ) {
    const vpackage = await this.packageModel.findById(packageId);

    if (!vpackage || vpackage.status === PackageStatus.DELIVERED) {
      return;
    }
    const nextStatus = await this.getNextPackageStatus(vpackage.status);
    if (nextStatus) {
      const updatedPackage = await this.packageModel.updatePackageStatus(
        packageId,
        status,
        nextStatus
      );

      console.log("UPDATED PACKAGE: ", updatedPackage);

      await EmailService.sendPackageUpdateEmail(
        user.email,
        user.name,
        updatedPackage
      );
    }
  }

  private static async getNextPackageStatus(currentStatus: PackageStatus) {
    switch (currentStatus) {
      case PackageStatus.PENDING:
        return PackageStatus.CONFIRMED;
      case PackageStatus.CONFIRMED:
        return PackageStatus.IN_TRANSIT;
      case PackageStatus.IN_TRANSIT:
        return PackageStatus.AVAILABLE_FOR_PICKUP;
      case PackageStatus.AVAILABLE_FOR_PICKUP:
        return PackageStatus.DELIVERED;
      default:
        return undefined;
    }
  }

  static scheduleCronJob = async () => {
    cron.schedule(`*/2 * * * *`, async () => {
      try {
        const { packages } = await this.packageModel.findAll(10, 0);
        for (const vpackage of packages) {
          if (vpackage.status !== PackageStatus.DELIVERED) {
            continue;
          }
          const user = await UserService.getUserById(vpackage.senderId);
          await this.updatePackageStatus(vpackage.id, vpackage.status, user);

          console.log("Package status updated successfully");
        }
      } catch (error) {
        console.error("Error updating package statuses:", error);
      }
    });
  };
}
