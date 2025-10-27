"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Dropdown from "@/app/shared/Dropdown";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";
import { managementApi } from "@/app/api/super-admin/user-management";
import { useParams } from "next/navigation";
import { PropertyResponse, BillingHistoryResponse , GetUserPropertiesParams , GetUserBillingParams } from "@/app/api/super-admin/user-management/types";

interface UserDetail {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  isEmail: boolean;
  isNotification: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    listedProperties: number;
    certifiedProperties: number;
    expiredCertificates: number;
    rejectedProperties: number;
  };
}

interface FilterValues {
  [key: string]: string;
}


export default function Detail() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;

  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      img: "/images/apartment.svg",
      val: "0",
      title: "Listed Properties",
    },
    {
      id: 2,
      img: "/images/p-app.svg",
      val: "0",
      title: "Certified Properties",
    },
    {
      id: 3,
      img: "/images/reject.svg",
      val: "0",
      title: "Expired Certificates",
    },
    {
      id: 4,
      img: "/images/approved.svg",
      val: "0",
      title: "Rejected Properties",
    },
  ]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Properties Table States
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
  const [propertyCurrentPage, setPropertyCurrentPage] = useState(1);
  const [isPropertyFilterOpen, setIsPropertyFilterOpen] = useState(false);
  const [propertySelectedRows, setPropertySelectedRows] = useState<Set<string>>(new Set());
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);
  const [propertyFilters, setPropertyFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
  });
  const [allPropertyData, setAllPropertyData] = useState<PropertyResponse['data']>([]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [deletingProperties, setDeletingProperties] = useState<Set<string>>(new Set());

  // Billing Table States
  const [billingSearchTerm, setBillingSearchTerm] = useState("");
  const [billingCurrentPage, setBillingCurrentPage] = useState(1);
  const [isBillingFilterOpen, setIsBillingFilterOpen] = useState(false);
  const [billingSelectedRows, setBillingSelectedRows] = useState<Set<string>>(new Set());
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [billingFilters, setBillingFilters] = useState({
    status: "",
    purchaseDate: "",
    endDate: "",
  });
  const [allBillingData, setAllBillingData] = useState<BillingHistoryResponse['data']>([]);
  const [billingLoading, setBillingLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: string;
    type: "property" | "billing";
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [deleteType, setDeleteType] = useState<"property" | "billing">("property");

  // Dropdown states for filters
  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showPropertyStatusDropdown, setShowPropertyStatusDropdown] = useState(false);
  const [showBillingStatusDropdown, setShowBillingStatusDropdown] = useState(false);

  const itemsPerPage = 6;

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      try {
        const response = await managementApi.getUserDetail(userId);
        setUserData(response.data as UserDetail);;
        
        // Update credentials with API data
        setCredentials([
          {
            id: 1,
            img: "/images/apartment.svg",
            val: response.data.statistics.listedProperties.toString(),
            title: "Listed Properties",
          },
          {
            id: 2,
            img: "/images/p-app.svg",
            val: response.data.statistics.certifiedProperties.toString(),
            title: "Certified Properties",
          },
          {
            id: 3,
            img: "/images/reject.svg",
            val: response.data.statistics.expiredCertificates.toString(),
            title: "Expired Certificates",
          },
          {
            id: 4,
            img: "/images/approved.svg",
            val: response.data.statistics.rejectedProperties.toString(),
            title: "Rejected Properties",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    
    fetchData();
  }, [userId]);

  // Fetch properties data
  // const fetchProperties = async (searchTerm?: string, filters?: any) => {
  //   if (!userId) return;
    
  //   setPropertyLoading(true);
  //   try {
  //     const params: GetUserPropertiesParams = {};
      
  //     if (searchTerm && searchTerm.length >= 3) {
  //       params.search = searchTerm;
  //     }
      
  //     if (filters?.status) {
  //       params.status = filters.status;
  //     }
      
  //     if (filters?.ownership) {
  //       params.ownership = filters.ownership;
  //     }
      
  //     if (filters?.submittedDate) {
  //       // Convert submitted date to date range format
  //       const submittedDateObj = new Date(filters.submittedDate);
  //       params.submittedFrom = submittedDateObj.toISOString().split('T')[0];
  //       params.submittedTo = submittedDateObj.toISOString().split('T')[0];
  //     }
      
  //     const response = await managementApi.getUserProperties(userId, params);
  //     setAllPropertyData(response.data.data);
  //   } catch (error) {
  //     console.error("Failed to fetch properties:", error);
  //   } finally {
  //     setPropertyLoading(false);
  //   }
  // };

  // Fetch billing data
  // const fetchBilling = async (searchTerm?: string, filters?: any) => {
  //   if (!userId) return;
    
  //   setBillingLoading(true);
  //   try {
  //     const params: GetUserBillingParams = {};
      
  //     if (searchTerm && searchTerm.length >= 3) {
  //       params.search = searchTerm;
  //     }
      
  //     if (filters?.status) {
  //       params.status = filters.status;
  //     }
      
  //     if (filters?.purchaseDate) {
  //       const purchaseDateObj = new Date(filters.purchaseDate);
  //       params.endDateFrom = purchaseDateObj.toISOString().split('T')[0];
  //     }
      
  //     if (filters?.endDate) {
  //       const endDateObj = new Date(filters.endDate);
  //       params.endDateTo = endDateObj.toISOString().split('T')[0];
  //     }
      
  //     const response = await managementApi.getUserBilling(userId, params);
  //     setAllBillingData(response.data.data);
  //   } catch (error) {
  //     console.error("Failed to fetch billing:", error);
  //   } finally {
  //     setBillingLoading(false);
  //   }
  // };

  // Delete property function
  const deleteProperty = async (propertyId: string) => {
    setDeletingProperties(prev => new Set(prev).add(propertyId));
    try {
      await managementApi.deleteApplication(propertyId);
      // Remove the deleted property from state
      setAllPropertyData(prev => prev.filter(property => property.id !== propertyId));
      // Remove from selected rows
      setPropertySelectedRows(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(propertyId);
        return newSelected;
      });
      return true;
    } catch (error) {
      console.error("Failed to delete property:", error);
      return false;
    } finally {
      setDeletingProperties(prev => {
        const newDeleting = new Set(prev);
        newDeleting.delete(propertyId);
        return newDeleting;
      });
    }
  };

  // Delete multiple properties
  const deleteMultipleProperties = async (propertyIds: string[]) => {
    const results = await Promise.allSettled(
      propertyIds.map(id => deleteProperty(id))
    );
    
    const successfulDeletes = results.filter(result => result.status === 'fulfilled' && result.value).length;
    const failedDeletes = results.filter(result => result.status === 'rejected' || !result.value).length;
    
    if (successfulDeletes > 0) {
      console.log(`Successfully deleted ${successfulDeletes} properties`);
    }
    if (failedDeletes > 0) {
      console.error(`Failed to delete ${failedDeletes} properties`);
    }
    
    return successfulDeletes > 0;
  };

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      // fetchProperties();
      // fetchBilling();
    }
  }, [userId]);

  // Search with debounce for properties
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (propertySearchTerm.length >= 3 || propertySearchTerm.length === 0) {
        // fetchProperties(propertySearchTerm, propertyFilters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [propertySearchTerm, userId]);

  // Search with debounce for billing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (billingSearchTerm.length >= 3 || billingSearchTerm.length === 0) {
        // fetchBilling(billingSearchTerm, billingFilters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [billingSearchTerm, userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsDropdownOpen(false);
  };

  const statusOptions = [
    { label: "Active", onClick: () => handleStatusSelect("Active") },
    { label: "Inactive", onClick: () => handleStatusSelect("Inactive") },
    { label: "Expired", onClick: () => handleStatusSelect("Expired") },
  ];

  // Transform API data for table display - Properties
  const displayPropertyData = useMemo(() => {
    return allPropertyData.map((property) => ({
      "Application ID": property.id.substring(0, 8).toUpperCase(),
      "Property Name": property.propertyDetails.propertyName,
      "Ownership": property.propertyDetails.ownership,
      "Submitted On": property.submittedAt ? new Date(property.submittedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) : 'Not Submitted',
      "Reviewed By": property.reviewedAt ? 'Admin' : 'Not Reviewed',
      "Status": property.status.charAt(0) + property.status.slice(1).toLowerCase()
    }));
  }, [allPropertyData]);

  // Transform API data for table display - Billing
  const displayBillingData = useMemo(() => {
    return allBillingData.map((billing) => ({
      "Plan Name": "Certification Fee", // You might want to get this from application data
      "Amount": `${billing.amount} ${billing.currency}`,
      "Purchase Date": new Date(billing.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      "End Date": new Date(billing.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }), // Adjust based on your business logic
      "Status": billing.status === 'COMPLETED' ? 'Active' : 'Inactive'
    }));
  }, [allBillingData]);

  // Get unique values for filter options from API data
  const uniqueOwnerships = useMemo(() => {
    return [...new Set(allPropertyData.map((item) => item.propertyDetails.ownership))];
  }, [allPropertyData]);

  const uniquePropertyStatuses = useMemo(() => {
    return [...new Set(allPropertyData.map((item) => item.status))];
  }, [allPropertyData]);

  const uniqueBillingStatuses = useMemo(() => {
    return [...new Set(allBillingData.map((item) => item.status))];
  }, [allBillingData]);

  // Property Table Handlers
  const handlePropertySelectAll = (checked: boolean) => {
    const newSelected = new Set(propertySelectedRows);
    if (checked) {
      allPropertyData.forEach((item) => newSelected.add(item.id));
    } else {
      allPropertyData.forEach((item) => newSelected.delete(item.id));
    }
    setPropertySelectedRows(newSelected);
  };

  const handlePropertySelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(propertySelectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setPropertySelectedRows(newSelected);
  };

  const isAllPropertySelected = useMemo(() => {
    return allPropertyData.length > 0 && allPropertyData.every((item) => propertySelectedRows.has(item.id));
  }, [allPropertyData, propertySelectedRows]);

  const isSomePropertySelected = useMemo(() => {
    return allPropertyData.some((item) => propertySelectedRows.has(item.id)) && !isAllPropertySelected;
  }, [allPropertyData, propertySelectedRows, isAllPropertySelected]);

  // Billing Table Handlers
  const handleBillingSelectAll = (checked: boolean) => {
    const newSelected = new Set(billingSelectedRows);
    if (checked) {
      allBillingData.forEach((item) => newSelected.add(item.id));
    } else {
      allBillingData.forEach((item) => newSelected.delete(item.id));
    }
    setBillingSelectedRows(newSelected);
  };

  const handleBillingSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(billingSelectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setBillingSelectedRows(newSelected);
  };

  const isAllBillingSelected = useMemo(() => {
    return allBillingData.length > 0 && allBillingData.every((item) => billingSelectedRows.has(item.id));
  }, [allBillingData, billingSelectedRows]);

  const isSomeBillingSelected = useMemo(() => {
    return allBillingData.some((item) => billingSelectedRows.has(item.id)) && !isAllBillingSelected;
  }, [allBillingData, billingSelectedRows, isAllBillingSelected]);

  // Delete Handlers
  const openDeleteSingleModal = (
    row: Record<string, string>,
    id: string,
    type: "property" | "billing"
  ) => {
    setSingleRowToDelete({ row, id, type });
    setModalType("single");
    setDeleteType(type);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = (type: "property" | "billing") => {
    const selectedRows = type === "property" ? propertySelectedRows : billingSelectedRows;
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setDeleteType(type);
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = async () => {
    if (modalType === "single" && singleRowToDelete) {
      if (singleRowToDelete.type === "property") {
        await deleteProperty(singleRowToDelete.id);
      }
      // Handle billing deletion if needed
    } else if (modalType === "multiple" && deleteType === "property") {
      const propertyIds = Array.from(propertySelectedRows);
      await deleteMultipleProperties(propertyIds);
    }
    
    setIsModalOpen(false);
    setSingleRowToDelete(null);
  };

  // Property Filter Handlers
  const handlePropertyResetFilter = () => {
    setPropertyFilters({
      ownership: "",
      status: "",
      submittedDate: "",
    });
    setPropertySearchTerm("");
    setSubmittedDate(null);
    // fetchProperties(); // Fetch without filters
  };

  const handlePropertyApplyFilter = () => {
    if (submittedDate) {
      setPropertyFilters((prev) => ({
        ...prev,
        submittedDate: submittedDate.toISOString(),
      }));
    }
    setIsPropertyFilterOpen(false);
    // fetchProperties(propertySearchTerm, { ...propertyFilters, submittedDate: submittedDate?.toISOString() });
  };

  // Billing Filter Handlers
  const handleBillingResetFilter = () => {
    setBillingFilters({
      status: "",
      purchaseDate: "",
      endDate: "",
    });
    setBillingSearchTerm("");
    setPurchaseDate(null);
    setEndDate(null);
    // fetchBilling(); // Fetch without filters
  };

  const handleBillingApplyFilter = () => {
    const newFilters: typeof billingFilters = { ...billingFilters };

    if (purchaseDate) {
      newFilters.purchaseDate = purchaseDate.toISOString();
    }

    if (endDate) {
      newFilters.endDate = endDate.toISOString();
    }

    setBillingFilters(newFilters);
    setIsBillingFilterOpen(false);
    // fetchBilling(billingSearchTerm, newFilters);
  };

  const propertyDropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allPropertyData[index];
        console.log("View property details:", originalRow);
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allPropertyData[index];
        openDeleteSingleModal(row, originalRow.id, "property");
      },
    },
  ];

  const billingDropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allBillingData[index];
        console.log("View billing details:", originalRow);
      },
    },
    {
      label: "Delete",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = allBillingData[index];
        openDeleteSingleModal(row, originalRow.id, "billing");
      },
    },
  ];

  return (
    <div className="">
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSingleRowToDelete(null);
          }}
          onConfirm={handleModalConfirm}
          title="Confirm Deletion"
          description="Deleting this item means it will no longer appear in your records."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      <nav className="flex py-3 mb-5 text-gray-200 rounded-lg bg-transparent">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/super-admin/dashboard/user-management"
              className="text-[16px] font-regular leading-5 text-white/60 hover:text-[#EFFC76] md:ms-2"
            >
              Registered Hosts
            </Link>
          </li>

          <Image
            src="/images/greater.svg"
            alt="Greater"
            height={16}
            width={16}
          />
          <li aria-current="page">
            <p className="text-[16px] leading-5 font-regular text-white">
              {userData?.name || "Loading..."}
            </p>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 justify-between">
        <div className="flex gap-4 items-center">
          <Image
            src="/images/profile.png"
            alt="profile"
            height={72}
            width={72}
          />
          <div>
            <h3 className="font-medium text-[24px] leading-7">
              {userData?.name || "Loading..."}
            </h3>
            <p className="font-regular text-[16px] leading-5 text-[#FFFFFFCC] mt-2">
              {userData?.email || "Loading..."}
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="bg-[#2D2D2D] py-3 px-4 w-[121px] rounded-full font-regular text-[18px] cursor-pointer focus:outline-0 flex justify-between items-center"
          >
            {selectedStatus}
            <Image
              src="/images/dropdown.svg"
              alt="Dropdown"
              height={16}
              width={16}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 right-10 sm:-right-21 z-10 w-[121px]">
              <Dropdown items={statusOptions} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 flex-wrap lg:flex-nowrap justify-between">
        {credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div>
                <h2 className="font-medium text-[18px] leading-[22px] text-white">
                  {item.val}
                </h2>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Listed Properties Table */}
      <div className="mt-8">
        <Table
          data={displayPropertyData}
          title="Listed Properties"
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = allPropertyData[index];
            openDeleteSingleModal(row, originalRow.id, "property");
          }}
          showPagination={false}
          clickable={true}
          selectedRows={propertySelectedRows}
          setSelectedRows={setPropertySelectedRows}
          onSelectAll={handlePropertySelectAll}
          onSelectRow={handlePropertySelectRow}
          isAllSelected={isAllPropertySelected}
          isSomeSelected={isSomePropertySelected}
          rowIds={allPropertyData.map((item) => item.id)}
          dropdownItems={propertyDropdownItems}
          searchTerm={propertySearchTerm}
          onSearchChange={setPropertySearchTerm}
          totalItems={allPropertyData.length}
          showFilter={true}
          onFilterToggle={setIsPropertyFilterOpen}
          onDeleteAll={() => handleDeleteSelected("property")}
          isDeleteAllDisabled={propertySelectedRows.size === 0}
          // loading={propertyLoading}
          // deletingRows={deletingProperties}
        />
      </div>

      {/* Billing History Table */}
      <div className="mt-10">
        <Table
          data={displayBillingData}
          title="Billing History"
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = allBillingData[index];
            openDeleteSingleModal(row, originalRow.id, "billing");
          }}
          showPagination={false}
          clickable={true}
          selectedRows={billingSelectedRows}
          setSelectedRows={setBillingSelectedRows}
          onSelectAll={handleBillingSelectAll}
          onSelectRow={handleBillingSelectRow}
          isAllSelected={isAllBillingSelected}
          isSomeSelected={isSomeBillingSelected}
          rowIds={allBillingData.map((item) => item.id)}
          dropdownItems={billingDropdownItems}
          searchTerm={billingSearchTerm}
          onSearchChange={setBillingSearchTerm}
          totalItems={allBillingData.length}
          showFilter={true}
          onFilterToggle={setIsBillingFilterOpen}
          onDeleteAll={() => handleDeleteSelected("billing")}
          isDeleteAllDisabled={billingSelectedRows.size === 0}
          // loading={billingLoading}
        />
      </div>

      {/* Property Filter Drawer */}
      <FilterDrawer
        isOpen={isPropertyFilterOpen}
        onClose={() => setIsPropertyFilterOpen(false)}
        title="Apply Filter"
        description="Refine listings to find the right property faster."
        resetLabel="Reset"
        onReset={handlePropertyResetFilter}
        buttonLabel="Apply Filter"
        onApply={handlePropertyApplyFilter}
        filterValues={propertyFilters}
        onFilterChange={(filters) => {
          setPropertyFilters((prev) => ({
            ...prev,
            ...filters,
          }));
        }}
        dropdownStates={{
          ownership: showOwnershipDropdown,
          status: showPropertyStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "ownership") setShowOwnershipDropdown(value);
          if (key === "status") setShowPropertyStatusDropdown(value);
        }}
        fields={[
          {
            label: "Ownership",
            key: "ownership",
            type: "dropdown",
            placeholder: "Select ownership",
            options: uniqueOwnerships,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniquePropertyStatuses,
          },
          {
            label: "Submitted date",
            key: "submittedDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />

      {/* Billing Filter Drawer */}
      <FilterDrawer
        isOpen={isBillingFilterOpen}
        onClose={() => setIsBillingFilterOpen(false)}
        title="Apply Filter"
        description="Refine billing records to find the right information."
        resetLabel="Reset"
        onReset={handleBillingResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleBillingApplyFilter}
        filterValues={billingFilters}
        onFilterChange={(filters) => {
          setBillingFilters((prev) => ({
            ...prev,
            ...filters,
          }));
        }}
        dropdownStates={{
          status: showBillingStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "status") setShowBillingStatusDropdown(value);
        }}
        fields={[
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueBillingStatuses,
          },
          {
            label: "Purchase Date",
            key: "purchaseDate",
            type: "date",
            placeholder: "Select date",
          },
          {
            label: "End Date",
            key: "endDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </div>
  );
}