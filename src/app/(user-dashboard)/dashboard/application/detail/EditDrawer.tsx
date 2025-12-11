// "use client";
// import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { Check, ChevronRight, ChevronLeft } from "lucide-react";
// import Image from "next/image";
// import toast from "react-hot-toast";
// import { application } from "@/app/api/Host/application";
// import StripePaymentModal from "@/app/(user-dashboard)/listing/(components)/StripePaymentModal";

// type Tab = "property" | "compliances" | "documents" | "payment";

// interface ChecklistItem {
//   id: string | number;
//   name: string;
//   description: string | null;
// }

// interface ApiChecklistItem {
//   id: string | number;
//   name: string;
//   description?: string;
//   isActive?: boolean;
// }

// interface FileData {
//   name: string;
//   size: number;
//   file: File;
//   documentType:
//     | "ID_DOCUMENT"
//     | "SAFETY_PERMIT"
//     | "INSURANCE_CERTIFICATE"
//     | "PROPERTY_DEED";
//   originalName: string;
//   documentId?: string;
// }

// interface UploadedDocument {
//   id?: string;
//   documentType: string;
//   fileName: string;
//   originalName: string;
//   mimeType: string;
//   size: number;
//   url?: string;
// }

// interface Payment {
//   id: string;
//   amount: number;
//   status: "PENDING" | "COMPLETED" | "FAILED";
//   createdAt: string;
// }

// interface ApplicationData {
//   id: string;
//   status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
//   currentStep: string;
//   propertyDetails?: {
//     propertyName?: string;
//     address?: string;
//     ownership?: string;
//     propertyType?: string;
//     description?: string;
//     images?: string[];
//     rent?: number;
//     bedrooms?: number;
//     bathrooms?: number;
//     currency?: string;
//     maxGuests?: number;
//   };
//   complianceChecklist?: {
//     [key: string]: boolean;
//   };
//   documents?: UploadedDocument[];
//   payments?: Payment[];
// }

// type HelpSupportDrawerProps = {
//   onClose: () => void;
//   applicationId?: string;
// };

// export default function TicketDrawer({
//   onClose,
//   applicationId,
// }: HelpSupportDrawerProps) {
//   const [activeTab, setActiveTab] = useState<Tab>("property");
//   const [isVisible, setIsVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
//   const [loadingChecklist, setLoadingChecklist] = useState(false);
//   const [applicationData, setApplicationData] =
//     useState<ApplicationData | null>(null);
//   const drawerRef = useRef<HTMLDivElement>(null);

//   // Property Details State
//   const [propertyName, setPropertyName] = useState("");
//   const [propertyAddress, setPropertyAddress] = useState("");
//   const [description, setDescription] = useState("");
//   const [uploadedImages, setUploadedImages] = useState<File[]>([]);
//   const [previewImages, setPreviewImages] = useState<string[]>([]);
//   const [existingImages, setExistingImages] = useState<string[]>([]);
//   const [currentStep, setCurrentStep] = useState<string | undefined>(undefined);
  
//   // Compliances State
//   const [compliances, setCompliances] = useState<{ [key: string]: boolean }>(
//     {}
//   );

//   // Documents State - Use Set to prevent duplicates
//   const [documents, setDocuments] = useState<FileData[]>([]);
//   const [existingDocuments, setExistingDocuments] = useState<
//     UploadedDocument[]
//   >([]);

//   // Payment State
//   const [selectedMethod, setSelectedMethod] = useState("stripe");
//   const [showStripeModal, setShowStripeModal] = useState(false);
//   const SUBSCRIPTION_AMOUNT = 9900;

//   // Track completed steps
//   const [completedSteps, setCompletedSteps] = useState<Set<Tab>>(new Set());

//   // Error states
//   const [errors, setErrors] = useState<{
//     propertyName?: string;
//     propertyAddress?: string;
//     description?: string;
//     images?: string;
//     compliances?: string;
//     documents?: string;
//   }>({});

//   // Refs for file inputs
//   const governmentIdRef = useRef<HTMLInputElement>(null);
//   const ownershipProofRef = useRef<HTMLInputElement>(null);
//   const safetyPermitsRef = useRef<HTMLInputElement>(null);
//   const insuranceRef = useRef<HTMLInputElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // Check if payment is completed - FIXED dependency
//   const isPaymentCompleted = useMemo(() => 
//     applicationData?.payments?.some(
//       (payment) => payment.status === "COMPLETED"
//     ) || false,
//     [applicationData?.payments]
//   );

//   // Filter tabs based on payment status
//   const availableTabs: Tab[] = useMemo(() => 
//     isPaymentCompleted
//       ? ["property", "compliances", "documents"]
//       : ["property", "compliances", "documents", "payment"],
//     [isPaymentCompleted]
//   );

//   const handleClose = useCallback(() => {
//     setIsVisible(false);
//     setTimeout(() => {
//       onClose();
//     }, 300);
//   }, [onClose]);

//   // Fix checklist fetching - only once when component mounts
//   useEffect(() => {
//     const fetchChecklist = async () => {
//       // Don't fetch if already loaded
//       if (checklistItems.length > 0 || loadingChecklist) return;
      
//       setLoadingChecklist(true);
//       try {
//         const response = await application.getCheckList();
//         if (response.success && response.data) {
//           let checklistData: ChecklistItem[] = [];

//           if (Array.isArray(response.data)) {
//             checklistData = response.data.map((item: ApiChecklistItem) => ({
//               id: item.id,
//               name: item.name,
//               description: item.description ?? null,
//             }));
//           } else if (response.data.data && Array.isArray(response.data.data)) {
//             checklistData = response.data.data.map((item: ApiChecklistItem) => ({
//               id: item.id,
//               name: item.name,
//               description: item.description ?? null,
//             }));
//           } else if (
//             response.data.checklists &&
//             Array.isArray(response.data.checklists)
//           ) {
//             checklistData = response.data.checklists.map(
//               (item: string, index: number) => ({
//                 id: index,
//                 name: item,
//                 description: null,
//               })
//             );
//           }

//           setChecklistItems(checklistData);

//           // Initialize compliances from existing data or set to false
//           const initialCompliances: { [key: string]: boolean } = {};
//           checklistData.forEach((item) => {
//             initialCompliances[item.name] = applicationData?.complianceChecklist?.[item.name] || false;
//           });
//           setCompliances(initialCompliances);
//         }
//       } catch (error) {
//         console.error("Error fetching checklist:", error);
//       } finally {
//         setLoadingChecklist(false);
//       }
//     };

//     fetchChecklist();
//   }, []); // Empty dependency array - fetch only once

//   // Fetch application data - FIXED to properly handle initial tab
//   useEffect(() => {
//     const fetchApplicationData = async () => {
//       setIsLoading(true);
      
//       const appId = applicationId;
      
//       if (!appId) {
//         setIsLoading(false);
//         toast.error("No application ID available");
//         return;
//       }

//       try {
//         const response = await application.getApplicationById(appId);
//         console.log("Fetch application from Edit drawer:", response);

//         if (response.success && response.data) {
//           const appData = ((response.data as { application?: ApplicationData })
//             .application ?? response.data) as ApplicationData;
//           setApplicationData(appData);
//           setCurrentStep(appData.currentStep);

//           // Initialize form data from application
//           if (appData.propertyDetails) {
//             setPropertyName(appData.propertyDetails.propertyName || "");
//             setPropertyAddress(appData.propertyDetails.address || "");
//             setDescription(appData.propertyDetails.description || "");
//             setExistingImages(appData.propertyDetails.images || []);
//           }

//           // Set existing documents only once
//           if (appData.documents) {
//             console.log("Setting existing documents:", appData.documents);
//             setExistingDocuments(appData.documents);
//           }

//           if (appData.complianceChecklist) {
//             setCompliances(prev => ({
//               ...prev,
//               ...appData.complianceChecklist
//             }));
//           }

//           // Mark completed tabs based on existing data
//           const completed = new Set<Tab>();
          
//           // Check if property step is complete (must have images)
//           const hasRequiredImages = (appData.propertyDetails?.images?.length || 0) >= 3;
//           if (appData.propertyDetails?.propertyName && 
//               appData.propertyDetails?.address && 
//               hasRequiredImages) {
//             completed.add("property");
//           }
          
