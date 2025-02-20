import { NextResponse } from "next/server";
import { Redis } from 'ioredis';
import nodemailer from 'nodemailer';

const redis = new Redis(process.env.REDIS_URL!);

const validateEmailConfig = () => {
  if (!process.env.SENDER_EMAIL || !process.env.BREVO_SENDER_PASSWORD || !process.env.SENDER_EMAIL_ADMIN) {
    throw new Error("Email configuration is missing");
  }
};

const createTransporter = () => {
  validateEmailConfig();
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.BREVO_SENDER_PASSWORD,
    },
  });
};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    try {
      validateEmailConfig();
    } catch (error) {
      console.error("Email configuration error:", error);
      return NextResponse.json(
        { error: "Email service configuration error" },
        { status: 500 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      await redis.set(`otp:${email}`, otp, 'EX', 300); 
    } catch (error) {
      console.error("Redis error:", error);
      return NextResponse.json(
        { error: "Failed to store OTP" },
        { status: 500 }
      );
    }
    
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL_ADMIN,
        to: email,
        subject: 'Your Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your OTP for Login</h2>
            <p>Your one-time password is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Email sending error:", error);
      return NextResponse.json(
        { error: "Failed to send email. Please check email configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("General error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}