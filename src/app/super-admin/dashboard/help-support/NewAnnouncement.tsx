"use client";
import React, { useState } from "react";
import Image from "next/image";

type HelpSupportDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function AddAnnouncementsDrawer({ onClose }: HelpSupportDrawerProps) {
   
    const [image, setImage] = useState<File | null>(null);

  
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
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

                {/* Issue Type Dropdown with ref */}
                <div  className="relative">
                    <label className="text-white text-sm font-medium mb-3 block">
                       Title
                    </label>
                    <input
                    type="text"
                    placeholder="Enter title"
                        className={`
                            w-full p-3 pr-10 rounded-[10px]
                            border border-[#404040]         
                            bg-gradient-to-b from-[#202020] to-[#101010]
                            text-white placeholder:text-white/40
                            focus:outline-none
                            transition duration-200 ease-in-out
                        `}
                    />
                </div>
                <div  className="relative">
                    <label className="text-white text-sm font-medium mb-3 block">
                       Subject
                    </label>
                    <input
                    type="text"
                    placeholder="Add announcement subject"
                        className={`
                            w-full p-3 pr-10 rounded-[10px]
                            border border-[#404040]         
                            bg-gradient-to-b from-[#202020] to-[#101010]
                            text-white placeholder:text-white/40
                            focus:outline-none
                            transition duration-200 ease-in-out
                        `}
                    />
                </div>

                
                <div>
                    <label
                        className="flex flex-col justify-center items-center mt-10 text-center rounded-[10px] border-2 border-dashed border-[#EFFC76] bg-gradient-to-b from-[#202020] to-[#101010] "
                        style={{ height: "180px", padding: "12px", cursor: "pointer" }}
                    >
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {image ? (
                            <div className="mt-3 w-full flex justify-center">
                                <Image
                                    src={URL.createObjectURL(image)}
                                    alt="Preview"
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-contain w-[100px] h-[100px]"
                                />
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
                                    Attach Image (Optional)
                                </h3>
                                <p className="text-[#FFFFFF99] text-[12px] leading-[16px] font-normal max-w-[346px] w-full">
                                   Upload an image to make your announcement more engaging. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                                </p>
                            </>
                        )}
                    </label>
                </div>
            </div>

            {/* Report Issue Button with responsive margin */}
            <div className="mt-5 lg:mt-auto py-5">
                <button
                    onClick={onClose}
                    className="yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
                >
                    Create Announcement
                </button>
            </div>
        </div>
    );
}