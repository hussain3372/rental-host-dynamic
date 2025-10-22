  "use client";

  import NextImage from "next/image";
  import { toast } from "react-hot-toast";

  import React, { useState, useEffect } from "react";
  import { ApplicationData, ChecklistItem } from "@/app/api/Host/application/types"; 

  interface ChecklistProps {
    application: ApplicationData;
  }

  interface DocumentItem {
    id: string;
    documentType: string;
    fileName: string;
    url: string;
    uploadedAt: string;
  }

  export default function Checklist({ application }: ChecklistProps) {
    const [verification, setVerification] = useState<
      { id: string; value: string; title: string }[]
    >([]);
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]); 

    useEffect(() => {
      console.log("📊 Checklist - Received application:", application);

      setVerification([
        {
          id: "0",
          value: application.propertyDetails?.propertyName || "N/A",
          title: "Property Name",
        },
        {
          id: "1",
          value: application.propertyDetails?.ownership || "N/A",
          title: "Ownership",
        },
        {
          id: "2",
          value: application.submittedAt
            ? new Date(application.submittedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Not Submitted",
          title: "Submission Date",
        },
        {
          id: "3",
          value: application.status
            ? capitalizeStatus(application.status)
            : "N/A",
          title: "Status",
        },
        {
          id: "4",
          value: application.currentStep || "N/A",
          title: "Current Step",
        },
        {
          id: "5",
          value: application.propertyDetails?.address || "N/A",
          title: "Address",
        },
      ]);

      if (application.documents && Array.isArray(application.documents)) {
        console.log(
          `📄 Checklist - Found ${application.documents.length} documents`
        );
setDocuments(application.documents as DocumentItem[]);
      } else {
        console.warn("❌ Checklist - No documents array found in application");
        setDocuments([]);
      }

      if (application.complianceChecklist && typeof application.complianceChecklist === 'object') {
        const checklistArray: ChecklistItem[] = Object.entries(application.complianceChecklist).map(([name, completed], index) => ({
  id: index,
  name: name,
  checked: Boolean(completed),
  notes: null,
  checklistId: index.toString(),
  description: null,
  isRequired: false
}));
        
        console.log(
          `✅ Checklist - Found ${checklistArray.length} checklist items`
        );
        setChecklistItems(checklistArray);
      } else {
        console.warn("❌ Checklist - No complianceChecklist found in application");
        setChecklistItems([]);
      }
    }, [application]);

    const capitalizeStatus = (status: string): string => {
      return (
        status.charAt(0).toUpperCase() +
        status.slice(1).toLowerCase().replace(/_/g, " ")
      );
    };

const handleDownload = (url: string, documentType: string) => {
  try {
    // Extract filename from URL or fallback to document type
    const filenameFromUrl = url.split("/").pop()?.split("?")[0];
    const extension =
      filenameFromUrl?.split(".").pop() || "pdf"; // default fallback
    const filename =
      filenameFromUrl ||
      `${documentType.toLowerCase().replace(/_/g, "-")}.${extension}`;

    // Create a temporary <a> tag for download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename; // this forces download instead of opening
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`✅ "${filename}" download started!`);
  } catch (error) {
    console.error("❌ Download failed:", error);
    toast.error("Failed to download file.");
  }
};


    const getDocumentTypeDisplayName = (documentType: string) => {
      const typeMap: Record<string, string> = {
        ID_DOCUMENT: "Government-issued ID",
        PROPERTY_DEED: "Property Deed",
        SAFETY_PERMIT: "Safety Permit",
        INSURANCE_CERTIFICATE: "Insurance Certificate",
        OTHER: "Additional Document",
      };
      return typeMap[documentType] || documentType.replace(/_/g, " ");
    };

    const getFileSize = () => {
      return "12.3kb";
    };

    // Render document preview - same approach as your Step3 component
    const renderDocumentPreview = (doc: DocumentItem) => {
      const fileName = doc.fileName.toLowerCase();
      const url = doc.url;

      // Check if it's a PDF
      if (fileName.endsWith('.pdf') || url.includes('.pdf')) {
        return (
          <iframe
            src={url}
            title={`PDF Preview - ${getDocumentTypeDisplayName(doc.documentType)}`}
            className="w-full h-full rounded-lg"
            style={{ border: 'none' }}
          />
        );
      }

      // Check if it's an image
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/) || url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return (
          <NextImage
            src={url}
            alt={getDocumentTypeDisplayName(doc.documentType)}
            width={80}
            height={60}
            className="object-cover w-full h-full rounded-lg"
            onError={(e) => {
              // Fallback to document icon if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      }

      // Default document icon for other file types
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 rounded-lg">
          <NextImage
            src="/images/doc-icon.svg"
            alt="Document Icon"
            width={40}
            height={40}
            className="opacity-60"
          />
          <p className="text-white text-xs mt-2 text-center px-2 break-all">
            {doc.fileName.split('/').pop() || 'Document'}
          </p>
        </div>
      );
    };

    return (
      <div className="pb-5">
        <h3 className="font-semibold text-[16px] leading-[20px] tracking-normal">
          Compliance Checklist
        </h3>

        <div className="pt-3 flex flex-col md:flex-row gap-3">
          {checklistItems.length > 0 ? (
            checklistItems.map((item: ChecklistItem) => (
              <p
                key={item.id}
                className="font-regular text-[14px] leading-[18px] tracking-normal py-[15px] pl-[12px] max-w-full sm:w-[391px] lg:w-[391px] xl:w-[500px] text-white bg-gradient-to-b from-[#202020] to-[#101010] border border-[#323232] rounded-lg"
              >
                {item.name}
              </p>
            ))
          ) : (
            <div className="w-full text-center py-4">
              <p className="text-white/60 font-medium text-[14px] leading-[18px]">
                No checklist items available for this application
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row pt-[60px] gap-5">
          <div className="flex flex-col gap-[16px] flex-1 p-5 bg-black rounded-lg">
            {verification.map((item, index) => (
              <div key={item.id}>
                <h2 className="font-semibold text-[18px] leading-[22px] text-white">
                  {item.value}
                </h2>
                <p className="pt-3 sm:pt-3.5 lg:pt-4 font-medium text-[16px] leading-[20px] text-white/60">
                  {item.title}
                </p>
                {index !== verification.length - 1 && (
                  <div className="w-full h-[1px] bg-gradient-to-r from-[#121315] via-white to-[#121315] mt-[16px]"></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-between flex-1">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#121315] p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    {/* Document Preview Container */}
                    <div className="w-20 h-15 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden">
                      {renderDocumentPreview(doc)}
                    </div>
                    <div>
                      <h3 className="font-medium text-[12px] sm:text-[16px] leading-[16px] sm:leading-[20px] text-white max-w-[250px] truncate">
                        {getDocumentTypeDisplayName(doc.documentType)}
                      </h3>
                      <h4 className="text-white/60 font-medium text-[14px] leading-[18px] pt-1">
                        {getFileSize()} •{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(doc.url, doc.documentType)}
                    className="cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <NextImage
                      src="/images/download.svg"
                      alt="download"
                      width={24}
                      height={24}
                      className="max-w-none h-auto inline-block"
                    />
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-[#121315] p-6 rounded-lg text-center">
                <p className="text-white/60 font-medium text-[16px] leading-[20px]">
                  No documents uploaded for this application
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }