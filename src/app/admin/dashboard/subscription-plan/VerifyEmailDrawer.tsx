"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

type VerifyEmailDrawerProps = {
    initialEmail: string;
    onClose: () => void;
    onVerify: (otp: string) => void;
};

export default function EmailVerifyDrawer({
    initialEmail,

    onVerify,
}: VerifyEmailDrawerProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [errors, setErrors] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState(120);
    const [showResend, setShowResend] = useState(false);

    // Countdown for resend
    useEffect(() => {
        if (timeLeft <= 0) {
            setShowResend(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const sec = (seconds % 60).toString().padStart(2, "0");
        return `${min}:${sec}`;
    };

    const handleResend = () => {
        toast.success("Code resent");
        setTimeLeft(120);
        setShowResend(false);
    };

    // OTP input logic
    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setErrors("");

            if (value && index < 5) {
                const nextInput = document.getElementById(
                    `otp-${index + 1}`
                ) as HTMLInputElement;
                nextInput?.focus();
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(
                `otp-${index - 1}`
            ) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    const handleVerify = () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setErrors("Please enter all 6 digits");
            return;
        }
        onVerify(otpCode);
    };

    return (
        <div className="h-full flex flex-col justify-between text-white">
            {/* Top content */}
            <div className="space-y-[40px]">
                <h2 className="text-[20px] leading-6 font-medium mb-3">
                    Verify Your Email
                </h2>
                <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99] max-w-[552px] w-full">
                    We’ve sent a 6-digit code to{" "}
                    <span className="font-medium text-[#FFFC76]">{initialEmail}</span>.
                    Enter it below to complete setup.
                </p>

                {/* OTP Inputs */}
                <div className="flex gap-2 sm:gap-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            placeholder="0"
                            className={`flex-1 min-w-[34px] sm:min-w-[48px] max-w-[60px] sm:max-w-[78px] aspect-square 
        bg-gradient-to-b from-[#202020] to-[#101010] 
        border ${errors ? "border-red-500" : "border-[#404040]"} 
        rounded-xl text-center text-white text-lg sm:text-lg font-semibold 
        focus:border-[#EFFC76] focus:outline-none transition-colors`}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        />
                    ))}
                </div>

                {errors && <p className="text-red-500 text-sm">{errors}</p>}

                <p className="text-white pt-[20px] text-center font-bold text-[22px]">
                    {formatTime(timeLeft)}
                </p>

                {/* Resend Button */}
                <div className="flex justify-center pt-3">
                    <button
                        onClick={handleResend}
                        disabled={!showResend}
                        className={`underline text-[16px] font-semibold ${showResend
                            ? "text-[#EFFC76] cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Resend Code
                    </button>
                </div>
            </div>

            {/* Bottom button */}
            <div className="mt-6">
                <button
                    onClick={handleVerify}
                    className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
                >
                    Verify
                </button>
            </div>
        </div>
    );
}
