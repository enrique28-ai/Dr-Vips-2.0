import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,       // secure SSL
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App Password (16 chars)
  },
  pool: true,            // conexión en pool ayuda con cold-start
  maxConnections: 3,
  maxMessages: 50,
  connectionTimeout: 30_000, // 30s
  greetingTimeout: 20_000,
  socketTimeout: 30_000,
});

// From header used in all emails
export const fromAddress = `"${process.env.GMAIL_FROM_NAME || "ENRIQUE"}" <${process.env.GMAIL_USER}>`;
