import Joi from "joi";

export const CreatePackageValidationSchema = Joi.object({
  name: Joi.string().required(),
  weight: Joi.number().min(1).required(),
  pickupAddress: Joi.string().min(10).required(),
  destinationAddress: Joi.string().min(10).required(),
  pickupDate: Joi.date().iso().min(new Date()).required(),
  status: Joi.string().optional().valid("pending").messages({
    "any.only": "Status must be 'pending'"
  })
});
