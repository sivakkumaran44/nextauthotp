import { NextResponse } from "next/server";
import { rateLimiter } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const { identifier, action, recordFailure = false, reset = false } = await req.json();
    
    const config = {
      login: { windowMs: 300000, maxAttempts: 3 },  
      register: { windowMs: 300000, maxAttempts: 3 }
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}