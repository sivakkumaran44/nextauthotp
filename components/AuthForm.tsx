"use client";
import Link from "next/link";
import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}
interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
  isBlocked?: boolean;
  blockTimeRemaining?: number;
}
export default function AuthForm({ 
  type, 
  onSubmit, 
  isLoading = false,
  isBlocked = false,
}: AuthFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>("");
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const fields: Record<'login' | 'register', FormField[]> = {
    login: [
      { id: 'email', label: 'Email', type: 'email', placeholder: 'abc@gmail.com' },
      { id: 'password', label: 'Password', type: 'password', placeholder: 'password' }
    ],
    register: [
      { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' },
      { id: 'email', label: 'Email', type: 'email', placeholder: 'abc@gmail.com' },
      { id: 'password', label: 'Password', type: 'password', placeholder: 'Password' }
    ]
  };
  const titles = {
    login: {
      heading: 'LOGIN',
      subheading: 'Login next-auth',
      buttonText: 'Login',
      altText: 'Create new Account',
      altLink: '/registerForm',
      altLinkText: 'Register'
    },
    register: {
      heading: 'REGISTER',
      subheading: 'Enter your details',
      buttonText: 'Register',
      altText: 'Already have an account?',
      altLink: '/',
      altLinkText: 'Login'
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({ ...formData, captchaToken });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };
  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  const isFormValid = () => {
    return fields[type].every(field => formData[field.id]?.trim()) && captchaToken;
  };
  return (
    <form onSubmit={handleSubmit} className="flex justify-center items-center  container mx-auto w-full">
      <div className="max-w-md w-full mx-auto rounded-2xl p-8 py-12 md:py-12 space-y-8 shadow-input bg-white border border-[#1a1c24]">
      {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
       
        <div className="font-bold text-neutral-800 dark:text-neutral-200 flex flex-col space-y-2">
          <Link href="/" className="flex items-start w-full justify-start">
            <h3 className="text-black font-bold text-[28px]">{titles[type].heading}</h3>
          </Link>
          <p className="font-normal text-[14px] text-neutral-800">
            {titles[type].subheading}
          </p>
        </div>
        <div className="flex flex-col space-y-6 mb-4">
          {fields[type].map(field => (
            <div key={field.id} className="flex flex-col space-y-2 w-full">
              <label
                htmlFor={field.id}
                className="text-sm font-medium text-black leading-none"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="block w-full px-3 py-3 mt-1 border rounded-lg border-gray-400 shadow-none focus:outline-none focus:ring-0 focus:ring-[#aeaeae] focus:border-gray-400 focus:bg-gray-50 sm:text-sm"
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}
        </div>
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          options={{ theme: "light" }}
          onSuccess={(token) => setCaptchaToken(token)}
          className="pl-10"
        />
        <div className="w-full">
        <button
          type="submit"
          disabled={!isFormValid() || isLoading || isBlocked}
          className={`flex justify-center font-semibold border items-center gap-2 rounded-md py-2 px-8 w-full text-[16px] cursor-pointer transition-colors ${
            !isFormValid() || isLoading || isBlocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#f55418] hover:bg-transparent border-[#f55418] text-white ring-[#f55418]/20 hover:text-[#f55418]"
          }`}
        >
          {isLoading ? `${titles[type].buttonText}...` : titles[type].buttonText}
        </button>
     </div>
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-800">
            {titles[type].altText}{" "}
            <Link href={titles[type].altLink}>
              <span className="text-[#1565C0]">{titles[type].altLinkText}</span>
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}