import { Request, Response } from "express";
import {
  getEmployees,
  getEmployeeId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeLogin,
  forgetPassword,
  verifyOTPAPI,
  resetPasswordAPI,
  changePasswordAPI,
} from "../services/employee.services.ts";
import { IRequestType } from "../types/employee.types.ts";
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

export const addEmployee = (req: Request, res: Response) => {
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

export const modifyEmployee = (req: Request, res: Response) => {
  try {
    const employee = req.body;
    const { id } = req.params;
    employee.id = id;
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

export const removeEmployee = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

export const login = (req: Request, res: Response) => {
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

export const forgetPasswordAPI = (req: Request, res: Response) => {
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

export const verifyOTP = (req: Request, res: Response) => {
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

export const resetPassword = (req: Request, res: Response) => {
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

export const changePassword = async (req: IRequestType, res: Response) => {
  try {
    const argPasswords = req.body;
    const id = req.user.id;
    changePasswordAPI(argPasswords, id)
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
