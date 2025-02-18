"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthForm from '@/components/AuthForm';
import { useState } from "react";
export default function LoginPage() {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const handleLogin = async (formData: Record<string, string>) => {
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

      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
       await fetch("/api/ratelimit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            identifier: `login:${formData.email}`,
            action: 'login',
            recordFailure: true
          }),
        });
        throw new Error("Invalid Credentials");
      } else {
        await fetch("/api/ratelimit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            identifier: `login:${formData.email}`,
            action: 'login',
            reset: true
          }),
        });
        router.replace("/dashboard");
      }
    } catch (error) {
      throw error;
    }
  };
  return (
    <AuthForm 
      type="login" 
      onSubmit={handleLogin} 
      isBlocked={isBlocked}
      blockTimeRemaining={blockTimeRemaining}
    />
  );
}