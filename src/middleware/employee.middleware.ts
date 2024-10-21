import joi from "joi";
import { Request, Response, NextFunction } from "express";
import { IRequestType } from "../types/employee.types.ts";
import { redisClient } from "../utility/redisClient.ts";
import { verifyTokenData } from "../utility/employee.utility.ts";
export const validate = (schema: joi.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validate = await schema.validateAsync(req.body);
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

export const verifyAccessToken = async (
  req: IRequestType,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.headers["authorization"];
    if (!authToken) {
      res.status(401).json({ message: "Authorization token is required." });
    } else {
      const bearerToken = authToken.split(" ")[1];
      const isBlacklisted = await redisClient.get(`blacklist:${bearerToken}`);
      if (isBlacklisted) {
        res.status(401).json({ message: "Token session expired." });
      } else {
        const tokenData = await verifyTokenData(bearerToken);
        req.id = tokenData.id;
        req.token = bearerToken;
        const redisToken = await redisClient.get(tokenData.id);
        if (redisToken) {
          next();
        } else {
          res.status(401).json({ message: "Invalid Token" });
        }
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    res.status(500).json({ message: message });
  }
};
