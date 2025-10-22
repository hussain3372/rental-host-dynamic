import React, { useState } from "react";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
// import { OtpVerification } from "@/app/api/auth/EmailVerificationAPI";
import toast from "react-hot-toast";
import { auth } from "@/app/api/auth";
import Cookies from "js-cookie";
interface FormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string[];
}
export default function Email() {
  const [loading, setLoading] = useState(false);
  const handleOTP = async (formData: FormData) => {
    try {
      setLoading(true);
      // Convert otp array to string
      const otpString = formData.otp?.join("") || "";
      // Validate OTP length
      if (otpString.length !== 6) {
        toast.error("Please enter all 6 digits of OTP");
        return;
      }
      const userEmail = Cookies.get("user-email");
      // if (!userEmail) {
      //   toast.error("Email not found. Please try again.");
      //   return;
      // }
      const response = await auth.verifyOTP({
        email: userEmail||"",
        otp: otpString,
      });
      if (response.success) {
        toast.success(response.message || "OTP Verified successfully");
        window.location.href = "/dashboard";
      } else {
        toast.error(response.message || "OTP verification failed");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <AuthForm
        emptyOTP="Please enter your OTP"
        title="Verify Your Email"
        subtitle="We've sent a verification code to your email address. Please enter it below to continue."
        submitText="Verify"
        showAlter={true}
        mode="otp"
        loading={loading}
        onSubmit={handleOTP}
      />
    </div>
  );
}