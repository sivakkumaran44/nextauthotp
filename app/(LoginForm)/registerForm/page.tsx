import RegisterForm from "./components/RegisterForm";
import { getServerSession } from "next-auth";
import React from "react";
import { config } from "../../api/auth/[...nextauth]/route"; // Updated import
import { redirect } from "next/navigation";

export default async function Register() {
  const session = await getServerSession(config); 
  if (session) redirect("/dashboard");
  return (
    <>
      <RegisterForm />
    </>
  );
}