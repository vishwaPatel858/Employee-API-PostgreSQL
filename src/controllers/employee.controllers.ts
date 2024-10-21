import { Request, Response } from "express";
import {
  getEmployees,
  getEmployeeId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeLogin,
  logoutAPI,
  forgetPassword,
  verifyOTPAPI,
  resetPasswordAPI,
  changePasswordAPI,
  resendOTPAPI,
  verifyAccount,
} from "../services/employee.services.ts";
import {
  IRequestType,
  IRequestEmployee,
  IRequestVerifyOTP,
  IRequestDeleteEmp,
  IRequestLogin,
  IRequestResetPassword,
  IRequestChangePassword,
  IRequestForgetPassword,
} from "../types/employee.types.ts";
export const getEmployee = (req: Request, res: Response) => {
  try {
    getEmployees()
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const getEmployeeById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    getEmployeeId(id)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const addEmployee = (req: IRequestEmployee, res: Response) => {
  try {
    const employee = req.body;
    createEmployee(employee)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const modifyEmployee = (req: IRequestEmployee, res: Response) => {
  try {
    const employee = req.body;
    const { id } = req.params;
    employee.id = parseInt(id);
    updateEmployee(employee)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const removeEmployee = (req: IRequestDeleteEmp, res: Response) => {
  try {
    const id = req.id;
    deleteEmployee(id)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const login = (req: IRequestLogin, res: Response) => {
  try {
    const { email, password } = req.body;
    employeeLogin(email, password)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const logout = (req: IRequestType, res: Response) => {
  try {
    const id = req.id;
    const token = req.token;
    logoutAPI(token, id)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};
export const forgetPasswordAPI = (
  req: IRequestForgetPassword,
  res: Response
) => {
  try {
    const { email } = req.body;
    forgetPassword(email)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const verifyOTP = (req: IRequestVerifyOTP, res: Response) => {
  try {
    const { email, otp } = req.body;
    verifyOTPAPI(email, otp)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const resetPassword = (req: IRequestResetPassword, res: Response) => {
  try {
    const { password, email } = req.body;
    resetPasswordAPI(password, email)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const changePassword = async (
  req: IRequestChangePassword,
  res: Response
) => {
  try {
    const argPasswords = req.body;
    const id = req.id;
    const token = req.token;
    changePasswordAPI(argPasswords, id, token)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const resendOTP = async (req: IRequestForgetPassword, res: Response) => {
  try {
    const { email } = req.body;
    resendOTPAPI(email)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const verifyAccountAPI = (req: IRequestVerifyOTP, res: Response) => {
  try {
    const { email, otp } = req.body;
    verifyAccount(email, otp)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const getProfile = (req: IRequestType, res: Response) => {
  try {
    const id = req.id;
    getEmployeeId(id)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};