//           if (appData.complianceChecklist && 
//               Object.keys(appData.complianceChecklist).length > 0) {
//             completed.add("compliances");
//           }
          
//           if (appData.documents && appData.documents.length >= 4) {
//             completed.add("documents");
//           }
          
//           if (appData.payments?.some(p => p.status === "COMPLETED")) {
//             completed.add("payment");
//           }
          
//           setCompletedSteps(completed);
          
//           // Set initial active tab based on what's incomplete
//           // If property step is incomplete, always go to property first
//           const tabs: Tab[] = ["property", "compliances", "documents", "payment"];
//           let initialTab: Tab = "property";
          
//           if (completed.has("property")) {
//             if (completed.has("compliances")) {
//               if (completed.has("documents")) {
//                 initialTab = appData.payments?.some(p => p.status === "COMPLETED") 
//                   ? "documents" 
//                   : "payment";
//               } else {
//                 initialTab = "documents";
//               }
//             } else {
//               initialTab = "compliances";
//             }
//           }
          
//           setActiveTab(initialTab);
//         }
//       } catch (error) {
//         console.error("Error fetching application data:", error);
//         toast.error("Failed to load application data");
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     if (applicationId) {
//       fetchApplicationData();
//     }
//   }, [applicationId]);

//   useEffect(() => {
//     setIsVisible(true);

//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         drawerRef.current &&
//         !drawerRef.current.contains(event.target as Node)
//       ) {
//         handleClose();
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [handleClose]);

//   const validateForm = (): boolean => {
//     const newErrors: typeof errors = {};

//     if (activeTab === "property") {
//       if (!propertyName.trim()) {
//         newErrors.propertyName = "Property name is required";
//       }
//       if (!propertyAddress.trim()) {
//         newErrors.propertyAddress = "Property address is required";
//       }
//       if (!description.trim()) {
//         newErrors.description = "Description is required";
//       }
//       // Check both existing and new images
//       const totalImages = existingImages.length + uploadedImages.length;
//       if (totalImages < 3) {
//         newErrors.images = "At least 3 images are required";
//       }
//     }

//     if (activeTab === "compliances") {
//       const allUnchecked = Object.values(compliances).every(
//         (checked) => !checked
//       );
//       if (allUnchecked) {
//         newErrors.compliances = "At least one compliance must be selected";
//       }
//     }

//     if (activeTab === "documents") {
//       // Check if we have all 4 document types
//       const allDocumentTypes = ["ID_DOCUMENT", "PROPERTY_DEED", "SAFETY_PERMIT", "INSURANCE_CERTIFICATE"];
//       const hasAllDocuments = allDocumentTypes.every(type => {
//         return documents.some(doc => doc.documentType === type) || 
//                existingDocuments.some(doc => doc.documentType === type);
//       });
      
//       if (!hasAllDocuments) {
//         newErrors.documents = "All required documents must be uploaded";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     // Don't allow uploads if there are existing images
//     if (existingImages.length > 0) {
//       toast.error("Images cannot be modified once uploaded");
//       return;
//     }

//     const files = Array.from(e.target.files || []);
//     const totalAfterUpload = files.length + uploadedImages.length;
    
//     if (totalAfterUpload > 5) {
//       toast.error("Maximum 5 images allowed");
//       return;
//     }

//     if (totalAfterUpload < 3) {
//       toast.error(`Upload at least ${3 - uploadedImages.length} more images`);
//       return;
//     }

//     const newImages = [...uploadedImages, ...files].slice(0, 5);
//     setUploadedImages(newImages);

//     const newPreviews = newImages.map((file) => URL.createObjectURL(file));
//     setPreviewImages(newPreviews);

//     if (newImages.length > 0) {
//       setErrors((prev) => ({ ...prev, images: undefined }));
//     }
//   };

//   const handleDocumentUpload = (type: FileData["documentType"], file: File) => {
//     // Check if there's an existing document of this type
//     const existingDoc = existingDocuments.find(
//       (doc) => doc.documentType === type
//     );

//     // Don't allow uploads if there's an existing document
//     if (existingDoc) {
//       toast.error(
//         `${documentTypeConfig[type].label} cannot be modified once uploaded`
//       );
//       return;
//     }

//     // Remove any pending upload for this type
//     const filteredDocuments = documents.filter(
//       (doc) => doc.documentType !== type
//     );

//     const newDocument: FileData = {
//       name: file.name,
//       size: file.size,
//       file: file,
//       documentType: type,
//       originalName: file.name,
//     };

//     setDocuments([...filteredDocuments, newDocument]);
//     setErrors((prev) => ({ ...prev, documents: undefined }));
//   };

