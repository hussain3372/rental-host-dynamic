export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  accessToken: string;
  user: {
    role: string;
    mfaEnabled: boolean;
    firstname: string;
    lastname: string;
    email: string;
  };
  data: string;
  message: string;
  success: boolean;
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordSuccessResponse {
  success: boolean;
  data: string;
  message?: string;
}
export interface OtpVerificationRequest {
  otp: string;
  email: string;
}

export interface OTPRes {
  success: boolean;
  message: string;
  data?: string;
  accessToken:string
}
export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignUpRes {
  message: string;
  success: boolean;
  data?: string;
}
export interface CreatePasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordRes {
  message: string;
  success: boolean;
  data?: string;
}
export interface EmailRequest {
  token: string;
}
export interface EmailResponse {
  status: string;
  message: string;
  success: boolean;
}
