import Image from "next/image";
import React, { useState } from "react";
import type { Application, Document } from "@/app/api/Admin/application/types";
import { application as applicationApi } from "@/app/api/Admin/application";

interface ChecklistProps {
  notes: string[];
  application: Application;
}

export default function Checklist({ notes, application }: ChecklistProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Convert complianceChecklist object to array format for display
  const checklist = application.complianceChecklist
    ? Object.entries(application.complianceChecklist).map(
        ([name, completed]) => ({
          id: name, // Use name as ID since we don't have proper IDs
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
      PROPERTY_DEED: "Property Deed",
      INSURANCE: "Insurance",
      LICENSE: "License",
      PERMIT: "Permit",
    };

    return typeMap[documentType] || documentType;
  };

  const getDocumentImage = (document: Document): string => {
    // Use the actual document URL from backend for images
    // For non-image files, fall back to appropriate icons
    const fileName = document.fileName.toLowerCase();

    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
      return document.url || "/images/id.png";
    }

    if (fileName.endsWith(".pdf")) {
      return "/images/pdf-icon.svg";
    }

    // Default document icon for other file types
    return "/images/doc-icon.svg";
  };

  const getFileName = (filePath: string): string => {
    return filePath.split("/").pop() || "Unknown file";
  };

  const handleApproveReject = async (action: "approve" | "reject") => {
    if (!application?.id) return;

    try {
      setIsLoading(true);
      const response = await applicationApi.approveORrejectApplication(
        application.id,
        action
      );

      if (response.success) {
        window.location.reload();
      } else {
        console.error(`Failed to ${action} application:`, response.message);
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const showActionButtons =
    application.status === "SUBMITTED" && !application.certification;

  return (
    <div className="pb-5 pt-[60px]">
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
                  <Image
                    src={getDocumentImage(document)}
                    alt="Document"
                    width={100}
                    height={60}
                    className="object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-[12px] sm:text-[18px] leading-[16px] sm:leading-[22px] text-white xl:w-[353px]">
                      {getDocumentTypeDisplayName(document.documentType)}{" "}
                      Document
                    </h3>
                    <h4 className="text-white/60 font-medium text-[16px] leading-[20px] pt-2">
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

      {showActionButtons && (
        <div className="pt-15 flex w-full justify-end gap-3">
          <button
            onClick={() => handleApproveReject("reject")}
            disabled={isLoading}
            className="hollow-btn font-semibold text-[16px] leading-5 py-3 px-[27px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Reject"}
          </button>
          <button
            onClick={() => handleApproveReject("approve")}
            disabled={isLoading}
            className="yellow-btn text-[#101010] font-semibold text-[16px] leading-5 py-3 px-[27px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Approve"}
          </button>
        </div>
      )}
    </div>
  );
}
