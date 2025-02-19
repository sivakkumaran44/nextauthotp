"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthForm from '@/components/AuthForm';
import { useState } from "react";
import { OTPVerification } from './OTPVerification';
export default function LoginPage() {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [validatedEmail, setValidatedEmail] = useState('');
  const [validatedPassword, setValidatedPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);  const handleInitialValidation = async (formData: Record<string, string>) => {
    setIsLoading(true);
    try {
      const rateLimitCheck = await fetch("/api/ratelimit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: `login:${formData.email}`,
          action: 'login',
          recordFailure: false
        }),
      });
      const rateLimitData = await rateLimitCheck.json();
      if (!rateLimitCheck.ok) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil(rateLimitData.remainingTime / 1000));
        throw new Error(rateLimitData.error);
      }
      const res = await fetch("/api/auth/validate-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!otpRes.ok) {
        throw new Error("Failed to send OTP");
      }
      setValidatedEmail(formData.email);
      setValidatedPassword(formData.password);
      setShowOTP(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
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
  const handleOTPVerified = async () => {
    try {
      const res = await signIn("credentials", {
        email: validatedEmail,
        password: validatedPassword,
        redirect: false,
      });
      if (res?.error) {
        throw new Error("Login failed");
      }
      await fetch("/api/ratelimit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: `login:${validatedEmail}`,
          action: 'login',
          reset: true
        }),
      });
      router.replace("/dashboard");
    } catch (error) {
      throw error;
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