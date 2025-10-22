"use client";
import React from "react";
import Image from "next/image";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  image?: string;
  confirmText?: string;
//   cancelText?: string;
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  image,
  confirmText = "Confirm",
//   cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-[#121315CC] flex items-center justify-center z-[2020] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0A0C0B] rounded-[12px] p-5 max-w-[554px] w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center">
          {/* Dynamic Image */}
          {image && (
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 relative">
                <Image src={image} alt="Modal" width={140} height={140} />
              </div>
            </div>
          )}

          {/* Title */}
          <h2 className="text-white text-[18px] leading-[22px] font-semibold mb-2">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5 font-normal max-w-[404px] mx-auto">
              {description}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            {/* {cancelText && (
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-[8px] bg-gray-700 text-white text-[16px] font-medium"
              >
                {cancelText}
              </button>
            )} */}
            <button
              onClick={handleConfirm}
                    className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[16px] leading-[20px] hover:bg-[#E5F266] transition-colors duration-300"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
