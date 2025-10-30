"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supportApi, uploadImage } from "@/app/api/super-admin/support";
import toast from "react-hot-toast";

export interface PlatformAnnouncement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  updatedAt?: string;
}

type HelpSupportDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  announcementId?: string;
  onUpdate?: (updatedAnnouncement: PlatformAnnouncement) => void;
};

interface FormErrors {
  title?: string;
  description?: string;
  image?: string;
}

export default function PlatformDrawer({ 
  // isOpen, 
  onClose, 
  announcementId, 
  onUpdate 
}: HelpSupportDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [announcement, setAnnouncement] = useState<PlatformAnnouncement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch announcement data when component mounts or announcementId changes
  useEffect(() => {
    if (announcementId) {
      fetchAnnouncement();
    } else {
      setAnnouncement(null);
    }
  }, [announcementId]);

  // Check for changes
  useEffect(() => {
    if (announcement) {
      const hasFormChanges = 
        formData.title !== announcement.title ||
        formData.description !== announcement.description ||
        formData.imageUrl !== announcement.imageUrl ||
        imageFile !== null;
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, announcement, imageFile]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAnnouncement = async () => {
    if (!announcementId) return;

    setIsFetching(true);
    try {
      const response = await supportApi.getAnnouncements();
      console.log('Full API Response:', response);

      if (response.success && response.data) {
        const announcementsArray = response.data.data;
        console.log('Announcements Array:', announcementsArray);
        
        if (Array.isArray(announcementsArray)) {
          const foundAnnouncement = announcementsArray.find((item) => item.id === announcementId);
          console.log('Found Announcement:', foundAnnouncement);
          
          if (foundAnnouncement) {
            setAnnouncement(foundAnnouncement);
            setFormData({
              title: foundAnnouncement.title || "",
              description: foundAnnouncement.description || "",
              imageUrl: foundAnnouncement.imageUrl || ""
            });
            setImagePreview(foundAnnouncement.imageUrl || "");
          } else {
            console.error('Announcement not found with ID:', announcementId);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch announcement:", error);
    } finally {
      setIsFetching(false);
    }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: "File size must be less than 5MB"
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: "Please upload a valid image (JPG, PNG, GIF)"
        }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({
        ...prev,
        image: undefined
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
  try {
    console.log("🟡 Uploading image:", file.name);
    const response = await uploadImage(file);
    
    if (response.data && response.data.data && response.data.data.url) {
      console.log("🟢 Image uploaded successfully:", response.data.data.url);
      return response.data.data.url;
    } else {
      throw new Error("Failed to get image URL from response");
    }
  } catch (error: unknown) {
    console.error("🔴 Image upload error:", error);
    throw new Error(error instanceof Error ? error.message : "Image upload failed");
  }
};

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      imageUrl: ""
    }));
    setErrors(prev => ({
      ...prev,
      image: undefined
    }));
  };

  const handleSaveChanges = async () => {
    if (!announcementId) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // If user uploaded a new image file, upload it first
     if (imageFile) {
  try {
    finalImageUrl = await uploadImageToServer(imageFile);
  } catch (uploadError: unknown) {
    const errorMessage = uploadError instanceof Error ? uploadError.message : "Image upload failed";
    toast.error(`Image upload failed: ${errorMessage}`);
    setIsLoading(false);
    return;
  }
}
      const response = await supportApi.updateAnnouncement(announcementId, {
        title: formData.title,
        description: formData.description,
        imageUrl: finalImageUrl
      });

      if (response.success && response.data) {
        const updatedData = response.data;
        setAnnouncement(updatedData);
        setFormData({
          title: updatedData.title || "",
          description: updatedData.description || "",
          imageUrl: updatedData.imageUrl || ""
        });
        setImagePreview(updatedData.imageUrl || "");
        setImageFile(null);
        setHasChanges(false);
        
        if (onUpdate) {
          onUpdate(updatedData);
        }
        
        toast.success("Announcement updated successfully");
        console.log("Announcement updated successfully");
      }
    } catch (error) {
      console.error("Failed to update announcement:", error);
      toast.error("Failed to update announcement");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleCancel = () => {
  //   if (announcement) {
  //     setFormData({
  //       title: announcement.title || "",
  //       description: announcement.description || "",
  //       imageUrl: announcement.imageUrl || ""
  //     });
  //     setImagePreview(announcement.imageUrl || "");
  //     setImageFile(null);
  //     setErrors({});
  //     setHasChanges(false);
  //   }
  // };

  const handleClose = async () => {
    if (hasChanges) {
      await handleSaveChanges();
    }
    onClose();
  };

  if (!announcementId) {
    return (
      <div className="h-full flex flex-col justify-between text-white">
        <div className="space-y-5 flex-1">
          <h2 className="text-[20px] leading-6 font-medium mb-3">
            Platform Updates
          </h2>
          <p className="text-[16px] leading-5 font-normal text-[#FFFFFF99]">
            No announcement selected
          </p>
        </div>
        <div className="">
          <button
            onClick={onClose}
            className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="h-full flex flex-col justify-between text-white">
        <div className="space-y-5 flex-1">
          <h2 className="text-[20px] leading-6 font-medium mb-3">
            Platform Updates
          </h2>
          <p className="text-[16px] leading-5 font-normal text-[#FFFFFF99]">
            Loading announcement...
          </p>
        </div>
        <div className="">
          <button
            onClick={onClose}
            className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="h-full flex flex-col justify-between text-white">
        <div className="space-y-5 flex-1">
          <h2 className="text-[20px] leading-6 font-medium mb-3">
            Platform Updates
          </h2>
          <p className="text-[16px] leading-5 font-normal text-[#FFFFFF99]">
            Announcement not found
          </p>
        </div>
        <div className="">
          <button
            onClick={onClose}
            className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col justify-between text-white">
      {/* Top content */}
      <div className="space-y-5 flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center">
          <h2 className="text-[20px] leading-6 font-medium">
            Platform Updates
          </h2>
          {hasChanges && (
            <span className="text-sm text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
              Unsaved Changes
            </span>
          )}
        </div>
        
        <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
          {announcement.updatedAt ? new Date(announcement.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'Invalid Date'}
        </p>

        <div className="relative p-4 rounded-lg space-y-5">
          {/* Title Section */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full p-3 rounded-[10px] border ${
                errors.title ? 'border-red-500' : 'border-[#404040]'
              } bg-gradient-to-b from-[#202020] to-[#101010] text-white placeholder:text-white/40 focus:outline-none focus:border-[#EFFC76] transition duration-200 ease-in-out`}
              placeholder="Enter title"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description Section */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full p-3 rounded-[10px] border ${
                errors.description ? 'border-red-500' : 'border-[#404040]'
              } bg-gradient-to-b from-[#202020] to-[#101010] text-white placeholder:text-white/40 focus:outline-none focus:border-[#EFFC76] transition duration-200 ease-in-out resize-vertical`}
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Image Upload/Display Section */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Uploaded Image
            </label>
            
            <div className="space-y-3">
              {/* Image Upload Input */}
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="w-full p-3 border border-[#333] rounded text-[#FFFFFF66] hover:border-blue-500 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {imageFile ? imageFile.name : 'Choose New Image'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                {(imagePreview || formData.imageUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {errors.image && (
                <p className="text-red-400 text-xs mt-1">{errors.image}</p>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-64 rounded overflow-hidden">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill
                    className="object-cover"
                    onError={() => {
                      console.error('Image load error');
                    }}
                  />
                </div>
              )}

              {/* Current Image Display */}
              {!imagePreview && formData.imageUrl && formData.imageUrl.startsWith('http') && (
                <div className="relative w-full h-64 rounded overflow-hidden">
                  <Image 
                    src={formData.imageUrl} 
                    alt={formData.title || "Announcement"} 
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<p class="text-red-400 text-sm p-4">Failed to load image</p>';
                      }
                    }}
                  />
                </div>
              )}

              {!imagePreview && !formData.imageUrl && (
                <div className="w-full h-32 bg-[#1E1F20] rounded flex items-center justify-center border border-[#333]">
                  <p className="text-[#FFFFFF66] text-sm">No image uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <div className="flex space-x-3">
          
        </div>
        
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300 disabled:opacity-50 disabled:!cursor-not-allowed"
        >
          {hasChanges && !isLoading ? "Save & Close" : isLoading ? "Saving...": "Close"}
        </button>
      </div>
    </div>
  );
}