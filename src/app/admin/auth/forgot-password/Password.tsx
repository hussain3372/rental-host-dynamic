import React, { useState } from "react";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
// import { ForgotPassword } from "@/app/api/auth/ForgetPasswordAPI";
import { auth } from "@/app/api/auth";
import toast from "react-hot-toast";

interface FormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string[];
}

export default function Password() {
  const [loading, setLoading] = useState(false);
  
  const handleForgot = async (formData: FormData) => {
    try {
      setLoading(true);
      
      const response = await auth.forgotPassword({
        email: formData.email,
      });
      
      if (response.success) {
        toast.success(response.message || "Reset link sent successfully!");
        // window.location.href = "/admin/auth/email-verification";
      } else {
        toast.error(response.message || "Failed to send reset link");
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
        emptyemailmessage="Email address is required"
        wronginputmessage="Please enter a valid email address"
        title="Forgot Password"
        subtitle="Recover access to your account in a few simple steps."
        submitText="Send Link"
        showAlter={true}
        alterText="Remember your password?"
        linktext=" Login"
        link="/admin/auth/login"
        mode="forgot"
        loading={loading}
        onSubmit={handleForgot}
      />
    </div>
  );
}