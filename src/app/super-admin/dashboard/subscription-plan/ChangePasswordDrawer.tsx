"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 
import { useRouter } from "next/navigation";
import { Modal } from "@/app/shared/Modal";

type ChangePasswordDrawerProps = {
  onSave?: (currentPassword: string, newPassword: string) => void;
  onClose: () => void;
  title?: string;
};

export default function ChangePasswordDrawer({ onClose, title }: ChangePasswordDrawerProps) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // ✅ Success modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically make your API call:
      // await updatePassword(currentPassword, newPassword);
      
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Password update failed:", error);
      setErrors({ currentPassword: "Failed to update password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePasswordUpdate();
    }
  };

  return (
    <div className="h-full flex flex-col justify-between text-white">
      {/* Top content */}
      <div className="space-y-5">
        <h2 className="text-[20px] leading-6 font-medium mb-3">
          {title || "Manage Your Password"}
        </h2>
        <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
          Update your password anytime for better security, or reset it if
          you&apos;ve forgotten the current one.
        </p>

        {/* Current Password */}
        <div className="relative">
          <label className="block text-[14px] font-medium mb-[10px]">
            Current password
          </label>
          <input
            placeholder="Enter password"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (errors.currentPassword) {
                setErrors(prev => ({ ...prev, currentPassword: undefined }));
              }
            }}
            onKeyPress={handleKeyPress}
            className={`w-full p-3 pr-10 rounded-xl border bg-gradient-to-b from-[#202020] to-[#101010] text-[14px] text-white placeholder:text-white/40 focus:outline-none transition duration-200 ease-in-out ${
              errors.currentPassword ? "border-red-500" : "border-[#404040] focus:border-[#EFFC76]"
            }`}
          />
          <button
            type="button"
            className="absolute right-3 top-[46px] text-gray-400 cursor-pointer hover:text-white transition-colors"
            onClick={() => setShowCurrent(!showCurrent)}
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="absolute right-0 -bottom-6 text-sm text-[#fff] cursor-pointer hover:text-[#EFFC76] transition-colors"
          >
            Forgot Password?
          </button>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div className="relative">
          <label className="block text-[14px] font-medium mb-[10px]">
            New password
          </label>
          <input
            placeholder="Enter new password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) {
                setErrors(prev => ({ ...prev, newPassword: undefined }));
              }
            }}
            onKeyPress={handleKeyPress}
            className={`w-full p-3 pr-10 rounded-xl border bg-gradient-to-b from-[#202020] to-[#101010] text-[14px] text-white placeholder:text-white/40 focus:outline-none transition duration-200 ease-in-out ${
              errors.newPassword ? "border-red-500" : "border-[#404040] focus:border-[#EFFC76]"
            }`}
          />
          <button
            type="button"
            className="absolute right-3 top-[46px] text-gray-400 cursor-pointer hover:text-white transition-colors"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="block text-[14px] font-medium mb-[10px]">
            Confirm new password
          </label>
          <input
            placeholder="Enter confirm new password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            onKeyPress={handleKeyPress}
            className={`w-full p-3 pr-10 rounded-xl border bg-gradient-to-b from-[#202020] to-[#101010] text-[14px] text-white placeholder:text-white/40 focus:outline-none transition duration-200 ease-in-out ${
              errors.confirmPassword ? "border-red-500" : "border-[#404040] focus:border-[#EFFC76]"
            }`}
          />
          <button
            type="button"
            className="absolute right-3 top-[46px] text-gray-400 cursor-pointer hover:text-white transition-colors"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Bottom button */}
      <div className="mt-6 lg:mt-auto">
        <button
          onClick={handlePasswordUpdate}
          disabled={isLoading}
          className={`yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] transition-colors duration-300 ${
            isLoading 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-[#E5F266]"
          }`}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </div>

      {isSuccessModalOpen && (
        <Modal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            onClose(); 
          }}
          onConfirm={() => {
            setIsSuccessModalOpen(false);
            onClose();
          }}
          title="Password Changed"
          description="Your password has been updated successfully."
          image="/images/2fa-image.png"
          confirmText="Okay"
        />
      )}
    </div>
  );
}