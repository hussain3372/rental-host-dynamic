import { apiClient } from "../core/client";
import { ApiResponse } from "../core/client";


import {
  SignUpRequest,
  SignUpRes,
  LoginSuccessResponse,
  LoginRequest,
  PasswordRes,
  CreatePasswordPayload,
  OtpVerificationRequest,
  OTPRes,
  ForgotPasswordRequest,
  ForgotPasswordSuccessResponse,
  EmailRequest,
  EmailResponse,
} from "./types";

export const auth = {
  /**
   * Register a new user
   */
  createUser: async (payload: SignUpRequest): Promise<ApiResponse<SignUpRes>> =>
    apiClient.post<SignUpRes>("/auth/register", payload),

  Login: async (
    payload: LoginRequest
  ): Promise<ApiResponse<LoginSuccessResponse>> => {
    const response = await apiClient.post<LoginSuccessResponse>(
      "/auth/login",
      payload
    );

    return response;
  },

  /**
   * Reset or create password
   */
  createPassword: async (
    payload: CreatePasswordPayload
  ): Promise<ApiResponse<PasswordRes>> =>
    apiClient.post<PasswordRes>("auth/reset-password", payload),

  /**
   * Verify OTP
   */
  verifyOTP: async (
    payload: OtpVerificationRequest
  ): Promise<ApiResponse<OTPRes>> =>
    apiClient.post<OTPRes>("auth/verify-otp", payload),

  /**
   * Forgot password
   */
  forgotPassword: async (
    payload: ForgotPasswordRequest
  ): Promise<ApiResponse<ForgotPasswordSuccessResponse>> =>
    apiClient.post<ForgotPasswordSuccessResponse>(
      "auth/forgot-password",
      payload
    ),

  verifyEmail: async (
    payload: EmailRequest
  ): Promise<ApiResponse<EmailResponse>> =>
    apiClient.post<EmailResponse>("/auth/verify-email", payload),
    
 

};
