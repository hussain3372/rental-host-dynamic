"use client";
import React, { useState } from "react";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
import toast from "react-hot-toast";
import { auth } from "@/app/api/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const handleLogin = async (formData: LoginFormData) => {
    try {
      setLoading(true);

      if (!formData.email || !formData.password) {
        toast.error("Email and password are required");
        return;
      }

      const response = await auth.Login({
        email: formData.email,
        password: formData.password,
      });

      console.log(response);

      if (response.success && response.data?.accessToken) {
        if (response.data.user.role !== "ADMIN") {
          toast.error("Access restricted - Admin access required");
          return;
        }

          toast.success("Login successful!");
          router.push('/admin/dashboard')
          Cookies.remove('accessToken')


        localStorage.removeItem("firstname");
        localStorage.removeItem("lastname");
        localStorage.removeItem("email");
        localStorage.removeItem("adminUserMfaEnabled");
        localStorage.removeItem("userRole");

        const user = response.data.user;
        if (user) {
          if (user.firstname)
            localStorage.setItem("adminFirstname", user.firstname);
          if (user.lastname)
            localStorage.setItem("adminLastname", user.lastname);
          if (user.email) localStorage.setItem("adminEmail", user.email);
          if (typeof user.mfaEnabled !== "undefined")
            localStorage.setItem(
              "adminMfaEnabled",
              JSON.stringify(user.mfaEnabled)
            );
          if (user.role) localStorage.setItem("adminRole", user.role);
        }

        Cookies.set("adminAccessToken", response.data.accessToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
        });

      } else {
        // Show the actual backend error message
        const errorResponse = response as { error?: { message: string } };
        if (errorResponse.error?.message) {
          toast.error(errorResponse.error.message);
        } else {
          toast.error(response.message || "Login failed");
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthForm
        emptyemailmessage="Email address is required"
        wronginputmessage="Please enter a valid email address"
        emptypasswordmessage="Password is required"
        title="Welcome Back!"
        subtitle="Sign in to explore your personalized dashboard."
        submitText="Login"
        showAlter={true}
        loading={loading}
        forgotlink = "/admin/auth/forgot-password"
        mode="login"
        onSubmit={handleLogin}
      />
    </div>
  );
}