import { PoolClient } from "pg";
import { pool } from "../utility/database.ts";
import { IEmployee, IChangePassword } from "../types/employee.types.ts";
import {
  generateEncryptedPassword,
  validatePassword,
  generateAccessToken,
  insertTokenData,
  deleteTokenData,
} from "../utility/employee.utility.ts";
import { redisClient } from "../utility/redisClient.ts";
import { generateOTP, sendMail } from "../utility/mail.utility.ts";
export const getEmployees = async () => {
  const client: PoolClient = await pool.connect();
  try {
    const query = "SELECT * FROM public.employee";
    const { rows } = await client.query(query);
    return {
      message: "Employees Fetched successfully.",
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
    const query = "SELECT * FROM public.employee WHERE id = $1";
    const { rows } = await client.query(query, [id]);
    if (rows.length == 0) {
      throw new Error("Employee Not Found");
    }
    return {
      employee: rows[0],
      status: 200,
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
    let query = `SELECT 1 FROM employee WHERE email = $1`;
    const { rowCount } = await client.query(query, [employee.email]);
    if (rowCount != null && rowCount > 0) {
      throw new Error("Email already exists");
    }
    const encryptedPass = await generateEncryptedPassword(employee.password);
    employee.password = encryptedPass;
    query = `INSERT INTO employee (first_name, last_name, email, password) VALUES ($1,$2,$3,$4) RETURNING first_name,last_name,email`;
    const { rows } = await client.query(query, [
      employee.first_name,
      employee.last_name,
      employee.email,
      employee.password,
    ]);
    return {
      message: "Employee created successfully",
      employee: rows[0],
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const updateEmployee = async (employee: IEmployee) => {
  const client: PoolClient = await pool.connect();
  try {
    let query = "SELECT 1 FROM employee WHERE id = $1";
    const { rowCount: uniqueRowCount } = await client.query(query, [
      employee.id,
    ]);
    if (uniqueRowCount == 0) {
      throw new Error("Employee not found");
    }
    query = "SELECT 1 FROM employee WHERE email = $1 and id != $2";
    const { rowCount } = await client.query(query, [
      employee.email,
      employee.id,
    ]);
    if (rowCount != null && rowCount > 0) {
      throw new Error("Email already exists");
    }
    const encryptedPass = await generateEncryptedPassword(employee.password);
    employee.password = encryptedPass;
    query = `UPDATE employee SET first_name = $1, last_name = $2 , email = $3 , password = $4 WHERE id = $5 RETURNING first_name, last_name ,email,password`;
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
    let query = `SELECT 1 FROM employee WHERE id = $1`;
    const { rowCount } = await client.query(query, [id]);
    if (rowCount === 0) {
      throw new Error("Employee not found");
    }
    query = `DELETE FROM employee WHERE id = $1 RETURNING first_name ,last_name ,email ,password`;
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
    let query = "SELECT id , password FROM employee WHERE email = $1";
    const { rows } = await client.query(query, [email]);
    if (rows.length === 0) {
      throw new Error("Employee Not Found");
    }
    const isValidPass = await validatePassword(password, rows[0].password);
    if (!isValidPass) {
      throw new Error("Invalid password");
    }
    const accessToken = await generateAccessToken(rows[0].id.toString());
    return {
      message: "Login Successfully!!",
      accessToken: accessToken,
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const logout = async (token: string, id: string) => {
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
    let query = "SELECT id FROM employee where email = $1";
    const { rows } = await client.query(query, [email]);
    if (rows.length == 0) {
      throw new Error(`Employee with ${email} not found`);
    }
    const otp = generateOTP();
    const mailOpt = {
      to: email,
      message: `Your OTP is <strong>${otp}</strong>`,
      subject: "ForgetPassword OTP",
    };
    return await sendMail(mailOpt)
      .then(async (response) => {
        return await insertTokenData(rows[0].id, otp, client)
          .then((response) => {
            return {
              message: `OTP sent to '${email}' successfully`,
            };
          })
          .catch((err) => {
            throw err;
          });
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
    let query = `SELECT id FROM employee WHERE email = $1`;
    const { rows } = await client.query(query, [email]);
    if (rows.length == 0) {
      throw new Error("Employee not found!");
    }
    query = `SELECT token , expires_at FROM tokens WHERE emp_id = $1`;
    const { rows: tokensData } = await client.query(query, [rows[0].id]);
    if (tokensData.length == 0) {
      throw new Error("Invalid OTP");
    }
    console.log(
      tokensData[0].expires_at + " ::::::::::: " + new Date(Date.now())
    );
    console.log(tokensData[0].expires_at < new Date(Date.now()));
    if (
      otp == tokensData[0].token &&
      tokensData[0].expires_at >= new Date(Date.now())
    ) {
      await deleteTokenData(rows[0].id, client);
      return {
        message: "OTP verified Successfully!",
      };
    } else {
      throw new Error("Invalid OTP");
    }
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const resetPasswordAPI = async (password: string, email: string) => {
  let client: PoolClient = await pool.connect();
  try {
    let query = `SELECT id FROM employee WHERE email =$1`;
    const { rows } = await client.query(query, [email]);
    if (rows.length == 0) {
      throw new Error("Employee not found");
    }
    const encryptedPass = await generateEncryptedPassword(password);
    query = `UPDATE employee SET password =$1 WHERE email =$2 RETURNING first_name,last_name,email`;
    const { rows: updated } = await client.query(query, [encryptedPass, email]);
    return {
      message: "Password changed successfully!",
      employee: updated[0],
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

export const changePasswordAPI = async (
  argPasswords: IChangePassword,
  id: string
) => {
  let client: PoolClient = await pool.connect();
  try {
    let query = `SELECT password FROM  employee WHERE id  = $1`;
    const { rows } = await client.query(query, [id]);
    if (rows.length == 0) {
      throw new Error("Employee not found");
    }
    const comparePass = await validatePassword(
      argPasswords.old_password,
      rows[0].password
    );
    if (!comparePass) {
      throw new Error("Incorrect Old Password");
    }
    const encryptedPass = await generateEncryptedPassword(
      argPasswords.new_password
    );
    query = `UPDATE employee SET password = $1 WHERE id = $2 RETURNING first_name, last_name, email, password`;
    const { rows: updatePass } = await client.query(query, [encryptedPass, id]);
    return {
      message: "Password changed successfully",
      employee: updatePass[0],
    };
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};
