"use client";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { auth } from "@/app/api/auth";
import Cookies from "js-cookie";

interface GoogleSession {
  idToken?: string;
  user?: {
    email?: string;
    name?: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[] | Array<Record<string, string>> | null;
}

interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  user: {
    name: string;
    email: string;
    id: string;
  };
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
  const { data: session, status } = useSession();

  // Handle Google authentication after redirect
  useEffect(() => {
    const processGoogleAuth = async () => {
if (status === "authenticated" && session && (session as unknown as GoogleSession).idToken) {
        try {
          setGoogleLoading(true);
          console.log("Processing Google authentication...");

          // ✅ Send ID Token (JWT) to backend, not access token
          const idToken = (session as GoogleSession).idToken;
          if (!idToken) {
            throw new Error("No ID token found in session");
          }

          const response = await auth.googleAuth({
            token: idToken,
          });

          console.log("Backend response:", response);

          if (response.success && response.data) {
            // Use double assertion for converting API response
            const authData = response.data as unknown as AuthResponseData;
            Cookies.set("accessToken", authData.accessToken, {
              expires: 7,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            if (authData.refreshToken) {
              Cookies.set("refreshToken", authData.refreshToken, {
                expires: 30,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              });
            }

            // toast.success("Successfully logged in with Google!");
            router.push("/dashboard");
          } else {
            toast.error(
              response.message || "Authentication failed. Please try again."
            );
          }
        } catch (error) {
          console.error("Error calling backend Google auth:", error);
          toast.error("Failed to complete authentication. Please try again.");
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    processGoogleAuth();
  }, [session, status, router]);

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
          // Safe access to the first key-value pair
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

  const googleLogin = async () => {
    try {
      setGoogleLoading(true);
      // Redirect to Google OAuth - will come back to this page
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to initiate Google login");
      setGoogleLoading(false);
    }
  };

  // Show loading spinner while processing Google auth
  if (googleLoading && status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Completing Google authentication...
          </p>
        </div>
      </div>
    );
  }

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
        loading={loading || googleLoading}
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
