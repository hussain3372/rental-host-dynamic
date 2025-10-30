"use client";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Dropdown from "@/app/shared/InputDropDown";

interface UserData {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
    certifications: number;
    supportTickets: number;
  };
}

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateUserPayload) => Promise<boolean>;
  userData: UserData | null;
  userType: "host" | "admin";
}

interface UpdateUserPayload {
  name: string;
  email: string;
  status: string;
}

interface UserFormData {
  name: string;
  email: string;
  status: string;
}

interface FormErrors {
  name: string;
  email: string;
  status: string;
}

// Convert API status to display status
const getDisplayStatus = (apiStatus: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'SUSPENDED': 'Suspended',
    'PENDING_VERIFICATION': 'Pending Verification'
  };
  return statusMap[apiStatus] || apiStatus;
};

// Convert display status to API status
const getApiStatus = (displayStatus: string): string => {
  const statusMap: Record<string, string> = {
    'Active': 'ACTIVE',
    'Suspended': 'SUSPENDED',
    'Pending Verification': 'PENDING_VERIFICATION'
  };
  return statusMap[displayStatus] || displayStatus;
};

export default function EditUser({
  isOpen,
  onClose,
  onSave,
  userData,
  userType
}: EditUserProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    status: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    status: ""
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = ["Active", "Suspended", "Pending Verification"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };

    if (statusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusDropdownOpen]);

  // Initialize form with user data when component opens or userData changes
  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        status: getDisplayStatus(userData.status) || "Active"
      });
    }
  }, [userData, isOpen]);

  const handleClose = (): void => {
    setIsVisible(false);
    setStatusDropdownOpen(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: "",
      email: "",
      status: ""
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the payload for the API
      const payload: UpdateUserPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        status: getApiStatus(formData.status)
      };

      const success = await onSave(payload);
      
      if (success) {
        toast.success(`${userType === "host" ? "Host" : "Admin"} updated successfully`);
        handleClose();
      } else {
        toast.error(`Failed to update ${userType}. Please try again.`);
      }
    } catch (error: unknown) {
      console.error(`Error updating ${userType}:`, error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("email") || error.message.includes("Email")) {
          toast.error("Email already exists. Please use a different email address.");
        } else {
          toast.error(error.message || `Failed to update ${userType}. Please try again.`);
        }
      } else {
        toast.error(`Failed to update ${userType}. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleStatusSelect = (status: string): void => {
    setFormData(prev => ({
      ...prev,
      status
    }));
    setStatusDropdownOpen(false);
    
    // Clear status error if any
    if (errors.status) {
      setErrors(prev => ({
        ...prev,
        status: ""
      }));
    }
  };

  const drawerTitle = userType === "host" ? "Update Host" : "Update Admin";
  const drawerDescription = userType === "host" 
    ? "Update host information and account status." 
    : "Update admin information and account status.";

  if (!isOpen) return null;

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
            {drawerTitle}
          </h2>
          <p className="text-[12px] sm:text-[16px] sm:leading-5 font-normal mb-10 text-[#FFFFFF99]">
            {drawerDescription}
          </p>

          {/* Name Input */}
          <div>
            <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] resize-none placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] resize-none placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
              Status <span className="text-red-500">*</span>
            </label>

            <div
              className={`
                w-full p-3 pr-10 rounded-[10px]
                border border-[#404040]        
                hover:border-[#EFFC76]          
                focus:border-[#EFFC76]          
                bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
                placeholder:text-white/40
                focus:outline-none
                transition duration-200 ease-in-out
                cursor-pointer
                text-white
                ${errors.status ? 'border-red-500' : ''}
              `}
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            >
              {formData.status || "Select status"}
              <Image
                src="/images/dropdown.svg"
                alt="dropdown"
                width={15}
                height={8}
                className="absolute right-3 bottom-4 transform -translate-y-1/2 pointer-events-none"
              />
            </div>

            {statusDropdownOpen && (
              <div className="absolute z-50 w-full mt-1">
                <Dropdown
                  items={statusOptions.map((status) => ({
                    label: status,
                    onClick: () => handleStatusSelect(status),
                  }))}
                />
              </div>
            )}
            
            {errors.status && (
              <p className="text-red-500 text-xs mt-1">{errors.status}</p>
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
                Updating...
              </div>
            ) : (
              `Update ${userType === "host" ? "Host" : "Admin"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}