// "use client";

// import Image from "next/image";
// import React, { useState, useEffect, useCallback } from "react";
// import Dropdown from "@/app/shared/InputDropDown";
// import { application } from "@/app/api/super-admin/application";
// import toast from "react-hot-toast";
// // import { UsersResponse } from "@/app/api/super-admin/application/types";

// interface AdminDrawerProps {
//   onClose: () => void;
//   applicationId: string;
//   onSuccess?: () => void;
// }



// interface Admin {
//   id: string;
//   name: string;
//   email?: string;
// }

// interface AdminOption {
//   label: string;
//   value: string;
//   onClick: () => void;
// }

// interface ApiError {
//   code: string;
//   message: string;
//   timestamp: string;
// }

// // interface ApiResponse {
// //   success: boolean;
// //   data?: {
// //     data?: Admin[];
// //   };
// //   error?: ApiError;
// //   meta?: {
// //     status?: number;
// //     code?: string;
// //     success?: boolean;
// //     error?: ApiError;
// //   };
// //   message?: string;
// // }

// export default function AdminDrawer({ 
//   onClose, 
//   applicationId, 
//   onSuccess 
// }: AdminDrawerProps) {
//   const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
//   const [adminOptions, setAdminOptions] = useState<AdminOption[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [adminsLoading, setAdminsLoading] = useState(false);
//   const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

// const fetchAdmins = useCallback(async (): Promise<void> => {
//   try {
//     setAdminsLoading(true);
//     const response = await application.getAdmins();
    
//     console.log("Admins API Response:", response);
//     console.log("Response data structure:", response.data);
    
//     // Adjust based on actual response structure
//     if (response.success && response.data) {
//       const adminsData = response.data; // This should be your UsersResponse
//       const adminArray = adminsData.data || adminsData; // Try both possibilities
      
//       if (adminArray && Array.isArray(adminArray)) {
//         const adminList: AdminOption[] = adminArray.map((user) => ({
//           label: user.name || `${user.firstName} ${user.lastName}`,
//           value: user.id.toString(),
//           onClick: () => {
//             setSelectedAdmin({ 
//               id: user.id.toString(), 
//               name: user.name || `${user.firstName} ${user.lastName}`, 
//               email: user.email 
//             });
//             setAdminDropdownOpen(false);
//           }
//         }));
//         setAdminOptions(adminList);
//       }
//     } else if (!response.success && response.message) {
//       toast.error(response.message || "Failed to load admins");
//     }
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : "Failed to load admins";
//     toast.error(errorMessage);
//     console.error("Error fetching admins:", err);
//   } finally {
//     setAdminsLoading(false);
//   }
// }, []);

//   useEffect(() => {
//     fetchAdmins();
//   }, [fetchAdmins]);

//   const handleAssignAdmin = async (): Promise<void> => {
//     if (!selectedAdmin) {
//       toast.error("Please select an admin");
//       return;
//     }

//     try {
//       setLoading(true);
      
//       console.log("📤 Sending request with:", { applicationId, adminId: selectedAdmin.id });
      
//      const response = await application.assignAdmin(
//   applicationId, 
//   selectedAdmin.id
// ) as {
//   success: boolean;
//   error?: ApiError;
//   message?: string;
//   meta?: string;
// };
      
//       console.log("📥 Full API Response:", response);
//       console.log("📥 Response Type:", typeof response);
//       console.log("📊 Response.success:", response.success);
//       console.log("📊 Response.success type:", typeof response.success);
//       console.log("📊 Response.error:", response.error);
      
//       // Check all possible failure conditions
//       if (response.success === false || !response.success) {
//         console.log("❌ Request failed, checking for error message...");
        
//         // Try to get error message from different possible locations
//         let errorMessage = "Failed to assign admin";
        
//         if (response.error?.message) {
//           errorMessage = response.error.message;
//           console.log("🔴 Got error from response.error.message:", errorMessage);
//         } else if (response.message) {
//           errorMessage = response.message;
//           console.log("🔴 Got error from response.message:", errorMessage);
//         }
        
//         console.log("🔴 Showing error toast:", errorMessage);
//         toast.error(errorMessage);
//         return; // Exit here, don't continue
//       }
      
//       // Only reach here if success is true
//       console.log("✅ Request successful!");
//       toast.success("Admin assigned successfully!");
//       onSuccess?.();
//       onClose();
      
//     } catch (err) {
//       console.error("🚨 Caught exception:", err);
//       const errorMessage = err instanceof Error ? err.message : "Failed to assign admin";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDropdownToggle = (): void => {
//     if (!adminsLoading) {
//       setAdminDropdownOpen(!adminDropdownOpen);
//     }
//   };

