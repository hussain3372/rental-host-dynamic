"use client";
import React, { useState } from "react";
import Image from "next/image";
import { supportApi } from "@/app/api/super-admin/support";
import { uploadImage } from "@/app/api/super-admin/support";
import toast from "react-hot-toast";

type AddAnnouncementsDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

interface CreateAnnouncementData {
    title: string;
    description: string;
    imageUrl?: string;
    tags?: string[];
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

interface FormErrors {
    title?: string;
    description?: string;
    image?: string;
}

export default function AddAnnouncementsDrawer({ onClose, onSuccess }: AddAnnouncementsDrawerProps) {
    const [formData, setFormData] = useState<CreateAnnouncementData>({
        title: "",
        description: "",
        imageUrl: "",
        tags: []
    });
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

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
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    image: "Please upload a valid image (JPG, PNG, GIF)"
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
            console.log("🟡 Uploading image:", file.name);
            const response = await uploadImage(file);
            
            if (response.data && response.data.data && response.data.data.url) {
                console.log("🟢 Image uploaded successfully:", response.data.data.url);
                return response.data.data.url;
            } else {
                throw new Error("Failed to get image URL from response");
            }
        } catch (error: unknown) {
            console.error("🔴 Image upload failed:", error);
            throw new Error( "Image upload failed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let imageUrl = "";

            // Upload image first if exists
            if (image) {
                try {
                    imageUrl = await uploadImageToServer(image);
                } catch (uploadError: unknown) {
                    if (uploadError instanceof Error) {
                        
                        toast.error(`Image upload failed: ${uploadError.message}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Prepare the payload with the uploaded image URL
            const payload: CreateAnnouncementData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                tags: ["announcement"],
                imageUrl: imageUrl || undefined
            };

            console.log("🟢 Creating announcement with payload:", payload);

            // Call the API
            const response = await supportApi.createAnnouncement(payload);
            
            console.log("🟢 Full API Response:", response);
            
            if (response.data) {
                toast.success(response.message || "Announcement created successfully!");
                onSuccess();
                
                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    imageUrl: "",
                    tags: []
                });
                setImage(null);
                setErrors({});
                onClose();
            } else {
                toast.error(response.message || "Failed to create announcement");
            }
            
        } catch (error: unknown) {
            console.error("🔴 Error creating announcement:", error);
            
            const apiError = error as ApiError;
            
            if (apiError.response?.data?.success) {
                toast.success(apiError.response.data.message || "Announcement created successfully!");
                setFormData({
                    title: "",
                    description: "",
                    imageUrl: "",
                    tags: []
                });
                setImage(null);
                setErrors({});
                onSuccess();
                onClose();
            } else {
                const errorMessage = apiError.response?.data?.message || apiError.message || "Failed to create announcement. Please try again.";
                toast.error(errorMessage);
            }
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
            {/* Top content */}
            <div className="space-y-5 flex-1">
                <h2 className="text-[20px] leading-6 font-medium mb-3">
                    New Announcement
                </h2>
                <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
                    Share important updates, new features, or service changes with all users. Fill in the details below to publish your announcement.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Title Input */}
                    <div className="relative">
                        <label className="text-white text-sm font-medium mb-3 block">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter title"
                            className={`
                                w-full p-3 pr-10 rounded-[10px]
                                border ${errors.title ? 'border-red-500' : 'border-[#404040]'}         
                                bg-gradient-to-b from-[#202020] to-[#101010]
                                text-white placeholder:text-white/40
                                focus:outline-none focus:border-[#EFFC76]
                                transition duration-200 ease-in-out
                            `}
                        />
                        {errors.title && (
                            <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Description Input */}
                    <div className="relative">
                        <label className="text-white text-sm font-medium mb-3 block">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Add announcement description"
                            rows={4}
                            className={`
                                w-full p-3 pr-10 rounded-[10px]
                                border ${errors.description ? 'border-red-500' : 'border-[#404040]'}         
                                bg-gradient-to-b from-[#202020] to-[#101010]
                                text-white placeholder:text-white/40
                                focus:outline-none focus:border-[#EFFC76]
                                transition duration-200 ease-in-out
                                resize-vertical
                            `}
                        />
                        {errors.description && (
                            <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="text-white text-sm font-medium mb-3 block">
                            Attach Image (Optional)
                        </label>
                        <label
                            className={`flex flex-col justify-center items-center mt-2 text-center rounded-[10px] border-2 border-dashed ${
                                errors.image ? 'border-red-500' : 'border-[#EFFC76]'
                            } bg-gradient-to-b from-[#202020] to-[#101010] hover:border-[#E5F266] transition-colors duration-200`}
                            style={{ height: "180px", padding: "12px", cursor: "pointer" }}
                        >
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            {image ? (
                                <div className="mt-3 w-full flex flex-col items-center">
                                    <div className="relative">
                                        <Image
                                            src={URL.createObjectURL(image)}
                                            alt="Preview"
                                            width={80}
                                            height={80}
                                            className="rounded-lg object-cover w-[80px] h-[80px] mb-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
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
                                        className="mb-3 object-contain"
                                    />
                                    <h3 className="text-[#FFFFFF] text-[16px] leading-5 font-normal mb-2">
                                        Click to upload image
                                    </h3>
                                    <p className="text-[#FFFFFF99] text-[12px] leading-[16px] font-normal max-w-[346px] w-full">
                                        Upload an image to make your announcement more engaging. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                                    </p>
                                </>
                            )}
                        </label>
                        {errors.image && (
                            <p className="text-red-400 text-xs mt-1">{errors.image}</p>
                        )}
                    </div>
                </form>
            </div>

            {/* Create Announcement Button */}
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
                    {loading ? "Creating..." : "Create Announcement"}
                </button>
            </div>
        </div>
    );
}