import express from "express";
export const router = express.Router();
import {
  getEmployee,
  getEmployeeById,
  addEmployee,
  modifyEmployee,
  removeEmployee,
  login,
  forgetPasswordAPI,
  verifyOTP,
  resetPassword,
} from "../controllers/employee.controllers.ts";
import {
  validateEmployee,
  validateLogin,
  validateToken,
  validateSchema,
  validateResetPassSchema,
  verifyAccessToken
} from "../middleware/employee.middleware.ts";
import {
  employeeSchema,
  loginSchema,
  tokenSchema,
  emailSchema,
  otpVerifySchema,
  resetPassSchema,
  changePasswordSchema
} from "../validations/employee.validations.ts";
import * as validator from "../middleware/employee.middleware.ts"
router.get("/", getEmployee);
router.get("/:id", getEmployeeById);
router.post("/", validateEmployee(employeeSchema), addEmployee);
router.put("/:id", validateEmployee(employeeSchema), modifyEmployee);
router.delete("/:id", removeEmployee);
router.post("/login", validateLogin(loginSchema), login);
router.post("/profile", validateToken(tokenSchema), getEmployeeById);
router.post("/forgerPassword", validateSchema(emailSchema), forgetPasswordAPI);
router.post("/verifyotp", validateSchema(otpVerifySchema), verifyOTP);
router.post(
  "/resetPassword",
  validateResetPassSchema(resetPassSchema),
  resetPassword
);
router.post("/verifyotp", validateSchema(otpVerifySchema), verifyOTP);
//router.post("/changepassword",validator.verifyAccessToken,validateSchema(changePasswordSchema))
