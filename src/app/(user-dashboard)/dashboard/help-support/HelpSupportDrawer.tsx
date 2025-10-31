"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Dropdown from "@/app/shared/InputDropDown";
import { supportApi } from "@/app/api/Host/support";
import { uploadImage } from "@/app/api/super-admin/support";
import toast from "react-hot-toast";

interface HelpSupportDrawerProps {
  onClose: () => void;
}

interface FormData {
  subject: string;
  description: string;
  category: string;
  priority: string;
}

interface FormErrors {
  subject?: string;
  description?: string;
  category?: string;
  priority?: string;
  image?: string;
}

interface ApiError {
  response?: {
    data?: {
      success?: boolean;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export default function HelpSupportDrawer({ onClose }: HelpSupportDrawerProps) {
  const [issueDropdownOpen, setIssueDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    description: "",
    category: "",
    priority: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const issueDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        issueDropdownRef.current &&
        !issueDropdownRef.current.contains(event.target as Node)
      ) {
        setIssueDropdownOpen(false);
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setPriorityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const issueTypes = [
    "GENERAL",
    "APPLICATION",
    "CERTIFICATION",
    "PAYMENT",
    "TECHNICAL",
    "ACCOUNT",
  ];

  const priorityLevels = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Issue type is required";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: "File size must be less than 5MB"
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: "Please upload a valid file (JPG, PNG, GIF, PDF)"
        }));
        return;
      }
      
      setImage(file);
      setErrors(prev => ({
        ...prev,
        image: undefined
      }));
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      console.log("🟡 Uploading file:", file.name);
      const response = await uploadImage(file);
      
