import RegisterForm from "./components/RegisterForm";
import { getServerSession } from "next-auth";
import React from "react";
import { authConfig } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export default async function Register() {
  const session = await getServerSession(authConfig);
  if (session) redirect("/dashboard");
  return (
    <>
      <RegisterForm />
    </>
  );
}