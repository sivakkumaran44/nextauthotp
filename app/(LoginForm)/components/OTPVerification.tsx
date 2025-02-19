"use client";
import { useState, useEffect } from 'react';
interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onResendOTP: () => Promise<void>;
  onBackToLogin: () => void;  
}
export function OTPVerification({ 
  email, 
  onVerified, 
  onBackToLogin 
}: OTPVerificationProps) {const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => setCountdown(count => count - 1), 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);
  useEffect(() => {
    let blockTimer: NodeJS.Timeout;
    if (blockTimeRemaining > 0) {
      blockTimer = setInterval(() => {
        setBlockTimeRemaining(time => {
          if (time <= 1) {
            setIsBlocked(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => {
      if (blockTimer) clearInterval(blockTimer);
    };
  }, [blockTimeRemaining]);
  const handleVerifyOTP = async () => {
    if (isBlocked) return;
    setIsLoading(true);
    try {
      const rateLimitCheck = await fetch("/api/ratelimit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: `otp:verify:${email}`,
          action: 'otp'  
        }),
      });
      const rateLimitData = await rateLimitCheck.json();   
      if (!rateLimitCheck.ok) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil(rateLimitData.remainingTime / 1000));
        throw new Error(rateLimitData.error);
      }
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
     const data = await res.json();
      if (!res.ok) {
        await fetch("/api/ratelimit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            identifier: `otp:verify:${email}`,
            action: 'otp',
            recordFailure: true
          }),
        });
        setAttemptsRemaining(rateLimitData.attemptsRemaining - 1);
        throw new Error(data.error || 'Invalid OTP');
      }
      await fetch("/api/ratelimit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: `otp:verify:${email}`,
          action: 'otp',
          reset: true
        }),
      });
      onVerified();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };
  const handleResend = async () => {
    onBackToLogin(); 
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-2xl p-8 py-12 space-y-8 shadow-input bg-white border border-[#1a1c24]">
      <div className="font-bold text-neutral-800 flex flex-col space-y-2">
        <h3 className="text-black font-bold text-[28px]">Verify OTP</h3>
        <p className="font-normal text-[14px] text-neutral-800">
          Enter the OTP sent to {email}
        </p>
      </div>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          {!isBlocked && attemptsRemaining > 0 && (
            <div className="mt-1">
              Attempts remaining: {attemptsRemaining}
            </div>
          )}
          {isBlocked && (
            <div className="mt-1">
              Please try again in {blockTimeRemaining} seconds
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOTP(e.target.value)}
          placeholder="Enter OTP"
          className="block w-full px-3 py-3 border rounded-lg border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 focus:bg-gray-50"
          disabled={isBlocked}
        />
        <button
          onClick={handleVerifyOTP}
          disabled={isLoading || !otp || isBlocked}
          className={`flex justify-center font-semibold border items-center gap-2 rounded-md py-2 px-8 w-full text-[16px] ${
            isLoading || !otp || isBlocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#f55418] hover:bg-transparent border-[#f55418] text-white hover:text-[#f55418]"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
        <button
          onClick={handleResend}
          className="text-[#1565C0] text-sm hover:underline"
        >
      Resend OTP
        </button>
      </div>
    </div>
  );
}