//   const handleCloseDropdown = (): void => {
//     setAdminDropdownOpen(false);
//   };

//   return (
//     <div className="bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] rounded-lg text-white flex flex-col justify-between p-[28px] w-[70vw] sm:w-[608px] h-full overflow-y-auto relative">
//       {/* Close Button */}
     

//       {/* Heading */}
//       <div>
//         <h2 className="text-[20px] font-medium mb-3">Assign Application</h2>
//         <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5">
//           Fill in the below details and select the admin you want to assign to the application.
//         </p>

//         {/* Assign Admin */}
//         <div className="mb-5 relative">
//           <label 
//             htmlFor="admin-select"
//             className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px]"
//           >
//             Assign to
//           </label>
//           <div className="relative">
//             <button
//               id="admin-select"
//               onClick={handleDropdownToggle}
//               disabled={adminsLoading}
//               className={`w-full bg-gradient-to-b from-[#202020] to-[#101010] border rounded-xl px-4 py-3 text-sm border-[#404040] focus:border-[#EFFC76] focus:outline-none cursor-pointer ${
//                 !selectedAdmin ? "text-white/40" : "text-white"
//               } disabled:opacity-50 disabled:cursor-not-allowed text-left transition-colors duration-200`}
//               type="button"
//             >
//               {adminsLoading 
//                 ? "Loading admins..." 
//                 : selectedAdmin 
//                   ? selectedAdmin.name 
//                   : "Select Admin"}
//             </button>
//             <Image
//               src="/images/dropdown.svg"
//               alt="dropdown"
//               width={20}
//               height={20}
//               className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none"
//             />
//             {!adminsLoading && adminDropdownOpen && (
//               <Dropdown
//                 items={adminOptions}
//                 isOpen={adminDropdownOpen}
//                 onClose={handleCloseDropdown}
//               />
//             )}
//           </div>
//           {adminsLoading && (
//             <p className="text-xs text-white/60 mt-2">Loading admin list...</p>
//           )}
//         </div>
//       </div>

//       {/* Assign Button */}
//       <button
//         className="w-full h-[52px] text-[18px] font-semibold rounded-md bg-[#EFFC76] text-black text-sm hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//         onClick={handleAssignAdmin}
//         disabled={loading || !selectedAdmin || adminsLoading}
//         type="button"
//       >
//         {loading ? (
//           <span className="flex items-center justify-center gap-2">
//             <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
//             Assigning...
//           </span>
//         ) : (
//           "Assign Application"
//         )}
//       </button>
//     </div>
//   );
// }

// AdminDrawer.displayName = "AdminDrawer";

"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Dropdown from "@/app/shared/InputDropDown";
import { application } from "@/app/api/super-admin/application";
import toast from "react-hot-toast";

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

