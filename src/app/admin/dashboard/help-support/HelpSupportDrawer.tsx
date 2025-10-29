"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Dropdown from "@/app/shared/InputDropDown";
import { supportApi } from "@/app/api/Host/support";

type HelpSupportDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    onTicketCreated?: () => void; // Callback to refresh tickets list
};



export default function HelpSupportDrawer({ onClose, onTicketCreated }: HelpSupportDrawerProps) {
    const [issueDropdownOpen, setIssueDropdownOpen] = useState(false);
    const [issueType, setIssueType] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Refs for dropdown containers
    const issueDropdownRef = useRef<HTMLDivElement>(null);
    const priorityDropdownRef = useRef<HTMLDivElement>(null);

    // Handle outside clicks to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (issueDropdownRef.current && !issueDropdownRef.current.contains(event.target as Node)) {
                setIssueDropdownOpen(false);
            }
            if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
                setPriorityDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const uniqueIssueTypes = [
        "APPLICATION",
        "PAYMENT", 
        "CERTIFICATION",
        "TECHNICAL",
        "GENERAL"
    ];

    const priorityOptions = [
        "LOW",
        "MEDIUM", 
        "HIGH",
        "URGENT"
    ];

    const handleSubmit = async () => {
        // Validation
        if (!issueType) {
            setError("Please select an issue type");
            return;
        }
        if (!subject.trim()) {
            setError("Please enter a subject");
            return;
        }
        if (!description.trim()) {
            setError("Please enter a description");
            return;
        }
        if (!priority) {
            setError("Please select a priority");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            // Prepare the payload
            const payload = {
                subject: subject.trim(),
                description: description.trim(),
                category: issueType, // Map to category in API
                priority: priority,
                attachmentUrls: image ? [URL.createObjectURL(image)] : [], // You might need to upload the image first
                tags: [] // Add tags if needed
            };

            console.log("🟡 Creating ticket with payload:", payload);

            // Call the API
            const response = await supportApi.createTicket(payload);
            
            console.log("🟢 Ticket created successfully:", response);

            // Reset form
            setIssueType("");
            setSubject("");
            setDescription("");
            setPriority("");
            setImage(null);
            
            // Call the callback to refresh tickets list
            if (onTicketCreated) {
                onTicketCreated();
            }

            // Close the drawer
            onClose();

        } catch (error: unknown) {
            if (error instanceof Error) {
                
                setError(error.message || "Failed to create ticket. Please try again.");
            }
            console.error("🔴 Error creating ticket:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col text-white">
            {/* Top content */}
            <div className="space-y-5 flex-1">
                <h2 className="text-[20px] leading-6 font-medium mb-3">
                    Create Support Ticket
                </h2>
                <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
                    Submit a new support ticket for assistance with any issues you&apos;re facing.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {/* Issue Type Dropdown */}
                <div ref={issueDropdownRef} className="relative">
                    <label className="text-white text-sm font-medium mb-3 block">
                        Issue Type *
                    </label>
                    <div
                        className={`
                            w-full p-3 pr-10 rounded-[10px]
                            border ${error && !issueType ? 'border-red-500' : 'border-[#404040]'}         
                            hover:border-[#EFFC76]          
                            focus:border-[#EFFC76]          
                            bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
                            text-white placeholder:text-white/40
                            focus:outline-none
                            transition duration-200 ease-in-out
                            cursor-pointer
                        `}
                        onClick={() => setIssueDropdownOpen(!issueDropdownOpen)}
                    >
                        {issueType || "Select issue type"}
                        <Image
                            src="/images/dropdown.svg"
                            alt="dropdown"
                            width={16}
                            height={16}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        />
                    </div>

                    {issueDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1">
                            <Dropdown
                                items={uniqueIssueTypes.map((issue) => ({
                                    label: issue,
                                    onClick: () => {
                                        setIssueType(issue);
                                        setIssueDropdownOpen(false);
                                    },
                                }))}
                            />
                        </div>
                    )}
                </div>

                {/* Priority Dropdown */}
                <div ref={priorityDropdownRef} className="relative">
                    <label className="text-white text-sm font-medium mb-3 block">
                        Priority *
                    </label>
                    <div
                        className={`
                            w-full p-3 pr-10 rounded-[10px]
                            border ${error && !priority ? 'border-red-500' : 'border-[#404040]'}         
                            hover:border-[#EFFC76]          
                            focus:border-[#EFFC76]          
                            bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
                            text-white placeholder:text-white/40
                            focus:outline-none
                            transition duration-200 ease-in-out
                            cursor-pointer
                        `}
                        onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                    >
                        {priority || "Select priority"}
                        <Image
                            src="/images/dropdown.svg"
                            alt="dropdown"
                            width={16}
                            height={16}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        />
                    </div>

                    {priorityDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1">
                            <Dropdown
                                items={priorityOptions.map((priorityOption) => ({
                                    label: priorityOption,
                                    onClick: () => {
                                        setPriority(priorityOption);
                                        setPriorityDropdownOpen(false);
                                    },
                                }))}
                            />
                        </div>
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
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={`
                            w-full p-3 rounded-[10px]
                            border ${error && !subject.trim() ? 'border-red-500' : 'border-[#404040]'}         
                            hover:border-[#EFFC76]          
                            focus:border-[#EFFC76]          
                            bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)]
                            text-white placeholder:text-white/40
                            focus:outline-none
                            transition duration-200 ease-in-out
                        `}
                    />
                </div>

                {/* Description */}
                <div className="mb-10">
                    <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
                        Description *
                    </label>
                    <textarea
                        placeholder="Describe your problem in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`
                            w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm 
                            ${error && !description.trim() ? 'border-red-500' : 'border-[#404040]'} 
                            focus:border-[#EFFC76] focus:outline-none appearance-none
                        `}
                        rows={4}
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
                        Attachment (Optional)
                    </label>
                    <label
                        className="flex flex-col justify-center items-center text-center rounded-[10px] border border-dashed border-[#EFFC76] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
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
                                    Upload File
                                </h3>
                                <p className="text-[#FFFFFF99] text-[12px] leading-[16px] font-normal max-w-[346px] w-full">
                                    Please upload a clear and readable file in PDF, JPG, or PNG format.
                                    The maximum file size allowed is 10MB.
                                </p>
                            </>
                        )}
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-5 lg:mt-auto py-5">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`
                        yellow-btn cursor-pointer w-full text-black px-[40px] py-[16px] rounded-[8px] font-semibold text-[18px] leading-[22px] 
                        hover:bg-[#E5F266] transition-colors duration-300
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
                </button>
            </div>
        </div>
    );
}