      if (response.data && response.data.data && response.data.data.url) {
        console.log("🟢 File uploaded successfully:", response.data.data.url);
        return response.data.data.url;
      } else {
        throw new Error("Failed to get file URL from response");
      }
    } catch (error: unknown) {
      console.error("🔴 File upload failed:", error);
      throw new Error("File upload failed");
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let uploadedUrl = "";

      // Upload image first if exists
      if (image) {
        try {
          uploadedUrl = await uploadImageToServer(image);
        } catch (uploadError: unknown) {
          if (uploadError instanceof Error) {
            toast.error(`File upload failed: ${uploadError.message}`);
            setLoading(false);
            return;
          }
        }
      }

      // Prepare the payload with the uploaded file URL
      const payload = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        attachmentUrls: uploadedUrl ? [uploadedUrl] : [],
        tags: [],
      };

      console.log("🟢 Creating support ticket with payload:", payload);

      // Call the API to create support ticket
      const response = await supportApi.createTicket(payload);
      
      console.log("🟢 Full API Response:", response);
      
      if (response.data) {
        toast.success(response.message || "Support ticket created successfully!");
        
        // Reset form
        setFormData({
          subject: "",
          description: "",
          category: "",
          priority: "",
        });
        setImage(null);
        setErrors({});
        onClose();
      } else {
        toast.error(response.message || "Failed to create support ticket");
      }
      
    } catch (error: unknown) {
      console.error("🔴 Error creating support ticket:", error);
      
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || "Failed to create support ticket. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setErrors(prev => ({
      ...prev,
      image: undefined
    }));
  };

  return (
    <div className="h-full flex flex-col text-white">
      <div className="space-y-5 flex-1">
        <h2 className="text-[20px] leading-6 font-medium mb-3">
          Help & Support
        </h2>
        <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
          View and update your personal details to keep your account information accurate.
        </p>

        {/* Issue Type Dropdown */}
        <div ref={issueDropdownRef} className="relative">
          <label className="text-white text-sm font-medium mb-3 block">
            Issue Type *
          </label>
          <div
            className={`
              w-full p-3 pr-10 rounded-[10px] border 
              ${errors.category ? 'border-red-500' : 'border-[#404040]'}
              hover:border-[#EFFC76] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] 
              cursor-pointer transition duration-200 ease-in-out
            `}
            onClick={() => setIssueDropdownOpen(!issueDropdownOpen)}
          >
            {formData.category || "Select issue type"}
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              width={16}
              height={16}
              className="absolute right-3 bottom-4 transform -translate-y-1/2 cursor-pointer"
            />
          </div>

          {issueDropdownOpen && (
            <div className="absolute z-50 w-full mt-1">
              <Dropdown
                items={issueTypes.map((issue) => ({
                  label: issue,
                  onClick: () => {
                    setFormData(prev => ({ ...prev, category: issue }));
                    setIssueDropdownOpen(false);
                    if (errors.category) {
                      setErrors(prev => ({ ...prev, category: undefined }));
                    }
                  },
                }))}
              />
            </div>
          )}
          {errors.category && (
            <p className="text-red-400 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        {/* Priority Dropdown */}
        <div ref={priorityDropdownRef} className="relative">
          <label className="text-white text-sm font-medium mb-3 block">
            Priority *
          </label>
          <div
            className={`
              w-full p-3 pr-10 rounded-[10px] border 
              ${errors.priority ? 'border-red-500' : 'border-[#404040]'}
              hover:border-[#EFFC76] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] 
              cursor-pointer transition duration-200 ease-in-out
            `}
            onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
          >
            {formData.priority || "Select priority"}
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              width={16}
              height={16}
              className="absolute right-3 bottom-4 transform -translate-y-1/2 cursor-pointer"
            />
          </div>

          {priorityDropdownOpen && (
            <div className="absolute z-50 w-full mt-1">
              <Dropdown
                items={priorityLevels.map((level) => ({
                  label: level,
                  onClick: () => {
                    setFormData(prev => ({ ...prev, priority: level }));
                    setPriorityDropdownOpen(false);
                    if (errors.priority) {
                      setErrors(prev => ({ ...prev, priority: undefined }));
                    }
                  },
                }))}
              />
            </div>
          )}
          {errors.priority && (
            <p className="text-red-400 text-xs mt-1">{errors.priority}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
            Subject *
          </label>
          <input
            placeholder="Enter subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className={`
              w-full p-3 rounded-[10px] border
              ${errors.subject ? 'border-red-500' : 'border-[#404040]'}
              hover:border-[#EFFC76] focus:border-[#EFFC76]
              bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
              text-white placeholder:text-white/40
              focus:outline-none transition duration-200 ease-in-out
            `}
          />
          {errors.subject && (
            <p className="text-red-400 text-xs mt-1">{errors.subject}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-10">
          <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
            Description *
          </label>
          <textarea
            placeholder="Describe your problem..."
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`
              w-full p-3 rounded-[10px] border
              ${errors.description ? 'border-red-500' : 'border-[#404040]'}
              hover:border-[#EFFC76] resize-none focus:border-[#EFFC76]
              bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
              text-white placeholder:text-white/40
              focus:outline-none transition duration-200 ease-in-out scrollbar-hide
            `}
            rows={4}
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="text-white text-sm font-medium mb-3 block">
            Attach File (Optional)
          </label>
          <label
            className={`
              flex flex-col justify-center items-center text-center rounded-[10px] border-2 border-dashed 
              ${errors.image ? 'border-red-500' : 'border-[#EFFC76]'}
              bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] 
              hover:border-[#E5F266] transition-colors duration-200
            `}
            style={{ height: "180px", padding: "12px", cursor: "pointer" }}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            {image ? (
              <div className="mt-3 w-full flex flex-col items-center">
                <div className="relative">
                  {image.type.startsWith('image/') ? (
                    <Image
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded-lg object-cover w-[80px] h-[80px] mb-2"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-white text-sm">PDF</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[#FFFFFF99] text-[12px]">
                  {image.name}
                </p>
              </div>
            ) : (
              <>
                <Image
                  src="/images/image-upload.png"
                  alt="Upload"
                  width={40}
                  height={40}
                  className="mb-5 object-contain"
                />
                <h3 className="text-[#FFFFFF] text-[16px] leading-5 font-normal mb-2">
                  Upload File
                </h3>
                <p className="text-[#FFFFFF99] text-[12px] leading-[16px] font-normal max-w-[346px] w-full">
                  Please upload a clear and readable file in PDF, JPG, PNG, or GIF format.
                  The maximum file size allowed is 5MB.
                </p>
              </>
            )}
          </label>
          {errors.image && (
            <p className="text-red-400 text-xs mt-1">{errors.image}</p>
          )}
        </div>
      </div>

      {/* Report Issue Button */}
      <div className="mt-5 lg:mt-auto py-5">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`
            yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] 
            hover:bg-[#E5F266] transition-colors duration-300
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? "Submitting..." : "Report Issue"}
        </button>
      </div>
    </div>
  );
}