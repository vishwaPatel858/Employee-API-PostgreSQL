import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { PoolClient } from "pg";
import { redisClient } from "../utility/redisClient.ts";
import { IUserReq } from "../types/employee.types.ts";
export const generateEncryptedPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const encryptedPass = await bcrypt.hash(password, salt);
  return encryptedPass;
};

export const validatePassword = async (
  password: string,
  encryptedPass: string
) => {
  const validatePass = await bcrypt.compare(password, encryptedPass);
  return validatePass;
};

export const generateAccessToken = async (id: string) => {
  try {
    const payload = {
      id: id,
    };
    const secretKey = process.env.JWT_Access_SECRET || "";
    const accessToken = await jwt.sign(payload, secretKey, {
      expiresIn: 3600,
    });
    await redisClient.set(id, accessToken);
    return accessToken;
  } catch (err) {
    throw err;
  }
};

export const insertTokenData = async (
  emp_id: string,
  otp: string,
  client: PoolClient
) => {
  try {
    const deletedData = await deleteTokenData(emp_id, client);
    let expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    let query = `INSERT INTO tokens (emp_id,token,expires_at) VALUES ($1,$2,$3) RETURNING token , emp_id , expires_at`;
    const { rows } = await client.query(query, [emp_id, otp, expiresAt]);
    return true;
  } catch (err) {
    throw err;
  }
};

export const deleteTokenData = async (emp_id: string, client: PoolClient) => {
  try {
    let query = `DELETE FROM tokens WHERE emp_id =$1`;
    const { rowCount } = await client.query(query, [emp_id]);
  } catch (err) {
    throw err;
  }
};

export const verifyTokenData = (token: string): Promise<IUserReq> => {
  return new Promise((resolve, reject) => {
    const secretKey = process.env.JWT_Access_SECRET || "";
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as IUserReq);
      }
    });
  });
};
