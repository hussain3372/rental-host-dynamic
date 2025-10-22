"use client";
import React from "react";
import Image from "next/image";
type SubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // ✅ new
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
              <Image src="/images/empty-state.png" alt="House" width={140} height={117} />
            </div>
          </div>
          <h2 className="text-white text-[18px] leading-[22px] font-semibold mb-2">
            Subscription Activated!
          </h2>
          <div className="flex justify-center">
            <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5 font-normal max-w-[404px] w-full text-center">
              Your plan is now active. Start listing your properties and move closer to earning your certification.
            </p>
          </div>
          <button
            onClick={handleConfirm} 
                    className="yellow-btn cursor-pointer mt-8 w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"

          >
            Start Listing
          </button>
        </div>
      </div>
    </div>
  );
};
