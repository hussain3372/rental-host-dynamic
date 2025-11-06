"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { auth } from "@/app/api/auth";
import Loader from "@/app/shared/loaders";

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

export default function RedirectingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const processGoogleAuth = async () => {
      // Only process if we have an authenticated session with ID token
      if (status === "authenticated" && session && (session as unknown as GoogleSession).idToken) {
        try {
          console.log("🔄 Processing Google authentication in callback page...");

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
              if (authData.user.email)
                localStorage.setItem("hostEmail", authData.user.email);
              localStorage.setItem("userMfaEnabled", "true");
              toast.loading("Redirecting to verification screen...");
              router.push("/auth/verify-otp");
              return;
            }

            // Check role restriction for Google auth
            if (authData.user?.role !== "HOST") {
              console.log("❌ Google user role is not HOST:", authData.user?.role);
              toast.error("Access restricted — hosts only.");
              // Sign out since role is invalid
              // You might want to add a sign out function here
              router.push("/auth/login");
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
            if (authData.user.email)
              localStorage.setItem("hostEmail", authData.user.email);
            if (authData.user.role)
              localStorage.setItem("userRole", authData.user.role);
            localStorage.setItem("userMfaEnabled", "false");

            // toast.success("Successfully logged in with Google!");
            router.push("/dashboard");
          } else {
            toast.error(
              response.message || "Google authentication failed. Please try again."
            );
            router.push("/auth/login");
          }
        } catch (error) {
          console.error("❌ Error calling backend Google auth:", error);
          toast.error("Failed to complete Google authentication. Please try again.");
          router.push("/auth/login");
        }
      } else if (status === "unauthenticated") {
        // If not authenticated, redirect to login
        console.log("❌ No authenticated session found");
        router.push("/auth/login");
      }
    };

    processGoogleAuth();
  }, [session, status, router]);

  // Show loading state
  return (
    <div className="min-h-[100vh] flex justify-center items-center">
      <div className="text-center">
        <div className="flex justify-center items-center">
        <Loader type="dots"/>
        </div>
        <p className="mt-4 text-white">Completing Google authentication...</p>
      </div>
    </div>
  );
}