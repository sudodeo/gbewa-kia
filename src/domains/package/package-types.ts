import { IQueryResult } from "../../common/common-types";

export enum PackageStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  IN_TRANSIT = "in transit",
  AVAILABLE_FOR_PICKUP = "available for pickup",
  DELIVERED = "delivered"
}

export interface IPackage {
  id: string;
  name: string;
  weight: number;
  senderId: string;
  status: PackageStatus;
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPackageQueryResult extends IQueryResult {
  packages: IPackage[];
}

export interface CreatePackage {
  name: string;
  weight: number;
  senderId: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupDate: string;
  trackingNumber: string;
}
