export interface AuthUser {
    id: string;
    name: string;
    email: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    user?: AuthUser;
  }
  