export default function AdminDrawer({ 
  onClose, 
  applicationId, 
  onSuccess 
}: AdminDrawerProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [adminOptions, setAdminOptions] = useState<AdminOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAdmins, setTotalAdmins] = useState(0);
  
  // Refs for infinite scroll
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const fetchAdmins = useCallback(async (page: number = 1, append: boolean = false): Promise<void> => {
    // Prevent multiple simultaneous requests
    if ((page === 1 && adminsLoading) || (page > 1 && loadingMore)) {
      return;
    }

    try {
      if (page === 1) {
        setAdminsLoading(true);
        setAdminOptions([]); // Clear previous options
      } else {
        setLoadingMore(true);
      }
      
      console.log(`📡 Fetching admins - Page ${page}`);
      const response = await application.getAdmins(page, 10);
      
      if (response.success && response.data) {
        const adminsData = response.data;
        const adminArray = adminsData.data || [];
        const pagination = adminsData.pagination;
        
        console.log(`✅ Loaded ${adminArray.length} admins from page ${page}`);
        
        // Set pagination info
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setHasMore(pagination.hasNextPage || false);
          setTotalAdmins(pagination.total || 0);
        }
        
        // Map admins to options
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
        
        // Append or replace based on pagination
        if (append) {
          setAdminOptions(prev => [...prev, ...adminList]);
        } else {
          setAdminOptions(adminList);
        }
        
        // Update current page
        setCurrentPage(page);
      } else if (!response.success) {
        const errorMsg = response.message || "Failed to load admins";
        toast.error(errorMsg);
        console.error("API Error:", response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load admins";
      toast.error(errorMessage);
      console.error("Error fetching admins:", err);
    } finally {
      setAdminsLoading(false);
      setLoadingMore(false);
    }
  }, [adminsLoading, loadingMore]);

  // Load initial admins when dropdown opens
  useEffect(() => {
    if (adminDropdownOpen && adminOptions.length === 0 && !adminsLoading) {
      console.log("Initial load triggered");
      fetchAdmins(1);
    }
  }, [adminDropdownOpen, adminOptions.length, adminsLoading, fetchAdmins]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!adminDropdownOpen || !hasMore || loadingMore || !dropdownRef.current) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          console.log("Intersection detected, loading next page...");
          const nextPage = currentPage + 1;
          fetchAdmins(nextPage, true);
        }
      },
      {
        root: dropdownRef.current,
        rootMargin: '100px', // Trigger 100px before reaching the bottom
        threshold: 0.1,
      }
    );

    // Observe the last item
    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [adminDropdownOpen, hasMore, loadingMore, currentPage, fetchAdmins, adminOptions.length]);

  // Update last item ref when options change
  useEffect(() => {
    if (adminDropdownOpen && observerRef.current && lastItemRef.current) {
      // Reconnect observer with new last item
      observerRef.current.disconnect();
      observerRef.current.observe(lastItemRef.current);
    }
  }, [adminOptions, adminDropdownOpen]);

  // Handle assign admin
  const handleAssignAdmin = async (): Promise<void> => {
    if (!selectedAdmin) {
      toast.error("Please select an admin");
      return;
    }

    try {
      setLoading(true);
      
      console.log("Assigning admin:", { applicationId, adminId: selectedAdmin.id });
      
      const response = await application.assignAdmin(
        applicationId, 
        selectedAdmin.id
      ) as {
        success: boolean;
        error?: ApiError;
        message?: string;
        meta?: string;
      };
      
      if (response.success === false || !response.success) {
        let errorMessage = "Failed to assign admin";
        
        if (response.error?.message) {
          errorMessage = response.error.message;
        } else if (response.message) {
          errorMessage = response.message;
        }
        
        toast.error(errorMessage);
        return;
      }
      
      toast.success("Admin assigned successfully!");
      onSuccess?.();
      onClose();
      
    } catch (err) {
      console.error("Error assigning admin:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to assign admin";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownToggle = (): void => {
    if (!adminsLoading) {
      const newState = !adminDropdownOpen;
      setAdminDropdownOpen(newState);
      
      // Reset pagination when closing and reopening
      if (!newState) {
        // Don't reset immediately, wait for animation
        setTimeout(() => {
          if (!adminDropdownOpen) {
            setCurrentPage(1);
            setHasMore(true);
          }
        }, 300);
      }
    }
  };

  const handleCloseDropdown = (): void => {
    setAdminDropdownOpen(false);
  };

  // Custom dropdown component with infinite scroll
  const CustomInfiniteScrollDropdown = () => {
    if (!adminDropdownOpen) return null;

    return (
      <div 
        ref={dropdownRef}
        className="absolute z-50 w-full mt-1 bg-[#0A0C0B] border border-[#404040] rounded-xl max-h-60 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#404040 transparent',
        }}
      >
        {/* Admin options */}
        {adminOptions.map((option, index) => (
          <div
            key={`${option.value}-${index}`}
            ref={index === adminOptions.length - 1 ? lastItemRef : null}
          >
            <button
              onClick={() => {
                option.onClick();
                setAdminDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors duration-150 border-b border-white/5 last:border-b-0"
            >
              {option.label}
            </button>
          </div>
        ))}
        
        {/* Loading indicator for infinite scroll */}
        {loadingMore && (
          <div className="px-4 py-3 text-center border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
              Loading more admins...
            </div>
          </div>
        )}
        
        {/* End of list indicator */}
       
        
        {/* Empty state */}
        {!adminsLoading && adminOptions.length === 0 && !loadingMore && (
          <div className="px-4 py-6 text-center text-sm text-white/60">
            No admins found
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] rounded-lg text-white flex flex-col justify-between p-[28px] w-[70vw] sm:w-[608px] h-full overflow-y-auto relative">
      {/* Close Button */}
      <div className="absolute top-6 right-6 cursor-pointer" onClick={onClose}>
        <Image src="/images/close-icon.svg" alt="close" width={24} height={24} />
      </div>

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
            
            {/* Custom infinite scroll dropdown */}
            <CustomInfiniteScrollDropdown />
          </div>
          
          {/* Loading state */}
          {adminsLoading && (
            <p className="text-xs text-white/60 mt-2 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
              Loading admin list...
            </p>
          )}
          
          {/* Selected admin info */}
         
        </div>
      </div>

      {/* Assign Button */}
      <button
        className="w-full h-[52px] text-[18px] font-semibold rounded-md bg-[#EFFC76] text-black text-sm hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAssignAdmin}
        disabled={loading || !selectedAdmin}
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