"use client";
import React, { useState, useEffect, useRef } from "react";
import { managementApi } from "@/app/api/super-admin/user-management/index";
import toast from "react-hot-toast";

type HelpSupportDrawerProps = {
  onClose: () => void;
  onSuccess?: () => void; // Optional callback for success
  onNoteSubmit?: () => void;
};

export default function TicketDrawer({
  onClose,
  onSuccess,
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);
  
  try {
    // Prepare the payload for the API
    const payload = {
      name: formData.fullName.trim(),
      email: formData.email.trim()
    };

    // Call the addAdmin API
    const response = await managementApi.addAdmin(payload);
    
    console.log("Full response:", response); // Debug log
    
    // Check if response indicates an error - FIXED: Remove problematic properties
    if ((response as { success?: boolean }).success === false) {
      // Extract error message from response - use only message property
      const errorMessage = (response as { message?: string }).message || "Failed to send admin invitation. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
      return;
    }
    
    // Show success toast with the exact message from API
    if ((response as { message?: string }).message) {
      toast.success("Admin added successfully");
    } 
    
    
    // Reset form
    setFormData({
      fullName: "",
      email: ""
    });
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }
    
    // Close drawer
    handleClose();
  } catch (error: unknown) {
    console.error('Error adding admin:', error);
    
    // Extract error message from API response
    let errorMessage = "Failed to send admin invitation. Please try again.";
    
    if (typeof error === 'object' && error !== null) {
      const apiError = error as { message?: string };
      
      // Use only message property to avoid TypeScript errors
      if (apiError.message) {
        errorMessage = apiError.message;
      }
    }
    
    // Show error toast with the proper message
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
            className={`w-full py-3 text-[#121315] rounded-lg font-semibold cursor-pointer transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'yellow-btn hover:bg-[#e0ed65]'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-[#121315] border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending Code...
              </div>
            ) : (
              "Send Code For Verification"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}