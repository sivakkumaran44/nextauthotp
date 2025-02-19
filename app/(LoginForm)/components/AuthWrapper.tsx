"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthWrapper({
  children,
  requireAuth = false,
  redirectTo = "/dashboard",
}: AuthWrapperProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.replace("/");
    } else if (!requireAuth && status === "authenticated") {
      router.replace(redirectTo);
    }
  }, [status, router, requireAuth, redirectTo]);
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

   if (requireAuth && status !== "authenticated") {
    return null;
  }

  if (!requireAuth && status === "authenticated") {
    return null;
  }

  return <>{children}</>;
}