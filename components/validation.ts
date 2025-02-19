export interface ValidationError {
    field: string;
    message: string;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
  }
  
  export const validateEmail = (email: string): ValidationError | null => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email) {
      return { field: 'email', message: 'Email is required' };
    }
    
    if (!emailRegex.test(email)) {
      return { field: 'email', message: 'Please enter a valid email address' };
    }
    
    if (email.length > 255) {
      return { field: 'email', message: 'Email is too long (maximum 255 characters)' };
    }
    
    return null;
  };
  
  export const validatePassword = (password: string): ValidationError | null => {
    if (!password) {
      return { field: 'password', message: 'Password is required' };
    }
  
    if (password.length < 8) {
      return { 
        field: 'password', 
        message: 'Password must be at least 8 characters long' 
      };
    }
  
    if (password.length > 128) {
      return { 
        field: 'password', 
        message: 'Password is too long (maximum 128 characters)' 
      };
    }
  
    if (!/[A-Z]/.test(password)) {
      return { 
        field: 'password', 
        message: 'Password must contain at least one uppercase letter' 
      };
    }
  
    if (!/[a-z]/.test(password)) {
      return { 
        field: 'password', 
        message: 'Password must contain at least one lowercase letter' 
      };
    }
  
    if (!/[0-9]/.test(password)) {
      return { 
        field: 'password', 
        message: 'Password must contain at least one number' 
      };
    }
  
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { 
        field: 'password', 
        message: 'Password must contain at least one special character' 
      };
    }
  
    return null;
  };
  
  export const validateForm = (formData: Record<string, string>): ValidationResult => {
    const errors: ValidationError[] = [];
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.push(emailError);
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.push(passwordError);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };