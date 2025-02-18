"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from '@/components/AuthForm';
export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const router = useRouter();
  const handleRegister = async (formData: Record<string, string>) => {
    setIsLoading(true);
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
        throw new Error(rateLimitData.error);
      }
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!resUserExists.ok) {
        throw new Error("Failed to check user existence");
      }
      const { user } = await resUserExists.json();
      if (user) {
         await fetch("/api/rateLimit/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            identifier: `register:${formData.email}`,
            action: 'register',
            recordFailure: true
          }),
        });
        throw new Error("User already exists");
      }
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
        throw new Error("Registration failed");
      }
      router.push("/");
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

