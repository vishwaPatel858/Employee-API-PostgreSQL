const randomString = require("randomstring");
const nodeMailer = require("nodemailer");
import { MailOptions } from "../types/employee.types.ts";
export const generateOTP = () => {
  try {
    return randomString.generate({
      length: 6,
      charset: "numeric",
    });
  } catch (err) {
    throw err;
  }
};

const transporterOptions = {
  host: process.env.SMPT_HOST,
  port: process.env.SMPT_PORT,
  secure: true,
  auth: {
    user: "vishwap9459276@gmail.com",
    pass: "lpjb ybte qoqy utba",
  },
  service: "Gmail",
};

export const sendMail = async (mailOptions: MailOptions) => {
    try {
      const transporter = nodeMailer.createTransport(transporterOptions);
      const options = {
        from: transporterOptions.auth.user,
        to: mailOptions.to,
        html: mailOptions.message,
        subject: mailOptions.subject,
      };
      const response = await transporter.sendMail(options);
      return response;
    } catch (err) {
      throw err;
    }
  };
