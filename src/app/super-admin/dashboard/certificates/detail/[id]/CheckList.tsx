"use client";

import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";
import {
  Certification,
  DocumentItem,
  ComplianceItem,
  ApplicationWithExtras,
} from "@/app/api/Admin/certificate/types";

interface ChecklistProps {
  certificate: Certification & { application?: ApplicationWithExtras };
}

// ✅ Display name helper
const getDocumentTypeDisplayName = (type: string) => {
  return type
    ? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Document";
};

// ✅ File size formatter
function humanFileSize(bytes: number | undefined) {
  if (!bytes && bytes !== 0) return "-";
  const thresh = 1024;
  if (Math.abs(Number(bytes)) < thresh) {
    return bytes + " B";
  }
  let u = -1;
  const units = ["KB", "MB", "GB", "TB"];
  do {
    bytes = Number(bytes) / thresh;
    ++u;
  } while (Math.abs(Number(bytes)) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
}

// ✅ Preview renderer (PDF, image, DOC)
const renderDocumentPreview = (doc: DocumentItem) => {
  const fileName = (doc.fileName || "").toLowerCase();
  const url = doc.url ?? "";

  // --- PDF Preview ---
  if (fileName.endsWith(".pdf") || url.includes(".pdf")) {
    return (
      <iframe
        src={url}
        title={`PDF Preview - ${getDocumentTypeDisplayName(doc.documentType)}`}
        className="w-full h-full rounded-lg"
        style={{ border: "none" }}
      />
    );
  }

  // --- Image Preview ---
  if (
    fileName.match(/\.(jpg|jpeg|png|gif|webp)$/) ||
    url.match(/\.(jpg|jpeg|png|gif|webp)$/)
  ) {
    const imgSrc = url || "/images/id.png";
    return (
      <Image
        src={imgSrc}
        alt={getDocumentTypeDisplayName(doc.documentType)}
        width={80}
        height={60}
        className="object-cover w-full h-full rounded-lg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  // --- DOC / DOCX / Other File Types ---
  if (fileName.match(/\.(doc|docx|txt)$/) || url.match(/\.(doc|docx|txt)$/)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 rounded-lg">
        <Image
          src="/images/doc-icon.svg"
          alt="Document Icon"
          width={40}
          height={40}
          className="opacity-70"
        />
        <p className="text-white text-xs mt-2 text-center px-2 break-all">
          {doc.fileName.split("/").pop() || "Document"}
        </p>
      </div>
    );
  }

  // --- Default Icon for Unknown Files ---
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 rounded-lg">
      <Image
        src="/images/file-icon.svg"
        alt="File Icon"
        width={40}
        height={40}
        className="opacity-70"
      />
      <p className="text-white text-xs mt-2 text-center px-2 break-all">
        {doc.fileName.split("/").pop() || "Document"}
      </p>
    </div>
  );
};

export default function Checklist({ certificate }: ChecklistProps) {
  if (!certificate) return null;

  const checklistItems: { id: string; name: string; checked: boolean; checkedAt?: string | null }[] =
    certificate.application?.complianceItems?.map((ci: ComplianceItem) => ({
      id: String(ci.id),
      name: ci.checklist?.name || ci.checklist?.description || "Unnamed item",
      checked: !!ci.checked,
      checkedAt: ci.checkedAt,
    })) || [];

  const documents: DocumentItem[] = certificate.application?.documents || [];

  // ✅ Download handler — optional, only triggers on button click
  const handleDownload = async (url: string | undefined, documentType: string) => {
    if (!url) {
      toast.error("No file available to download.");
      return;
    }

    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const filenameFromUrl = url.split("/").pop()?.split("?")[0];
      const extension =
        filenameFromUrl?.split(".").pop() || blob.type.split("/")[1] || "pdf";
      const filename =
        filenameFromUrl ||
        `${documentType.toLowerCase().replace(/_/g, "-")}.${extension}`;

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`✅ "${filename}" download started!`);
    } catch (error) {
      console.error("❌ Download failed:", error);
      toast.error("Failed to download file.");
    }
  };

  if (checklistItems.length === 0 && documents.length === 0) return null;

  return (
    <div className="pb-5 pt-[60px]">
      {/* ✅ Compliance Checklist Section */}
      {checklistItems.length > 0 && (
        <>
          <h3 className="font-semibold text-[16px] leading-5 tracking-normal pb-5 text-white">
            Compliance Checklist
          </h3>
          <div className="pt-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`py-[15px] pl-3 text-white bg-linear-to-b w-full from-[#202020] to-[#101010] border border-[#323232] rounded-lg ${
                  item.checked ? "opacity-100" : "opacity-60"
                }`}
              >
                <p className="font-regular text-[14px] leading-[18px] tracking-normal">
                  {item.name}
                </p>
                {/* {item.checked && item.checkedAt && (
                  <p className="text-[12px] text-white/60 mt-2">
                    Checked at: {new Date(item.checkedAt).toLocaleString()}
                  </p>
                )} */}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ✅ Related Documents Section */}
      {documents.length > 0 && (
        <>
          <h3 className="font-semibold text-[16px] pt-[60px] pb-5 leading-5 text-white">
            Related Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id || doc.fileName}
                className="flex p-3 bg-[#121315] items-center justify-between rounded-lg"
              >
                <div className="flex items-center gap-5 w-full">
                  <div className="w-20 h-16 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden">
                    {renderDocumentPreview(doc)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-[14px] leading-5 text-white truncate">
                      {doc.originalName || doc.fileName}
                    </h3>
                    <h4 className="text-white/60 font-medium text-[13px] leading-5 pt-2">
                      {humanFileSize(doc.size)} • {doc.documentType}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleDownload(doc.url, doc.documentType || "document")
                  }
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}
