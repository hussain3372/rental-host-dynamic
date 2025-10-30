"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supportApi } from "@/app/api/super-admin/support";

export interface PlatformAnnouncement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  updatedAt?: string;
  // Add any other fields that this component actually receives from the API
}

type HelpSupportDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  announcementId?: string;
  onUpdate?: (updatedAnnouncement: PlatformAnnouncement) => void;
};

// Update the props and state types


export default function PlatformDrawer({ 
  isOpen, 
  onClose, 
  announcementId, 
  onUpdate 
}: HelpSupportDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
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

  // Fetch announcement data when component mounts or announcementId changes
  useEffect(() => {
    if (announcementId) {
      fetchAnnouncement();
    } else {
      setAnnouncement(null);
    }
  }, [announcementId]);

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
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({
      ...prev,
      imageUrl: ""
    }));
  };

  const handleSave = async () => {
    if (!announcementId) return;

    setIsLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // If user uploaded a new image file, upload it first
      if (imageFile) {
        // TODO: Upload image to your storage service and get URL
        // Example:
        // const uploadResponse = await uploadImage(imageFile);
        // finalImageUrl = uploadResponse.url;
        
        // For now, using the preview (base64) - replace with actual upload logic
        finalImageUrl = imagePreview;
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
        setIsEditing(false);
        
        if (onUpdate) {
          onUpdate(updatedData);
        }
        
        console.log("Announcement updated successfully");
      }
    } catch (error) {
      console.error("Failed to update announcement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        description: announcement.description || "",
        imageUrl: announcement.imageUrl || ""
      });
      setImagePreview(announcement.imageUrl || "");
      setImageFile(null);
    }
    setIsEditing(false);
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
    <div className="h-full overflow-hidden  flex flex-col justify-between text-white">
      {/* Top content */}
      <div className="space-y-5 flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center">
          <h2 className="text-[20px] leading-6 font-medium">
            Platform Updates
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm yellow-btn text-black px-3 py-1 rounded transition-colors"
            >
              Edit
            </button>
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
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-[#1E1F20] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter title"
              />
            ) : (
              <p className="text-[16px] font-normal leading-5 text-[#FFFFFF66]">
                {announcement.title || "No title"}
              </p>
            )}
          </div>

          {/* Description Section */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Description
            </label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-[#1E1F20] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Enter description"
              />
            ) : (
              <p className="text-[16px] font-normal leading-5 text-[#FFFFFF66]">
                {announcement.description || "No description available"}
              </p>
            )}
          </div>

          {/* Image Upload/Display Section */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
             Uploaded Image
            </label>
            
            {isEditing ? (
              <div className="space-y-3">
                {/* Image Upload Input */}
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full border border-[#333] rounded text-[#FFFFFF66] hover:border-blue-500 transition-colors flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {imageFile ? imageFile.name : 'Choose Image'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  {(imagePreview || imageFile) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Image Preview in Edit Mode */}
                {imagePreview && (
                  <div className="relative w-full h-64  rounded overflow-hidden ">
                    <Image 
                      src={imagePreview} 
                      alt="Preview" 
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error('Image load error');
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Image Display in View Mode */
              <>
                {announcement.imageUrl && announcement.imageUrl.startsWith('http') ? (
                  <div className="relative w-full h-64  rounded overflow-hidden ">
                    <Image 
                      src={announcement.imageUrl} 
                      alt={announcement.title || "Announcement"} 
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
                ) : (
                  <div className="w-full h-32 bg-[#1E1F20] rounded flex items-center justify-center border border-[#333]">
                    <p className="text-[#FFFFFF66] text-sm">No image uploaded</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tags Display */}
          

          {/* Metadata */}
         
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {isEditing ? (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] transition-colors duration-300"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        ) : null}
        
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