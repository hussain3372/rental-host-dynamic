"use client";
import React, { useState, useEffect } from "react";
import AuthForm from "@/app/Layout/auth-layout/AuthForm";
import toast from "react-hot-toast";
import { auth } from "@/app/api/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { signIn, useSession } from "next-auth/react";

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface MfaResponse {
  mfaRequired?: boolean;
  email?: string;
}

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

interface GoogleSession {
  idToken?: string;
  user?: {
    email?: string;
    name?: string;
  };
}

interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  user: {
    name: string;
    email: string;
    id: string;
    role?: string;
    mfaEnabled?: boolean;
  };
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleRedirect, setIsGoogleRedirect] = useState(false);
  const router = useRouter();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check if this is a Google OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const isGoogleCallback = urlParams.get('callbackUrl')?.includes('/auth/login') || 
                            urlParams.get('error') || 
                            urlParams.get('code');
    
    if (isGoogleCallback) {
      setIsGoogleRedirect(true);
    }
  }, []);

  useEffect(() => {
    const requestNotificationPermissionAndGenerateToken = async () => {
      try {
        if (!messaging) {
          console.log("❌ FCM not supported or messaging not initialized");
          return;
        }

        console.log("🔄 Checking notification permission...");
        console.log("Current permission:", Notification.permission);

        // REQUEST PERMISSION IF NOT GRANTED
        if (Notification.permission === "default") {
          console.log("📢 Requesting notification permission...");
          const permission = await Notification.requestPermission();
          console.log("Permission result:", permission);

          if (permission !== "granted") {
            console.log("❌ Notification permission denied by user");
            return;
          }
        }

        // Generate token if permission is granted
        if (Notification.permission === "granted") {
          console.log("✅ Permission granted, generating FCM token...");
          const token = await getToken(messaging, {
            vapidKey: "BEyjKXOqIyfAIE2cXJZdqdLXzA_NVMq4K4EHN_WO3UXBhsHPxz_amir9TBY5PEDzkT7mvMbwudeMc8q-nnp1A9Y",
          });

          if (token) {
            console.log("✅ FCM Token generated successfully:", token);
            console.log("Token length:", token.length);
            setFcmToken(token);
          } else {
            console.log("❌ No FCM token received - token is null/empty");
          }
        } else {
          console.log("❌ Notification permission not granted:", Notification.permission);
        }
      } catch (error) {
        console.error("❌ FCM token generation failed:", error);
      }
    };

    requestNotificationPermissionAndGenerateToken();
  }, []);

  // Handle Google authentication after redirect - ONLY for initial Google login
  useEffect(() => {
    const processGoogleAuth = async () => {
      // Only process if this is a Google redirect and we have a session with ID token
      if (isGoogleRedirect && status === "authenticated" && session && (session as unknown as GoogleSession).idToken) {
        try {
          setGoogleLoading(true);
          console.log("🔄 Processing Google authentication in login page...");

          const idToken = (session as unknown as GoogleSession).idToken;
          if (!idToken) {
            throw new Error("No ID token found in session");
          }

          const response = await auth.googleAuth({
            token: idToken,
          });
          console.log("🔍 Google auth response:", response);

          if (response.success && response.data) {
            const authData = response.data as unknown as AuthResponseData;
            
            // Handle MFA for Google auth if needed
            if (authData.user?.mfaEnabled) {
              console.log("✅ MFA required for Google user - redirecting to verification");
              if (authData.user.email) localStorage.setItem("hostEmail", authData.user.email);
              localStorage.setItem("userMfaEnabled", "true");
              toast.loading("Redirecting to verification screen...");
              router.push("/auth/verify-otp");
              return;
            }

            // Check role restriction for Google auth
            if (authData.user?.role !== "HOST") {
              console.log("❌ Google user role is not HOST:", authData.user?.role);
              toast.error("Access restricted — hosts only.");
              return;
            }

            // Store tokens and user data
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

            // Store user data in localStorage
            if (authData.user.name) {
              const names = authData.user.name.split(" ");
              localStorage.setItem("hostFirstname", names[0] || "");
              localStorage.setItem("hostLastname", names[1] || "");
            }
            if (authData.user.email) localStorage.setItem("hostEmail", authData.user.email);
            if (authData.user.role) localStorage.setItem("userRole", authData.user.role);
            localStorage.setItem("userMfaEnabled", "false");

            // toast.success("Successfully logged in with Google!");
            router.push("/dashboard");
          } else {
            toast.error(response.message || "Google authentication failed. Please try again.");
          }
        } catch (error) {
          console.error("❌ Error calling backend Google auth:", error);
          toast.error("Failed to complete Google authentication. Please try again.");
        } finally {
          setGoogleLoading(false);
          setIsGoogleRedirect(false); // Reset the flag
        }
      }
    };

    processGoogleAuth();
  }, [session, status, router, fcmToken, isGoogleRedirect]);

  const googleLogin = async () => {
    try {
      setGoogleLoading(true);
      setIsGoogleRedirect(true); // Set flag when initiating Google login
      console.log("🔄 Initiating Google login...");
      
      // Redirect to Google OAuth with callback to login page
      await signIn("google", {
        callbackUrl: "/auth/login",
        redirect: true,
      });
    } catch (error) {
      console.error("❌ Google login error:", error);
      toast.error("Failed to initiate Google login");
      setGoogleLoading(false);
      setIsGoogleRedirect(false); // Reset flag on error
    }
  };

  const handleLogin = async (formData: LoginFormData) => {
    try {
      setLoading(true);

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
      const mfaRequired = (response?.data as MfaResponse)?.mfaRequired;

      console.log("🔍 Full response:", JSON.stringify(response, null, 2));
      console.log("🔍 User object:", JSON.stringify(user, null, 2));
      console.log("🔍 MFA Required:", mfaRequired);

      // Step 1: Check if login failed
      if (!response?.success) {
        toast.error(response?.message || "Login failed");
        return;
      }

      // Step 2: Handle MFA users FIRST (check mfaRequired flag from API)
      if (mfaRequired === true) {
        console.log("✅ MFA required - redirecting to email verification");

        // Store email for MFA flow
        const email = (response?.data as MfaResponse)?.email;
        if (email) localStorage.setItem("hostEmail", email);
        localStorage.setItem("userMfaEnabled", "true");

        setLoading(false);
        toast.loading("Redirecting to verification screen...");
        router.push("/auth/verify-otp");
        return;
      }

      // Step 3: Store user data (only for non-MFA users)
      if (user) {
        if (user.firstname) localStorage.setItem("hostFirstname", user.firstname);
        if (user.lastname) localStorage.setItem("hostLastname", user.lastname);
        if (user.email) localStorage.setItem("hostEmail", user.email);
        localStorage.setItem("userMfaEnabled", "false");
        if (user.role) localStorage.setItem("userRole", user.role);
      }

      // Step 4: Check role restriction (only for non-MFA users)
      console.log("Checking role for non-MFA user:", user?.role);
      if (user?.role !== "HOST") {
        console.log("❌ User role is not HOST:", user?.role);
        toast.error("Access restricted — hosts only.");
        return;
      }

      // Step 5: Complete login for HOST users without MFA
      const token = response?.data?.accessToken || "";
      if (token) {
        console.log("✅ Setting access token for HOST user");
        Cookies.set("accessToken", token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          path: "/",
        });

        toast.success("Login successful!");
        router.push("/dashboard");
        return;
      }

      // Fallback
      console.log("⚠️ Unexpected state - no token provided");
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
        wronginputmessage="Please enter a valid email address"
        emptypasswordmessage="Password is required"
        title="Welcome Back!"
        subtitle="Sign in to explore your personalized dashboard."
        submitText="Login"
        showAlter={true}
        alterText="Don't have an account?"
        linktext="Sign up"
        loading={loading || googleLoading}
        link="/auth/signup"
        mode="login"
        onGoogleLogin={googleLogin}
        onSubmit={handleLogin}
      />
    </div>
  );
}