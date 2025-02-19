"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from '@/components/AuthForm';
import { AppError, ERROR_MESSAGES, formatApiError } from '@/components/errorUtils';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(null);

    try {
      try {
        const rateLimitCheck = await fetch("/api/ratelimit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            identifier: `register:${formData.email}`,
            action: 'register'
          }),
        });
        
        const rateLimitData = await rateLimitCheck.json();
        if (!rateLimitCheck.ok) {
          setIsBlocked(true);
          setBlockTimeRemaining(Math.ceil(rateLimitData.remainingTime / 1000));
          throw new AppError(ERROR_MESSAGES.RATE_LIMIT, 429);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(ERROR_MESSAGES.RATE_LIMIT, 429);
      }
   try {
        const resUserExists = await fetch("/api/userExists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        if (!resUserExists.ok) {
          throw new AppError(ERROR_MESSAGES.SERVER_ERROR, 500);
        }

        const { user } = await resUserExists.json();
        if (user) {
          await fetch("/api/ratelimit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              identifier: `register:${formData.email}`,
              action: 'register',
              recordFailure: true
            }),
          });
          throw new AppError(ERROR_MESSAGES.USER_EXISTS, 409);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(ERROR_MESSAGES.SERVER_ERROR, 500);
      }
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            captchaToken: formData.captchaToken,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new AppError(data.error || ERROR_MESSAGES.SERVER_ERROR, res.status);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(ERROR_MESSAGES.SERVER_ERROR, 500);
      }

      router.push("/");
    } catch (error) {
      setError(formatApiError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm 
      type="register" 
      onSubmit={handleRegister} 
      isLoading={isLoading}
      isBlocked={isBlocked}
      blockTimeRemaining={blockTimeRemaining}
    />
  );
}