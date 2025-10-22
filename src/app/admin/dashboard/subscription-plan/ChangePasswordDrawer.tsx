"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Modal } from "@/app/shared/Modal";
import { ChangePasswordResponse } from "@/app/api/Admin/setting/types";
import { setting } from "@/app/api/Admin/setting"; 

type ChangePasswordDrawerProps = {
  onClose: () => void;
  onSave?: (currentPassword: string, newPassword: string) => void; 
};

export default function ChangePasswordDrawer({
  onClose,
  onSave,
}: ChangePasswordDrawerProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handlePasswordUpdate = async () => {
    setError(null);

    if (!currentPassword || !newPassword) {
      setError("Both fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      const response = await setting.changePassword({
        currentPassword,
        newPassword,
      });
      const data: ChangePasswordResponse = response.data;

      if (data.status === "success") {
        setIsSuccessModalOpen(true);
        setCurrentPassword("");
        setNewPassword("");
        if (onSave) onSave(currentPassword, newPassword); 
      } else {
        setError(data.message || "Failed to change password. Please try again.");
      }
    } catch (err) {
      console.error("Password change error:", err);
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-full flex flex-col justify-between text-white">
      <div className="space-y-5">
        <h2 className="text-[20px] font-medium">Change Password</h2>

        <div className="relative">
          <label className="block text-[14px] mb-[10px]">Current password</label>
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 pr-10 rounded-xl border border-[#404040] bg-gradient-to-b from-[#202020] to-[#101010]
              text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#EFFC76]"
          />
          <button
            type="button"
            className="absolute right-3 top-[46px] text-gray-400"
            onClick={() => setShowCurrent(!showCurrent)}
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="relative">
          <label className="block text-[14px] mb-[10px]">New password</label>
          <input
            type={showNew ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 pr-10 rounded-xl border border-[#404040] bg-gradient-to-b from-[#202020] to-[#101010]
              text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#EFFC76]"
          />
          <button
            type="button"
            className="absolute right-3 top-[46px] text-gray-400"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      <div className="mt-6">
        <button
          disabled={loading}
          onClick={handlePasswordUpdate}
          className={`yellow-btn w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px]
            ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#E5F266]"}`}
        >
          {loading ? "Updating..." : "Update Password"}
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
