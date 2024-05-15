import Joi, { ValidationError } from "joi";
import { InvalidInput } from "../middlewares/error-middleware";

export const validatePayload = async (payload: any, schema: Joi.Schema) => {
  try {
    const value = await schema.validateAsync(payload, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    return value;
  } catch (error) {
    const vError = error as ValidationError;
    const validationErrors = vError.details.map(({ message, context }) => ({
      message: message.replace(/['"]/g, ""),
      context
    }));

    throw new InvalidInput("Invalid input", validationErrors);
  }
};
