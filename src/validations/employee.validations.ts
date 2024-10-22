import joi from "joi";
export const employeeSchema = joi.object({
  first_name: joi
    .string()
    .pattern(new RegExp(/^[a-zA-Z]*$/))
    .required()
    .messages({
      "string.empty": "First Name is required",
      "any.required": "First Name is required",
      "string.pattern.base":
        "first_name cannot contain numbers , special characters.",
    }),
  last_name: joi
    .string()
    .pattern(new RegExp(/^[a-zA-Z]*$/))
    .required()
    .messages({
      "string.empty": "First Name is required",
      "any.required": "First Name is required",
      "string.pattern.base":
        "first_name cannot contain numbers , special characters.",
    }),
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
    "string.email": "Invalid email format.",
  }),
  password: joi
    .string()
    .required()
    .pattern(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/
      )
    )
    .messages({
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
      "string.pattern.base":
        "Password must contain 1 Uppercase letter , 1 lowercase letter , 1 digit and 1 special character.Password length must be minimum 8 and maximum 10 characters.",
    }),
});

export const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
    "string.email": "Invalid email format.",
  }),
  password: joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});

export const emailSchema = joi.object({
  email: joi.string().required().email().messages({
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
});

export const otpVerifySchema = joi.object({
  email: joi.string().required().email().messages({
    "string.empty": "Email is required",
    "any.required": "Email is required",
    "string.email": "Invalid email format",
  }),
  otp: joi.string().required().messages({
    "string.empty": "OTP is required",
    "any.required": "OTP is required",
  }),
});

export const resetPassSchema = joi.object({
  password: joi
    .string()
    .required()
    .pattern(
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/
      )
    )
    .messages({
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
      "string.pattern.base":
        "Password must contain 1 Uppercase letter , 1 lowercase letter , 1 digit and 1 special character.Password length must be minimum 8 and maximum 10 characters.",
    }),
  confirm_password: joi
    .string()
    .required()
    .valid(joi.ref("password"))
    .messages({
      "string.empty": "Confirm Password is required.",
      "any.required": "Confirm Password is required.",
      "any.only": "Confirm Password not matched with 'Password'",
    }),
});

export const changePasswordSchema = joi.object({
  old_password: joi.string().required().messages({
    "string.empty": "Old Password is required.",
    "any.required": "Old Password is required.",
  }),
  new_password: joi.string().required().messages({
    "string.empty": "New Password is required.",
    "any.required": "New Password is required.",
  }),
});
