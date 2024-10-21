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
  changePassword,
  resendOTP,
  verifyAccountAPI,
  logout,
  getProfile,
} from "../controllers/employee.controllers.ts";
import {
  verifyAccessToken,
  validate,
} from "../middleware/employee.middleware.ts";
import {
  employeeSchema,
  loginSchema,
  emailSchema,
  otpVerifySchema,
  resetPassSchema,
  changePasswordSchema,
} from "../validations/employee.validations.ts";

router.get("/", getEmployee);
router.get("/:id", getEmployeeById);
router.post("/add", validate(employeeSchema), addEmployee);
router.put("/:id", verifyAccessToken, validate(employeeSchema), modifyEmployee);
router.delete("/", verifyAccessToken, removeEmployee);
router.post("/login", validate(loginSchema), login);
router.post("/logout", verifyAccessToken, logout);
router.post("/profile", verifyAccessToken, getProfile);
router.post("/forgerPassword", validate(emailSchema), forgetPasswordAPI);
router.post("/verifyotp", validate(otpVerifySchema), verifyOTP);
router.post(
  "/resetPassword",
  verifyAccessToken,
  validate(resetPassSchema),
  resetPassword
);
router.post(
  "/changepassword",
  verifyAccessToken,
  validate(changePasswordSchema),
  changePassword
);
router.post("/resendotp", validate(emailSchema), resendOTP);
router.post("/verifyaccount", validate(otpVerifySchema), verifyAccountAPI);
