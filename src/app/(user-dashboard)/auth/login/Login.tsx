"use client";
import React, { useState, useEffect } from "react";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
import toast from "react-hot-toast";
import { auth } from "@/app/api/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";


// Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let messaging: ReturnType<typeof getMessaging> | null = null;

// Initialize messaging only if supported
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    user?: {
      mfaEnabled?: boolean;
      role?: string;
      firstname?: string;
      lastname?: string;
      email?: string;
    };
  };
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const generateFcmTokenSilently = async () => {
      try {
        if (!messaging) {
          console.log("❌ FCM not supported or messaging not initialized");
          return;
        }

        console.log("🔄 Checking notification permission...");
        console.log("Current permission:", Notification.permission);

        if (Notification.permission === "granted") {
          console.log("✅ Permission granted, generating FCM token...");
          const token = await getToken(messaging, {
            vapidKey:
              "BEyjKXOqIyfAIE2cXJZdqdLXzA_NVMq4K4EHN_WO3UXBhsHPxz_amir9TBY5PEDzkT7mvMbwudeMc8q-nnp1A9Y",
          });

          if (token) {
            console.log("✅ FCM Token generated successfully:", token);
            console.log("Token length:", token.length);
            setFcmToken(token);
          } else {
            console.log("❌ No FCM token received - token is null/empty");
          }
        } else {
          console.log(
            "ℹ️ Notification permission not granted, token generation skipped"
          );
        }
      } catch (error) {
        console.error("❌ FCM token generation failed:", error);
      }
    };

    generateFcmTokenSilently();
  }, []);


  const handleLogin = async (formData: LoginFormData) => {
    try {
      setLoading(true);

      // Debug FCM token before sending
      console.log("🔍 FCM Token status before login:");
      console.log("- Token exists:", !!fcmToken);
      console.log("- Token value:", fcmToken);
      console.log("- Token length:", fcmToken?.length);

      const loginPayload = {
        email: formData.email,
        password: formData.password,
        ...(fcmToken && { fcmToken }),
      };

      const response: AuthResponse = await auth.Login(loginPayload);
      const user = response?.data?.user;

      if (response.success) {
        if (user?.role !== "HOST") {
          toast.error("Access restricted — hosts only.");
          return;
        }
      }

      if (!response?.success) {
        toast.error(response?.message || "Login failed");
        return;
      }

     

      // 🧱 Safely store whatever exists — no undefined crashes
      if (user) {
        if (user.firstname) localStorage.setItem("firstname", user.firstname);
        if (user.lastname) localStorage.setItem("lastname", user.lastname);
        if (user.email) localStorage.setItem("email", user.email);
        if (typeof user.mfaEnabled !== "undefined")
          localStorage.setItem(
            "userMfaEnabled",
            JSON.stringify(user.mfaEnabled)
          );
        if (user.role) localStorage.setItem("userRole", user.role);
      }

      const token = response?.data?.accessToken || "";

      // 🔐 Case 1: MFA disabled → accessToken present
      if (token && !user?.mfaEnabled) {
        Cookies.set("accessToken", token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          path: "/",
        });
        Cookies.remove('adminAccessToken')
        Cookies.remove('superAdminAccessToken')
        toast.success("Login successful!");
        // router.push("/dashboard");
        router.refresh();
        return;
      }

      // 🔐 Case 2: MFA enabled → no token yet
      if (user?.mfaEnabled) {
        toast.success("2FA verification required");
        router.push("/auth/verify-otp");
        return;
      }

      // 🧩 Case 3: Unexpected success shape (no user, no token)
      toast.success(response?.message || "Login request successful");
      router.push("/auth/verify-otp"); // safe fallback
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Network error. Please try again.";
      toast.error(errorMessage);
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
        alterText="Don't have an account?"
        linktext="Sign up"
        loading={loading}
        link="/auth/signup"
        mode="login"
        onSubmit={handleLogin}
      />
    </div>
  );
}
