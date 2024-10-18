import { Request } from "express";
export interface IEmployee {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
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

export interface IUserReq extends Request {
  id: string;
}

export interface IRequestType extends Request {
  user: IUserReq;
  token: string;
}
