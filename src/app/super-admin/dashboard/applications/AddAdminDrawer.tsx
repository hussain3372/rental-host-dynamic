"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import Dropdown from "@/app/shared/InputDropDown";
import { application } from "@/app/api/super-admin/application";
import toast from "react-hot-toast";
// import { UsersResponse } from "@/app/api/super-admin/application/types";

interface AdminDrawerProps {
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}



interface Admin {
  id: string;
  name: string;
  email?: string;
}

interface AdminOption {
  label: string;
  value: string;
  onClick: () => void;
}

interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}

// interface ApiResponse {
//   success: boolean;
//   data?: {
//     data?: Admin[];
//   };
//   error?: ApiError;
//   meta?: {
//     status?: number;
//     code?: string;
//     success?: boolean;
//     error?: ApiError;
//   };
//   message?: string;
// }

export default function AdminDrawer({ 
  onClose, 
  applicationId, 
  onSuccess 
}: AdminDrawerProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [adminOptions, setAdminOptions] = useState<AdminOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

const fetchAdmins = useCallback(async (): Promise<void> => {
  try {
    setAdminsLoading(true);
    const response = await application.getAdmins();
    
    console.log("Admins API Response:", response);
    console.log("Response data structure:", response.data);
    
    // Adjust based on actual response structure
    if (response.success && response.data) {
      const adminsData = response.data; // This should be your UsersResponse
      const adminArray = adminsData.data || adminsData; // Try both possibilities
      
      if (adminArray && Array.isArray(adminArray)) {
        const adminList: AdminOption[] = adminArray.map((user) => ({
          label: user.name || `${user.firstName} ${user.lastName}`,
          value: user.id.toString(),
          onClick: () => {
            setSelectedAdmin({ 
              id: user.id.toString(), 
              name: user.name || `${user.firstName} ${user.lastName}`, 
              email: user.email 
            });
            setAdminDropdownOpen(false);
          }
        }));
        setAdminOptions(adminList);
      }
    } else if (!response.success && response.message) {
      toast.error(response.message || "Failed to load admins");
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to load admins";
    toast.error(errorMessage);
    console.error("Error fetching admins:", err);
  } finally {
    setAdminsLoading(false);
  }
}, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAssignAdmin = async (): Promise<void> => {
    if (!selectedAdmin) {
      toast.error("Please select an admin");
      return;
    }

    try {
      setLoading(true);
      
      console.log("📤 Sending request with:", { applicationId, adminId: selectedAdmin.id });
      
     const response = await application.assignAdmin(
  applicationId, 
  selectedAdmin.id
) as {
  success: boolean;
  error?: ApiError;
  message?: string;
  meta?: string;
};
      
      console.log("📥 Full API Response:", response);
      console.log("📥 Response Type:", typeof response);
      console.log("📊 Response.success:", response.success);
      console.log("📊 Response.success type:", typeof response.success);
      console.log("📊 Response.error:", response.error);
      
      // Check all possible failure conditions
      if (response.success === false || !response.success) {
        console.log("❌ Request failed, checking for error message...");
        
        // Try to get error message from different possible locations
        let errorMessage = "Failed to assign admin";
        
        if (response.error?.message) {
          errorMessage = response.error.message;
          console.log("🔴 Got error from response.error.message:", errorMessage);
        } else if (response.message) {
          errorMessage = response.message;
          console.log("🔴 Got error from response.message:", errorMessage);
        }
        
        console.log("🔴 Showing error toast:", errorMessage);
        toast.error(errorMessage);
        return; // Exit here, don't continue
      }
      
      // Only reach here if success is true
      console.log("✅ Request successful!");
      toast.success("Admin assigned successfully!");
      onSuccess?.();
      onClose();
      
    } catch (err) {
      console.error("🚨 Caught exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to assign admin";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownToggle = (): void => {
    if (!adminsLoading) {
      setAdminDropdownOpen(!adminDropdownOpen);
    }
  };

  const handleCloseDropdown = (): void => {
    setAdminDropdownOpen(false);
  };

  return (
    <div className="bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] rounded-lg text-white flex flex-col justify-between p-[28px] w-[70vw] sm:w-[608px] h-full overflow-y-auto relative">
      {/* Close Button */}
     

      {/* Heading */}
      <div>
        <h2 className="text-[20px] font-medium mb-3">Assign Application</h2>
        <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5">
          Fill in the below details and select the admin you want to assign to the application.
        </p>

        {/* Assign Admin */}
        <div className="mb-5 relative">
          <label 
            htmlFor="admin-select"
            className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px]"
          >
            Assign to
          </label>
          <div className="relative">
            <button
              id="admin-select"
              onClick={handleDropdownToggle}
              disabled={adminsLoading}
              className={`w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer ${
                !selectedAdmin ? "text-white/40" : "text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed text-left transition-colors duration-200`}
              type="button"
            >
              {adminsLoading 
                ? "Loading admins..." 
                : selectedAdmin 
                  ? selectedAdmin.name 
                  : "Select Admin"}
            </button>
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              width={20}
              height={20}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none"
            />
            {!adminsLoading && adminDropdownOpen && (
              <Dropdown
                items={adminOptions}
                isOpen={adminDropdownOpen}
                onClose={handleCloseDropdown}
              />
            )}
          </div>
          {adminsLoading && (
            <p className="text-xs text-white/60 mt-2">Loading admin list...</p>
          )}
        </div>
      </div>

      {/* Assign Button */}
      <button
        className="w-full h-[52px] text-[18px] font-semibold rounded-md bg-[#EFFC76] text-black text-sm hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAssignAdmin}
        disabled={loading || !selectedAdmin || adminsLoading}
        type="button"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Assigning...
          </span>
        ) : (
          "Assign Application"
        )}
      </button>
    </div>
  );
}

AdminDrawer.displayName = "AdminDrawer";