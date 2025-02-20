import { NextResponse } from "next/server";
import { rateLimiter } from "@/lib/rateLimit";
import { AppError, ERROR_MESSAGES } from '@/components/errorUtils';

export async function POST(req: Request) {
 if (!process.env.REDIS_URL) {
    return new NextResponse(
      JSON.stringify({ error: ERROR_MESSAGES.REDIS_CONFIG_ERROR }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { identifier, action, recordFailure = false, reset = false } = await req.json();

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
      return new NextResponse(
        JSON.stringify({ 
          error: result.message,
          remainingTime: result.remainingTime 
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ 
        success: true,
        attemptsRemaining: result.attemptsRemaining
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Rate limit check error:", error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof AppError ? error.message : ERROR_MESSAGES.SERVER_ERROR 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
