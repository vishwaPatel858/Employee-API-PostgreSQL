import joi from "joi";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import {
  IEmployee,
  ILogin,
  IRequestType,
  IUserReq,
} from "../types/employee.types.ts";
import { JwtPayload } from "jsonwebtoken";
import { redisClient } from "../utility/redisClient.ts";
import { verifyTokenData } from "../utility/employee.utility.ts";
export const validateEmployee = (schema: joi.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validate: IEmployee = await schema.validateAsync(req.body);
      req.body = validate;
      next();
    } catch (err) {
      if (err instanceof joi.ValidationError) {
        res.status(500).json({ message: err.message });
      } else {
        const message = err instanceof Error ? err.message : "Unknown error.";
        res.status(500).json({ message: message });
      }
    }
  };
};

export const validateLogin = (schema: joi.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validate: ILogin = await schema.validateAsync(req.body);
      req.body = validate;
      next();
    } catch (err) {
      if (err instanceof joi.ValidationError) {
        res.status(500).json({ message: err.message });
      } else {
        const message = err instanceof Error ? err.message : "Unknown error.";
        res.status(500).json({ message: message });
      }
    }
  };
};

export const validateToken = (schema: joi.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const secretKey = process.env.JWT_Access_SECRET || "";
      const decoded = (await jwt.verify(token, secretKey)) as JwtPayload;
      req.params.id = decoded.id;
      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        res.status(500).json({ message: err.message });
      } else {
        const message = err instanceof Error ? err.message : "Unknown error.";
        res.status(500).json({ message: message });
      }
    }
  };
};

export const validateSchema = (schema: joi.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validate = await schema.validateAsync(req.body);
      req.body = validate;
      next();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error.";
      res.status(500).json({ message: message });
    }
  };
};

export const validateResetPassSchema = (schema: joi.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.validateAsync(req.body);
      req.body = validatedData;
      if (validatedData.password == validatedData.confirm_password) {
        next();
      } else {
        res
          .status(500)
          .json({ message: "Password and Confirm Password are not matched." });
      }
    } catch (err) {
      if (err instanceof joi.ValidationError) {
        res.status(500).json({ message: err.message });
      } else {
        const message = err instanceof Error ? err.message : "Unknown error.";
        res.status(500).json({ message: message });
      }
    }
  };
};

export const verifyAccessToken = async (
  req: IRequestType,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.headers["authorization"];
    if (!authToken) {
      return res
        .status(401)
        .json({ message: "Authorization token is required." });
    }
    const bearerToken = authToken.split(" ")[1];
    const isBlacklisted = await redisClient.get(`blacklist:${bearerToken}`);
    if (isBlacklisted) {
      res.status(401).json({ message: "Token session expired." });
    }
    await verifyTokenData(bearerToken)
      .then((data: IUserReq) => {
        req.user = data;
        req.token = bearerToken;
        redisClient
          .get(data.id)
          .then((response) => {
            next();
          })
          .catch((error) => {
            res.status(500).json({ message: error.message });
          });
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};

export const validateSchema2 = (schema: joi.Schema) => {
  return async (req: IRequestType, res: Response, next: NextFunction) => {
    try {
      const validate = await schema.validateAsync(req.body);
      req.body = validate;
      next();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error.";
      res.status(500).json({ message: message });
    }
  };
};
