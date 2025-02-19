export class AppError extends Error {
    public statusCode: number;
    public field?: string;
  
    constructor(message: string, statusCode: number = 500, field?: string) {
      super(message);
      this.statusCode = statusCode;
      this.field = field;
      this.name = 'AppError';
    }
  }
  
  export const ERROR_MESSAGES = {
    RATE_LIMIT: 'Too many attempts. Please try again later.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    USER_EXISTS: 'An account with this email already exists.',
    USER_NOT_FOUND: 'No account found with this email.',
    INVALID_OTP: 'Invalid or expired OTP code.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    NETWORK_ERROR: 'Connection error. Please check your internet connection.',
    CAPTCHA_INVALID: 'Please complete the captcha verification.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_REQUEST: 'Invalid request. Please try again.',
  } as const;
  
  export const handleApiError = (error: unknown): { message: string; statusCode: number } => {
    if (error instanceof AppError) {
      return {
        message: error.message,
        statusCode: error.statusCode,
      };
    }
  
    if (error instanceof Error) {
      return {
        message: error.message || ERROR_MESSAGES.SERVER_ERROR,
        statusCode: 500,
      };
    }
  
    return {
      message: ERROR_MESSAGES.SERVER_ERROR,
      statusCode: 500,
    };
  };
  
  export const isNetworkError = (error: unknown): boolean => {
    return error instanceof Error && 
      ('NetworkError' === error.name || error.message.includes('network') || error.message.includes('failed to fetch'));
  };
  
  export const formatApiError = (error: unknown): string => {
    if (isNetworkError(error)) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
  
    if (error instanceof AppError || error instanceof Error) {
      return error.message;
    }
  
    return ERROR_MESSAGES.SERVER_ERROR;
  };