import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,       // secure SSL
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App Password (16 chars)
  },
});

// From header used in all emails
export const fromAddress = `"${process.env.GMAIL_FROM_NAME || "ENRIQUE"}" <${process.env.GMAIL_USER}>`;
