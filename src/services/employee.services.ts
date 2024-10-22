import { PoolClient } from "pg";
import { pool } from "../utility/database.ts";
import { IEmployee, IChangePassword } from "../types/employee.types.ts";
import {
  generateEncryptedPassword,
  validatePassword,
  generateAccessToken,
  deleteTokenData,
  sendOTP,
  checkEmployeeExists,
  checkEmployeeExistsWithId,
  checkDuplicateEmail,
  verifyOTPwithExpirationTime,
} from "../utility/employee.utility.ts";
import { redisClient } from "../utility/redisClient.ts";
export const getEmployees = async () => {
  const client: PoolClient = await pool.connect();
  try {
    const query = "SELECT * FROM public.employee";
    const { rows } = await client.query(query);
    return {
      employees: rows,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const getEmployeeId = async (id: string) => {
  const client: PoolClient = await pool.connect();
  try {
    let empData = await checkEmployeeExistsWithId(id, client);
    return {
      employee: empData,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const createEmployee = async (employee: IEmployee) => {
  const client: PoolClient = await pool.connect();
  try {
    const isDuplicateEmail = await checkDuplicateEmail(employee.email, client);
    if (isDuplicateEmail) {
      throw new Error(`Employee already exists with ${employee.email} email`);
    }
    const encryptedPass = await generateEncryptedPassword(employee.password);
    employee.password = encryptedPass;
    let query = `INSERT INTO employee (first_name, last_name, email, password) VALUES ($1,$2,$3,$4) RETURNING *`;
    const { rows } = await client.query(query, [
      employee.first_name,
      employee.last_name,
      employee.email,
      employee.password,
    ]);
    return sendOTP(employee.email, rows[0].id, client)
      .then(async (otp) => {
        return {
          message: "Employee created successfully",
          note: "Please verify your email to continue",
          employee: rows[0],
        };
      })
      .catch((error) => {
        throw error;
      });
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const updateEmployee = async (employee: IEmployee) => {
  const client: PoolClient = await pool.connect();
  try {
    let empData = await checkEmployeeExistsWithId(
      employee.id.toString(),
      client
    );
    let query = "SELECT 1 FROM employee WHERE email = $1 and id != $2";
    const { rowCount } = await client.query(query, [
      employee.email,
      employee.id,
    ]);
    if (rowCount != null && rowCount > 0) {
      throw new Error("Email already exists");
    }
    const encryptedPass = await generateEncryptedPassword(employee.password);
    employee.password = encryptedPass;
    query = `UPDATE employee SET first_name = $1, last_name = $2 , email = $3 , password = $4 WHERE id = $5 RETURNING *`;
    const { rows } = await client.query(query, [
      employee.first_name,
      employee.last_name,
      employee.email,
      employee.password,
      employee.id,
    ]);
    return {
      message: "Employee updated successfully",
      employee: rows,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const deleteEmployee = async (id: string) => {
  const client: PoolClient = await pool.connect();
  try {
    let empData = await checkEmployeeExistsWithId(id, client);
    let query = `DELETE FROM employee WHERE id = $1 RETURNING *`;
    const { rows } = await client.query(query, [id]);
    if (rows.length == 0) {
      throw new Error("Failed to delete employee");
    }
    return {
      message: "Employee deleted successfully",
      employee: rows[0],
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const employeeLogin = async (email: string, password: string) => {
  const client: PoolClient = await pool.connect();
  try {
    const empData = await checkEmployeeExists(email, client);
    const isValidPass = await validatePassword(password, empData.password);
    if (!isValidPass) {
      throw new Error("Invalid password");
    }
    const accessToken = await generateAccessToken(empData.id.toString());
    return {
      message: empData.is_verified
        ? "Login Successfully!!"
        : "Employee not verified.",
      access_token: accessToken,
      empoyee: empData,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const logoutAPI = async (token: string, id: string) => {
  const client: PoolClient = await pool.connect();
  try {
    await redisClient.set(`blacklist:${token}`, "blacklisted", { EX: 60 * 60 });
    await redisClient.del(id);
    return {
      message: "Logged out",
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const forgetPassword = async (email: string) => {
  const client: PoolClient = await pool.connect();
  try {
    const empData = await checkEmployeeExists(email, client);
    return await sendOTP(email, empData.id.toString(), client)
      .then(async (otp) => {
        return {
          message: `OTP sent to '${email}' successfully`,
        };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const verifyOTPAPI = async (email: string, otp: string) => {
  let client: PoolClient = await pool.connect();
  try {
    const empData = await checkEmployeeExists(email, client);
    const isValidOTP = await verifyOTPwithExpirationTime(
      empData.id.toString(),
      otp,
      client
    );
    if (!isValidOTP) {
      throw new Error("Invalid OTP");
    }
    const accessToken = await generateAccessToken(empData.id.toString());
    await deleteTokenData(empData.id.toString(), client);
    return {
      message: "OTP verified Successfully!",
      access_token: accessToken,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const resetPasswordAPI = async (
  password: string,
  id: string,
  token: string
) => {
  let client: PoolClient = await pool.connect();
  try {
    const empData = await checkEmployeeExistsWithId(id, client);
    const encryptedPass = await generateEncryptedPassword(password);
    let query = `UPDATE employee SET password =$1 WHERE id =$2 RETURNING *`;
    const { rows: updated } = await client.query(query, [encryptedPass, id]);
    logoutAPI(token, id);
    const accessToken = await generateAccessToken(empData.id.toString());
    return {
      message: "Password Reset successfully!",
      employee: updated[0],
      access_token: accessToken,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const changePasswordAPI = async (
  argPasswords: IChangePassword,
  id: string,
  token: string
) => {
  let client: PoolClient = await pool.connect();
  try {
    let empData = await checkEmployeeExistsWithId(id, client);
    const comparePass = await validatePassword(
      argPasswords.old_password,
      empData.password
    );
    if (!comparePass) {
      throw new Error("Incorrect Old Password");
    }
    const encryptedPass = await generateEncryptedPassword(
      argPasswords.new_password
    );
    let query = `UPDATE employee SET password = $1 WHERE id = $2 RETURNING *`;
    const { rows: updatePass } = await client.query(query, [encryptedPass, id]);
    await logoutAPI(token, id);
    const accessToken = await generateAccessToken(empData.id.toString());
    return {
      message: "Password changed successfully",
      employee: updatePass[0],
      access_token: accessToken,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const resendOTPAPI = async (email: string) => {
  let client: PoolClient = await pool.connect();
  try {
    const empData = await checkEmployeeExists(email, client);
    return sendOTP(email, empData.id.toString(), client)
      .then(async (otp) => {
        return {
          message: `OTP resent to '${email}'`,
        };
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const verifyAccount = async (email: string, otp: string) => {
  let client: PoolClient = await pool.connect();
  try {
    const empData = await checkEmployeeExists(email, client);
    const isVerified = await verifyOTPwithExpirationTime(
      empData.id.toString(),
      otp,
      client
    );
    if (!isVerified) {
      throw new Error("Invalid otp");
    }
    let query = `UPDATE employee SET is_verified  = $1 WHERE email = $2 RETURNING *`;
    const { rows } = await client.query(query, [true, email]);
    const accessToken = await generateAccessToken(empData.id.toString());
    await deleteTokenData(empData.id.toString(), client);
    return {
      message: "Employee Verified Successfully",
      access_token: accessToken,
      employee: rows[0],
    };
  } catch (err) {
    throw err;
  }
};
