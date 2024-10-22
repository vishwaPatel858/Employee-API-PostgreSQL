import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { PoolClient } from "pg";
import { redisClient } from "../utility/redisClient.ts";
import { IUserReq, MailOptions, IEmployee } from "../types/employee.types.ts";
import { generateOTP, sendMail } from "../utility/mail.utility.ts";
import { response } from "express";
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
    await redisClient.del(id);
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
    //const deletedData = await deleteTokenData(emp_id, client);
    let expiresAt = new Date(Date.now() + 5 * 60 * 1000);
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

export const sendOTP = async (
  email: string,
  id: string,
  client: PoolClient
) => {
  try {
    const otp = generateOTP();
    const mailOptions: MailOptions = {
      to: email,
      message: `Your OTP is <strong>${otp}</strong>`,
      subject: "ForgetPassword OTP",
    };
    return await sendMail(mailOptions)
      .then(async (response) => {
        await insertTokenData(id, otp, client);
        return otp;
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  }
};


export const verifyOTPwithExpirationTime = async (
  id: string,
  otp: string,
  client: PoolClient
) => {
  try {
    const query = `      
      WITH deleted AS (
        DELETE FROM tokens
        WHERE emp_id = $1 AND token = $2 and expires_at >= $3
        RETURNING *
      )
      SELECT COUNT(*) > 0 AS exists
      FROM deleted`;
    const {
      rows: [result],
    } = await client.query(query, [id, otp, new Date(Date.now())]);
    return result.exists;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const checkEmployeeExists = async (
  email: string,
  client: PoolClient
): Promise<IEmployee> => {
  try {
    let query = `SELECT * FROM employee WHERE email = $1`;
    const { rows } = await client.query(query, [email]);
    if (rows.length == 0) {
      throw new Error(`Employee with email '${email}' not found`);
    } else {
      return rows[0] as IEmployee;
    }
  } catch (err) {
    throw err;
  }
};

export const checkDuplicateEmail = async (
  email: string,
  client: PoolClient
) => {
  try {
    let query = `SELECT * FROM employee WHERE email = $1`;
    const { rows } = await client.query(query, [email]);
    if (rows.length > 0) {
      throw new Error(`Employee already exists with ${email} email`);
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};
export const checkEmployeeExistsWithId = async (
  id: string,
  client: PoolClient
) => {
  try {
    let query = `SELECT * FROM  employee WHERE id  = $1`;
    const { rows } = await client.query(query, [id]);
    if (rows.length == 0) {
      throw new Error("Employee not found");
    } else {
      return rows[0] as IEmployee;
    }
  } catch (err) {
    throw err;
  }
};
