"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { validateForm, ValidationError } from "./validation";
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
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const { errors } = validateForm(formData);
      setErrors(errors);
    }
  }, [formData, touched]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({ ...formData, captchaToken });
    } catch (error) {
      setErrors([{ field: 'form', message: error instanceof Error ? error.message : "An unexpected error occurred" }]);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const handleBlur = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const getFieldError = (fieldId: string) => {
    return errors.find(error => error.field === fieldId)?.message;
  };

  const isFormValid = () => {
    return validateForm(formData).isValid && captchaToken;
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center items-center container mx-auto w-full">
      <div className="max-w-md w-full mx-auto rounded-2xl p-8 py-12 md:py-12 space-y-8 shadow-input bg-white border border-[#1a1c24]">
        {errors.find(error => error.field === 'form') && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.find(error => error.field === 'form')?.message}
          </div>
        )}
        
        <div className="font-bold text-neutral-800 dark:text-neutral-200 flex flex-col space-y-2">
          <Link href="/" className="flex items-start w-full justify-start">
            <h3 className="text-black font-bold text-[28px]">
              {type === 'login' ? 'LOGIN' : 'REGISTER'}
            </h3>
          </Link>
          <p className="font-normal text-[14px] text-neutral-800">
            {type === 'login' ? 'Login next-auth' : 'Enter your details'}
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
                onBlur={() => handleBlur(field.id)}
                className={`block w-full px-3 py-3 mt-1 border rounded-lg shadow-none focus:outline-none focus:ring-0 focus:ring-[#aeaeae] focus:bg-gray-50 sm:text-sm ${
                  touched[field.id] && getFieldError(field.id)
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-400 focus:border-gray-400'
                }`}
                placeholder={field.placeholder}
                required
              />
              {touched[field.id] && getFieldError(field.id) && (
                <p className="text-sm text-red-600">{getFieldError(field.id)}</p>
              )}
            </div>
          ))}
        </div>

        {type === 'register' && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Password must:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be at least 8 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one lowercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
        )}

        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          options={{ theme: "light" }}
          onSuccess={(token) => setCaptchaToken(token)}
          className="pl-10"
        />

        <button
          type="submit"
          disabled={!isFormValid() || isLoading || isBlocked}
          className={`flex justify-center font-semibold border items-center gap-2 rounded-md py-2 px-8 w-full text-[16px] cursor-pointer transition-colors ${
            !isFormValid() || isLoading || isBlocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#f55418] hover:bg-transparent border-[#f55418] text-white ring-[#f55418]/20 hover:text-[#f55418]"
          }`}
        >
          {isLoading ? `${type === 'login' ? 'Logging in...' : 'Registering...'}` : type === 'login' ? 'Login' : 'Register'}
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-neutral-800">
            {type === 'login' ? "Don't have an account? " : "Already have an account? "}
            <Link href={type === 'login' ? '/registerForm' : '/'}>
              <span className="text-[#1565C0]">{type === 'login' ? 'Register' : 'Login'}</span>
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}