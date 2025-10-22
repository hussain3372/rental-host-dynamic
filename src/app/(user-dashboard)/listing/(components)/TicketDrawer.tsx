"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Dropdown from "@/app/shared/InputDropDown";

type HelpSupportDrawerProps = {
  onClose: () => void;
};

export default function TicketDrawer({ onClose }: HelpSupportDrawerProps) {
  const [issueType, setIssueType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowIssueDropdown(false);
      }
    }
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

  return (
    <div className="prevent-scroller flex flex-col text-white">
      <div className="space-y-5" ref={dropdownRef}>
        <h2 className="text-[20px] leading-6 font-medium mb-3">Create Ticket</h2>
        <p className="text-[16px] leading-5 font-normal mb-10 text-[#FFFFFF99]">
          Submit your issue or request, and our team will assist you promptly.
        </p>

        {/* Issue Type */}
        <div className="relative">
          <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
            Issue Type
          </label>
          <button
            type="button"
            onClick={() => setShowIssueDropdown((prev) => !prev)}
            className={`w-full px-4 py-3 pr-10 rounded-[10px] cursor-pointer focus:outline-none
            bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)]
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]
            text-[14px] font-medium text-left
            ${!issueType ? "text-white/40" : "text-white"}
          `}
          >
            {issueType || "Select type"}
            <Image
              src="/images/dropdown.svg"
              width={20}
              height={20}
              alt="dropdown"
              className="absolute top-13 right-6 -translate-y-1/2 pointer-events-none"
            />
          </button>

          {showIssueDropdown && (
            <div className="absolute mt-1 w-full z-10">
              <Dropdown
                items={[
                  {
                    label: "Account Issue",
                    onClick: () => {
                      setIssueType("Account Issue");
                      setShowIssueDropdown(false);
                    },
                  },
                  {
                    label: "Payment Problem",
                    onClick: () => {
                      setIssueType("Payment Problem");
                      setShowIssueDropdown(false);
                    },
                  },
                  {
                    label: "Report a Bug",
                    onClick: () => {
                      setIssueType("Report a Bug");
                      setShowIssueDropdown(false);
                    },
                  },
                  {
                    label: "Other",
                    onClick: () => {
                      setIssueType("Other");
                      setShowIssueDropdown(false);
                    },
                  },
                ]}
              />
            </div>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
            Subject
          </label>
          <input
            placeholder="Enter subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 rounded-[10px] placeholder:text-white/40 focus:outline-none 
            bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)]
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
          />
        </div>

        {/* Description */}
        <div className="mb-10">
          <label className="block text-[14px] leading-[18px] font-medium mb-[10px]">
            Description
          </label>
          <input
            placeholder="Describe your problem..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 focus:outline-none placeholder:text-white/40 rounded-[10px]
            bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)]
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label
            className="flex flex-col justify-center items-center text-center rounded-[10px] border border-dashed border-[#EFFC76] 
            bg-[radial-gradient(75%_81%_at_50%_18.4%,#202020_0%,#101010_100%)] 
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
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
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
              </div>
            ) : (
              <>
                <Image
                  src="/images/image-upload.png"
                  alt="Upload"
                  width={40}
                  height={40}
                  className="mb-5"
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

      {/* Submit button */}
      <div className="mt-6">
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#EFFC76] text-[#121315] rounded-lg font-semibold cursor-pointer"
        >
          Report Issue
        </button>
      </div>
    </div>
  );
}
