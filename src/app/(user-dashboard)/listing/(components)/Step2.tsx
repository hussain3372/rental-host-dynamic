"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { application } from "@/app/api/Host/application";
import toast from "react-hot-toast";

interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
}

interface Step2Props {
  formData: {
    checklistItems: ChecklistItem[];
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: ChecklistItem[]) => void;
  savedComplianceChecklist?: Record<string, boolean>;
}

export interface Step2Ref {
  handleStepComplete: () => Promise<boolean>;
}

interface ApiChecklistItem {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
  checked?: boolean;
}

const Step2 = forwardRef<Step2Ref, Step2Props>(
  ({ formData, errors, onFieldChange, savedComplianceChecklist }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [hasFetched, setHasFetched] = useState(false);

    // ✅ Update step (skips if status is DRAFT)
    const updateComplianceStep = async (
      checklistItems: ChecklistItem[]
    ): Promise<boolean> => {
      try {
        setUpdating(true);

        const stored = localStorage.getItem("applicationData");
        const applicationData = stored ? JSON.parse(stored) : null;

        if (!applicationData?.id) {
          toast.error("Please complete step 1a first");
          return false;
        }

        // ✅ Skip update if current step is in these stages
        const skipSteps = [
          "COMPLIANCE_CHECKLIST",
          "DOCUMENT_UPLOAD",
          "PAYMENT",
          "SUBMISSION",
        ];

        if (skipSteps.includes(applicationData.currentStep)) {
          console.log(
            `⏩ Skipping update API because current step is "${applicationData.currentStep}"`
          );
          return true;
        }

        const complianceChecklist: Record<string, boolean> = {};
        checklistItems.forEach((item) => {
          complianceChecklist[item.title] = item.checked;
        });

        const storedPropertyDetails = applicationData?.propertyDetails || {};

        const payload = {
          step: "COMPLIANCE_CHECKLIST",
          data: {
            propertyDetails: storedPropertyDetails,
            complianceChecklist,
          },
        };

        const response = await application.updateStep(payload);
        const isSuccess =
          response?.data?.success === true || response?.success === true;

        if (isSuccess) {
          console.log("🎉 Compliance checklist updated successfully!");
          // ✅ Update localStorage with latest data
          const latestData = response?.data?.data || response?.data;
          if (latestData) {
            localStorage.setItem("applicationData", JSON.stringify(latestData));
          }
          return true;
        } else {
          const errorMsg =
            response?.data?.message ||
            response?.message ||
            "Failed to update compliance checklist";
          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error("❌ Error updating compliance checklist:", err);
        setError((err as Error).message);
        return false;
      } finally {
        setUpdating(false);
      }
    };

    // ✅ Step completion handler
    const handleStepComplete = useCallback(async (): Promise<boolean> => {
      const allChecked = formData.checklistItems.every((item) => item.checked);
      if (!allChecked) {
        setError("Please check all compliance items before continuing");
        return false;
      }
      return await updateComplianceStep(formData.checklistItems);
    }, [formData.checklistItems]);

    useImperativeHandle(ref, () => ({ handleStepComplete }), [
      handleStepComplete,
    ]);

    // ✅ Fetch checklist from API and merge with saved local data
    useEffect(() => {
      const fetchChecklist = async () => {
        if (hasFetched && formData.checklistItems.length > 0) {
          console.log("⏸️ Skipping fetch - checklist already loaded");
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          // 🔹 Get application data from localStorage
          const storedApp = localStorage.getItem("applicationData");
          const appData = storedApp ? JSON.parse(storedApp) : null;

          if (!appData) {
            setError(
              "Application data not found. Please complete Step 1 first."
            );
            setLoading(false);
            return;
          }

          // 🔹 Extract complianceChecklist from localStorage
          const localComplianceChecklist =
            appData?.complianceChecklist || savedComplianceChecklist || {};

          // 🔹 Determine property type ID
          const sources = [
            localStorage.getItem("propertyType"),
            appData?.propertyType,
            appData?.propertyDetails?.propertyType,
          ];

          const propertyTypeId =
            sources.find((s) => s && s !== "null" && s !== "") || null;

          if (!propertyTypeId) {
            setError("Property type not found. Please complete Step 1 first.");
            setLoading(false);
            return;
          }

          // 🔹 Fetch checklist from API
          const response = await application.getCheckList();
          let checklistData: ApiChecklistItem[] = [];

          if (Array.isArray(response?.data?.data)) {
            checklistData = response.data.data;
          } else if (Array.isArray(response?.data)) {
            checklistData = response.data;
          } else if (Array.isArray(response)) {
            checklistData = response;
          } else {
            throw new Error("Unexpected checklist data format from server");
          }

          if (!checklistData.length) {
            setError("No compliance checklist items found.");
            setLoading(false);
            return;
          }

          // 🔹 Transform checklist — checked state comes from local data
          const transformedData: ChecklistItem[] = checklistData
            .filter((item) => item.isActive !== false)
            .map((item) => {
              const itemName = String(item.name || "Unnamed Item");
              const wasChecked = localComplianceChecklist?.[itemName] === true; // ✅ from local storage
              return {
                id: String(item.id),
                title: itemName,
                checked: wasChecked,
              };
            });

          // 🔹 Update form data
          onFieldChange("checklistItems", transformedData);
          setHasFetched(true);

          console.log("✅ Checklist loaded:", {
            totalItems: transformedData.length,
            checkedItems: transformedData.filter((i) => i.checked).length,
            localComplianceChecklist,
          });
        } catch (err) {
          console.error("💥 Error in fetchChecklist:", err);
          let msg =
            (err as Error).message || "Failed to load compliance checklist";

          if (msg.includes("401")) {
            msg = "Your session expired. Please refresh and log in again.";
          } else if (msg.includes("404")) {
            msg = "Checklist not found for this property type.";
          } else if (msg.toLowerCase().includes("network")) {
            msg = "Network error. Check your connection and try again.";
          }

          setError(msg);

          if (msg.toLowerCase().includes("network") && retryCount < 3) {
            setTimeout(() => setRetryCount((prev) => prev + 1), 2000);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchChecklist();
    }, [retryCount, savedComplianceChecklist,  formData.checklistItems.length,   hasFetched, onFieldChange ]);

    const toggleCheck = (id: string) => {
      const updatedItems = formData.checklistItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      onFieldChange("checklistItems", updatedItems);
      if (error) setError(null);
    };

    const handleRetry = () => {
      setRetryCount((prev) => prev + 1);
      setError(null);
    };

    useEffect(() => {
      return () => setHasFetched(false);
    }, []);

    if (loading) {
      return (
        <div className="flex flex-col items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EFFC76]"></div>
          <p className="text-white/60 mt-2">Loading compliance checklist...</p>
          {retryCount > 0 && (
            <p className="text-white/40 text-sm mt-1">
              Retry attempt: {retryCount}
            </p>
          )}
        </div>
      );
    }

    if (error && !updating) {
      return (
        <div className="text-center py-8">
          <div className="text-red-400 mb-4 max-w-md mx-auto">⚠️ {error}</div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-[#EFFC76] text-black rounded-md hover:opacity-90"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:opacity-90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="font-bold text-[20px] sm:text-[28px] mb-3">
          Complete the Compliance Checklist
        </h3>
        <p className="text-white/60 text-[12px] sm:text-[16px] max-w-[573px]">
          Review and confirm that your property meets the required standards for
          certification.
        </p>

        {updating && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EFFC76] mr-2"></div>
            <p className="text-white/60 text-sm">Updating checklist...</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          {formData.checklistItems.map((item) => (
            <div key={item.id} className="relative">
              <div
                className={`flex justify-between items-center rounded-lg p-3 cursor-pointer transition-colors ${
                  item.checked
                    ? "bg-[#1c1f14] border border-[#9ba44f]"
                    : "bg-gradient-to-b from-[#202020] to-[#101010] hover:from-[#252525] hover:to-[#151515]"
                }`}
                onClick={() => toggleCheck(item.id)}
              >
                <p className="text-[14px] text-white">{item.title}</p>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  className="
                    appearance-none w-6 h-6
                    bg-white/40 border border-white/40 rounded-sm
                    checked:bg-[#EFFC76] checked:border-[#EFFC76]
                    cursor-pointer relative
                    checked:before:content-['✔']
                    checked:before:absolute checked:before:inset-0
                    checked:before:flex checked:before:items-center
                    checked:before:justify-center
                    checked:before:text-black checked:before:text-[12px] checked:before:font-bold
                  "
                />
              </div>

              {errors[`checklist_${item.id}`] && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors[`checklist_${item.id}`]}
                </p>
              )}
            </div>
          ))}
        </div>

        {formData.checklistItems.length === 0 && !loading && !error && (
          <div className="flex justify-center items-center py-8">
            <p className="text-white/60">
              No checklist items available for this property type.
            </p>
          </div>
        )}
      </div>
    );
  }
);

Step2.displayName = "Step2";

export default Step2;
