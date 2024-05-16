import { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  public status: number;
  public details: Record<string, any>;
  public code: string;
  public keyValue: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = statusCode;
    this.details = details;
    this.code = (details as { code?: string })["code"] || "";
    this.keyValue = (details as { keyValue?: Object })["keyValue"] || {};
  }
}

export class BadRequest extends HttpError {
  constructor(message: string, details?: Object) {
    super(400, message, details);
  }
}

export class ResourceNotFound extends HttpError {
  constructor(message: string, details?: Object) {
    super(404, message, details);
  }
}

export class Unauthorized extends HttpError {
  constructor(message: string, details?: Object) {
    super(401, message, details);
  }
}

export class Forbidden extends HttpError {
  constructor(message: string, details?: Object) {
    super(403, message, details);
  }
}

export class Conflict extends HttpError {
  constructor(message: string, details?: Object) {
    super(409, message, details);
  }
}

export class InvalidInput extends HttpError {
  constructor(message: string, details?: Object) {
    super(422, message, details);
  }
}

export class ServerError extends HttpError {
  constructor(message: string, details?: Object) {
    super(500, message, details);
  }
}

export const routeNotFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = `Route not found`;
  res
    .status(404)
    .json({ success: false, message, method: req.method, resource: req.path });
};

export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);
  let statusCode = err.status || 500;
  let cleanedMessage = (
    statusCode === 500 ? "Internal Server Error" : err.message
  ).replace(/"/g, "");

  const responsePayload: any = {
    success: false,
    message: cleanedMessage
  };

  if (err.details != null) {
    responsePayload.details = err.details;
  }

  res.status(statusCode).json(responsePayload);
};
