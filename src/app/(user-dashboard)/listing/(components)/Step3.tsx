"use client";

import React, {
  useState,
  useRef,
  useEffect,
  // ChangeEvent,
  DragEvent,
} from "react";
import Image from "next/image";
import toast from "react-hot-toast";

type DocumentKey =
  | "governmentId"
  | "propertyOwnership"
  | "safetyPermits"
  | "insuranceCertificate";

interface FileData {
  name: string;
  size: number;
  file?: File; // file might not exist if loaded from URL
  url?: string; // ✅ added for persisted files
  documentType:
    | "ID_DOCUMENT"
    | "SAFETY_PERMIT"
    | "INSURANCE_CERTIFICATE"
    | "PROPERTY_DEED";
}

interface DocumentInfo {
  key: DocumentKey;
  title: string;
  subtitle?: string;
  description?: string;
  documentType:
    | "ID_DOCUMENT"
    | "SAFETY_PERMIT"
    | "INSURANCE_CERTIFICATE"
    | "PROPERTY_DEED";
}

interface Step3Props {
  formData: {
    photos: FileData[];
  };
  errors: { [key: string]: string };
  onFieldChange: (field: string, value: FileData[]) => void;
}

export default function Step3({ errors, onFieldChange }: Step3Props) {
  const [files, setFiles] = useState<Record<DocumentKey, FileData | null>>({
    governmentId: null,
    propertyOwnership: null,
    safetyPermits: null,
    insuranceCertificate: null,
  });

  const [previewUrls, setPreviewUrls] = useState<
    Record<DocumentKey, string | null>
  >({
    governmentId: null,
    propertyOwnership: null,
    safetyPermits: null,
    insuranceCertificate: null,
  });

  const fileInputRefs: Record<
    DocumentKey,
    React.RefObject<HTMLInputElement | null>
  > = {
    governmentId: useRef(null),
    propertyOwnership: useRef(null),
    safetyPermits: useRef(null),
    insuranceCertificate: useRef(null),
  };

  const documentType: DocumentInfo[] = [
    {
      key: "governmentId",
      title: "Government-issued ID",
      description:
        "Upload a valid ID (passport, national ID card, or driver's license) of the property owner.",
      documentType: "ID_DOCUMENT",
    },
    {
      key: "propertyOwnership",
      title: "Property Ownership Proof",
      description:
        "Submit legal proof of ownership (title deed, property tax receipt, or utility bill under your name)",
      documentType: "PROPERTY_DEED",
    },
    {
      key: "safetyPermits",
      title: "Safety Permits",
      description:
        "Provide any required local safety approvals or compliance certificates.",
      documentType: "SAFETY_PERMIT",
    },
    {
      key: "insuranceCertificate",
      title: "Insurance Certificate",
      description:
        "Upload proof of active property insurance covering liability or damage.",
      documentType: "INSURANCE_CERTIFICATE",
    },
  ];

  // In your Step3 component, add this useEffect to verify documents are loaded
  useEffect(() => {
    const stored = localStorage.getItem("applicationData");
    if (!stored) return;

    try {
      const appData = JSON.parse(stored);
      console.log("🔍 Current application documents:", appData.documents);

      // If documents exist in application data but not in local state, sync them
      if (appData.documents && appData.documents.length > 0) {
        console.log(
          "📄 Documents found in application data:",
          appData.documents.length
        );

        // Verify we have the expected 4 documents
        if (appData.documents.length < 4) {
          console.warn(
            `⚠️ Only ${appData.documents.length} documents found, expected 4`
          );
        }
      } else {
        console.warn("⚠️ No documents found in application data");
      }
    } catch (err) {
      console.error("Error checking application documents:", err);
    }
  }, []);

  // helper to map documentType → key
  // const getKeyByDocumentType = (docType: string): DocumentKey | null => {
  //   switch (docType) {
  //     case "ID_DOCUMENT":
  //       return "governmentId";
  //     case "PROPERTY_DEED":
  //       return "propertyOwnership";
  //     case "SAFETY_PERMIT":
  //       return "safetyPermits";
  //     case "INSURANCE_CERTIFICATE":
  //       return "insuranceCertificate";
  //     default:
  //       return null;
  //   }
  // };

  // file select (same as before, just persists)
  const handleFileSelect = (
    docType: DocumentKey,
    selectedFile: File | undefined
  ) => {
    if (!selectedFile) return;

    // ⭐ FILE SIZE VALIDATION — MAX 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      toast.error(`File size exceeds 5MB limit`);
      return;
    }

    const docInfo = documentType.find((d) => d.key === docType);
    if (!docInfo) return;

    const fileData: FileData = {
      name: selectedFile.name,
      size: selectedFile.size,
      file: selectedFile,
      documentType: docInfo.documentType,
    };

    const url = URL.createObjectURL(selectedFile);

    setFiles((prev) => ({ ...prev, [docType]: fileData }));
    setPreviewUrls((prev) => ({ ...prev, [docType]: url }));

    const updatedFiles = { ...files, [docType]: fileData };
    const allFiles = Object.values(updatedFiles).filter(Boolean) as FileData[];
    onFieldChange("photos", allFiles);

    // 🟢 Persist to localStorage
    const stored = localStorage.getItem("applicationData");
    if (stored) {
      const appData = JSON.parse(stored);
      appData.data = appData.data || {};
      appData.data.DOCUMENT_UPLOAD = appData.data.DOCUMENT_UPLOAD || {};
      appData.data.DOCUMENT_UPLOAD.photos = allFiles.map((f) => ({
        ...f,
        url: f.file ? URL.createObjectURL(f.file) : f.url,
      }));
      localStorage.setItem("applicationData", JSON.stringify(appData));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, docType: DocumentKey) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(docType, droppedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const renderPreview = (
    docType: DocumentKey,
    previewUrl: string | null,
    file: FileData | null
  ) => {
    if (!file) return null;
    if (!previewUrl) return null;

    const fileType = file.file?.type || "";
    if (fileType.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name)) {
      return (
        <Image
          src={previewUrl}
          alt="Preview"
          fill
          className="object-cover rounded"
        />
      );
    }

      if (fileType === "application/pdf" || /\.pdf$/i.test(file.name) ) {
        return (
          <iframe
            src={previewUrl}
            title="PDF Preview"
            className="w-full h-full rounded"
          />
        );
      }

      

      

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 rounded">
        <Image
          src="/images/doc-icon.svg"
          alt="Doc Icon"
          width={40}
          height={40}
        />
        <p className="text-white text-sm mt-2 text-center px-2 break-all">
          {file.name}
        </p>
      </div>
    );
  };

  const renderUploadCard = (doc: DocumentInfo) => {
  const file = files[doc.key];
  const previewUrl = previewUrls[doc.key];
  const hasError = errors.photos && !file;

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg bg-linear-to-b from-[#202020] to-[#101010] h-[200px] cursor-pointer relative ${
          hasError ? "border-red-500" : "border-[#effc76]"
        }`}
        onDrop={(e) => handleDrop(e, doc.key)}
        onDragOver={handleDragOver}
        onClick={() => fileInputRefs[doc.key].current?.click()}
      >
        <input
          ref={fileInputRefs[doc.key]}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp"
          onChange={(e) => handleFileSelect(doc.key, e.target.files?.[0])}
        />

        {file ? (
          <div className="relative w-full h-full">
            {renderPreview(doc.key, previewUrl, file)}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRefs[doc.key].current?.click();
                }}
                className="text-[#EFFC76] text-[14px] font-medium underline"
              >
                Replace Document
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center h-full flex flex-col justify-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Image
                src="/images/upload2.svg"
                alt="Upload docs"
                width={40}
                height={40}
              />
            </div>
            <h4 className="text-white font-regular text-[16px] mb-2">
              {doc.title}
            </h4>
            {doc.description && (
              <p className="text-white/60 text-xs leading-4">
                {doc.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Helper text */}
    

      {hasError && (
        <p className="text-red-500 text-xs mt-2">{doc.title} is required</p>
      )}
    </div>
  );
};
  return (
    <div>
      <h3 className="font-bold text-[20px] sm:text-[28px] mb-3">
        Upload Required Documents
      </h3>
      <p className="text-[12px] sm:text-[16px] text-white/60 max-w-[573px]">
        Provide the necessary documents for verification. All files must be
        clear and legible.
      </p>

      <div className="pt-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentType.map((doc) => (
          <div key={doc.key}>{renderUploadCard(doc)}</div>
        ))}
      </div>
    </div>
  );
}
