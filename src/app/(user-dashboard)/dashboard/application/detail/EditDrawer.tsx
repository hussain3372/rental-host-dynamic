"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { application } from "@/app/api/Host/application"; 

type Tab = "property" | "compliances" | "documents";

interface ChecklistItem {
  id: string | number;  // Allow both string and number
  name: string;
  description: string | null;
}

interface ApiChecklistItem {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
}

// OR create a separate interface for API response


interface FileData {
  name: string;
  size: number;
  file: File;
  documentType: "ID_DOCUMENT" | "SAFETY_PERMIT" | "INSURANCE_CERTIFICATE" | "PROPERTY_DEED";
  originalName: string;
}

interface UploadedDocument {
  documentType: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url?: string;
}

interface ApplicationData {
  id: string;
  propertyDetails?: {
    propertyName?: string;
    address?: string;
    ownership?: string;
    propertyType?: string;
    description?: string;
    images?: string[];
    rent?: number;
    bedrooms?: number;
    bathrooms?: number;
    currency?: string;
    maxGuests?: number;
  };
  complianceChecklist?: {
    [key: string]: boolean;
  };
  
  documents?: UploadedDocument[];
}

type HelpSupportDrawerProps = {
  onClose: () => void;
  applicationId?: string;
};

export default function TicketDrawer({ onClose, applicationId }: HelpSupportDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("property");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Property Details State
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Compliances State - dynamic based on API
  const [compliances, setCompliances] = useState<{ [key: string]: boolean }>({});

  // Documents State using FileData structure
  const [documents, setDocuments] = useState<FileData[]>([]);

  // Existing document URLs from API
  const [existingDocuments, setExistingDocuments] = useState<UploadedDocument[]>([]);

  // Track completed steps
  const [completedSteps, setCompletedSteps] = useState<Set<Tab>>(new Set());

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

  // Fetch checklist from API
 const fetchChecklist = async () => {
  setLoadingChecklist(true);
  try {
    const response = await application.getCheckList();
    if (response.success && response.data) {
      let checklistData: ChecklistItem[] = [];
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        checklistData = response.data.map((item: ApiChecklistItem) => ({
          id: item.id,
          name: item.name,
          description: item.description ?? null
        }));
      } else if (response.data.data && Array.isArray(response.data.data)) {
        checklistData = response.data.data.map((item: ApiChecklistItem) => ({
          id: item.id,
          name: item.name,
          description: item.description ?? null
        }));
      } else if (response.data.checklists && Array.isArray(response.data.checklists)) {
        // Handle string arrays by converting them to ChecklistItem objects
        checklistData = response.data.checklists.map((item: string, index: number) => ({
          id: index,
          name: item,
          description: null
        }));
      }

      setChecklistItems(checklistData);
      
      // Initialize compliance state with all items unchecked
      const initialCompliances: { [key: string]: boolean } = {};
      checklistData.forEach(item => {
        initialCompliances[item.name] = false;
      });
      setCompliances(initialCompliances);
    }
  } catch (error) {
    console.error("Error fetching checklist:", error);
    // toast.error("Failed to load checklist");
  } finally {
    setLoadingChecklist(false);
  }
};
  // Fetch application data when component mounts or applicationId changes
  useEffect(() => {
    const fetchApplicationData = async () => {
      let appId = applicationId;
      
      if (!appId) {
        // Try to get from localStorage if no applicationId provided
        const stored = localStorage.getItem("applicationData");
        const storedData = stored ? JSON.parse(stored) : null;
        if (!storedData?.id) return;
        
        appId = storedData.id;
      }

      setIsLoading(true);
      try {
        const response = await application.getApplicationById(appId || "");
        
        if (response.success && response.data) {
         const appData = ((response.data as { application?: ApplicationData }).application ?? response.data) as ApplicationData;
          console.log('Application data loaded:', appData);

          // Populate property details
          if (appData.propertyDetails) {
            setPropertyName(appData.propertyDetails.propertyName || "");
            setPropertyAddress(appData.propertyDetails.address || "");
            setDescription(appData.propertyDetails.description || "");
            
            // Handle existing images
            if (appData.propertyDetails.images && appData.propertyDetails.images.length > 0) {
              setExistingImages(appData.propertyDetails.images);
            }
          }

          // Populate existing documents if available
          if (appData.documents && appData.documents.length > 0) {
            setExistingDocuments(appData.documents);
          }

          // Fetch checklist and then populate compliance data
          await fetchChecklist();
          
          // Populate compliance checklist if available (after checklist is loaded)
          if (appData.complianceChecklist) {
            setCompliances(appData.complianceChecklist);
          }

          // Mark completed steps based on existing data
          const completed = new Set<Tab>();
          if (appData.propertyDetails?.propertyName && appData.propertyDetails?.address) {
            completed.add("property");
          }
          if (appData.complianceChecklist && Object.keys(appData.complianceChecklist).length > 0) {
            completed.add("compliances");
          }
          if (appData.documents && appData.documents.length > 0) {
            completed.add("documents");
          }
          setCompletedSteps(completed);

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
      if (uploadedImages.length === 0 && existingImages.length === 0) {
        newErrors.images = "At least one image is required";
      }
    }

    // Compliances tab validation
    if (activeTab === "compliances") {
      const allUnchecked = Object.values(compliances).every(checked => !checked);
      if (allUnchecked) {
        newErrors.compliances = "At least one compliance must be selected";
      }
    }

    // Documents tab validation
    if (activeTab === "documents") {
      if (documents.length === 0 && existingDocuments.length === 0) {
        newErrors.documents = "At least one document must be uploaded";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedImages.length + existingImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [...uploadedImages, ...files].slice(0, 5 - existingImages.length);
    setUploadedImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(newPreviews);

    // Clear image error when images are uploaded
    if (newImages.length > 0 || existingImages.length > 0) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleDocumentUpload = (type: FileData['documentType'], file: File) => {
    // Remove existing document of same type
    const filteredDocuments = documents.filter(doc => doc.documentType !== type);
    
    const newDocument: FileData = {
      name: file.name,
      size: file.size,
      file: file,
      documentType: type,
      originalName: file.name
    };

    setDocuments([...filteredDocuments, newDocument]);
    
    // Clear documents error when a document is uploaded
    setErrors(prev => ({ ...prev, documents: undefined }));
  };

  const handleDocumentInputChange = 
    (type: FileData['documentType']) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleDocumentUpload(type, file);
      }
    };

  const handleDocumentBoxClick = (type: FileData['documentType']) => {
    const refs = {
      "ID_DOCUMENT": governmentIdRef,
      "PROPERTY_DEED": ownershipProofRef,
      "SAFETY_PERMIT": safetyPermitsRef,
      "INSURANCE_CERTIFICATE": insuranceRef,
    };
    refs[type].current?.click();
  };

  const getDocumentByType = (type: FileData['documentType']) => {
    return documents.find(doc => doc.documentType === type);
  };

  const getExistingDocumentByType = (type: string) => {
    return existingDocuments.find(doc => doc.documentType === type);
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

  const uploadDocuments = async (files: FileData[]): Promise<UploadedDocument[]> => {
    if (files.length === 0) return [];

    try {
      const formData = new FormData();

      files.forEach((fileData) => {
        formData.append("files", fileData.file);
        formData.append("documentType", fileData.documentType);
        formData.append("originalNames", fileData.originalName);
      });

      const response = await application.uploadDocuments(formData);

      if (!response.data) {
        throw new Error("No response data received from document upload");
      }

      // Simple approach - assume response.data is the array of documents
      const uploadedDocs = Array.isArray(response.data) ? response.data : [];

      return uploadedDocs;
    } catch (error) {
      console.error("Document upload error:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to upload documents: ${error.message}`
          : "Failed to upload documents due to server error"
      );
    }
  };

const updateCurrentStep = async (): Promise<boolean> => {
  setIsUpdating(true);
  const toastId = toast.loading("Updating application...");

  try {
    const stored = localStorage.getItem("applicationData");
    const localApplicationData = stored ? JSON.parse(stored) : null;
    
    if (!localApplicationData?.id) {
      throw new Error("No application found. Please create an application first.");
    }

    let imageUrls: string[] = [...existingImages];

    // Upload images if any new ones are added
    if (uploadedImages.length > 0) {
      const newImageUrls = await uploadFiles(uploadedImages);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Upload documents separately and update state
    if (documents.length > 0) {
      const newDocs = await uploadDocuments(documents);
      const updatedDocs = [...existingDocuments, ...newDocs];
      setExistingDocuments(updatedDocs);
      
      // Update localStorage with new documents
      const updatedAppData = {
        ...localApplicationData,
        documents: updatedDocs
      };
      localStorage.setItem("applicationData", JSON.stringify(updatedAppData));
      
      setDocuments([]);
    }

    // Prepare step data WITHOUT documents
    const stepData = {
      propertyDetails: {
        propertyName,
        address: propertyAddress,
        description,
        images: imageUrls,
        propertyType: localApplicationData.propertyDetails?.propertyType || "RESIDENTIAL",
        ownership: localApplicationData.propertyDetails?.ownership || "OWNED",
        rent: localApplicationData.propertyDetails?.rent || 18500,
        bedrooms: localApplicationData.propertyDetails?.bedrooms || 20,
        bathrooms: localApplicationData.propertyDetails?.bathrooms || 20,
        currency: localApplicationData.propertyDetails?.currency || "AED",
        maxGuests: localApplicationData.propertyDetails?.maxGuests || 20,
      }
      
    };

    // Add compliance checklist only
    if (activeTab === "compliances" || activeTab === "documents") {
      localApplicationData.complianceChecklist = compliances;
    }

    // Documents are NOT included in step data

    const stepNameMap: Record<Tab, string> = {
      property: "PROPERTY_DETAILS",
      compliances: "COMPLIANCE_CHECKLIST", 
      documents: "DOCUMENT_UPLOAD"
    };

    const updatePayload = {
      step: stepNameMap[activeTab],
      data: stepData
    };

    const stepResponse = await application.updateStep(updatePayload);

    if (stepResponse.success) {
      // Update localStorage with latest step data (without documents)
      const updatedAppData = {
        ...localApplicationData,
        ...stepData
      };
      localStorage.setItem("applicationData", JSON.stringify(updatedAppData));
      
      setCompletedSteps(prev => new Set(prev).add(activeTab));
      
      if (uploadedImages.length > 0) {
        setExistingImages(imageUrls);
        setUploadedImages([]);
        setPreviewImages([]);
      }

      toast.success("Step completed successfully!", { id: toastId });
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

  const submitFinalApplication = async (): Promise<boolean> => {
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting application...");

    try {
      const stored = localStorage.getItem("applicationData");
      const localApplicationData = stored ? JSON.parse(stored) : null;
      
      if (!localApplicationData?.id) {
        throw new Error("No application found.");
      }

      const response = await application.submitApplication();

      if (response.success) {
        toast.success("Application submitted successfully!", { id: toastId });
        
        // Clean up localStorage  
        localStorage.removeItem("applicationData");
        localStorage.removeItem("propertyType");
        
        return true;
      } else {
        throw new Error(response.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application",
        { id: toastId }
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
  if (!validateForm()) {
    toast.error("Please fix the errors before proceeding");
    return;
  }

  try {
    const success = await updateCurrentStep();
    if (success) {
      const tabs: Tab[] = ["property", "compliances", "documents"];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      } else {
        const submitSuccess = await submitFinalApplication();
        if (submitSuccess) {
          handleClose(); // This will trigger the refetch
        }
      }
    }
  } catch (error) {
    console.error("Step progression error:", error);
  }
};

  const handlePreviousStep = () => {
    const tabs: Tab[] = ["property", "compliances", "documents"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleComplianceToggle = (checklistName: string) => {
    setCompliances(prev => ({
      ...prev,
      [checklistName]: !prev[checklistName]
    }));
    
    // Clear compliance error when any item is checked
    if (errors.compliances) {
      setErrors(prev => ({ ...prev, compliances: undefined }));
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
      documents.forEach(doc => {
        if (doc.file) {
          URL.revokeObjectURL(URL.createObjectURL(doc.file));
        }
      });
    };
  }, [previewImages, documents]);

  const isLastStep = activeTab === "documents";
  // const allStepsCompleted = completedSteps.size === 3;

  // Document type mappings for display
  const documentTypeConfig = {
    "ID_DOCUMENT": {
      label: "Government-issued ID",
      description: "Upload a valid ID (passport, national ID card, or driver's license) of the property owner.",
      ref: governmentIdRef
    },
    "PROPERTY_DEED": {
      label: "Property Ownership Proof", 
      description: "Upload legal proof of ownership (title deed, property tax receipt, or utility bill under your name).",
      ref: ownershipProofRef
    },
    "SAFETY_PERMIT": {
      label: "Safety Permits",
      description: "Provide any required local safety approvals or compliance certificates.",
      ref: safetyPermitsRef
    },
    "INSURANCE_CERTIFICATE": {
      label: "Insurance Certificate",
      description: "Upload proof of active property insurance covering liability or damage.",
      ref: insuranceRef
    }
  };

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
            Complete Your Application
          </h2>
          <p className="text-[12px] sm:text-[16px] sm:leading-5 font-normal mb-10 text-[#FFFFFF99]">
            Enter your property details and upload required documents to complete your certification application.
          </p>

          {/* Tabs with completion status */}
          <div className="flex gap-2 mb-6">
            {(["property", "compliances", "documents"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[16px] cursor-pointer font-medium transition-colors relative ${
                  activeTab === tab
                    ? "bg-[#EFFC7614] text-white border border-[#EFFC7699]"
                    : completedSteps.has(tab)
                    ? "bg-green-500/20 text-green-300 border border-green-500"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                {tab === "property" && "Property Details"}
                {tab === "compliances" && "Compliances"}
                {tab === "documents" && "Documents"}
                {completedSteps.has(tab) && (
                  <Check className="w-3 h-3 absolute -top-1 -right-1 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
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
                  
                    <>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
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
                    </>
                  
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
                  <div className="flex justify-center gap-3">
                  {/* Show existing images */}
                  {existingImages.length > 0 && (
                    <div className="flex gap-2 mb-4 w-full">
                      {existingImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={url}
                            alt={`Existing ${idx + 1}`}
                            fill
                            className="object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show new preview images */}
                  {previewImages.length > 0 && (
                    <div className="flex gap-2 mb-4 w-full">
                      {previewImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            fill
                            className="object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                    
                  )}

                  </div>
            </div>
          )}

          {activeTab === "compliances" && (
            <div className="space-y-4">
              <h3 className="text-white text-[18px] font-medium">
                Compliances Checklist
              </h3>

              {loadingChecklist ? (
                <div className="text-center py-8">
                  <p className="text-white">Loading checklist...</p>
                </div>
              ) : (
                <>
                  {errors.compliances && (
                    <p className="text-red-500 text-[12px] mb-2">{errors.compliances}</p>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {checklistItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleComplianceToggle(item.name)}
                        className="flex items-center justify-between p-3 rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] cursor-pointer"
                      >
                        <div className="flex-1">
                          <span className="text-white text-[14px] font-regular">
                            {item.name}
                          </span>
                          {item.description && (
                            <p className="text-[#FFFFFF99] text-[12px] mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
                            compliances[item.name]
                              ? "bg-[#EFFC76] border-[#EFFC76]"
                              : "border-white/20"
                          }`}
                        >
                          {compliances[item.name] && (
                            <Check className="w-3 h-3 text-black" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {checklistItems.length === 0 && (
                    <div className="text-center py-8 text-[#FFFFFF99]">
                      No checklist items available for this property type.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              {errors.documents && (
                <p className="text-red-500 text-[12px] mb-2">{errors.documents}</p>
              )}

              {/* Render document upload boxes for each type */}
              {Object.entries(documentTypeConfig).map(([type, config]) => {
                const currentDoc = getDocumentByType(type as FileData['documentType']);
                const existingDoc = getExistingDocumentByType(type);
                const hasDocument = currentDoc || existingDoc;
                const previewUrl = currentDoc ? URL.createObjectURL(currentDoc.file) : existingDoc?.url;

                return (
                  <div
                    key={type}
                    onClick={() => handleDocumentBoxClick(type as FileData['documentType'])}
                    className="border-2 cursor-pointer border-dashed border-[#EFFC76] rounded-[10px] p-0 overflow-hidden"
                    style={{ height: '200px' }}
                  >
                    <input
                      ref={config.ref}
                      type="file"
                      className="hidden"
                      onChange={handleDocumentInputChange(type as FileData['documentType'])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    
                    {hasDocument && previewUrl ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={previewUrl}
                          alt={config.label}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                          <p className="text-[#EFFC76] text-[11px] font-medium text-center">
                            ✓ {config.label} Uploaded
                          </p>
                          <p className="text-white text-[10px] text-center mt-1">
                            {currentDoc?.name || existingDoc?.originalName}
                          </p>
                          <p className="text-[#FFFFFF99] text-[9px] text-center mt-1">
                            Click to change file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full p-6">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                          <Image
                            src="/images/upload.png"
                            alt="Upload document"
                            height={40}
                            width={40}
                          />
                        </div>
                        <p className="text-white text-[16px] font-regular mb-2">
                          {config.label}
                        </p>
                        <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                          {config.description}
                        </p>
                        <span className="text-[#EFFC76] text-[11px] font-medium">
                          Upload
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          {activeTab !== "property" && (
            <button
              onClick={handlePreviousStep}
              disabled={isUpdating || isSubmitting}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          
          <button
            onClick={handleNextStep}
            disabled={isUpdating || isSubmitting}
            className={`flex-1 py-3 bg-[#EFFC76] text-[#121315] rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              activeTab === "property" ? "flex-1" : "flex-1"
            }`}
          >
            {isUpdating ? "Updating..." : isSubmitting ? "Submitting..." : isLastStep ? "Submit Application" : "Next Step"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}