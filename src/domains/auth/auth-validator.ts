import Joi from "joi";

export const SignupValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().trim(false).min(8).max(64).required(),
  name: Joi.string().max(200).required()
});

export const SigninValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const ResetPasswordValidationSchema = Joi.object({
  id: Joi.string().uuid().required(),
  token: Joi.string().required(),
  password: Joi.string().trim(false).min(8).max(64).required()
});