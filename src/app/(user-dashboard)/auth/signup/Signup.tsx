"use client";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
// import { SignUp } from "@/app/api/auth/CreateUserAPI";
import { auth } from "@/app/api/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

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

  const router = useRouter();
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

      if (response.success) {
        // The success message is likely in response.data.message
        const successMessage =
          response.data?.message || "Account created successfully!";
        toast.success(successMessage);

        router.push("/auth/verifying");
      } else {
        toast.error(response.message || "Signup failed");
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
        mode="signup"
        onAppleLogin={() => {
          console.log("apple login");
        }}
        onGoogleLogin={() => {
          console.log("Google login");
        }}
        onSubmit={handleSignup}
      />
    </div>
  );
}
