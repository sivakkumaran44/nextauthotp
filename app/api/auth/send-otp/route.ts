import { NextResponse } from "next/server";
import { Redis } from 'ioredis';
import nodemailer from 'nodemailer';

const redis = new Redis(process.env.REDIS_URL!);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.BREVO_SENDER_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
   const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await redis.set(`otp:${email}`, otp, 'EX', 20);
    
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

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
