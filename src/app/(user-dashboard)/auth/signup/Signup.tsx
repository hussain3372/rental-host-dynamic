"use client";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { auth } from "@/app/api/auth";



interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[] | Array<Record<string, string>> | null;
}



interface SignUpResponseData {
  id: string;
  email: string;
}

type SignupResponse = ApiResponse<SignUpResponseData>;

interface FormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string[];
}

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const googleLogin = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", {
        callbackUrl: "/auth/redirecting",
        redirect: true,
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to initiate Google login");
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (formData: FormData) => {
    try {
      setLoading(true);

      if (!formData.firstName || !formData.lastName) {
        toast.error("First name and last name are required");
        return;
      }

      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      const response = await auth.createUser(payload);
      const data = response as unknown as SignupResponse;

      if (data.success) {
        toast.success(data.message || "Account created successfully!");
        router.push("/auth/verifying");
      } else {
        if (data.errors && data.errors.length > 0) {
          const firstError = data.errors[0];
          const errorField = Object.keys(firstError)[0];
          const errorMessage =
            firstError[errorField as keyof typeof firstError];
          toast.error(String(errorMessage));
        } else {
          toast.error(data.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthForm
        emptyemailmessage="Email address is required"
        emptyfirstNamemessage="First name is required"
        emptylastNamemessage="Last name is required"
        wronginputmessage="Please enter a valid email address"
        emptypasswordmessage="Password is required"
        title="Create Your Account"
        subtitle="Join us today and unlock your personalized experience."
        submitText="Create Account"
        showAlter={true}
        alterText="Already have an account?"
        linktext=" Login"
        link="/auth/login"
        loading={loading}
        socialLoading={googleLoading}
        mode="signup"
        onAppleLogin={() => {
          console.log("apple login");
        }}
        onGoogleLogin={googleLogin}
        onSubmit={handleSignup}
      />
    </div>
  );
}