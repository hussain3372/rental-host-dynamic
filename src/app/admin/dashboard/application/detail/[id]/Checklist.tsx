import Image from "next/image";
import React, { useState } from "react";
import type { Application, Document } from "@/app/api/Admin/application/types";
import { application as applicationApi } from "@/app/api/Admin/application";
import toast from "react-hot-toast";

interface ChecklistProps {
  notes: string[];
  application: Application;
  onRejectClick: () => void;
}

export default function Checklist({
  notes,
  application,
  onRejectClick,
}: ChecklistProps) {
  const [isApproving, setIsApproving] = useState(false);

  const checklist = application.complianceChecklist
    ? Object.entries(application.complianceChecklist).map(
        ([name, completed]) => ({
          id: name,
          name: name,
          completed: completed,
        })
      )
    : [];

  const documents: Document[] = application.documents || [];

  const getDocumentTypeDisplayName = (documentType: string): string => {
    const typeMap: Record<string, string> = {
      OTHER: "Other",
      ID: "Identification",
      ID_DOCUMENT: "Identification", // Added this
      PROPERTY_DEED: "Property Deed",
      INSURANCE: "Insurance",
      INSURANCE_CERTIFICATE: "Insurance Certificate", // Added this
      LICENSE: "License",
      PERMIT: "Permit",
      SAFETY_PERMIT: "Safety Permit", // Added this
    };

    return typeMap[documentType] || documentType.replace(/_/g, " ");
  };

  const getDocumentImage = (document: Document): string => {
    const fileName = document.fileName.toLowerCase();

    // For images, return the URL directly
    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
      return document.url || "/images/id.png";
    }

    // For PDFs, we'll return a PDF icon but show preview differently
    if (fileName.endsWith(".pdf")) {
      return "/images/pdf-icon.svg";
    }

    return "/images/doc-icon.svg";
  };

  // Add this new function to check if it's a PDF
  const isPdfDocument = (document: Document): boolean => {
    return document.fileName.toLowerCase().endsWith(".pdf");
  };

  const getFileName = (filePath: string): string => {
    // Handle both full URLs and file paths
    const parts = filePath.split("/");
    const fileName = parts.pop() || filePath;

    // Clean up timestamp prefixes if present
    return fileName.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-/, "");
  };

  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const lowerFileName = fileName.toLowerCase();
    return imageExtensions.some((ext) => lowerFileName.endsWith(ext));
  };

  const handleDocumentClick = (document: Document) => {
    if (document.url) {
      window.open(document.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleApprove = async () => {
    if (!application?.id) return;

    try {
      setIsApproving(true);
      const response = await applicationApi.approveORrejectApplication(
        application.id,
        "approve"
      );

      if (response.success) {
        toast.success(`Application approved successfully!`);
        window.location.reload();
      } else {
        const errorMessage =
          response.message || `Failed to approve application`;
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(`Error approving application:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to approve application`;
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const showActionButtons =
    application.status === "SUBMITTED" && !application.certification;

  return (
    <div className="pb-5 pt-[60px]">
      <h3 className="font-semibold text-[16px] leading-[20px] tracking-normal pb-5">
        Compliance Checklist
      </h3>
      <div className="pt-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`py-[15px] px-[12px] text-white bg-gradient-to-b w-full flex items-center from-[#202020] to-[#101010] border border-[#FFFFFF1F] rounded-lg `}
          >
            <p className="font-regular text-[14px] leading-[18px] tracking-normal">
              {item.name}
            </p>
          </div>
        ))}
      </div>

      {documents.length > 0 && (
        <div className="pt-[60px]">
          <h3 className="font-semibold text-[16px] leading-[20px] tracking-normal pb-5">
            Uploaded Documents
          </h3>
          <div className="w-full">
            <div className="rounded-lg w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex p-3 bg-[#121315] rounded-lg w-full items-center gap-5"
                >
                  {isPdfDocument(document) ? (
                    // For PDFs, show an embed/iframe preview
                    <div className="relative w-[100px] h-[60px] bg-gray-800 rounded overflow-hidden">
                      <iframe
                        src={document.url}
                        title="PDF Preview"
                        className="w-full h-full"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      </div>
                    </div>
                  ) : (
                    // For images, use Next.js Image component
                    <Image
                      src={getDocumentImage(document)}
                      alt="Document"
                      width={100}
                      height={60}
                      className="object-cover h-[60px]"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-[12px] sm:text-[18px] leading-4 sm:leading-[22px] text-white xl:w-[353px]">
                      {getDocumentTypeDisplayName(document.documentType)}{" "}
                      Document
                    </h3>
                    <h4 className="text-white/60 font-medium text-[16px] leading-5 pt-2">
                      {getFileName(document.fileName)}
                    </h4>
                    <p className="text-white/40 text-sm">
                      Uploaded:{" "}
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {notes.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-[16px] leading-[20px] tracking-normal pb-3">
            Your Notes
          </h3>
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div
                key={index}
                className="p-3 bg-gradient-to-b from-[#202020] via-[#101010] to-[#101010] border border-[#323232] rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <p className="text-white font-regular text-[16px] leading-[18px] tracking-normal">
                    {note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showActionButtons && (
        <div className="pt-15 flex w-full justify-end gap-3">
          <button
            onClick={onRejectClick}
            disabled={isApproving}
            className="hollow-btn font-semibold text-[16px] leading-5 py-3 px-[27px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="yellow-btn text-[#101010] font-semibold text-[16px] leading-5 py-3 px-[27px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? "Approving..." : "Approve"}
          </button>
        </div>
      )}
    </div>
  );
}
