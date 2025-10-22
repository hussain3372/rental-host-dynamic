"use client";
import React from "react";
import Image from "next/image";
import toast from "react-hot-toast";


type AuthenticationEnableProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // ✅ new
};

export const AuthenticationEnable: React.FC<AuthenticationEnableProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

 

  return (
    <div
      className="fixed inset-0 bg-[#121315CC] flex items-center justify-center z-[2020] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0A0C0B] rounded-[12px] p-5 max-w-[554px] w-full mx-4 relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 relative">
              <Image src="/images/2fa-image.png" alt="House" width={140} height={140} />
            </div>
          </div>
          <h2 className="text-white text-[18px] leading-[22px] font-semibold mb-2">
            Two-Factor Authentication Enabled
          </h2>
          <div className="flex justify-center">
            <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5 font-normal max-w-[358px] w-full text-center">
              From now on, we’ll send a login code to your email for extra security.
            </p>
          </div>
          <button
            onClick={() => {
              toast.success("2FA authentication enabled successfully");
              onClose(); // ✅ close the modal
            }}
                    className="yellow-btn cursor-pointer py-4 mt-8 w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
          >
            Got It
          </button>

        </div>
      </div>
    </div>
  );
};