//   const handleDocumentInputChange =
//     (type: FileData["documentType"]) =>
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (file) {
//         handleDocumentUpload(type, file);
//       }
//       // Clear the input value so the same file can be selected again
//       if (e.target) {
//         e.target.value = '';
//       }
//     };

//   const handleDocumentBoxClick = (type: FileData["documentType"]) => {
//     // Don't allow clicks if there's an existing document
//     const existingDoc = existingDocuments.find(
//       (doc) => doc.documentType === type
//     );
//     if (existingDoc) {
//       toast.error(
//         `${documentTypeConfig[type].label} cannot be modified once uploaded`
//       );
//       return;
//     }

//     const refs = {
//       ID_DOCUMENT: governmentIdRef,
//       PROPERTY_DEED: ownershipProofRef,
//       SAFETY_PERMIT: safetyPermitsRef,
//       INSURANCE_CERTIFICATE: insuranceRef,
//     };
//     refs[type].current?.click();
//   };

//   const getDocumentByType = (type: FileData["documentType"]) => {
//     return documents.find((doc) => doc.documentType === type);
//   };

//   const getExistingDocumentByType = (type: string) => {
//     return existingDocuments.find((doc) => doc.documentType === type);
//   };

//   const handleUpload = () => {
//     // Don't allow uploads if there are existing images
//     if (existingImages.length > 0) {
//       toast.error("Images cannot be modified once uploaded");
//       return;
//     }
//     inputRef.current?.click();
//   };

//   const uploadFiles = async (applicationId: string, files: File[]): Promise<string[]> => {
//     if (files.length === 0) return [];

//     try {
//       const uploadFormData = new FormData();
//       files.forEach((file) => {
//         uploadFormData.append(`images`, file);
//       });

//       const response = await application.uploadImage(applicationId, uploadFormData);

//       if (!response.data) {
//         throw new Error("No response data received from server");
//       }

//       let uploadedUrls: string[] = [];

//       if (Array.isArray(response.data)) {
//         uploadedUrls = response.data
//           .map((item) => {
//             if (typeof item === "string") return item;
//             if (item && typeof item === 'object' && 'url' in item) return String(item.url);
//             if (item && typeof item === 'object' && 'path' in item) return String(item.path);
//             if (item && typeof item === 'object' && 'key' in item) return String(item.key);
//             return "";
//           })
//           .filter(Boolean);
//       } else {
//         const data = response.data as {
//           uploaded?: unknown[];
//           files?: unknown[];
//           images?: unknown[];
//         };
//         const items = data.uploaded || data.files || data.images;

//         if (items && Array.isArray(items)) {
//           uploadedUrls = items
//             .map((item) => {
//               if (typeof item === "string") return item;
//               if (item && typeof item === 'object' && 'url' in item) return String(item.url);
//               if (item && typeof item === 'object' && 'path' in item) return String(item.path);
//               if (item && typeof item === 'object' && 'key' in item) return String(item.key);
//               return "";
//             })
//             .filter(Boolean);
//         }
//       }

//       if (uploadedUrls.length === 0) {
//         throw new Error("No valid image URLs received from server");
//       }

//       return uploadedUrls;
//     } catch (error) {
//       console.error("Image upload error:", error);
//       throw new Error(
//         error instanceof Error
//           ? `Failed to upload images: ${error.message}`
//           : "Failed to upload images due to server error"
//       );
//     }
//   };

//   const uploadDocuments = async (applicationId: string, files: FileData[]): Promise<UploadedDocument[]> => {
//     if (files.length === 0) return [];

//     try {
//       // Create form data with ALL documents (replacing existing ones)
//       const formData = new FormData();
      
//       files.forEach((fileData) => {
//         formData.append("files", fileData.file);
//         formData.append("documentType", fileData.documentType);
//         formData.append("originalNames", fileData.originalName);
//       });

//       // This API call should replace existing documents, not append
//       const response = await application.uploadDocuments(applicationId, formData);

//       if (!response.data) {
//         throw new Error("No response data received from document upload");
//       }

//       // Return the complete set of documents (should include all 4 types)
//       const uploadedDocs = Array.isArray(response.data) ? response.data : [];
      
//       console.log("Uploaded documents from API:", uploadedDocs);
      
//       return uploadedDocs;
//     } catch (error) {
//       console.error("Document upload error:", error);
//       throw new Error(
//         error instanceof Error
//           ? `Failed to upload documents: ${error.message}`
//           : "Failed to upload documents due to server error"
//       );
//     }
//   };

//   const updateCurrentStep = async (): Promise<boolean> => {
//     setIsUpdating(true);
//     const toastId = toast.loading("Saving application data...");

//     try {
//       const appId = applicationId;
      
//       if (!appId || appId === "null") {
//         throw new Error("Application ID is missing. Please refresh the page.");
//       }

//       let imageUrls: string[] = [...existingImages];
      
//       // Only upload new images if there are no existing ones
//       if (uploadedImages.length > 0 && existingImages.length === 0) {
//         const newImageUrls = await uploadFiles(appId, uploadedImages);
//         imageUrls = [...imageUrls, ...newImageUrls];
//       }

//       // FIX FOR DUPLICATE DOCUMENTS:
//       // If we have documents to upload, upload ALL documents (not just new ones)
//       let allDocuments: UploadedDocument[] = [];
      
//       if (documents.length > 0) {
//         // Get existing documents that are NOT being replaced
//         const documentsToKeep = existingDocuments.filter(
//           existingDoc => !documents.some(newDoc => 
//             newDoc.documentType === existingDoc.documentType
//           )
//         );
        
//         // Upload new/replacement documents
//         const uploadedDocs = await uploadDocuments(appId, documents);
        
//         // Combine: keep documents that weren't replaced + newly uploaded documents
//         allDocuments = [...documentsToKeep, ...uploadedDocs];
        
//         console.log("Combined documents:", {
//           kept: documentsToKeep.length,
//           uploaded: uploadedDocs.length,
//           total: allDocuments.length
//         });
//       } else {
//         // If no new documents, keep existing ones
//         allDocuments = [...existingDocuments];
//       }

//       // Ensure we have exactly 4 documents (one of each type)
//       const requiredTypes = ["ID_DOCUMENT", "PROPERTY_DEED", "SAFETY_PERMIT", "INSURANCE_CERTIFICATE"];
//       const finalDocuments = requiredTypes.map(type => {
//         const existing = allDocuments.find(doc => doc.documentType === type);
//         return existing || {
//           id: undefined,
//           documentType: type,
//           fileName: "",
//           originalName: "",
//           mimeType: "application/octet-stream",
//           size: 0,
//           url: ""
//         };
//       }).filter(doc => doc.fileName); // Remove empty documents

//       console.log("Final documents for API:", finalDocuments);

//       // Format documents for API with all required fields
//       const formattedDocuments = finalDocuments.map((doc) => ({
//         id: doc.id || undefined,
//         documentType: doc.documentType,
//         fileName: doc.fileName,
//         originalName: doc.originalName || doc.fileName.split('/').pop() || "document",
//         mimeType: doc.mimeType || "application/octet-stream",
//         size: doc.size || 0,
//         url: doc.url || "",
//       }));

//       // Ensure we have valid propertyType ID
//       const propertyTypeId = applicationData?.propertyDetails?.propertyType || 
//                             (typeof applicationData?.propertyDetails?.propertyType === 'string' && 
//                              applicationData.propertyDetails.propertyType !== "RESIDENTIAL" ? 
//                              applicationData.propertyDetails.propertyType : 
//                              "5d218053-bdd0-43a2-a532-aa8764e29db2");

//       const stepData = {
//         propertyDetails: {
//           propertyName,
//           address: propertyAddress,
//           description,
//           images: imageUrls,
//           propertyType: propertyTypeId,
//           ownership: applicationData?.propertyDetails?.ownership || "OWNED",
//           rent: applicationData?.propertyDetails?.rent || 18500,
//           bedrooms: applicationData?.propertyDetails?.bedrooms || 20,
//           bathrooms: applicationData?.propertyDetails?.bathrooms || 20,
//           currency: applicationData?.propertyDetails?.currency || "AED",
//           maxGuests: applicationData?.propertyDetails?.maxGuests || 20,
//         },
//         complianceChecklist: compliances,
//         documents: formattedDocuments,
//       };

//       const stepNameMap: Record<Tab, string> = {
//         property: "PROPERTY_DETAILS",
//         compliances: "COMPLIANCE_CHECKLIST",
//         documents: "DOCUMENT_UPLOAD",
//         payment: "PAYMENT",
//       };

//       const updatePayload = {
//         step: stepNameMap[activeTab],
//         data: stepData,
//       };

//       console.log("Sending update payload with documents:", formattedDocuments.length, "documents");

//       const stepResponse = await application.updateStep(appId, updatePayload);

//       if (stepResponse.success) {
//         // Refresh application data from API after successful update
//         const refreshResponse = await application.getApplicationById(appId);
        
//         if (refreshResponse.success && refreshResponse.data) {
//           const refreshedAppData = ((refreshResponse.data as { application?: ApplicationData })
//             .application ?? refreshResponse.data) as ApplicationData;
          
//           setApplicationData(refreshedAppData);
          
//           // Update local state with refreshed data
//           if (refreshedAppData.propertyDetails) {
//             setPropertyName(refreshedAppData.propertyDetails.propertyName || "");
//             setPropertyAddress(refreshedAppData.propertyDetails.address || "");
//             setDescription(refreshedAppData.propertyDetails.description || "");
            
//             if (refreshedAppData.propertyDetails.images) {
//               setExistingImages(refreshedAppData.propertyDetails.images);
//             }
//           }
          
//           if (refreshedAppData.documents) {
//             console.log("Setting refreshed documents:", refreshedAppData.documents);
//             setExistingDocuments(refreshedAppData.documents);
//           }
          
//           if (refreshedAppData.complianceChecklist) {
//             setCompliances(refreshedAppData.complianceChecklist);
//           }
//         }

//         setCompletedSteps((prev) => new Set(prev).add(activeTab));

//         // Clear temporary upload states
//         if (uploadedImages.length > 0 && existingImages.length === 0) {
//           setUploadedImages([]);
//           setPreviewImages([]);
//         }

//         // Clear temporary documents
//         if (documents.length > 0) {
//           setDocuments([]);
//         }

//         toast.success("Step completed successfully!", { id: toastId });
//         return true;
//       } else {
//         throw new Error(stepResponse.message || "Failed to update application");
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to update application",
//         { id: toastId }
//       );
//       return false;
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const submitFinalApplication = async (): Promise<boolean> => {
//     setIsUpdating(true);
//     const toastId = toast.loading("Submitting application...");

//     try {
//       const appId = applicationId;
      
//       if (!appId || appId === "null") {
//         throw new Error("No application found. Please refresh and try again.");
//       }

//       const response = await application.submitApplication(appId);

//       if (response.success) {
//         toast.success("Application submitted successfully!", { id: toastId });
        
//         // Optionally fetch updated application data
//         const updatedApp = await application.getApplicationById(appId);
//         if (updatedApp.success && updatedApp.data) {
//           setApplicationData(updatedApp.data as ApplicationData);
//         }
        
//         // Close the drawer after successful submission
//         setTimeout(() => {
//           handleClose();
//         }, 1500);
        
//         return true;
//       } else {
//         throw new Error(response.message || "Failed to submit application");
//       }
//     } catch (error) {
//       console.error("Submission error:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Failed to submit application",
//         { id: toastId }
//       );
//       return false;
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleNextStep = async () => {
//     if (!validateForm()) {
//       toast.error("Please fix the errors before proceeding");
//       return;
//     }

//     try {
//       if (activeTab !== "payment") {
//         const success = await updateCurrentStep();
//         if (!success) return;
//       }

//       const currentIndex = availableTabs.indexOf(activeTab);
//       const paymentCompleted = isPaymentCompleted;

//       if (currentIndex < availableTabs.length - 1) {
//         setActiveTab(availableTabs[currentIndex + 1]);
//       } else {
//         // If this is the documents tab and payment is already completed, submit
//         if (activeTab === "documents" && paymentCompleted) {
//           const submitSuccess = await submitFinalApplication();
//           if (submitSuccess) {
//             handleClose();
//           }
//         } 
//         // If this is the documents tab and payment is NOT completed, go to payment
//         else if (activeTab === "documents" && !paymentCompleted) {
//           setActiveTab("payment");
//         }
//         // If this is the payment tab, show the payment modal
//         else if (activeTab === "payment" && !paymentCompleted) {
//           setShowStripeModal(true);
//         }
//       }
//     } catch (error) {
//       console.error("Step progression error:", error);
//     }
//   };

//   const handlePreviousStep = () => {
//     const currentIndex = availableTabs.indexOf(activeTab);
//     if (currentIndex > 0) {
//       setActiveTab(availableTabs[currentIndex - 1]);
//     }
//   };

//   const handleComplianceToggle = (checklistName: string) => {
//     setCompliances((prev) => ({
//       ...prev,
//       [checklistName]: !prev[checklistName],
//     }));

//     if (errors.compliances) {
//       setErrors((prev) => ({ ...prev, compliances: undefined }));
//     }
//   };

//   useEffect(() => {
//     return () => {
//       previewImages.forEach((url) => URL.revokeObjectURL(url));
//       documents.forEach((doc) => {
//         if (doc.file) {
//           URL.revokeObjectURL(URL.createObjectURL(doc.file));
//         }
//       });
//     };
//   }, [previewImages, documents]);

//   const isLastStep =
//     activeTab === (isPaymentCompleted ? "documents" : "payment");

//   const documentTypeConfig = {
//     ID_DOCUMENT: {
//       label: "Government-issued ID",
//       description:
//         "Upload a valid ID (passport, national ID card, or driver's license) of the property owner.",
//       ref: governmentIdRef,
//     },
//     PROPERTY_DEED: {
//       label: "Property Ownership Proof",
//       description:
//         "Upload legal proof of ownership (title deed, property tax receipt, or utility bill under your name).",
//       ref: ownershipProofRef,
//     },
//     SAFETY_PERMIT: {
//       label: "Safety Permits",
//       description:
//         "Provide any required local safety approvals or compliance certificates.",
//       ref: safetyPermitsRef,
//     },
//     INSURANCE_CERTIFICATE: {
//       label: "Insurance Certificate",
//       description:
//         "Upload proof of active property insurance covering liability or damage.",
//       ref: insuranceRef,
//     },
//   };

//   // Fix the tab navigation issue - UPDATED to handle all cases properly
//   useEffect(() => {
//     // Only auto-navigate if we have application data
//     if (applicationData) {
//       // Check if payment is completed
//       const paymentCompleted = applicationData.payments?.some(
//         (payment) => payment.status === "COMPLETED"
//       ) || false;
      
//       // Set the correct active tab based on what's completed
//       if (paymentCompleted) {
//         // If payment is completed, go to documents tab for final submission
//         setActiveTab("documents");
//         setCompletedSteps(prev => new Set(prev).add("payment"));
//       } else {
//         // Otherwise follow the normal flow
//         const tabsToCheck: Tab[] = ["property", "compliances", "documents", "payment"];
//         const completedTabs: Tab[] = [];
        
//         // Check what's already completed
//         const hasRequiredImages = (applicationData.propertyDetails?.images?.length || 0) >= 3;
//         if (applicationData.propertyDetails?.propertyName && 
//             applicationData.propertyDetails?.address && 
//             hasRequiredImages) {
//           completedTabs.push("property");
//         }
        
//         if (applicationData.complianceChecklist && 
//             Object.keys(applicationData.complianceChecklist).length > 0) {
//           completedTabs.push("compliances");
//         }
        
//         if (applicationData.documents && 
//             applicationData.documents.length >= 4) {
//           completedTabs.push("documents");
//         }
        
//         if (paymentCompleted) {
//           completedTabs.push("payment");
//         }
        
//         // Set completed steps
//         setCompletedSteps(new Set(completedTabs));
        
//         // Set active tab to first incomplete tab
//         const incompleteTab = tabsToCheck.find(tab => !completedTabs.includes(tab));
//         if (incompleteTab) {
//           setActiveTab(incompleteTab);
//         } else {
//           // If all are complete, stay on documents
//           setActiveTab("documents");
//         }
//       }
//     }
//   }, [applicationData]);

//   // Debug: Log document states
//   useEffect(() => {
//     console.log("Documents state updated:", {
//       documentsCount: documents.length,
//       existingDocumentsCount: existingDocuments.length,
//       documents: documents.map(d => ({ type: d.documentType, name: d.name })),
//       existingDocuments: existingDocuments.map(d => ({ type: d.documentType, name: d.originalName }))
//     });
//   }, [documents, existingDocuments]);

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 z-[9000] min-h-[100vh] bg-black/80 flex items-center justify-center">
//         <div className="text-white">Loading application data...</div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`fixed inset-0 z-[9000] bg-black/80 min-h-[100vh] transition-opacity duration-300 ${
//         isVisible ? "opacity-100" : "opacity-0"
//       }`}
//     >
//       <div
//         ref={drawerRef}
//         className={`prevent-scroller overflow-auto max-w-[70vw] sm:max-w-[608px] absolute right-0 h-[100vh] bg-[#0A0C0B] z-[8000] p-[28px] top-0 flex flex-col justify-between text-white transition-transform duration-300 ${
//           isVisible ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <div className="space-y-5">
//           <h2 className="text-[16px] sm:text-[20px] leading-6 font-medium mb-3">
//             Complete Your Application
//           </h2>
//           <p className="text-[12px] sm:text-[16px] sm:leading-5 font-normal mb-10 text-[#FFFFFF99]">
//             Enter your property details and upload required documents to
//             complete your certification application.
//           </p>

//           {/* Tabs with completion status */}
//           <div className="flex gap-2 mb-6">
//             {availableTabs.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 rounded-lg text-[16px] cursor-pointer font-medium transition-colors relative ${
//                   activeTab === tab
//                     ? "bg-[#EFFC7614] text-white border border-[#EFFC76]"
//                     : completedSteps.has(tab)
//                     ? "bg-[#EFFC76] text-black border border-transparent"
//                     : "bg-gray-800 text-gray-300"
//                 }`}
//               >
//                 {tab === "property" && "Property"}
//                 {tab === "compliances" && "Compliances"}
//                 {tab === "documents" && "Documents"}
//                 {tab === "payment" && "Payment"}

//                 {completedSteps.has(tab) && (
//                   <Check className="w-3.5 p-0.5 h-3.5 absolute -top-1 -right-1 bg-[#EFFC76] text-black rounded-full" />
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Tab Content */}
//           {activeTab === "property" && (
//             <div className="space-y-4">
//               {/* Property form fields */}
//               <div>
//                 <label className="block text-[14px] leading-[18px] font-regular mb-[10px]">
//                   Property name
//                 </label>
//                 <input
//                   type="text"
//                   value={propertyName}
//                   onChange={(e) => setPropertyName(e.target.value)}
//                   className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
//                   placeholder="Enter property name"
//                 />
//                 {errors.propertyName && (
//                   <p className="text-red-500 text-[12px] mt-1">
//                     {errors.propertyName}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-[14px] leading-[18px] font-regular mb-[10px]">
//                   Property address
//                 </label>
//                 <input
//                   type="text"
//                   value={propertyAddress}
//                   onChange={(e) => setPropertyAddress(e.target.value)}
//                   className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
//                   placeholder="Enter property address"
//                 />
//                 {errors.propertyAddress && (
//                   <p className="text-red-500 text-[12px] mt-1">
//                     {errors.propertyAddress}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-[14px] leading-[18px] font-regular mb-[10px]">
//                   Description
//                 </label>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   className="w-full p-3 text-[12px] sm:text-[14px] rounded-[10px] resize-none placeholder:text-white/40 focus:outline-none bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] h-24"
//                   placeholder="Enter property description"
//                 />
//                 {errors.description && (
//                   <p className="text-red-500 text-[12px] mt-1">
//                     {errors.description}
//                   </p>
//                 )}
//               </div>

//               {/* Image Upload Section */}
//               <div
//                 onClick={handleUpload}
//                 className={`border-2 rounded-[10px] p-6 ${
//                   existingImages.length > 0
//                     ? "border-green-500 cursor-not-allowed bg-green-500/10"
//                     : "border-dashed border-[#EFFC76] cursor-pointer"
//                 }`}
//               >
//                 <div className="flex flex-col items-center justify-center text-center">
//                   <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
//                     <Image
//                       src={"/images/upload.png"}
//                       alt={
//                         existingImages.length > 0
//                           ? "Upload complete"
//                           : "Upload image"
//                       }
//                       height={40}
//                       width={40}
//                     />
//                   </div>
//                   <p className="text-white text-[16px] font-regular mb-2">
//                     {existingImages.length > 0
//                       ? "Images Uploaded"
//                       : "Upload Images"}
//                   </p>
//                   <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
//                     {existingImages.length > 0
//                       ? "Images have been successfully uploaded and cannot be modified."
//                       : "Please upload a clear and readable file in PDF, JPG, or PNG format. The maximum file size allowed is 10MB."}
//                   </p>
//                   {existingImages.length === 0 && (
//                     <label className="cursor-pointer">
//                       <input
//                         ref={inputRef}
//                         type="file"
//                         multiple
//                         accept="image/*"
//                         className="hidden"
//                         onChange={handleImageUpload}
//                       />
//                     </label>
//                   )}
//                 </div>
//               </div>

//               {errors.images && (
//                 <p className="text-red-500 text-[12px] mt-1">{errors.images}</p>
//               )}

//               <div className="flex items-start gap-2 text-[#FFB52B] text-[14px] font-regular">
//                 <Image
//                   src="/images/warning.svg"
//                   alt="warning"
//                   height={20}
//                   width={20}
//                 />
//                 <span>Upload at least 3 images for faster approval.</span>
//               </div>

//               <div className="flex justify-center">
//                 {existingImages.length > 0 && (
//                   <div className="flex gap-2 mb-4 w-full">
//                     {existingImages.map((url, idx) => (
//                       <div
//                         key={idx}
//                         className="relative w-20 h-20 rounded-lg overflow-hidden"
//                       >
//                         <Image
//                           src={url}
//                           alt={`Existing ${idx + 1}`}
//                           fill
//                           className="object-cover"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {previewImages.length > 0 && (
//                   <div className="flex gap-2 mb-4 w-full">
//                     {previewImages.map((url, idx) => (
//                       <div
//                         key={idx}
//                         className="relative w-20 h-20 rounded-lg overflow-hidden"
//                       >
//                         <Image
//                           src={url}
//                           alt={`Preview ${idx + 1}`}
//                           fill
//                           className="object-cover"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "compliances" && (
//             <div className="space-y-4">
//               <h3 className="text-white text-[18px] font-medium">
//                 Compliances Checklist
//               </h3>

//               {loadingChecklist ? (
//                 <div className="text-center py-8">
//                   <p className="text-white">Loading checklist...</p>
//                 </div>
//               ) : (
//                 <>
//                   {errors.compliances && (
//                     <p className="text-red-500 text-[12px] mb-2">
//                       {errors.compliances}
//                     </p>
//                   )}

//                   <div className="grid grid-cols-1 gap-3">
//                     {checklistItems.map((item) => (
//                       <div
//                         key={item.id}
//                         onClick={() => handleComplianceToggle(item.name)}
//                         className="flex items-center justify-between p-3 rounded-[10px] bg-[radial-gradient(75%_81%_at_50%_18.4%,_#202020_0%,_#101010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] cursor-pointer"
//                       >
//                         <div className="flex-1">
//                           <span className="text-white text-[14px] font-regular">
//                             {item.name}
//                           </span>
//                           {item.description && (
//                             <p className="text-[#FFFFFF99] text-[12px] mt-1">
//                               {item.description}
//                             </p>
//                           )}
//                         </div>
//                         <div
//                           className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
//                             compliances[item.name]
//                               ? "bg-[#EFFC76] border-[#EFFC76]"
//                               : "border-white/20"
//                           }`}
//                         >
//                           {compliances[item.name] && (
//                             <Check className="w-3 h-3 text-black" />
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {checklistItems.length === 0 && (
//                     <div className="text-center py-8 text-[#FFFFFF99]">
//                       No checklist items available for this property type.
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}

//           {activeTab === "documents" && (
//             <div className="space-y-4">
//               {errors.documents && (
//                 <p className="text-red-500 text-[12px] mb-2">
//                   {errors.documents}
//                 </p>
//               )}

//               {/* Show only 4 document boxes as in your original design */}
//               {Object.entries(documentTypeConfig).map(([type, config]) => {
//                 const currentDoc = getDocumentByType(
//                   type as FileData["documentType"]
//                 );
//                 const existingDoc = getExistingDocumentByType(type);
//                 const hasDocument = currentDoc || existingDoc;
//                 const previewUrl = currentDoc
//                   ? URL.createObjectURL(currentDoc.file)
//                   : existingDoc?.url;
//                 const isLocked = !!existingDoc;

//                 return (
//                   <div
//                     key={type}
//                     onClick={() =>
//                       !isLocked &&
//                       handleDocumentBoxClick(type as FileData["documentType"])
//                     }
//                     className={`border-2 rounded-[10px] h-[200px] overflow-hidden ${
//                       isLocked
//                         ? "border-green-500 cursor-not-allowed bg-green-500/10"
//                         : "border-dashed border-[#EFFC76] cursor-pointer hover:bg-[#EFFC7610]"
//                     }`}
//                   >
//                     <input
//                       ref={config.ref}
//                       type="file"
//                       className="hidden"
//                       onChange={handleDocumentInputChange(
//                         type as FileData["documentType"]
//                       )}
//                       accept=".pdf,.jpg,.jpeg,.png"
//                       disabled={isLocked}
//                     />

//                     {hasDocument && previewUrl ? (
//                       <div className="w-full h-full relative">
//                         <Image
//                           src={previewUrl}
//                           alt={config.label}
//                           fill
//                           className="object-cover"
//                         />
//                         <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
//                           <p className="text-[#EFFC76] text-[11px] font-medium text-center">
//                             ✓ {config.label} Uploaded
//                           </p>
//                           <p className="text-white text-[10px] text-center mt-1">
//                             {currentDoc?.name || existingDoc?.originalName}
//                           </p>
//                           <p className="text-[#FFFFFF99] text-[9px] text-center mt-1">
//                             {isLocked
//                               ? "Document cannot be modified"
//                               : "Click to change file"}
//                           </p>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="flex flex-col items-center justify-center text-center h-full p-6">
//                         <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
//                           <Image
//                             src={
//                               isLocked
//                                 ? "/images/check-circle.svg"
//                                 : "/images/upload.png"
//                             }
//                             alt={
//                               isLocked ? "Document uploaded" : "Upload document"
//                             }
//                             height={40}
//                             width={40}
//                           />
//                         </div>
//                         <p className="text-white text-[16px] font-regular mb-2">
//                           {config.label}
//                         </p>
//                         <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
//                           {isLocked
//                             ? "Document has been successfully uploaded and cannot be modified."
//                             : config.description}
//                         </p>
//                         {!isLocked && (
//                           <span className="text-[#EFFC76] text-[11px] font-medium">
//                             Upload
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {activeTab === "payment" && !isPaymentCompleted && (
//             <div className="space-y-6">
//               <h3 className="text-white text-[18px] font-medium">
//                 Choose Your Payment Method
//               </h3>
//               <p className="text-[#FFFFFF99] text-[14px] font-regular">
//                 Select the most convenient option to securely complete your
//                 subscription payment.
//               </p>

//               {/* Stripe Payment */}
//               <label
//                 className={`flex items-center sm:gap-[38px] justify-between rounded-lg p-4 cursor-pointer ${
//                   selectedMethod === "stripe"
//                     ? "border-[#9ba44f] border bg-[#1c1f14]"
//                     : "bg-transparent bg-gradient-to-b from-[#202020] to-[#101010]"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <Image
//                     src="/images/stripe-logo.svg"
//                     alt="Stripe payment"
//                     width={64}
//                     height={64}
//                   />
//                   <div>
//                     <h4 className="text-white text-[14px] sm:text-[16px] font-regular leading-5">
//                       Stripe Payment
//                     </h4>
//                     <p className="text-white/60 font-regular text-[10px] sm:text-[12px] pt-2 max-w-[215px]">
//                       Secure payment with credit/debit card via Stripe
//                     </p>
//                   </div>
//                 </div>

//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="stripe"
//                   checked={selectedMethod === "stripe"}
//                   onChange={() => setSelectedMethod("stripe")}
//                   className="w-5 h-5 accent-[#EFFC76] cursor-pointer"
//                 />
//               </label>

//               {/* Stripe Payment Details */}
//               {selectedMethod === "stripe" && (
//                 <div className="mt-4">
//                   <div className="bg-gradient-to-b from-[#202020] to-[#101010] border border-[#4a4a4a] rounded-lg p-6">
//                     <div className="flex items-center justify-between mb-6">
//                       <div>
//                         <h4 className="text-white font-semibold text-lg">
//                           Subscription Amount
//                         </h4>
//                         <p className="text-white/60 text-sm mt-1">
//                           One-time certification fee
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-3xl font-bold text-[#EFFC76]">
//                           ${(SUBSCRIPTION_AMOUNT / 100).toFixed(2)}
//                         </p>
//                         <p className="text-white/40 text-xs mt-1">USD</p>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => setShowStripeModal(true)}
//                       className="w-full py-4 bg-gradient-to-b from-[#EFFC76] to-[#d4e05c] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
//                     >
//                       <Image
//                         src="/images/stripe-logo.svg"
//                         alt="Stripe"
//                         width={50}
//                         height={20}
//                       />
//                       <span>Pay with Stripe</span>
//                     </button>

//                     <div className="flex items-center gap-2 mt-4 justify-center text-xs text-white/40">
//                       <Image
//                         src="/images/lock.png"
//                         alt="secure"
//                         width={12}
//                         height={12}
//                       />
//                       <span>Secure payment powered by Stripe</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Navigation buttons */}
//         <div className="mt-6 flex gap-3">
//           {activeTab !== availableTabs[0] && (
//             <button
//               onClick={handlePreviousStep}
//               disabled={isUpdating}
//               className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               <ChevronLeft className="w-4 h-4" />
//               Previous
//             </button>
//           )}

//           <button
//             onClick={handleNextStep}
//             disabled={isUpdating}
//             className={`flex-1 py-3 bg-[#EFFC76] text-[#121315] rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
//               activeTab === availableTabs[0] ? "flex-1" : "flex-1"
//             }`}
//           >
//             {isUpdating
//               ? "Saving..."
//               : activeTab === "documents" && isPaymentCompleted
//               ? "Submit Application"
//               : activeTab === "documents" && !isPaymentCompleted
//               ? "Proceed to Payment"
//               : activeTab === "payment" && !isPaymentCompleted
//               ? "Pay Now"
//               : "Next Step"}
//             {!isLastStep && <ChevronRight className="w-4 h-4" />}
//           </button>
//         </div>

//         {/* Stripe Payment Modal */}
//         <StripePaymentModal
//           isOpen={showStripeModal}
//           applicationId={applicationId}
//           onClose={() => {
//             setShowStripeModal(false);
//           }}
//           onSuccess={() => {
//             setShowStripeModal(false);
//             setCompletedSteps((prev) => new Set(prev).add("payment"));
            
//             // Refresh application data to get updated payment status
//             if (applicationId) {
//               setTimeout(() => {
//                 application.getApplicationById(applicationId).then((response) => {
//                   if (response.success && response.data) {
//                     const appData = ((response.data as { application?: ApplicationData })
//                       .application ?? response.data) as ApplicationData;
//                     setApplicationData(appData);
                    
//                     // After payment success, go back to documents tab for final submission
//                     setActiveTab("documents");
//                   }
//                 });
//               }, 1000);
//             }
            
//             toast.success("Payment successful! You can now submit your application.");
//           }}
//           amount={SUBSCRIPTION_AMOUNT}
//           currency="USD"
//         />
//       </div>
//     </div>
//   );
// }



"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { application } from "@/app/api/Host/application"; 
import StripePaymentModal from "@/app/(user-dashboard)/listing/(components)/StripePaymentModal";

type Tab = "property" | "compliances" | "documents" | "payment";

interface ChecklistItem {
  id: string | number;
  name: string;
  description: string | null;
}

interface ApiChecklistItem {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface FileData {
  name: string;
  size: number;
  file: File;
  documentType: "ID_DOCUMENT" | "SAFETY_PERMIT" | "INSURANCE_CERTIFICATE" | "PROPERTY_DEED";
  originalName: string;
  documentId?: string;
}

interface UploadedDocument {
  id?: string;
  documentType: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url?: string;
}

interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

interface ApplicationData {
  id: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  currentStep: string;
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
  payments?: Payment[];
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
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Property Details State
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Compliances State
  const [compliances, setCompliances] = useState<{ [key: string]: boolean }>({});

  // Documents State
  const [documents, setDocuments] = useState<FileData[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<UploadedDocument[]>([]);

  // Payment State
  const [selectedMethod, setSelectedMethod] = useState("stripe");
  const [showStripeModal, setShowStripeModal] = useState(false);
  const SUBSCRIPTION_AMOUNT = 9900;

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

  // Check if payment is completed - FIXED with useMemo
  const isPaymentCompleted = useMemo(() => 
    applicationData?.payments?.some(
      payment => payment.status === "COMPLETED"
    ) || false,
    [applicationData?.payments]
  );

  // Filter tabs based on payment status
  const availableTabs: Tab[] = useMemo(() => 
    isPaymentCompleted
      ? ["property", "compliances", "documents"]
      : ["property", "compliances", "documents", "payment"],
    [isPaymentCompleted]
  );

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
          checklistData = response.data.checklists.map((item: string, index: number) => ({
            id: index,
            name: item,
            description: null
          }));
        }

        setChecklistItems(checklistData);
        
        const initialCompliances: { [key: string]: boolean } = {};
        checklistData.forEach(item => {
          initialCompliances[item.name] = false;
        });
        setCompliances(initialCompliances);
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
    } finally {
      setLoadingChecklist(false);
    }
  };

  // Determine which tab is in progress
  const determineActiveTab = (appData: ApplicationData): Tab => {
    // Step mapping from API step names to our tab names
    const stepToTabMap: Record<string, Tab> = {
      "PROPERTY_DETAILS": "property",
      "COMPLIANCE_CHECKLIST": "compliances", 
      "DOCUMENT_UPLOAD": "documents",
      "PAYMENT": "payment"
    };

    // First, try to use the currentStep from API
    if (appData.currentStep && stepToTabMap[appData.currentStep]) {
      return stepToTabMap[appData.currentStep];
    }

    // If no currentStep or mapping not found, determine based on completed steps
    const tabsToCheck: Tab[] = ["property", "compliances", "documents", "payment"];
    
    // Check what's already completed
    const hasRequiredImages = (appData.propertyDetails?.images?.length || 0) >= 3;
    const propertyComplete = appData.propertyDetails?.propertyName && 
                             appData.propertyDetails?.address && 
                             hasRequiredImages;
    
    const compliancesComplete = appData.complianceChecklist && 
                               Object.keys(appData.complianceChecklist).length > 0;
    
    const documentsComplete = appData.documents && 
                             appData.documents.length >= 4;
    
    const paymentComplete = isPaymentCompleted;

    // Find the first incomplete tab
    if (!propertyComplete) return "property";
    if (!compliancesComplete) return "compliances";
    if (!documentsComplete) return "documents";
    if (!paymentComplete) return "payment";
    
    // If all are complete, default to documents for final review
    return "documents";
  };

  // Fetch application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      let appId = applicationId;
      
      if (!appId) {
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
          setApplicationData(appData);

          if (appData.propertyDetails) {
            setPropertyName(appData.propertyDetails.propertyName || "");
            setPropertyAddress(appData.propertyDetails.address || "");
            setDescription(appData.propertyDetails.description || "");
            
            if (appData.propertyDetails.images && appData.propertyDetails.images.length > 0) {
              setExistingImages(appData.propertyDetails.images);
            }
          }

          if (appData.documents && appData.documents.length > 0) {
            setExistingDocuments(appData.documents);
          }

          await fetchChecklist();
          
          if (appData.complianceChecklist) {
            setCompliances(appData.complianceChecklist);
          }

          const completed = new Set<Tab>();
          
          // Property step is complete if we have all required fields and images
          const hasRequiredImages = (appData.propertyDetails?.images?.length || 0) >= 3;
          if (appData.propertyDetails?.propertyName && 
              appData.propertyDetails?.address && 
              hasRequiredImages) {
            completed.add("property");
          }
          
          if (appData.complianceChecklist && Object.keys(appData.complianceChecklist).length > 0) {
            completed.add("compliances");
          }
          
          if (appData.documents && appData.documents.length >= 4) {
            completed.add("documents");
          }
          
          if (appData.payments?.some(payment => payment.status === "COMPLETED")) {
            completed.add("payment");
          }
          
          setCompletedSteps(completed);
          
          // Determine which tab should be active based on progress
          const tabToShow = determineActiveTab(appData);
          setActiveTab(tabToShow);
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
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
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
      // Check both existing and new images
      const totalImages = existingImages.length + uploadedImages.length;
      if (totalImages < 3) {
        newErrors.images = "At least 3 images are required";
      }
    }

    if (activeTab === "compliances") {
      const allUnchecked = Object.values(compliances).every(checked => !checked);
      if (allUnchecked) {
        newErrors.compliances = "At least one compliance must be selected";
      }
    }

    if (activeTab === "documents") {
      // Check if we have all 4 document types
      const allDocumentTypes = ["ID_DOCUMENT", "PROPERTY_DEED", "SAFETY_PERMIT", "INSURANCE_CERTIFICATE"];
      const hasAllDocuments = allDocumentTypes.every(type => {
        return documents.some(doc => doc.documentType === type) || 
               existingDocuments.some(doc => doc.documentType === type);
      });
      
      if (!hasAllDocuments) {
        newErrors.documents = "All required documents must be uploaded";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow uploads if there are existing images
    if (existingImages.length > 0) {
      // toast.error("Images cannot be modified once uploaded");
      return;
    }

    const files = Array.from(e.target.files || []);
    const totalAfterUpload = files.length + uploadedImages.length + existingImages.length;
    
    if (totalAfterUpload > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    if (totalAfterUpload < 3) {
      toast.error(`Upload at least ${3 - (uploadedImages.length + existingImages.length)} more images`);
      return;
    }

    const newImages = [...uploadedImages, ...files].slice(0, 5 - existingImages.length);
    setUploadedImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(newPreviews);

    if (newImages.length > 0 || existingImages.length > 0) {
      setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleDocumentUpload = (type: FileData['documentType'], file: File) => {
    // Check if there's an existing document of this type
    const existingDoc = existingDocuments.find(doc => doc.documentType === type);
    
    // Don't allow uploads if there's an existing document
    if (existingDoc) {
      toast.error(`${documentTypeConfig[type].label} cannot be modified once uploaded`);
      return;
    }
    
    // Remove any pending upload for this type
    const filteredDocuments = documents.filter(doc => doc.documentType !== type);
    
    const newDocument: FileData = {
      name: file.name,
      size: file.size,
      file: file,
      documentType: type,
      originalName: file.name,
    };

    setDocuments([...filteredDocuments, newDocument]);
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
    // Don't allow clicks if there's an existing document
    const existingDoc = existingDocuments.find(doc => doc.documentType === type);
    if (existingDoc) {
      toast.error(`${documentTypeConfig[type].label} cannot be modified once uploaded`);
      return;
    }

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
    // Don't allow uploads if there are existing images
    if (existingImages.length > 0) {
      toast.error("Images cannot be modified once uploaded");
      return;
    }
    inputRef.current?.click();
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    try {
      const uploadFormData = new FormData();
      files.forEach((file) => {
        uploadFormData.append(`images`, file);
      });

      // Pass the application ID to uploadImage
      const response = await application.uploadImage(applicationId || "", uploadFormData);

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

      // Pass the application ID to uploadDocuments
      const response = await application.uploadDocuments(applicationId || "", formData);

      if (!response.data) {
        throw new Error("No response data received from document upload");
      }

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
      
      // Use applicationId from props instead of localStorage
      if (!applicationId) {
        throw new Error("No application found. Please create an application first.");
      }

      let imageUrls: string[] = [...existingImages];
      const finalDocuments = [...existingDocuments];

      // Only upload new images if there are no existing ones
      if (uploadedImages.length > 0 && existingImages.length === 0) {
        const newImageUrls = await uploadFiles(uploadedImages);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Only upload new documents
      if (documents.length > 0) {
        const newDocs = await uploadDocuments(documents);
        
        // Add new documents to final documents
        newDocs.forEach(newDoc => {
          finalDocuments.push(newDoc);
        });
        
        setExistingDocuments(finalDocuments);
        setDocuments([]);
      }

      // Format documents for API
      const formattedDocuments = finalDocuments.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        url: doc.url
      }));

      const stepData = {
        propertyDetails: {
          propertyName,
          address: propertyAddress,
          description,
          images: imageUrls,
          propertyType: localApplicationData?.propertyDetails?.propertyType || "RESIDENTIAL",
          ownership: localApplicationData?.propertyDetails?.ownership || "OWNED",
          rent: localApplicationData?.propertyDetails?.rent || 18500,
          bedrooms: localApplicationData?.propertyDetails?.bedrooms || 20,
          bathrooms: localApplicationData?.propertyDetails?.bathrooms || 20,
          currency: localApplicationData?.propertyDetails?.currency || "AED",
          maxGuests: localApplicationData?.propertyDetails?.maxGuests || 20,
          complianceChecklist: compliances,
          documents: formattedDocuments
        }
      };

      const stepNameMap: Record<Tab, string> = {
        property: "PROPERTY_DETAILS",
        compliances: "COMPLIANCE_CHECKLIST", 
        documents: "DOCUMENT_UPLOAD",
        payment: "PAYMENT"
      };

      const updatePayload = {
        step: stepNameMap[activeTab],
        data: stepData
      };

      // Pass the application ID to updateStep
      const stepResponse = await application.updateStep(applicationId, updatePayload);

      if (stepResponse.success) {
        const updatedAppData = {
          ...localApplicationData,
          ...stepData,
          complianceChecklist: compliances,
          documents: existingDocuments
        };
        localStorage.setItem("applicationData", JSON.stringify(updatedAppData));
        
        setCompletedSteps(prev => new Set(prev).add(activeTab));
        
        if (uploadedImages.length > 0 && existingImages.length === 0) {
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
      // Use applicationId from props
      if (!applicationId) {
        throw new Error("No application found.");
      }

      // Pass the application ID to submitApplication
      const response = await application.submitApplication(applicationId);

      if (response.success) {
        toast.success("Application submitted successfully!", { id: toastId });
        localStorage.removeItem("applicationData");
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
      if (activeTab !== "payment") {
        const success = await updateCurrentStep();
        if (!success) return;
      }

      const currentIndex = availableTabs.indexOf(activeTab);
      
      if (currentIndex < availableTabs.length - 1) {
        setActiveTab(availableTabs[currentIndex + 1]);
      } else {
        // If this is the documents tab and payment is already completed, submit
        if (activeTab === "documents" && isPaymentCompleted) {
          const submitSuccess = await submitFinalApplication();
          if (submitSuccess) {
            handleClose();
          }
        } 
        // If this is the documents tab and payment is NOT completed, go to payment
        else if (activeTab === "documents" && !isPaymentCompleted) {
          setActiveTab("payment");
        }
        // If this is the payment tab, show the payment modal
        else if (activeTab === "payment" && !isPaymentCompleted) {
          setShowStripeModal(true);
        }
        // If all steps are complete, submit
        else if (completedSteps.has("property") && 
                 completedSteps.has("compliances") && 
                 completedSteps.has("documents") && 
                 completedSteps.has("payment")) {
          const submitSuccess = await submitFinalApplication();
          if (submitSuccess) {
            handleClose();
          }
        }
      }
    } catch (error) {
      console.error("Step progression error:", error);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = availableTabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(availableTabs[currentIndex - 1]);
    }
  };

  const handleComplianceToggle = (checklistName: string) => {
    setCompliances(prev => ({
      ...prev,
      [checklistName]: !prev[checklistName]
    }));
    
    if (errors.compliances) {
      setErrors(prev => ({ ...prev, compliances: undefined }));
    }
  };

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

  const isLastStep = activeTab === (isPaymentCompleted ? "documents" : "payment");

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
      <div className="fixed inset-0 z-[9000] min-h-[100vh] bg-black/80 flex items-center justify-center">
        <div className="text-white">Loading application data...</div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[9000] bg-black/80 min-h-[100vh] transition-opacity duration-300 ${
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
            {availableTabs.map((tab) => (
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
                {tab === "property" && "Property"}
                {tab === "compliances" && "Compliances"}
                {tab === "documents" && "Documents"}
                {tab === "payment" && "Payment"}
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

              {/* Image Upload Section - Disabled if images exist */}
              <div
                onClick={handleUpload}
                className={`border-2 rounded-[10px] p-6 ${
                  existingImages.length > 0 
                    ? "border-green-500 cursor-not-allowed bg-green-500/10" 
                    : "border-dashed border-[#EFFC76] cursor-pointer"
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <Image
                      src={"/images/upload.png"}
                      alt={existingImages.length > 0 ? "Upload complete" : "Upload image"}
                      height={40}
                      width={40} 
                    />
                  </div>
                  <p className="text-white text-[16px] font-regular mb-2">
                    {existingImages.length > 0 ? "Images Uploaded" : "Upload Images"}
                  </p>
                  <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                    {existingImages.length > 0 
                      ? "Images have been successfully uploaded and cannot be modified."
                      : "Please upload a clear and readable file in PDF, JPG, or PNG format. The maximum file size allowed is 10MB."
                    }
                  </p>
                  {existingImages.length === 0 && (
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
                  )}
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

              <div className="flex justify-center">
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

              {Object.entries(documentTypeConfig).map(([type, config]) => {
                const currentDoc = getDocumentByType(type as FileData['documentType']);
                const existingDoc = getExistingDocumentByType(type);
                const hasDocument = currentDoc || existingDoc;
                const previewUrl = currentDoc ? URL.createObjectURL(currentDoc.file) : existingDoc?.url;
                const isLocked = !!existingDoc;

                return (
                  <div
                    key={type}
                    onClick={() => !isLocked && handleDocumentBoxClick(type as FileData['documentType'])}
                    className={`border-2 rounded-[10px] p-0 overflow-hidden ${
                      isLocked 
                        ? "border-green-500 cursor-not-allowed bg-green-500/10" 
                        : "border-dashed border-[#EFFC76] cursor-pointer"
                    }`}
                    style={{ height: '200px' }}
                  >
                    <input
                      ref={config.ref}
                      type="file"
                      className="hidden"
                      onChange={handleDocumentInputChange(type as FileData['documentType'])}
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isLocked}
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
                            {isLocked ? "Document cannot be modified" : "Click to change file"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full p-6">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                          <Image
                            src={isLocked ? "/images/check-circle.svg" : "/images/upload.png"}
                            alt={isLocked ? "Document uploaded" : "Upload document"}
                            height={40}
                            width={40}
                          />
                        </div>
                        <p className="text-white text-[16px] font-regular mb-2">
                          {config.label}
                        </p>
                        <p className="text-[#FFFFFF99] text-[12px] font-regular mb-4 max-w-[346px] text-center">
                          {isLocked 
                            ? "Document has been successfully uploaded and cannot be modified."
                            : config.description
                          }
                        </p>
                        {!isLocked && (
                          <span className="text-[#EFFC76] text-[11px] font-medium">
                            Upload
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "payment" && !isPaymentCompleted && (
            <div className="space-y-6">
              <h3 className="text-white text-[18px] font-medium">
                Choose Your Payment Method
              </h3>
              <p className="text-[#FFFFFF99] text-[14px] font-regular">
                Select the most convenient option to securely complete your subscription payment.
              </p>

              {/* Stripe Payment */}
              <label
                className={`flex items-center sm:gap-[38px] justify-between rounded-lg p-4 cursor-pointer ${
                  selectedMethod === "stripe"
                    ? "border-[#9ba44f] border bg-[#1c1f14]"
                    : "bg-transparent bg-gradient-to-b from-[#202020] to-[#101010]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/stripe-logo.svg"
                    alt="Stripe payment"
                    width={64}
                    height={64}
                  />
                  <div>
                    <h4 className="text-white text-[14px] sm:text-[16px] font-regular leading-5">
                      Stripe Payment
                    </h4>
                    <p className="text-white/60 font-regular text-[10px] sm:text-[12px] pt-2 max-w-[215px]">
                      Secure payment with credit/debit card via Stripe
                    </p>
                  </div>
                </div>

                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={selectedMethod === "stripe"}
                  onChange={() => setSelectedMethod("stripe")}
                  className="w-5 h-5 accent-[#EFFC76] cursor-pointer"
                />
              </label>

              {/* Stripe Payment Details */}
              {selectedMethod === "stripe" && (
                <div className="mt-4">
                  <div className="bg-gradient-to-b from-[#202020] to-[#101010] border border-[#4a4a4a] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-white font-semibold text-lg">
                          Subscription Amount
                        </h4>
                        <p className="text-white/60 text-sm mt-1">
                          One-time certification fee
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[#EFFC76]">
                          ${(SUBSCRIPTION_AMOUNT / 100).toFixed(2)}
                        </p>
                        <p className="text-white/40 text-xs mt-1">USD</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowStripeModal(true)}
                      className="w-full py-4 bg-gradient-to-b from-[#EFFC76] to-[#d4e05c] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                    >
                      <Image
                        src="/images/stripe-logo.svg"
                        alt="Stripe"
                        width={50}
                        height={20}
                      />
                      <span>Pay with Stripe</span>
                    </button>

                    <div className="flex items-center gap-2 mt-4 justify-center text-xs text-white/40">
                      <Image
                        src="/images/lock.png"
                        alt="secure"
                        width={12}
                        height={12}
                      />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stripe Payment Modal */}
              <StripePaymentModal
                isOpen={showStripeModal}
                onClose={() => setShowStripeModal(false)}
                applicationId={applicationId}
                onSuccess={async () => {
                  setShowStripeModal(false);
                  setCompletedSteps(prev => new Set(prev).add("payment"));
                  
                  // Submit the application automatically after successful payment
                  const submitSuccess = await submitFinalApplication();
                  if (submitSuccess) {
                    toast.success("Payment successful! Application submitted.");
                    handleClose();
                  }
                }}
                amount={SUBSCRIPTION_AMOUNT}
                currency="USD"
              />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          {activeTab !== availableTabs[0] && (
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
              activeTab === availableTabs[0] ? "flex-1" : "flex-1"
            }`}
          >
            {isUpdating ? "Updating..." : 
             isSubmitting ? "Submitting..." : 
             activeTab === "documents" && isPaymentCompleted ? "Submit Application" :
             activeTab === "documents" && !isPaymentCompleted ? "Proceed to Payment" :
             activeTab === "payment" && !isPaymentCompleted ? "Pay Now" : 
             "Next Step"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}