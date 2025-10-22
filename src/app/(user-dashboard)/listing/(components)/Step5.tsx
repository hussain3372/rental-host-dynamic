"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Upload,
  Trash2,
} from "lucide-react";
import { application } from "@/app/api/Host/application";
import toast from "react-hot-toast";

interface PropertyDetails {
  rent: number;
  images: string[];
  address: string;
  bedrooms: number;
  currency: string;
  bathrooms: number;
  maxGuests: number;
  ownership: string;
  description: string;
  propertyName: string;
  propertyType: string;
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface ApplicationData {
  id: string;
  hostId: number;
  status: string;
  currentStep: string;
  propertyDetails: PropertyDetails;
  complianceChecklist: { [key: string]: boolean };
  submittedAt: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  documents: Document[];
}

interface UpdatePayload {
  propertyDetails?: {
    propertyName?: string;
    address?: string;
    propertyType?: string;
    ownership?: string;
    description?: string;
    images?: string[];
  };
  complianceChecklist?: { [key: string]: boolean };
  documents?: Document[];
}

export default function ReviewSubmission() {
  const [propertyDetails, setPropertyDetails] = useState({
    name: "",
    address: "",
    type: "",
    ownership: "",
  });

  const [description, setDescription] = useState("");
  const [compliance, setCompliance] = useState<string[]>([]);
  const [planDetails, setPlanDetails] = useState({
    name: "Professional",
    duration: "Monthly",
    startDate: "Aug 12, 2025",
    amount: "$24",
  });

  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const [isPropertyOpen, setIsPropertyOpen] = useState(false);
  const [propertyIndex, setPropertyIndex] = useState(0);

  const [isDocOpen, setIsDocOpen] = useState(false);
  const [docIndex, setDocIndex] = useState(0);

  const [uploadingImages, setUploadingImages] = useState(false);
  // const [uploadingDocuments, setUploadingDocuments] = useState(false);

  const documentTypeMap: { [key: string]: string } = {
    ID_DOCUMENT: "Government-issued ID",
    PROPERTY_DEED: "Property Ownership Proof",
    SAFETY_PERMIT: "Safety Permits",
    INSURANCE_CERTIFICATE: "Insurance Certificate",
  };

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const stored = localStorage.getItem("applicationData");
        const storedData = stored ? JSON.parse(stored) : null;
        setLoading(true);
        const response = await application.getApplicationById(storedData.id);

        if (response.success && response.data) {
          // Replace line 1094 with:
          const appData = response.data as unknown as ApplicationData;
          // Set property details
          setPropertyDetails({
            name: appData.propertyDetails.propertyName,
            address: appData.propertyDetails.address,
            type: appData.propertyDetails.propertyType,
            ownership: appData.propertyDetails.ownership,
          });

          // Set description
          setDescription(appData.propertyDetails.description);

          // Set property images
          setPropertyImages(appData.propertyDetails.images || []);

          // Set documents - these are already uploaded, don't duplicate
          setDocuments(appData.documents || []);

          // Set compliance checklist
          if (appData.complianceChecklist) {
            const complianceItems = Object.keys(appData.complianceChecklist);
            setCompliance(complianceItems);
          }

          // Set plan details based on payment if available
          setPlanDetails((prev) => ({
            ...prev,
            amount: `${appData.propertyDetails.currency} ${
              appData.propertyDetails.rent || 1000
            }`,
            startDate: new Date(appData.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          }));
        }
      } catch (err) {
        setError("Failed to fetch application data");
        console.error("Error fetching application:", err);
        toast.error("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, []);

  const openPropertyPreview = (i: number) => {
    setPropertyIndex(i);
    setIsPropertyOpen(true);
  };
  const closePropertyPreview = () => setIsPropertyOpen(false);
  const prevProperty = () =>
    setPropertyIndex((prev) =>
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  const nextProperty = () =>
    setPropertyIndex((prev) =>
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );

  const openDocPreview = (i: number) => {
    setDocIndex(i);
    setIsDocOpen(true);
  };
  const closeDocPreview = () => setIsDocOpen(false);
  const prevDoc = () =>
    setDocIndex((prev) => (prev === 0 ? documents.length - 1 : prev - 1));
  const nextDoc = () =>
    setDocIndex((prev) => (prev === documents.length - 1 ? 0 : prev + 1));

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await application.uploadImage(formData);

      if (response.data) {
        let uploadedUrls: string[] = [];

        if (Array.isArray(response.data)) {
          uploadedUrls = response.data
            .map((item) => {
              if (typeof item === "string") return item;
              if (item && typeof item === "object" && "url" in item)
                return String(item.url);
              if (item && typeof item === "object" && "path" in item)
                return String(item.path);
              return "";
            })
            .filter(Boolean);
        }

        if (uploadedUrls.length > 0) {
          const newImages = [...propertyImages, ...uploadedUrls];
          setPropertyImages(newImages);
          toast.success(
            `${uploadedUrls.length} image(s) uploaded successfully`
          );
        }
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  //   const handleDocumentUpload = async (files: FileList | null, documentType: string) => {
  //     if (!files || files.length === 0) return;

  //     try {
  //       setUploadingDocuments(true);
  //       const formData = new FormData();
  //       Array.from(files).forEach(file => {
  //         formData.append('files', file);
  //         formData.append('documentTypes', documentType);
  //       });

  //       const response = await application.uploadDocuments(formData);

  // //       if (response.data) {
  // // // Replace line 1214 with:
  // // const uploadedData = response.data.documents || response.data;        let uploadedDocuments: Document[] = [];

  // //         if (Array.isArray(uploadedData)) {
  // //           uploadedDocuments = uploadedData as Document[];
  // //         }

  // //         if (uploadedDocuments.length > 0) {
  // //           const newDocuments = [...documents, ...uploadedDocuments];
  // //           setDocuments(newDocuments);
  // //           toast.success(`${uploadedDocuments.length} document(s) uploaded successfully`);
  // //         }
  // //       }
  // if (response.data) {
  //   const uploadedData = response.data.documents || response.data;
  //   let uploadedDocuments: Document[] = [];

  //   if (Array.isArray(uploadedData)) {
  //   const uploadedData = (response.data as any).documents || response.data;  }

  //   if (uploadedDocuments.length > 0) {
  //     const newDocuments = [...documents, ...uploadedDocuments];
  //     setDocuments(newDocuments);
  //     toast.success(`${uploadedDocuments.length} document(s) uploaded successfully`);
  //   }
  // }
  //     } catch (error) {
  //       console.error("Document upload error:", error);
  //       toast.error("Failed to upload documents");
  //     } finally {
  //       setUploadingDocuments(false);
  //     }
  //   };

  const removeImage = (index: number) => {
    const newImages = propertyImages.filter((_, i) => i !== index);
    setPropertyImages(newImages);
    toast.success("Image removed");
  };

  const removeDocument = (id: string) => {
    const newDocuments = documents.filter((doc) => doc.id !== id);
    setDocuments(newDocuments);
    toast.success("Document removed");
  };

  const handleUpdateApplication = async () => {
    try {
      setIsSubmitting(true);

      const updatePayload: UpdatePayload = {};

      if (editing === "property" || editing === "photos") {
        updatePayload.propertyDetails = {
          propertyName: propertyDetails.name,
          address: propertyDetails.address,
          propertyType: propertyDetails.type,
          ownership: propertyDetails.ownership,
          description: description,
          images: propertyImages,
        };
      }

      if (editing === "compliance") {
        const complianceObj: { [key: string]: boolean } = {};
        compliance.forEach((item) => {
          complianceObj[item] = true;
        });
        updatePayload.complianceChecklist = complianceObj;
      }

      // Don't send documents in update - they're already uploaded
      console.log("📤 Update payload (without documents):", updatePayload);

      const response = await application.updateApplication(
        updatePayload as never
      );

      if (response.success) {
        toast.success("Application updated successfully!");
        setEditing(null);
      } else {
        throw new Error(response.message || "Failed to update application");
      }
    } catch (error) {
      console.error("Update application error:", error);
      toast.error((error as Error).message || "Failed to update application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    handleUpdateApplication();
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const addComplianceItem = () => {
    setCompliance([...compliance, ""]);
  };

  const removeComplianceItem = (index: number) => {
    const newCompliance = compliance.filter((_, i) => i !== index);
    setCompliance(newCompliance);
  };

  if (loading) {
    return (
      <div className="mx-auto text-white flex justify-center items-center h-64">
        <p>Loading application data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto text-white flex justify-center items-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto text-white">
      <h2 className="text-[28px] leading-[32px] font-bold mb-3">
        Review Your Submission
      </h2>
      <p className="text-white/60 text-[16px] leading-[20px] mb-10 max-w-[573px] w-full">
        Please review the details below before proceeding. You can go back and
        edit if needed.
      </p>

      {/* Property Details */}
      <div className="border bg-[#121315] border-[#2e2f31] rounded-xl mb-6 p-5">
        <div className="flex justify-between items-center border-b border-b-[#2e2f31] pb-3 mb-[28px]">
          <h3 className="font-semibold">Property Details</h3>
          {editing === "property" ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="text-white/60 underline cursor-pointer text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="text-[#EFFC76] underline cursor-pointer text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing("property")}
              className="text-[#EFFC76] underline cursor-pointer text-sm"
            >
              Edit
            </button>
          )}
        </div>

        {editing === "property" ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Property Name
              </label>
              <input
                value={propertyDetails.name}
                onChange={(e) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    name: e.target.value,
                  })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Property Address
              </label>
              <input
                value={propertyDetails.address}
                onChange={(e) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    address: e.target.value,
                  })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Property Type
              </label>
              <input
                value={propertyDetails.type}
                onChange={(e) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    type: e.target.value,
                  })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Ownership
              </label>
              <input
                value={propertyDetails.ownership}
                onChange={(e) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    ownership: e.target.value,
                  })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-[28px] text-sm">
            <div className="">
              <p className="font-regular text-[12px] leading-4">
                Property name
              </p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {propertyDetails.name}{" "}
              </p>
            </div>
            <div className="">
              <p className="font-regular text-[12px] leading-4">
                Property address
              </p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {propertyDetails.address}{" "}
              </p>
            </div>
            <div className="">
              <p className="font-regular text-[12px] leading-4">
                Property type
              </p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {propertyDetails.type}{" "}
              </p>
            </div>
            <div className="">
              <p className="font-regular text-[12px] leading-4">Ownership</p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {propertyDetails.ownership}{" "}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Property Photos */}
      <div className="bg-[#121315] border border-[#2e2f31] rounded-xl p-5 mb-6">
        <div className="flex border-b border-b-[#2e2f31] pb-3 justify-between items-center ">
          <h3 className="font-semibold">Property Photos</h3>
          {editing === "photos" ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="text-white/60 underline cursor-pointer text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="text-[#EFFC76] underline cursor-pointer text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing("photos")}
              className="text-[#EFFC76] underline cursor-pointer text-sm"
            >
              Edit
            </button>
          )}
        </div>

        <p className="text-white font-regular text-[12px] leading-[16px] pt-[28px] pb-2">
          Description
        </p>

        {editing === "photos" ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded bg-[#1a1b1d] border border-[#2e2f31] mb-3 text-white"
            rows={3}
            placeholder="Enter property description..."
          />
        ) : (
          <p className="text-white leading-[18px] text-sm font-semibold">
            {description}
          </p>
        )}

        <div className="pt-[28px]">
          {editing === "photos" && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-[#EFFC76] cursor-pointer">
                <Upload size={16} />
                <span>Upload Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={uploadingImages}
                />
              </label>
              {uploadingImages && (
                <p className="text-white/60 text-sm mt-1">
                  Uploading images...
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {propertyImages.length > 0 ? (
              propertyImages.map((src, i) => (
                <div key={i} className="relative cursor-pointer group">
                  <Image
                    src={src}
                    alt={`Property ${i + 1}`}
                    height={120}
                    width={120}
                    className="rounded-lg object-cover h-[120px] w-[120px]"
                  />
                  <div
                    onClick={() => openPropertyPreview(i)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                     flex items-center justify-center transition-opacity"
                  >
                    <Eye className="text-white w-8 h-8" />
                  </div>
                  {editing === "photos" && (
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-white/60">No property images uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Property Image Preview Modal */}
      {isPropertyOpen && propertyImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-0"
          onClick={closePropertyPreview}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePropertyPreview();
            }}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white p-2 cursor-pointer z-10 bg-black/50 rounded-full"
          >
            <X size={20} className="sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevProperty();
            }}
            className="absolute left-4 sm:left-5 text-white p-2 cursor-pointer z-10 bg-black/50 rounded-full"
          >
            <ChevronLeft size={20} className="sm:w-10 sm:h-10" />
          </button>

          <div
            className="w-full max-w-4xl max-h-[80vh] flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={propertyImages[propertyIndex]}
              alt={`Property ${propertyIndex + 1}`}
              width={600}
              height={500}
              className="w-auto h-auto max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextProperty();
            }}
            className="absolute right-4 sm:right-5 text-white p-2 cursor-pointer z-10 bg-black/50 rounded-full"
          >
            <ChevronRight size={20} className="sm:w-10 sm:h-10" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            {propertyIndex + 1} / {propertyImages.length}
          </div>
        </div>
      )}

      {/* Compliance Checklist */}
      <div className="bg-[#121315] border border-[#2e2f31] rounded-xl p-5 mb-6">
        <div className="flex border-b border-b-[#2e2f31] pb-3 justify-between items-center mb-4">
          <h3 className="font-semibold text-[16px] leading-5">
            Compliance Checklist
          </h3>
          {editing === "compliance" ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="text-white/60 underline cursor-pointer text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="text-[#EFFC76] underline cursor-pointer text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing("compliance")}
              className="text-[#EFFC76] underline cursor-pointer text-sm"
            >
              Edit
            </button>
          )}
        </div>

        {editing === "compliance" ? (
          <div className="space-y-3 py-[28px]">
            {compliance.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  value={item}
                  onChange={(e) => {
                    const updated = [...compliance];
                    updated[idx] = e.target.value;
                    setCompliance(updated);
                  }}
                  className="flex-1 p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] text-white"
                  placeholder="Enter compliance requirement..."
                />
                <button
                  onClick={() => removeComplianceItem(idx)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addComplianceItem}
              className="text-[#EFFC76] underline cursor-pointer text-sm"
            >
              + Add Compliance Item
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {compliance.map((item, idx) => (
              <span
                key={idx}
                className="rounded-md bg-gradient-to-b from-[#202020] to-[#101010] p-[15px] border border-[#353535] md:min-w-[357px] text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Document Uploads */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {documents.length > 0 ? (
          documents.map((doc, i) => {
            const fileName = doc.fileName?.toLowerCase() || "";
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
            const isPdf = /\.pdf$/i.test(fileName);
            // const isDoc = /\.(doc|docx)$/i.test(fileName);

            return (
              <div key={doc.id} className="flex flex-col">
                {/* Document Title */}
                <div className="min-h-[40px] flex items-start mb-1">
                  <p className="text-sm text-white/60 line-clamp-2">
                    {documentTypeMap[doc.documentType] || doc.documentType}
                  </p>
                </div>

                {/* Preview Container */}
                <div className="relative cursor-pointer group">
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                    {/* ✅ Image Preview */}
                    {isImage && (
                      <Image
                        src={doc.url}
                        alt={doc.fileName}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* ✅ PDF Preview */}
                    {isPdf && (
                      <iframe
                        src={`${doc.url}#toolbar=0`}
                        title="PDF Preview"
                        className="w-full h-full"
                      />
                    )}

                    {/* ✅ DOC or Other file preview */}
                    {!isImage && !isPdf && (
                      <div className="flex flex-col items-center justify-center text-center px-2">
                        <Image
                          src="/images/doc-icon.svg"
                          alt="Doc Icon"
                          width={40}
                          height={40}
                          className="mb-2"
                        />
                        <p className="text-white text-xs truncate w-[140px]">
                          {doc.fileName.split("/").pop()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hover overlay for preview */}
                  <div
                    onClick={() => openDocPreview(i)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                flex items-center justify-center transition-opacity"
                  >
                    <Eye className="text-white w-8 h-8" />
                  </div>

                  {/* Delete button only in edit mode */}
                  {editing === "documents" && (
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-white/60 col-span-2">No documents uploaded</p>
        )}
      </div>
      {/* Document Preview Modal */}
      {isDocOpen && documents.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-0"
          onClick={closeDocPreview}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeDocPreview();
            }}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white p-2 cursor-pointer z-10 bg-black/50 rounded-full"
          >
            <X size={20} className="sm:w-7 sm:h-7" />
          </button>

          {/* Prev Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevDoc();
            }}
            className="absolute left-4 sm:left-5 text-white p-2 cursor-pointer z-10 bg-black/50 rounded-full"
          >
            <ChevronLeft size={20} className="sm:w-10 sm:h-10" />
          </button>

          <div
            className="w-full max-w-5xl max-h-[85vh] flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentDoc = documents[docIndex];
              const fileUrl = currentDoc.url || currentDoc.fileName;
              const fileType = (fileUrl?.split(".").pop() || "").toLowerCase();

              if (!fileUrl) {
                return (
                  <div className="bg-white rounded-lg p-8 text-center max-w-md">
                    <p className="text-black font-semibold mb-4">
                      {documentTypeMap[currentDoc.documentType] ||
                        currentDoc.documentType}
                    </p>
                    <p className="text-gray-600 mb-2">
                      {currentDoc.originalName}
                    </p>
                    <p className="text-gray-400 text-xs mt-4">
                      Document preview not available
                    </p>
                  </div>
                );
              }

              if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)) {
                return (
                  <Image
                    src={fileUrl}
                    alt={currentDoc.fileName || "Document"}
                    width={800}
                    height={600}
                    className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-lg"
                  />
                );
              }

              if (fileType === "pdf") {
                return (
                  <iframe
                    src={fileUrl}
                    className="w-full h-[80vh] rounded-lg bg-white"
                    title="PDF Preview"
                  />
                );
              }

              if (["doc", "docx"].includes(fileType)) {
                return (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                      fileUrl
                    )}`}
                    className="w-full h-[80vh] rounded-lg bg-white"
                    title="DOC Preview"
                  />
                );
              }

              // Default fallback for unknown formats
              return (
                <div className="bg-white rounded-lg p-8 text-center max-w-md">
                  <p className="text-black font-semibold mb-4">
                    {documentTypeMap[currentDoc.documentType] ||
                      currentDoc.documentType}
                  </p>
                  <p className="text-gray-600 mb-2">{currentDoc.fileName}</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Open / Download Document
                  </a>
                </div>
              );
            })()}
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextDoc();
            }}
            className="absolute right-4 sm:right-5 text-white p-2 cursor-pointer z-10 bg-black/50 rounded-full"
          >
            <ChevronRight size={20} className="sm:w-10 sm:h-10" />
          </button>

          {/* Index */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            {docIndex + 1} / {documents.length}
          </div>
        </div>
      )}

      {/* Plan Details */}
      <div className="bg-[#121315] border border-[#2e2f31] rounded-xl p-5 mb-6">
        <div className="flex justify-between border-b border-b-[#2e2f31] pb-3 items-center mb-[28px]">
          <h3 className="font-semibold">Plan Details</h3>
          {editing === "plan" ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="text-white/60 underline cursor-pointer text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="text-[#EFFC76] underline cursor-pointer text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing("plan")}
              className="text-[#EFFC76] underline cursor-pointer text-sm"
            >
              Edit
            </button>
          )}
        </div>

        {editing === "plan" ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Plan Name
              </label>
              <input
                value={planDetails.name}
                onChange={(e) =>
                  setPlanDetails({ ...planDetails, name: e.target.value })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Duration
              </label>
              <input
                value={planDetails.duration}
                onChange={(e) =>
                  setPlanDetails({ ...planDetails, duration: e.target.value })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">
                Start Date
              </label>
              <input
                value={planDetails.startDate}
                onChange={(e) =>
                  setPlanDetails({ ...planDetails, startDate: e.target.value })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Amount</label>
              <input
                value={planDetails.amount}
                onChange={(e) =>
                  setPlanDetails({ ...planDetails, amount: e.target.value })
                }
                className="p-2 rounded bg-[#1a1b1d] border border-[#2e2f31] w-full text-white"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-[28px] text-sm">
            <div className="">
              <p className="font-regular text-[12px] leading-4">Plan name</p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {planDetails.name}{" "}
              </p>
            </div>
            <div className="">
              <p className="font-regular text-[12px] leading-4">Duration</p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {planDetails.duration}{" "}
              </p>
            </div>
            <div className="">
              <p className="font-regular text-[12px] leading-4">Start Date</p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {planDetails.startDate}{" "}
              </p>
            </div>
            <div className="">
              <p className="font-regular text-[12px] leading-4">Amount</p>
              <p className="text-[14px] font-semibold leading-[18px] pt-2">
                {" "}
                {planDetails.amount}{" "}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
