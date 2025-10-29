import Image from 'next/image'
import React, { useState } from 'react'
import type { Application } from "@/app/api/super-admin/application/types";
import { application as applicationApi } from "@/app/api/super-admin/application";
import { toast } from "react-hot-toast";

interface ChecklistProps {
  notes: string[];
  application: Application;
}

interface DocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}

export default function Checklist({ notes, application }: ChecklistProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Convert complianceChecklist object to array format for display
  const checklist = application.complianceChecklist ? 
    Object.entries(application.complianceChecklist).map(([name, completed]) => ({
      id: name, // Use name as ID since we don't have proper IDs
      name: name,
      completed: completed
    })) : [];

  const documents: DocumentItem[] = application.documents || [];
  
  // Verification data similar to the first component

  const capitalizeStatus = (status: string): string => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase().replace(/_/g, " ")
    );
  };


  const verification = [
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
  ];

  
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

  const getDocumentTypeDisplayName = (documentType: string): string => {
    const typeMap: Record<string, string> = {
      'OTHER': 'Other',
      'ID': 'Identification',
      'PROPERTY_DEED': 'Property Deed',
      'INSURANCE': 'Insurance',
      'LICENSE': 'License',
      'PERMIT': 'Permit',
      'ID_DOCUMENT': "Government-issued ID",
      // "PROPERTY_DEED": "Property Deed",
      "SAFETY_PERMIT": "Safety Permit",
      "INSURANCE_CERTIFICATE": "Insurance Certificate",
      // "OTHER": "Additional Document",
    };
    
    return typeMap[documentType] || documentType.replace(/_/g, " ");
  };

  const getFileSize = () => {
    return "12.3kb";
  };

  // Render document preview - same approach as your first component
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
        <Image
          src={url}
          alt={getDocumentTypeDisplayName(doc.documentType)}
          width={80}
          height={60}
          className="object-cover w-full h-full rounded-lg"
          onError={(e) => {
            // Fallback to document icon if image fails to load
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      );
    }

    // Default document icon for other file types
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 rounded-lg">
        <Image
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

  const handleApproveReject = async (action: 'approve' | 'reject') => {
    if (!application?.id) return;

    try {
      setIsLoading(true);
      const response = await applicationApi.approveORrejectApplication(application.id, action);
      
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

  const showActionButtons = application.status === 'SUBMITTED';

  return (
    <div className='pb-5 pt-[60px]'>
      {notes.length > 0 && (
        <div className="mb-8">
          <h3 className='font-semibold text-[16px] leading-[20px] tracking-normal pb-3'>Your Notes</h3>
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

      <h3 className='font-semibold text-[16px] leading-[20px] tracking-normal pb-5'>Compliance Checklist</h3>
      <div className='pt-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full'>
        {checklist.map((item) => (
          <div 
            key={item.id} 
            className={`py-[15px] px-[12px] text-white bg-gradient-to-b w-full flex items-center from-[#202020] to-[#101010] border border-[#FFFFFF1F] rounded-lg `}
          >
            <p className='font-regular text-[14px] leading-[18px] tracking-normal'>
              {item.name}
            </p>
          </div>
        ))}
      </div>

      {/* Documents and Verification Section - From first component */}
      <div className="flex flex-col md:flex-row pt-[60px] gap-5">
        {/* Verification Sidebar - From first component */}
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

        {/* Documents Section - Enhanced from first component */}
        <div className="flex flex-col justify-between flex-1">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#121315] p-3 rounded-lg flex items-center justify-between mb-3"
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
                  <Image
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

      {showActionButtons && (
        <div className="pt-15 flex w-full justify-end gap-3">
          <button 
            onClick={() => handleApproveReject('reject')}
            disabled={isLoading}
            className='hollow-btn font-semibold text-[16px] leading-5 py-3 px-[27px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Processing...' : 'Reject'}
          </button>
          <button 
            onClick={() => handleApproveReject('approve')}
            disabled={isLoading}
            className='yellow-btn text-[#101010] font-semibold text-[16px] leading-5 py-3 px-[27px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      )}
    </div>
  );
}