import Joi, { Schema } from "joi";
import validateRequest from "../helpers/validateRequest";

const signupSchema: Schema = Joi.object({
  name: Joi.string().lowercase().trim().min(3).max(50).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
  role: Joi.string().valid("USER", "ADMIN").default("USER").optional(),

  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])" + // at least one lowercase letter
          "(?=.*[A-Z])" + // at least one uppercase letter
          "(?=.*\\d)" + // at least one number
          "(?=.*[!@#$%^&*()\\-_=+{};:,<.>])" + // at least one special character
          "(?!.*\\s)" + // no whitespace allowed
          "[A-Za-z\\d!@#$%^&*()\\-_=+{};:,<.>]{8,32}$" // allowed characters
      )
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 32 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, " +
        "one number, one special character, no spaces, and cannot have more than 2 repeating characters",
      "any.required": "New password is required",
    }),

  avatar: Joi.string().allow(null, "").uri().messages({
    "string.uri": "Avatar must be a valid URL",
  }),
})
  .optional()
  .options({ stripUnknown: true }); // Removes unexpected fields

const verifyEmailSchema: Schema = Joi.object({
  emailVerificationToken: Joi.string().length(6).required(),
}).options({ stripUnknown: true });

const signinSchema: Schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).options({ stripUnknown: true });

const refreshTokenSchema: Schema = Joi.object({
  cookies: Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.empty": "Refresh token is required",
    }),
  }).unknown(true), // Allow other cookies
}).options({ stripUnknown: true });

const googleAuthSchema: Schema = Joi.object({
  access_token: Joi.string().required().messages({
    "string.empty": "Google access token is required",
  }),
}).options({ stripUnknown: true });

const forgotPasswordSchema: Schema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
}).options({ stripUnknown: true });

const resetPasswordSchema: Schema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .max(32)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])" + // at least one lowercase letter
          "(?=.*[A-Z])" + // at least one uppercase letter
          "(?=.*\\d)" + // at least one number
          "(?=.*[!@#$%^&*()\\-_=+{};:,<.>])" + // at least one special character
          "(?!.*\\s)" + // no whitespace allowed
          "(?!.*(.+)\\1{2,})" + // no more than 2 consecutive repeated characters
          "[A-Za-z\\d!@#$%^&*()\\-_=+{};:,<.>]{8,32}$"
      )
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 32 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, " +
        "one number, one special character, no spaces, and cannot have more than 2 repeating characters",
      "any.required": "New password is required",
    }),
}).options({ stripUnknown: true });

const validateRegister = validateRequest(signupSchema);
const validateVerifyEmail = validateRequest(verifyEmailSchema);
const validateSignin = validateRequest(signinSchema);
const validateRefreshToken = validateRequest(refreshTokenSchema);
const validateGoogleAuth = validateRequest(googleAuthSchema);
const validateForgotPassword = validateRequest(forgotPasswordSchema);
const validateResetPassword = validateRequest(resetPasswordSchema);

export {
  validateRegister,
  validateVerifyEmail,
  validateSignin,
  validateRefreshToken,
  validateGoogleAuth,
  validateForgotPassword,
  validateResetPassword,
};
