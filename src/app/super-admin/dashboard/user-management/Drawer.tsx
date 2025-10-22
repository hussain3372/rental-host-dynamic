"use client";
import React, { useState, useEffect, useRef } from "react";

type HelpSupportDrawerProps = {
  onClose: () => void;
  onNoteSubmit: (note: string) => void;
};

export default function TicketDrawer({
  onClose,
  onNoteSubmit,
}: HelpSupportDrawerProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: ""
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: ""
  });
  const [isVisible, setIsVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  useEffect(() => {
  setIsVisible(true);
  document.body.style.overflow = "hidden";

  const handleClickOutside = (event: MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.body.style.overflow = "unset";
    document.removeEventListener("mousedown", handleClickOutside);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: ""
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.email;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // You might want to submit both fields or just one
      onNoteSubmit(`New Admin: ${formData.fullName} (${formData.email})`);
      handleClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9000] bg-black/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={drawerRef}
        className={`prevent-scroller overflow-auto max-w-[70vw] sm:max-w-[608px] absolute right-0 bg-[#0A0C0B] z-[8000] h-full min-h-[100vh] p-[28px] top-0 flex flex-col justify-between text-white transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-5">
          <h2 className="text-[16px] sm:text-[20px] leading-6 font-medium mb-3">
            Add New Admin
          </h2>
          <p className="text-[12px] sm:text-[16px] sm:leading-5 font-normal mb-10 text-[#FFFFFF99]">
            Assign admin access by entering details and selecting permissions.
          </p>

          {/* Full Name Input */}
          <div>
            <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
              Full name
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] resize-none placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] resize-none placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full py-3 yellow-btn text-[#121315] rounded-lg font-semibold cursor-pointer hover:bg-[#e0ed65] transition-colors"
          >
           Send Code For Verification
          </button>
        </div>
      </div>
    </div>
  );
}