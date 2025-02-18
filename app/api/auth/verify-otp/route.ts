
import { NextResponse } from "next/server";
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    
    const storedOTP = await redis.get(`otp:${email}`);
    
    if (!storedOTP || storedOTP !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }
    
    await redis.del(`otp:${email}`);
    
    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}