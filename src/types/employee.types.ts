import { Request } from "express";
export interface IEmployee {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_verified?: boolean;
}
export interface ILogin {
  email: string;
  password: string;
}

export interface MailOptions {
  to: string;
  message: string;
  subject: string;
}

export interface IChangePassword {
  old_password: string;
  new_password: string;
}

export interface IVerifyOTP {
  email: string;
  otp: string;
}
export interface IUserReq {
  id: string;
}

export interface IRequestType extends Request {
  id?: string;
  token?: string;
}

export interface IRequestEmployee extends Request {
  id?: string;
  token?: string;
  body: IEmployee;
}

export interface IRequestVerifyOTP extends Request {
  id?: string;
  token?: string;
  body: IVerifyOTP;
}

export interface IRequestDeleteEmp extends Request {
  id?: string;
  token?: string;
  body: IVerifyOTP;
}
export interface IRequestLogin extends Request {
  body: ILogin;
}

export interface IRequestResetPassword extends Request {
  body: ILogin;
}

export interface IRequestChangePassword extends Request {
  body: IChangePassword;
  id?: string;
  token?: string;
}
