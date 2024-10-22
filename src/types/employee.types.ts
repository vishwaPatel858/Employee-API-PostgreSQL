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

export interface IForgetPassword {
  email: string;
}

export interface IPassword{
  password : string;
}
export interface IRequestType extends Request {
  id?: string;
  token?: string;
}

export interface IRequestEmployee extends IRequestType {
  body: IEmployee;
}

export interface IRequestVerifyOTP extends IRequestType {
  body: IVerifyOTP;
}

export interface IRequestDeleteEmp extends IRequestType {
  body: IVerifyOTP;
}
export interface IRequestLogin extends Request {
  body: ILogin;
}

export interface IRequestResetPassword extends IRequestType {
  body: IPassword;
}

export interface IRequestChangePassword extends IRequestType {
  body: IChangePassword;
}

export interface IRequestForgetPassword extends Request {
  body: IForgetPassword;
}
