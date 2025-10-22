"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Step1a from "./Step1a";
import Step1b from "./Step1b";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4b from "./Step4b";
import Step5 from "./Step5";
import toast from "react-hot-toast";
import { application } from "@/app/api/Host/application";
// import { useRouter } from "next/navigation";

interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
}

interface PropertyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  checklists: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

interface FileData {
  name: string;
  size: number;
  file: File;
  documentType:
    | "ID_DOCUMENT"
    | "SAFETY_PERMIT"
    | "INSURANCE_CERTIFICATE"
    | "PROPERTY_DEED";
  originalName: string; // Add this line
}

interface AppFormData {
  propertyName: string;
  propertyAddress: string;
  propertyType: string;
  propertyTypeName: string;
  ownership: string;
  description: string;
  images: File[];
  checklistItems: ChecklistItem[];
  photos: FileData[];
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

type FieldChangeHandler = (field: string, value: unknown) => void;

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [subStep, setSubStep] = useState(1);
  const [formData, setFormData] = useState<AppFormData>({
    propertyName: "",
    propertyAddress: "",
    propertyType: "",
    propertyTypeName: "",
    ownership: "",
    description: "",
    images: [],
    photos: [],
    checklistItems: [{ id: "1", title: "", checked: false }],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(true);
  const [currentApplicationData, setCurrentApplicationData] =
    useState<ApplicationData | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);

  // const router = useRouter();

  // Fetch property types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setLoadingPropertyTypes(true);
        const response = await application.getPropertyType();

        let propertyTypesArray: PropertyType[] = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            propertyTypesArray = response.data;
          } else if (
            typeof response.data === "object" &&
            response.data !== null &&
            "data" in response.data
          ) {
            const nestedData = response.data.data;
            if (Array.isArray(nestedData)) {
              propertyTypesArray = nestedData;
            }
          } else if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            if ("data" in response.data && Array.isArray(response.data.data)) {
              propertyTypesArray = response.data.data;
            } else if (
              "propertyTypes" in response.data &&
              Array.isArray(response.data.propertyTypes)
            ) {
              propertyTypesArray = response.data.propertyTypes;
            }
          }
        }

        setPropertyTypes(propertyTypesArray);
      } catch (error) {
        console.error("Error fetching property types:", error);
        setPropertyTypes([]);
        toast.error("Failed to load property types");
      } finally {
        setLoadingPropertyTypes(false);
      }
    };

    fetchPropertyTypes();
  }, []);

  // Fetch application data by ID
  const fetchApplicationData = async (): Promise<ApplicationData | null> => {
    try {
      const stored = localStorage.getItem("applicationData");
      const storedData = stored ? JSON.parse(stored) : null;
      console.log("🔍 fetchApplicationData() called");

      if (!storedData?.id) {
        return null;
      }

      const response = await application.getApplicationById(storedData.id);
      if (response.success && response.data) {
        const applicationData = response.data as unknown as ApplicationData;
        setCurrentApplicationData(applicationData);

        // Store uploaded documents separately
        if (applicationData.documents && applicationData.documents.length > 0) {
          setUploadedDocuments(applicationData.documents);
        }

        return applicationData;
      }

      return null;
    } catch (error) {
      console.error("Error fetching application data:", error);
      return null;
    }
  };

  const handleFieldChange: FieldChangeHandler = (
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1 && subStep === 1) {
      if (!formData.propertyName.trim())
        newErrors.propertyName = "Property name is required";
      if (!formData.propertyAddress.trim())
        newErrors.propertyAddress = "Property address is required";
      if (!formData.ownership) newErrors.ownership = "Ownership is required";
      if (!formData.propertyType)
        newErrors.propertyType = "Property type is required";
    }

    if (step === 1 && subStep === 2) {
      if (!formData.description.trim())
        newErrors.description = "Description is required";
    }

    if (step === 2) {
      formData.checklistItems.forEach((item) => {
        if (!item.checked)
          newErrors[`checklist_${item.id}`] = "This item must be checked";
      });
    }

    if (step === 3) {
      if (formData.photos.length < 4)
        newErrors.photos = "All 4 documents are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      if (uploadedUrls.length !== files.length) {
        console.warn(
          `Uploaded ${uploadedUrls.length} URLs but expected ${files.length}`
        );
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

  //   const uploadDocuments = async (files: FileData[]): Promise<UploadedDocument[]> => {
  //   if (files.length === 0) return [];

  //   try {
  //     const formData = new FormData();

  //     files.forEach((fileData) => {
  //       formData.append('files', fileData.file);
  //       formData.append('documentType', fileData.documentType);
  //       formData.append('originalNames', fileData.originalName); // Add originalName
  //     });

  //     const response = await application.uploadDocuments(formData);

  //     if (!response.data) {
  //       throw new Error("No response data received from document upload");
  //     }

  //     const documentsData = response.data.documents || response.data;
  //     // Store the uploaded documents in state
  //     const uploadedDocs = Array.isArray(documentsData) ? documentsData as UploadedDocument[] : [];
  //     setUploadedDocuments(uploadedDocs);

  //     return uploadedDocs;

  //   } catch (error) {
  //     console.error("Document upload error:", error);
  //     throw new Error(
  //       error instanceof Error
  //         ? `Failed to upload documents: ${error.message}`
  //         : "Failed to upload documents due to server error"
  //     );
  //   }
  // };

  const uploadDocuments = async (
    files: FileData[]
  ): Promise<UploadedDocument[]> => {
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

      // Store the uploaded documents in state
      setUploadedDocuments(uploadedDocs);

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

  const getAllPreviousStepData = async (excludeDocuments = false) => {
    const appData = await fetchApplicationData();

    if (!appData?.id) {
      return null;
    }

    const storedPropertyDetails = appData.propertyDetails || {};
    const storedComplianceChecklist = appData.complianceChecklist || {};

    const result: {
      propertyDetails: object;
      complianceChecklist: object;
      documents?: UploadedDocument[];
    } = {
      propertyDetails: {
        ...storedPropertyDetails,
        propertyName:
          formData.propertyName || storedPropertyDetails.propertyName,
        address: formData.propertyAddress || storedPropertyDetails.address,
        ownership: formData.ownership || storedPropertyDetails.ownership,
        propertyType:
          formData.propertyType || storedPropertyDetails.propertyType,
        description: formData.description || storedPropertyDetails.description,
      },
      complianceChecklist: storedComplianceChecklist,
    };

    if (!excludeDocuments && uploadedDocuments.length > 0) {
      result.documents = uploadedDocuments;
    }

    return result;
  };

  const updateApplicationStep = async (
    stepName: string,
    stepData: object
  ): Promise<boolean> => {
    const stored = localStorage.getItem("applicationData");
    const localApplicationData = stored ? JSON.parse(stored) : null;

    if (!localApplicationData?.id) {
      toast.error("Please complete step 1a first");
      return false;
    }

    let updatePayload: { step: string; data: object } = {
      step: stepName,
      data: stepData,
    };

    // Merge previous step data if needed
    if (stepName === "COMPLIANCE_CHECKLIST" || stepName === "DOCUMENT_UPLOAD") {
      const previousData = await getAllPreviousStepData(
        stepName === "DOCUMENT_UPLOAD"
      );
      if (previousData) {
        updatePayload = {
          step: stepName,
          data: {
            ...previousData,
            ...stepData,
          },
        };
      }
    }

    console.log("📤 Update Payload for step:", stepName, updatePayload);

    // API call
    const updateResponse = await application.updateStep(updatePayload);

    if (updateResponse.success) {
      const updatedApplication = updateResponse.data.data; // assuming backend returns updated application

      // ✅ Update localStorage to keep latest application data
      localStorage.setItem(
        "applicationData",
        JSON.stringify(updatedApplication)
      );

      await fetchApplicationData(); // optional revalidation if you want to sync fresh API data
      toast.success(`Step ${stepName} updated successfully!`);
      return true;
    } else {
      const errorMsg = updateResponse.message || "Step update failed";
      throw new Error(errorMsg);
    }
  };

  const handleStep1bUpdate = async (): Promise<boolean> => {
    if (formData.images.length === 0) {
      toast.error("Please upload at least 3 images");
      return false;
    }

    const toastId = toast.loading("Uploading images...");

    try {
      const imageUrls = await uploadFiles(formData.images);

      toast.loading("Updating application...", { id: toastId });

      const stepData = {
        propertyDetails: {
          propertyName: formData.propertyName,
          address: formData.propertyAddress,
          ownership: formData.ownership,
          propertyType: formData.propertyType,
          description: formData.description,
          images: imageUrls,
          rent: 18500,
          bedrooms: 20,
          bathrooms: 20,
          currency: "AED",
          maxGuests: 20,
        },
      };

      localStorage.setItem("propertyType", formData.propertyType);
      const success = await updateApplicationStep("PROPERTY_DETAILS", stepData);

      if (success) {
        toast.success("Images uploaded and application updated!", {
          id: toastId,
        });
      }

      return success;
    } catch (error) {
      console.error("Step 1b update error:", error);
      toast.error(
        (error as Error).message ||
          "Failed to upload images and update application",
        { id: toastId }
      );
      return false;
    }
  };

  const handleStep2Update = async (): Promise<boolean> => {
    const toastId = toast.loading("Updating compliance checklist...");

    try {
      const complianceChecklist: { [key: string]: boolean } = {};
      formData.checklistItems.forEach((item) => {
        complianceChecklist[item.title] = item.checked;
      });

      const stepData = {
        complianceChecklist: complianceChecklist,
      };

      const success = await updateApplicationStep(
        "COMPLIANCE_CHECKLIST",
        stepData
      );

      if (success) {
        toast.success("Compliance checklist updated!", { id: toastId });
      }

      return success;
    } catch (error) {
      console.error("Step 2 update error:", error);
      toast.error(
        (error as Error).message || "Failed to update compliance checklist",
        { id: toastId }
      );
      return false;
    }
  };

  const handleStep3Update = async (): Promise<boolean> => {
    if (formData.photos.length === 0) {
      toast.error("Please upload required documents");
      return false;
    }

    if (formData.photos.length < 4) {
      toast.error("All 4 documents are required");
      return false;
    }

    const toastId = toast.loading("Uploading documents...");

    try {
      // Upload documents and get the response
      const uploadedDocs = await uploadDocuments(formData.photos);

      toast.loading("Updating application...", { id: toastId });

      // Don't send documents in the payload - they're already uploaded
      // Just send the step completion signal
      const previousData = await getAllPreviousStepData(true);

      const stepData = previousData
        ? {
            propertyDetails: previousData.propertyDetails,
            complianceChecklist: previousData.complianceChecklist,
          }
        : {};

      console.log(
        "📤 Final documents payload (documents already uploaded):",
        JSON.stringify(stepData, null, 2)
      );
      console.log("📁 Uploaded documents stored in state:", uploadedDocs);

      const success = await updateApplicationStep("DOCUMENT_UPLOAD", stepData);

      if (success) {
        toast.success("Documents uploaded successfully!", { id: toastId });
      }

      return success;
    } catch (error) {
      console.error("Step 3 update error:", error);
      toast.error(
        (error as Error).message ||
          "Failed to upload documents and update application",
        { id: toastId }
      );
      return false;
    }
  };

  const handleCreateApplication = async () => {
    setIsLoading(true);

    try {
      setErrors({});
      const isValid = validateCurrentStep();

      if (!isValid) {
        setIsLoading(false);
        return;
      }

      const payload = {
        propertyDetails: {
          propertyName: formData.propertyName,
          address: formData.propertyAddress,
          ownership: formData.ownership,
          propertyType: formData.propertyType,
        },
      };

      const response = await application.createApplication(payload as never);

      if (response.data) {
        const responseData = response.data;

        if (typeof responseData === "object" && responseData !== null) {
          const hasNestedData =
            "data" in responseData && typeof responseData.data === "object";
          const applicationData = hasNestedData
            ? responseData.data
            : responseData;

          if (applicationData) {
            localStorage.setItem(
              "applicationData",
              JSON.stringify(applicationData)
            );
            localStorage.setItem("propertyType", formData.propertyType);
            await fetchApplicationData();
          }
        }
      }

      toast.dismiss();

      if (response.success) {
        toast.success("Application created successfully!");
        handleNext();
      } else {
        const message = response.message || "Failed to submit application";
        toast.error(message);
      }
    } catch (error) {
      toast.dismiss();
      console.error("Application submission error:", error);
      toast.error((error as Error).message || "Application submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (): Promise<boolean> => {
    if (isLoading) {
      return false;
    }

    const toastId = toast.loading("Processing payment...");

    try {
      const response = await application.mockPay();

      if (response.success) {
        toast.success("Payment processed successfully!", { id: toastId });
        return true;
      } else {
        const errorMsg = response.message || "Payment failed";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error((error as Error).message || "Failed to process payment", {
        id: toastId,
      });
      return false;
    }
  };

  const handleSubmitApplication = async (): Promise<boolean> => {
    const toastId = toast.loading("Submitting your application...");

    try {
      const stored = localStorage.getItem("applicationData");
      const localApplicationData = stored ? JSON.parse(stored) : null;

      if (!localApplicationData?.id) {
        throw new Error(
          "No application data found. Please complete all previous steps."
        );
      }

      console.log(
        "📤 Submitting application with ID:",
        localApplicationData.id
      );

      const response = await application.submitApplication();

      if (response.success) {
        toast.success("Application submitted successfully!", { id: toastId });
        
        if (response.data) {
          localStorage.setItem("submissionData", JSON.stringify(response.data));
        }

        localStorage.removeItem("applicationData");
        localStorage.removeItem("propertyType");
        setCurrentApplicationData(null);
        setUploadedDocuments([]);

        return true;
      } else {
        const errorMsg = response.message || "Submission failed";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error((error as Error).message || "Failed to submit application", {
        id: toastId,
      });
      return false;
    }
  };

  const handleNextClick = async () => {
    if (isLoading) return;

    if (!validateCurrentStep()) return;

    setIsLoading(true);

    try {
      let success = false;

      if (step === 1 && subStep === 1) {
        await handleCreateApplication();
        return;
      } else if (step === 1 && subStep === 2) {
        success = await handleStep1bUpdate();
      } else if (step === 2) {
        success = await handleStep2Update();
      } else if (step === 3) {
        success = await handleStep3Update();
      } else if (step === 4) {
        success = await handlePayment();
        if (success) {
          setStep(5);
        }
        setIsLoading(false);
        return;
      } else if (step === 5) {
        success = await handleSubmitApplication();
      }

      if (success) {
        handleNext();
      }
    } catch (error) {
      console.error("Error in step processing:", error);
      toast.error("Failed to complete step");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Property Details",
      desc: "Enter Your Property Information",
      icon: "/images/property.svg",
      activeIcon: "/images/property.svg",
    },
    {
      id: 2,
      title: "Compliance Checklist",
      desc: "Complete the Compliance Checklist",
      icon: "/images/checklist.svg",
      activeIcon: "/images/checklist-complete.svg",
    },
    {
      id: 3,
      title: "Document Uploads",
      desc: "Upload Required Documents",
      icon: "/images/upload.svg",
      activeIcon: "/images/upload-active.svg",
    },
    {
      id: 4,
      title: "Choose Plan & Payment",
      desc: "Secure Your Certification Payment",
      icon: "/images/payment.svg",
      activeIcon: "/images/payment-active.svg",
    },
    {
      id: 5,
      title: "Submission & Confirmation",
      desc: "Review & Submit Your Application",
      icon: "/images/confirm.svg",
      activeIcon: "/images/confirm-active.svg",
    },
  ];

  const renderStepContent = () => {
    if (step === 1) {
      if (subStep === 1)
        return (
          <Step1a
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            propertyTypes={propertyTypes}
            loadingPropertyTypes={loadingPropertyTypes}
          />
        );
      if (subStep === 2)
        return (
          <Step1b
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        );
    }

    if (step === 4) {
      return <Step4b />;
    }

    switch (step) {
      case 2:
        return (
          <Step2
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            savedComplianceChecklist={
              currentApplicationData?.complianceChecklist
            }
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        );
      case 5:
        return <Step5 />;
      default:
        return null;
    }
  };

  // const handlePrev = () => {
  //   if (step === 2 && subStep === 1) {
  //     setStep(1);
  //     setSubStep(2);
  //   } else if (step === 1 && subStep === 2) {
  //     setSubStep(1);
  //   } else if (step === 4 && subStep > 1) {
  //     setSubStep((prev) => prev - 1);
  //   } else if (step > 1) {
  //     setStep((prev) => prev - 1);
  //     setSubStep(1);
  //   }
  // };

  const handleNext = () => {
    if (step === 1 && subStep === 1) {
      setSubStep(2);
    } else if (step === 4 && subStep < 2) {
      setSubStep((prev) => prev + 1);
    } else {
      setStep((prev) => (prev < 5 ? prev + 1 : prev));
      setSubStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row px-4 md:pl-10 py-10 w-full h-auto">
      {/* Sidebar */}
      <div
        className="w-full lg:w-1/3 bg-[#121315] px-8 sm:px-10 sm:py-5 py-5 relative 
                lg:sticky lg:top-0 lg:h-screen lg:max-h-[848px] self-start"
      >
        <Image
          src="/images/shape1.png"
          alt="gradient"
          fill
          className="absolute bottom-0 left-0 object-cover"
        />

        <div className="relative flex lg:flex-col flex-row items-start lg:items-stretch gap-8 lg:gap-12 overflow-x-auto prevent-scroller lg:overflow-visible">
          {steps.map((s, idx) => {
            const isCompleted = step > s.id;
            const isActive = step === s.id;

            let iconSrc = s.icon;
            if (isCompleted) iconSrc = "/images/completed.svg";
            else if (isActive) iconSrc = s.activeIcon;

            return (
              <div
                key={s.id}
                className="flex lg:flex-row z-10 flex-col items-center lg:items-start gap-4 relative flex-shrink-0"
              >
                <div className="flex flex-col lg:flex-col items-center">
                  <div
                    className={`flex justify-center items-center rounded-full ${
                      isCompleted || isActive
                        ? "bg-[#353825] h-[56px] w-[56px]"
                        : "h-[56px] lg:h-[30px] w-[56px]"
                    }`}
                  >
                    <div
                      className={`w-[44px] h-[44px] flex items-center justify-center rounded-full ${
                        isCompleted || isActive ? "bg-[#EFFC76]" : "bg-white/12"
                      }`}
                    >
                      <Image
                        src={iconSrc}
                        alt={s.title}
                        width={20}
                        height={20}
                        className="transition-all duration-300"
                      />
                    </div>
                  </div>

                  {idx !== steps.length - 1 && (
                    <div className="hidden lg:block absolute top-[62%] w-px h-16 border-l-2 z-[-60] border-dashed border-gray-600"></div>
                  )}
                </div>

                <div className="text-center lg:text-left min-w-[140px]">
                  <p
                    className={`font-regular text-[14px] leading-[18px] ${
                      isActive ? "text-[#EFFC76]" : "text-white"
                    }`}
                  >
                    STEP {s.id}
                  </p>
                  <p className="text-[16px] font-semibold leading-[20px] pt-[6px] text-white">
                    {s.title}
                  </p>
                  <p className="pt-[6px] text-[12px] text-white/80 font-regular leading-[16px]">
                    {s.desc}
                  </p>
                </div>

                {idx !== steps.length - 1 && (
                  <div className="lg:hidden absolute left-1/2 top-1/5 w-[120%] border-t-2 z-[-60] border-dashed border-gray-600"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`w-full lg:flex-1 md:pt-10 md:px-10 flex flex-col lg:ml-1/3 ${
          step === 5 ? "" : "min-h-screen lg:max-h-[748px] justify-between"
        }`}
      >
        <div className="flex-1">
          <div className="flex gap-2 items-center mb-5 mt-5 sm:mt-0">
            <Image src="/images/step.svg" alt="steps" width={16} height={16} />
            <p className="text-[#EFFC76] font-semibold text-[14px]">
              STEP {step} OF 5
            </p>
          </div>
          <div className="pb-6">{renderStepContent()}</div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-end mt-auto">
          <div className="flex flex-col pt-6 sm:flex-row gap-3">
            {/* <button
              onClick={handlePrev}
              className={`w-full sm:w-auto px-8 py-3 black-btn text-[16px] bg-gradient-to-b text-#101010 font-semibold rounded-md shadow-lg ${
                step === 1 && subStep === 1 ? "hidden" : "block"
              }`}
            >
              Back
            </button> */}
            <button
              onClick={handleNextClick}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 text-[16px] bg-gradient-to-b yellow-btn text-black font-semibold rounded-md shadow-lg hover:opacity-90 disabled:opacity-50 disabled:!cursor-not-allowed"
            >
              {isLoading
                ? "Please wait ..."
                : step === 5
                ? "Submit"
                : "Continue"}
            </button>
          </div>

          <button
            onClick={() => toast.success("Your data drafted successfully")}
            className="font-medium text-[16px] pt-3 sm:pt-0 leading-5 text-[#EFFC76] cursor-pointer"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
