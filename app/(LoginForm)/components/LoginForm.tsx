"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthForm from '@/components/AuthForm';
import { useState } from "react";
import { OTPVerification } from './OTPVerification';
import { AppError, ERROR_MESSAGES, formatApiError } from '@/components/errorUtils';
export default function LoginPage() {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [validatedEmail, setValidatedEmail] = useState('');
  const [validatedPassword, setValidatedPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const handleInitialValidation = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    try {
const rateLimitCheck = await fetch("/api/ratelimit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    identifier: `login:${formData.email}`,
    action: 'login'
  }),
});

const rateLimitData = await rateLimitCheck.json();

if (!rateLimitCheck.ok) {
  if (rateLimitData.error === ERROR_MESSAGES.REDIS_CONFIG_ERROR) {
    throw new AppError(ERROR_MESSAGES.REDIS_CONFIG_ERROR, 500);
  }
  
  if (rateLimitCheck.status === 429) {
    setIsBlocked(true);
    setBlockTimeRemaining(Math.ceil(rateLimitData.remainingTime / 1000));
    throw new AppError(ERROR_MESSAGES.RATE_LIMIT, 429);
  }
  
  throw new AppError(rateLimitData.error || ERROR_MESSAGES.SERVER_ERROR, rateLimitCheck.status);
}
      try {
        const res = await fetch("/api/auth/validate-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!res.ok) {
          await fetch("/api/ratelimit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              identifier: `login:${formData.email}`,
              action: 'login',
              recordFailure: true
            }),
          });
          throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(ERROR_MESSAGES.SERVER_ERROR, 500);
      }
try {
  const otpRes = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: formData.email }),
  });

  if (!otpRes.ok) {
    const errorData = await otpRes.json();
    throw new AppError(errorData.error || ERROR_MESSAGES.SERVER_ERROR, otpRes.status);
  }
} catch (error) {
  if (error instanceof AppError) throw error;
  throw new AppError("Failed to send OTP. Please check your email configuration.", 500);
}

      setValidatedEmail(formData.email);
      setValidatedPassword(formData.password);
      setShowOTP(true);
    } catch (error) {
      if (error instanceof AppError) {
        setError(error.message);
        throw error;
      }
      setError(ERROR_MESSAGES.SERVER_ERROR);
      throw new AppError(ERROR_MESSAGES.REDIS_CONFIG_ERROR, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: validatedEmail,
        password: validatedPassword,
        redirect: false,
      });

      if (res?.error) {
        throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
      }

      try {
        await fetch("/api/ratelimit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            identifier: `login:${validatedEmail}`,
            action: 'login',
            reset: true
          }),
        });
      } catch (error) {
        console.error('Failed to reset rate limit:', error);
      }

      router.replace("/dashboard");
    } catch (error) {
      setError(formatApiError(error));
      throw error;
    }
  };
  const handleBackToLogin = () => {
    setShowOTP(false);
    setValidatedEmail('');
    setValidatedPassword('');
  };

  const handleResendOTP = async () => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: validatedEmail }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send OTP');
    }
  };
  if (showOTP) {
    return (
      <OTPVerification 
        email={validatedEmail} 
        onVerified={handleOTPVerified}
        onResendOTP={handleResendOTP}
        onBackToLogin={handleBackToLogin} 
      />
    );
  }
  return (
    <AuthForm 
      type="login" 
      onSubmit={handleInitialValidation} 
      isLoading={isLoading}
      isBlocked={isBlocked}
      blockTimeRemaining={blockTimeRemaining}
    />
  );
}