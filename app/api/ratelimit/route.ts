import { NextResponse } from "next/server";
import { rateLimiter } from "@/lib/rateLimit";
import { AppError,ERROR_MESSAGES } from '@/components/errorUtils';
export async function POST(req: Request) {
  if (!process.env.REDIS_URL) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.REDIS_CONFIG_ERROR },
      { status: 500 }
    );
  }

  try {
    const { identifier, action, recordFailure = false, reset = false } = await req.json();
  
    if (!process.env.REDIS_URL) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.REDIS_CONFIG_ERROR },
        { status: 500 }
      );
    }

    const config = {
      login: { windowMs: 300000, maxAttempts: 3 },  
      register: { windowMs: 300000, maxAttempts: 3 },
      otp: { windowMs: 300000, maxAttempts: 5 }
    };

    const result = await rateLimiter(
      identifier,
      config[action as keyof typeof config],
      recordFailure,
      reset
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.message,
          remainingTime: result.remainingTime 
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ 
      success: true,
      attemptsRemaining: result.attemptsRemaining
    });
  } catch (error) {
    console.error("Rate limit check error:", error);
    if (error instanceof AppError && error.message === ERROR_MESSAGES.REDIS_CONFIG_ERROR) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.REDIS_CONFIG_ERROR },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}