"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/api/auth";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next or previous input automatically
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      } else if (!value && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP code.");
      return;
    }

    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      setMessage("Email not found. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await auth.verifyOTP({
        otp: otpCode,
        email: userEmail,
        
      });

      // ✅ Check for success and accessToken
      const success = response?.data?.success || response?.success;
      const accessToken = response?.data?.accessToken;
      const messageText =
        response?.data?.message || response?.message || "Verification complete.";

      if (success && accessToken) {
        // 🔐 Store token in cookies
        Cookies.set("accessToken", accessToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
          path: "/",
        });

        toast.success("OTP verified successfully!");
        setMessage("OTP verified successfully!");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else if (success && !accessToken) {
        // 🧩 Handle success with no token gracefully
        toast.success("OTP verified, please log in again.");
        setMessage("OTP verified, but no token received. Please log in again.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        toast.error(messageText);
        setMessage(messageText);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Something went wrong. Please try again.");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0C0B] text-white px-4">
      <h1 className="text-2xl md:text-3xl font-semibold mb-3">
        Verify Your OTP
      </h1>
      <p className="text-[#FFFFFF99] mb-6 text-center max-w-md">
        Please enter the 6-digit OTP code sent to your email.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6 w-full max-w-sm"
      >
        {/* OTP Inputs */}
        <div className="flex gap-3 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-12 text-center text-xl font-semibold rounded-md bg-[#1b1b1d] border border-[#333] outline-none focus:border-[#EFFC76] transition"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 cursor-pointer bg-[#EFFC76] text-black font-semibold rounded-md hover:bg-[#e5f353] transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Message */}
        {message && (
          <p className="text-sm text-[#FFFFFFB3] text-center mt-2">{message}</p>
        )}

        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="text-[#EFFC76] underline mt-4 hover:text-[#e5f353] transition text-sm"
        >
          ← Back
        </button>
      </form>
    </div>
  );
};

export default OTPVerificationPage;
