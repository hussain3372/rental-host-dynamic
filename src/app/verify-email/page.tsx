"use client";
export const dynamic = "force-dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Loader from "../shared/loaders";
import { auth } from "../api/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      if (!token) {
        setVerificationStatus("error");
        setMessage(
          "No verification token found. Please check your email for the correct verification link."
        );
        return;
      }

      try {
        console.log("Verification token:", token);

        const response = await auth.verifyEmail({ token });

        if (response.success) {
          setVerificationStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        } else {
          setVerificationStatus("error");
          setMessage(
            response.message || "Email verification failed. Please try again."
          );
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error("Email verification error:", err.message);
          setMessage(err.message || "An unexpected error occurred.");
        } else if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { data?: { message?: string } } })
            .response?.data?.message === "string"
        ) {
          setMessage(
            (err as { response: { data: { message?: string } } }).response.data
              .message || "An error occurred during email verification."
          );
        } else {
          console.error("Unknown error:", err);
          setMessage("Something went wrong during verification.");
        }

        setVerificationStatus("error");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus("error");
      setMessage("No verification token provided.");
    }
  }, [token, router]);

  const getStatusContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <>
            <Loader type="dots" size="medium" />
            <h1 className="text-3xl font-semibold tracking-wide text-center">
              Verifying Your Email
            </h1>
            <p className="text-gray-400 text-base max-w-md text-center">
              Please wait a moment while we confirm your verification token.
              You&apos;ll be redirected shortly once the process completes.
            </p>
          </>
        );

      case "success":
        return (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-wide text-green-400 text-center">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-400 text-base max-w-md text-center">
              {message}
            </p>
          </>
        );

      case "error":
        return (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold tracking-wide text-red-400">
              Verification Failed
            </h1>
            <p className="text-gray-400 text-base max-w-md text-center">
              {message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <div className="flex flex-col items-center gap-6 px-6 py-8 bg-gray-900/50 rounded-2xl shadow-xl backdrop-blur-sm max-w-md w-full">
        {getStatusContent()}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
          <div className="flex flex-col items-center gap-6 px-6 py-8 bg-gray-900/50 rounded-2xl shadow-xl backdrop-blur-sm max-w-md w-full">
            <Loader type="dots" size="medium" />
            <h1 className="text-3xl font-semibold tracking-wide">Loading...</h1>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
