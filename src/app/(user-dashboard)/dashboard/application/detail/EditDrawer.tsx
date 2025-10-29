"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { application } from "@/app/api/Host/application"; 

type Tab = "property" | "compliances" | "documents";



type ComplianceData = {
  fireSafety: boolean;
  buildingCode: boolean;
  energyEfficiency: boolean;
  accessibility: boolean;
};

type DocumentData = {
  governmentId: File | null;
  ownershipProof: File | null;
  safetyPermits: File | null;
  insurance: File | null;
};

type DocumentPreviews = {
  governmentId: string | null;
  ownershipProof: string | null;
  safetyPermits: string | null;
  insurance: string | null;
};

type HelpSupportDrawerProps = {
  onClose: () => void;
  applicationId?: string;
};

export default function TicketDrawer({ onClose, applicationId }: HelpSupportDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("property");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Property Details State
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Compliances State
  const [compliances, setCompliances] = useState<ComplianceData>({
    fireSafety: false,
    buildingCode: false,
    energyEfficiency: false,
    accessibility: false,
  });

  // Documents State
  const [documents, setDocuments] = useState<DocumentData>({
    governmentId: null,
    ownershipProof: null,
    safetyPermits: null,
    insurance: null,
  });

  // Document Previews State
  const [documentPreviews, setDocumentPreviews] = useState<DocumentPreviews>({
    governmentId: null,
    ownershipProof: null,
    safetyPermits: null,
    insurance: null,
  });

  // Error states
  const [errors, setErrors] = useState<{
    propertyName?: string;
    propertyAddress?: string;
    description?: string;
    images?: string;
    compliances?: string;
    documents?: string;
  }>({});

  // Refs for file inputs
  const governmentIdRef = useRef<HTMLInputElement>(null);
  const ownershipProofRef = useRef<HTMLInputElement>(null);
  const safetyPermitsRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Fetch application data when component mounts or applicationId changes
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!applicationId) {
        // Try to get from localStorage if no applicationId provided
        const stored = localStorage.getItem("applicationData");
        const storedData = stored ? JSON.parse(stored) : null;
        if (!storedData?.id) return;
        
        applicationId = storedData.id;
      }

      setIsLoading(true);
      try {
        const response = await application.getApplicationById(applicationId||"");
        
        if (response.success && response.data?.application) {
          const appData = response.data.application;
          
          // Populate property details
          if (appData.propertyDetails) {
            setPropertyName(appData.propertyDetails.propertyName || "");
            setPropertyAddress(appData.propertyDetails.address || "");
            setDescription(appData.propertyDetails.description || "");
            
            // Handle existing images - you might need to fetch and convert them
            if (appData.propertyDetails.images && appData.propertyDetails.images.length > 0) {
              // Note: This would require additional logic to convert URLs back to File objects
              // For now, we'll just show a message that images are already uploaded
              toast.success("Existing property images loaded");
            }
          }

          // Populate compliance checklist if available
          if (appData.complianceChecklist && Array.isArray(appData.complianceChecklist)) {
            const complianceData: ComplianceData = {
              fireSafety: appData.complianceChecklist.includes("Fire safety measures in place") || 
                         appData.complianceChecklist.some(item => item.includes?.("fire") || item.includes?.("safety")),
              buildingCode: appData.complianceChecklist.includes("Building code compliance") || 
                           appData.complianceChecklist.some(item => item.includes?.("building") || item.includes?.("code")),
              energyEfficiency: appData.complianceChecklist.includes("Energy efficiency standards met") || 
                               appData.complianceChecklist.some(item => item.includes?.("energy") || item.includes?.("efficiency")),
              accessibility: appData.complianceChecklist.includes("Accessibility compliance") || 
                            appData.complianceChecklist.some(item => item.includes?.("accessibility")),
            };
            setCompliances(complianceData);
          }

          console.log("Application data loaded:", appData);
          toast.success("Application data loaded successfully");
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        toast.error("Failed to load application data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId]);

  useEffect(() => {
    setIsVisible(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Property tab validation
    if (activeTab === "property") {
      if (!propertyName.trim()) {
        newErrors.propertyName = "Property name is required";
      }
      if (!propertyAddress.trim()) {
        newErrors.propertyAddress = "Property address is required";
      }
      if (!description.trim()) {
        newErrors.description = "Description is required";
      }
      if (uploadedImages.length === 0) {
        newErrors.images = "At least one image is required";
      }
    }

    // Compliances tab validation
    if (activeTab === "compliances") {
      const allUnchecked = !compliances.fireSafety && 
                          !compliances.buildingCode && 
                          !compliances.energyEfficiency && 
                          !compliances.accessibility;
      if (allUnchecked) {
        newErrors.compliances = "At least one compliance must be selected";
      }
    }

    // Documents tab validation
    if (activeTab === "documents") {
      const allMissing = !documents.governmentId && 
                        !documents.ownershipProof && 
                        !documents.safetyPermits && 
                        !documents.insurance;
      if (allMissing) {
        newErrors.documents = "At least one document must be uploaded";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedImages.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    const newImages = [...uploadedImages, ...files].slice(0, 3);
    setUploadedImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(newPreviews);

    // Clear image error when images are uploaded
    if (newImages.length > 0) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleDocumentUpload = (type: keyof DocumentData, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [type]: file }));
    
    // Create preview URL for the document
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreviews((prev) => ({ ...prev, [type]: previewUrl }));
      
      // Clear documents error when a document is uploaded
      setErrors(prev => ({ ...prev, documents: undefined }));
    } else {
      setDocumentPreviews((prev) => ({ ...prev, [type]: null }));
    }
  };

  const handleDocumentInputChange = 
    (type: keyof DocumentData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleDocumentUpload(type, file);
    };

  const handleDocumentBoxClick = (type: keyof DocumentData) => {
    const refs = {
      governmentId: governmentIdRef,
      ownershipProof: ownershipProofRef,
      safetyPermits: safetyPermitsRef,
      insurance: insuranceRef,
    };
    refs[type].current?.click();
  };

  const handleUpload = () => {
    inputRef.current?.click();
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    try {
      const uploadFormData = new FormData();
      files.forEach((file) => {
        uploadFormData.append(`images`, file);
      });

      const response = await application.uploadImage(uploadFormData);

      if (!response.data) {
        throw new Error("No response data received from server");
      }

      let uploadedUrls: string[] = [];

      if (Array.isArray(response.data)) {
        uploadedUrls = response.data
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "url" in item)
              return String(item.url);
            if (item && typeof item === "object" && "path" in item)
              return String(item.path);
            if (item && typeof item === "object" && "key" in item)
              return String(item.key);
            return "";
          })
          .filter(Boolean);
      } else {
        const data = response.data as {
          uploaded?: unknown[];
          files?: unknown[];
          images?: unknown[];
        };
        const items = data.uploaded || data.files || data.images;

        if (items && Array.isArray(items)) {
          uploadedUrls = items
            .map((item) => {
              if (typeof item === "string") return item;
              if (item && typeof item === "object" && "url" in item)
                return String(item.url);
              if (item && typeof item === "object" && "path" in item)
                return String(item.path);
              if (item && typeof item === "object" && "key" in item)
                return String(item.key);
              return "";
            })
            .filter(Boolean);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error("No valid image URLs received from server");
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to upload images: ${error.message}`
          : "Failed to upload images due to server error"
      );
    }
  };

  const uploadDocuments = async (): Promise<void> => {
    const documentFiles = Object.entries(documents)
      .filter(([_, file]) => file !== null)
      .map(([type, file]) => ({ type, file: file! }));

    if (documentFiles.length === 0) return;

    try {
      const formData = new FormData();

      documentFiles.forEach(({ type, file }) => {
        formData.append("files", file);
        
        // Map your document types to the API expected types
        const documentTypeMap: Record<string, string> = {
          governmentId: "ID_DOCUMENT",
          ownershipProof: "PROPERTY_DEED", 
          safetyPermits: "SAFETY_PERMIT",
          insurance: "INSURANCE_CERTIFICATE"
        };
        
        formData.append("documentType", documentTypeMap[type] || "OTHER");
        formData.append("originalNames", file.name);
      });

      const response = await application.uploadDocuments(formData);

      if (!response.data) {
        throw new Error("No response data received from document upload");
      }

      toast.success("Documents uploaded successfully!");
    } catch (error) {
      console.error("Document upload error:", error);
      throw error;
    }
  };

  const updateApplicationData = async (): Promise<boolean> => {
    setIsUpdating(true);
    const toastId = toast.loading("Updating application...");

    try {
      // Get current application ID
      const stored = localStorage.getItem("applicationData");
      const localApplicationData = stored ? JSON.parse(stored) : null;
      
      if (!localApplicationData?.id) {
        throw new Error("No application found. Please create an application first.");
      }

      // Upload images if any
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        imageUrls = await uploadFiles(uploadedImages);
      }

      // Upload documents if any
      if (Object.values(documents).some(doc => doc !== null)) {
        await uploadDocuments();
      }

      // Prepare update payload based on active tab
      let updatePayload = {};
      
      if (activeTab === "property") {
        updatePayload = {
          propertyDetails: {
            propertyName,
            address: propertyAddress,
            description,
            images: imageUrls,
            // Include other required fields from your existing data
            ...(localApplicationData.propertyDetails || {})
          }
        };
      } else if (activeTab === "compliances") {
        const complianceChecklist: string[] = [];
        if (compliances.fireSafety) complianceChecklist.push("Fire safety measures in place");
        if (compliances.buildingCode) complianceChecklist.push("Building code compliance");
        if (compliances.energyEfficiency) complianceChecklist.push("Energy efficiency standards met");
        if (compliances.accessibility) complianceChecklist.push("Accessibility compliance");
        
        updatePayload = {
          complianceChecklist
        };
      } else if (activeTab === "documents") {
        // Documents are already uploaded, just update the step
        updatePayload = {};
      }

      // Determine step name based on active tab
      const stepNameMap: Record<Tab, string> = {
        property: "PROPERTY_DETAILS",
        compliances: "COMPLIANCE_CHECKLIST", 
        documents: "DOCUMENT_UPLOAD"
      };

      const stepResponse = await application.updateStep({
        step: stepNameMap[activeTab],
        data: updatePayload
      });

      if (stepResponse.success) {
        toast.success("Application updated successfully!", { id: toastId });
        return true;
      } else {
        throw new Error(stepResponse.message || "Failed to update application");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update application",
        { id: toastId }
      );
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async () => {
    // Validate current tab
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const success = await updateApplicationData();
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
      Object.values(documentPreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewImages, documentPreviews]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9000] bg-black/80 flex items-center justify-center">
        <div className="text-white">Loading application data...</div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[9000] bg-black/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={drawerRef}
        className={`prevent-scroller overflow-auto max-w-[70vw] sm:max-w-[608px] absolute right-0 h-[100vh] bg-[#0A0C0B] z-[8000] p-[28px] top-0 flex flex-col justify-between text-white transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-5">
          <h2 className="text-[16px] sm:text-[20px] leading-6 font-medium mb-3">
            Complete Your Purchase
          </h2>
          <p className="text-[12px] sm:text-[16px] sm:leading-5 font-normal mb-10 text-[#FFFFFF99]">
            Enter your details to activate your subscription plan and start
            listing your property with confidence.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("property")}
              className={`px-4 py-2 rounded-lg text-[16px] cursor-pointer font-medium transition-colors ${
                activeTab === "property"
                  ? "bg-[#EFFC7614] text-white border border-[#EFFC7699]"
                  : ""
              }`}
            >
              Property Details
            </button>
            <button
              onClick={() => setActiveTab("compliances")}
              className={`px-4 py-2 rounded-lg text-[16px] cursor-pointer font-medium transition-colors ${
                activeTab === "compliances"
                  ? "bg-[#EFFC7614] text-white border border-[#EFFC7699]"
                  : ""
              }`}
            >
              Compliances Checklist
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 rounded-lg text-[16px] cursor-pointer font-medium transition-colors ${
                activeTab === "documents"
                  ? "bg-[#EFFC7614] text-white border border-[#EFFC7699]"
                  : ""
              }`}
            >
              Documents
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "property" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] leading-[18px] font-regular mb-[10px]">
                  Property name
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                  placeholder="Enter property name"
                />
                {errors.propertyName && (
                  <p className="text-red-500 text-[12px] mt-1">{errors.propertyName}</p>
                )}
              </div>

              <div>
                <label className="block text-[14px] leading-[18px] font-regular mb-[10px]">
                  Property address
                </label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                  placeholder="Enter property address"
                />
                {errors.propertyAddress && (
                  <p className="text-red-500 text-[12px] mt-1">{errors.propertyAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-[14px] leading-[18px] font-regular mb-[10px]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] resize-none placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] h-24"
                  placeholder="Enter property description"
                />
                {errors.description && (
                  <p className="text-red-500 text-[12px] mt-1">{errors.description}</p>
                )}
              </div>

              <div
                onClick={handleUpload}
                className="border-2 cursor-pointer border-dashed border-[#EFFC76] rounded-[10px] p-6"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full  flex items-center justify-center mb-3">
                    <Image
                      src="/images/upload.png"
                      alt="Upload image"
                      height={40}
                      width={40}
                    />
                  </div>
                  <p className="text-white text-[16px] font-regular mb-2">
                    Upload Images
                  </p>
                  <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                    Please upload a clear and readable file in PDF, JPG, or PNG
                    format. The maximum file size allowed is 10MB.
                  </p>
                  <label className="cursor-pointer">
                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {errors.images && (
                <p className="text-red-500 text-[12px] mt-1">{errors.images}</p>
              )}

              <div className="flex items-start gap-2 text-[#FFB52B] text-[14px] font-regular">
                <Image
                  src="/images/warning.svg"
                  alt="warning"
                  height={20}
                  width={20}
                />
                <span>Upload at least 3 images for faster approval.</span>
              </div>

              {previewImages.length > 0 && (
                <div className="flex gap-2">
                  {previewImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "compliances" && (
            <div className="space-y-4">
              <h3 className="text-white text-[18px] font-medium">
                Compliances Checklist
              </h3>

              {errors.compliances && (
                <p className="text-red-500 text-[12px] mb-2">{errors.compliances}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() =>
                    setCompliances((prev) => ({
                      ...prev,
                      fireSafety: !prev.fireSafety,
                    }))
                  }
                  className="flex items-center justify-between p-3 rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] cursor-pointer"
                >
                  <span className="text-white text-[14px] font-regular">
                    Fire safety measures in place
                  </span>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
                      compliances.fireSafety
                        ? "bg-[#EFFC76] border-[#EFFC76]"
                        : "border-white/20"
                    }`}
                  >
                    {compliances.fireSafety && (
                      <Check className="w-3 h-3 text-black" />
                    )}
                  </div>
                </div>

                <div
                  onClick={() =>
                    setCompliances((prev) => ({
                      ...prev,
                      buildingCode: !prev.buildingCode,
                    }))
                  }
                  className="flex items-center justify-between p-3 rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] cursor-pointer"
                >
                  <span className="text-white text-[14px] font-regular">
                    Building code compliance
                  </span>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
                      compliances.buildingCode
                        ? "bg-[#EFFC76] border-[#EFFC76]"
                        : "border-white/20"
                    }`}
                  >
                    {compliances.buildingCode && (
                      <Check className="w-3 h-3 text-black" />
                    )}
                  </div>
                </div>

                <div
                  onClick={() =>
                    setCompliances((prev) => ({
                      ...prev,
                      energyEfficiency: !prev.energyEfficiency,
                    }))
                  }
                  className="flex items-center justify-between p-3 rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] cursor-pointer"
                >
                  <span className="text-white text-[14px] font-regular">
                    Energy efficiency standards met
                  </span>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
                      compliances.energyEfficiency
                        ? "bg-[#EFFC76] border-[#EFFC76]"
                        : "border-white/20"
                    }`}
                  >
                    {compliances.energyEfficiency && (
                      <Check className="w-3 h-3 text-black" />
                    )}
                  </div>
                </div>

                <div
                  onClick={() =>
                    setCompliances((prev) => ({
                      ...prev,
                      accessibility: !prev.accessibility,
                    }))
                  }
                  className="flex items-center justify-between p-3 rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] cursor-pointer"
                >
                  <span className="text-white text-[14px] font-regular">
                    Accessibility compliance
                  </span>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
                      compliances.accessibility
                        ? "bg-[#EFFC76] border-[#EFFC76]"
                        : "border-white/20"
                    }`}
                  >
                    {compliances.accessibility && (
                      <Check className="w-3 h-3 text-black" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              {errors.documents && (
                <p className="text-red-500 text-[12px] mb-2">{errors.documents}</p>
              )}

              {/* Government ID */}
              <div
                onClick={() => handleDocumentBoxClick("governmentId")}
                className="border-2 cursor-pointer border-dashed border-[#EFFC76] rounded-[10px] p-6"
              >
                <input
                  ref={governmentIdRef}
                  type="file"
                  className="hidden"
                  onChange={handleDocumentInputChange("governmentId")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                
                {documentPreviews.governmentId ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={documentPreviews.governmentId}
                        fill
                        alt="Government ID Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[#EFFC76] text-[11px] font-medium">
                      ✓ Government-issued ID Uploaded
                    </p>
                    <p className="text-[#FFFFFF99] text-[10px] mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Image
                        src="/images/upload.png"
                        alt="Upload document"
                        height={40}
                        width={40}
                      />
                    </div>
                    <p className="text-white text-[16px] font-regular mb-2">
                      Government-issued ID
                    </p>
                    <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                      Upload a valid ID (passport, national ID card, or driver&apos;s license) of the property owner.
                    </p>
                    <span className="text-[#EFFC76] text-[11px] font-medium">
                      Upload
                    </span>
                  </div>
                )}
              </div>

              {/* Property Ownership Proof */}
              <div
                onClick={() => handleDocumentBoxClick("ownershipProof")}
                className="border-2 cursor-pointer border-dashed border-[#EFFC76] rounded-[10px] p-6"
              >
                <input
                  ref={ownershipProofRef}
                  type="file"
                  className="hidden"
                  onChange={handleDocumentInputChange("ownershipProof")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                
                {documentPreviews.ownershipProof ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
                      <Image
                      fill
                        src={documentPreviews.ownershipProof}
                        alt="Ownership Proof Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[#EFFC76] text-[11px] font-medium">
                      ✓ Property Ownership Proof Uploaded
                    </p>
                    <p className="text-[#FFFFFF99] text-[10px] mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Image
                        src="/images/upload.png"
                        alt="Upload document"
                        height={40}
                        width={40}
                      />
                    </div>
                    <p className="text-white text-[16px] font-regular mb-2">
                      Property Ownership Proof
                    </p>
                    <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                      Upload legal proof of ownership (title deed, property tax receipt, or utility bill under your name).
                    </p>
                    <span className="text-[#EFFC76] text-[11px] font-medium">
                      Upload
                    </span>
                  </div>
                )}
              </div>

              {/* Safety Permits */}
              <div
                onClick={() => handleDocumentBoxClick("safetyPermits")}
                className="border-2 cursor-pointer border-dashed border-[#EFFC76] rounded-[10px] p-6"
              >
                <input
                  ref={safetyPermitsRef}
                  type="file"
                  className="hidden"
                  onChange={handleDocumentInputChange("safetyPermits")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                
                {documentPreviews.safetyPermits ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
                      <Image
                      fill
                        src={documentPreviews.safetyPermits}
                        alt="Safety Permits Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[#EFFC76] text-[11px] font-medium">
                      ✓ Safety Permits Uploaded
                    </p>
                    <p className="text-[#FFFFFF99] text-[10px] mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Image
                        src="/images/upload.png"
                        alt="Upload document"
                        height={40}
                        width={40}
                      />
                    </div>
                    <p className="text-white text-[16px] font-regular mb-2">
                      Safety Permits
                    </p>
                    <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                      Provide any required local safety approvals or compliance certificates.
                    </p>
                    <span className="text-[#EFFC76] text-[11px] font-medium">
                      Upload
                    </span>
                  </div>
                )}
              </div>

              {/* Insurance Certificate */}
              <div
                onClick={() => handleDocumentBoxClick("insurance")}
                className="border-2 cursor-pointer border-dashed border-[#EFFC76] rounded-[10px] p-6"
              >
                <input
                  ref={insuranceRef}
                  type="file"
                  className="hidden"
                  onChange={handleDocumentInputChange("insurance")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                
                {documentPreviews.insurance ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
                      <Image
                      fill
                        src={documentPreviews.insurance}
                        alt="Insurance Certificate Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[#EFFC76] text-[11px] font-medium">
                      ✓ Insurance Certificate Uploaded
                    </p>
                    <p className="text-[#FFFFFF99] text-[10px] mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Image
                        src="/images/upload.png"
                        alt="Upload document"
                        height={40}
                        width={40}
                      />
                    </div>
                    <p className="text-white text-[16px] font-regular mb-2">
                      Insurance Certificate
                    </p>
                    <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                      Upload proof of active property insurance covering liability or damage.
                    </p>
                    <span className="text-[#EFFC76] text-[11px] font-medium">
                      Upload
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="w-full py-3 bg-[#EFFC76] text-[#121315] rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}