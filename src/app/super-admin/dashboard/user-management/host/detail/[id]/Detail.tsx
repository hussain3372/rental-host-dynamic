"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
// import { allProperties } from "@/app/admin/data/Info";
import Dropdown from "@/app/shared/Dropdown";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";

interface PropertyData {
  id: number;
  "Application ID": string;
  "Property Name": string;
  Ownership: string;
  "Submitted On": string;
  "Reviewed By": string;
  Status: "Approved" | "Rejected" | "Approved";
}

interface BillingData {
  id: number;
  "Plan Name": string;
  Amount: string;
  "Purchase Date": string;
  "End Date": string;
  Status: "Active" | "Inactive";
}

export default function Detail() {
  const Credentials = [
    {
      id: 1,
      img: "/images/apartment.svg",
      val: "120",
      title: "Listed Properties",
    },
    {
      id: 2,
      img: "/images/p-app.svg",
      val: "86",
      title: "Certified Properties",
    },
    {
      id: 3,
      img: "/images/reject.svg",
      val: "12",
      title: "Expired Certificates",
    },
    {
      id: 4,
      img: "/images/approved.svg",
      val: "05",
      title: "Rejected Properties",
    },
  ];

  // const { id } = useParams();
  // const propertyId = Number(id);

  // Get property by ID
  // const property = allProperties.find((p) => p.id === propertyId);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Properties Table States
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
  const [propertyCurrentPage, setPropertyCurrentPage] = useState(1);
  const [isPropertyFilterOpen, setIsPropertyFilterOpen] = useState(false);
  // Properties Table States - Change to string
  const [propertySelectedRows, setPropertySelectedRows] = useState<Set<string>>(
    new Set()
  );
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);
  const [propertyFilters, setPropertyFilters] = useState({
    ownership: "",
    status: "",
    submittedDate: "",
  });

  // Billing Table States
  const [billingSearchTerm, setBillingSearchTerm] = useState("");
  const [billingCurrentPage, setBillingCurrentPage] = useState(1);
  const [isBillingFilterOpen, setIsBillingFilterOpen] = useState(false);
  // Billing Table States - Change to string
  const [billingSelectedRows, setBillingSelectedRows] = useState<Set<string>>(
    new Set()
  );
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [billingFilters, setBillingFilters] = useState({
    status: "",
    purchaseDate: "",
    endDate: "",
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
    type: "property" | "billing";
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [deleteType, setDeleteType] = useState<"property" | "billing">(
    "property"
  );

  // Dropdown states for filters
  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [showPropertyStatusDropdown, setShowPropertyStatusDropdown] =
    useState(false);
  const [showBillingStatusDropdown, setShowBillingStatusDropdown] =
    useState(false);

  const itemsPerPage = 6;

  // Sample Data
  const [allPropertyData, setAllPropertyData] = useState<PropertyData[]>([
    {
      id: 1,
      "Application ID": "TAG-8789",
      "Property Name": "Coastal Hillside Estate",
      Ownership: "Manager",
      "Submitted On": "August 12, 2025",
      "Reviewed By": "Conrad Fisher",
      Status: "Approved",
    },
    {
      id: 2,
      "Application ID": "TAG-8789",
      "Property Name": "Coastal Hillside Estate",
      Ownership: "Manager",
      "Submitted On": "August 12, 2025",
      "Reviewed By": "Conrad Fisher",
      Status: "Rejected",
    },
    {
      id: 3,
      "Application ID": "TAG-8789",
      "Property Name": "Coastal Hillside Estate",
      Ownership: "Owner",
      "Submitted On": "August 12, 2025",
      "Reviewed By": "Conrad Fisher",
      Status: "Approved",
    },
    {
      id: 4,
      "Application ID": "TAG-8789",
      "Property Name": "Coastal Hillside Estate",
      Ownership: "Manager",
      "Submitted On": "August 12, 2025",
      "Reviewed By": "Conrad Fisher",
      Status: "Approved",
    },
    {
      id: 5,
      "Application ID": "TAG-8789",
      "Property Name": "Coastal Hillside Estate",
      Ownership: "Agent",
      "Submitted On": "August 12, 2025",
      "Reviewed By": "Conrad Fisher",
      Status: "Approved",
    },
    {
      id: 6,
      "Application ID": "TAG-8789",
      "Property Name": "Coastal Hillside Estate",
      Ownership: "Manager",
      "Submitted On": "August 12, 2025",
      "Reviewed By": "Conrad Fisher",
      Status: "Approved",
    },
  ]);

  const [allBillingData, setAllBillingData] = useState<BillingData[]>([
    {
      id: 1,
      "Plan Name": "Starter",
      Amount: "$12",
      "Purchase Date": "Aug 12, 2025",
      "End Date": "Aug 12, 2025",
      Status: "Active",
    },
    {
      id: 2,
      "Plan Name": "Professional",
      Amount: "$24",
      "Purchase Date": "Aug 12, 2025",
      "End Date": "Aug 12, 2025",
      Status: "Inactive",
    },
    {
      id: 3,
      "Plan Name": "Enterprise",
      Amount: "$200",
      "Purchase Date": "Aug 12, 2025",
      "End Date": "Aug 12, 2025",
      Status: "Active",
    },
    {
      id: 4,
      "Plan Name": "Starter",
      Amount: "$12",
      "Purchase Date": "Aug 12, 2025",
      "End Date": "Aug 12, 2025",
      Status: "Inactive",
    },
    {
      id: 5,
      "Plan Name": "Enterprise",
      Amount: "$200",
      "Purchase Date": "Aug 12, 2025",
      "End Date": "Aug 12, 2025",
      Status: "Active",
    },
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If property not found

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setIsDropdownOpen(false);
  };

  // Remove this problematic line completely
  // window.addEventListener("click", () => setIsDropdownOpen(false));

  // Your useEffect is sufficient
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const statusOptions = [
    { label: "Active", onClick: () => handleStatusSelect("Active") },
    { label: "Inactive", onClick: () => handleStatusSelect("Inactive") },
    { label: "Expired", onClick: () => handleStatusSelect("Expired") },
  ];

  // Get unique values for filter options
  const uniqueOwnerships = [
    ...new Set(allPropertyData.map((item) => item["Ownership"])),
  ];
  const uniquePropertyStatuses = [
    ...new Set(allPropertyData.map((item) => item["Status"])),
  ];
  const uniqueBillingStatuses = [
    ...new Set(allBillingData.map((item) => item["Status"])),
  ];

  // Filter Properties Data
  const filteredPropertyData = useMemo(() => {
    let filtered = allPropertyData;

    if (propertySearchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Property Name"]
            .toLowerCase()
            .includes(propertySearchTerm.toLowerCase()) ||
          item["Application ID"]
            .toLowerCase()
            .includes(propertySearchTerm.toLowerCase()) ||
          item["Ownership"]
            .toLowerCase()
            .includes(propertySearchTerm.toLowerCase()) ||
          item["Reviewed By"]
            .toLowerCase()
            .includes(propertySearchTerm.toLowerCase())
      );
    }

    if (propertyFilters.ownership) {
      filtered = filtered.filter(
        (item) => item["Ownership"] === propertyFilters.ownership
      );
    }

    if (propertyFilters.status) {
      filtered = filtered.filter(
        (item) => item["Status"] === propertyFilters.status
      );
    }

    if (propertyFilters.submittedDate) {
      filtered = filtered.filter((item) =>
        item["Submitted On"].includes(propertyFilters.submittedDate)
      );
    }

    return filtered;
  }, [propertySearchTerm, propertyFilters, allPropertyData]);

  // Filter Billing Data
  const filteredBillingData = useMemo(() => {
    let filtered = allBillingData;

    if (billingSearchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Plan Name"]
            .toLowerCase()
            .includes(billingSearchTerm.toLowerCase()) ||
          item["Amount"].toLowerCase().includes(billingSearchTerm.toLowerCase())
      );
    }

    if (billingFilters.status) {
      filtered = filtered.filter(
        (item) => item["Status"] === billingFilters.status
      );
    }

    if (billingFilters.purchaseDate) {
      filtered = filtered.filter((item) =>
        item["Purchase Date"].includes(billingFilters.purchaseDate)
      );
    }

    if (billingFilters.endDate) {
      filtered = filtered.filter((item) =>
        item["End Date"].includes(billingFilters.endDate)
      );
    }

    return filtered;
  }, [billingSearchTerm, billingFilters, allBillingData]);

  // Property Table Handlers
  const handlePropertySelectAll = (checked: boolean) => {
    const newSelected = new Set(propertySelectedRows);
    if (checked) {
      filteredPropertyData.forEach((item) =>
        newSelected.add(item.id.toString())
      );
    } else {
      filteredPropertyData.forEach((item) =>
        newSelected.delete(item.id.toString())
      );
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
    return (
      filteredPropertyData.length > 0 &&
      filteredPropertyData.every((item) =>
        propertySelectedRows.has(item.id.toString())
      )
    );
  }, [filteredPropertyData, propertySelectedRows]);

  const isSomePropertySelected = useMemo(() => {
    return (
      filteredPropertyData.some((item) =>
        propertySelectedRows.has(item.id.toString())
      ) && !isAllPropertySelected
    );
  }, [filteredPropertyData, propertySelectedRows, isAllPropertySelected]);

  // Billing Table Handlers
  const handleBillingSelectAll = (checked: boolean) => {
    const newSelected = new Set(billingSelectedRows);
    if (checked) {
      filteredBillingData.forEach((item) =>
        newSelected.add(item.id.toString())
      );
    } else {
      filteredBillingData.forEach((item) =>
        newSelected.delete(item.id.toString())
      );
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
    return (
      filteredBillingData.length > 0 &&
      filteredBillingData.every((item) =>
        billingSelectedRows.has(item.id.toString())
      )
    );
  }, [filteredBillingData, billingSelectedRows]);

  const isSomeBillingSelected = useMemo(() => {
    return (
      filteredBillingData.some((item) =>
        billingSelectedRows.has(item.id.toString())
      ) && !isAllBillingSelected
    );
  }, [filteredBillingData, billingSelectedRows, isAllBillingSelected]);

  // Delete Handlers
  const openDeleteSingleModal = (
    row: Record<string, string>,
    id: number,
    type: "property" | "billing"
  ) => {
    setSingleRowToDelete({ row, id, type });
    setModalType("single");
    setDeleteType(type);
    setIsModalOpen(true);
  };

  const handleDeleteSelected = (type: "property" | "billing") => {
    const selectedRows =
      type === "property" ? propertySelectedRows : billingSelectedRows;
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setDeleteType(type);
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = () => {
    if (modalType === "multiple") {
      if (deleteType === "property" && propertySelectedRows.size > 0) {
        const idsToDelete = Array.from(propertySelectedRows).map((id) =>
          parseInt(id)
        );
        const updatedData = allPropertyData.filter(
          (item) => !idsToDelete.includes(item.id)
        );
        setAllPropertyData(updatedData);
        setPropertySelectedRows(new Set());
      } else if (deleteType === "billing" && billingSelectedRows.size > 0) {
        const idsToDelete = Array.from(billingSelectedRows).map((id) =>
          parseInt(id)
        );
        const updatedData = allBillingData.filter(
          (item) => !idsToDelete.includes(item.id)
        );
        setAllBillingData(updatedData);
        setBillingSelectedRows(new Set());
      }
    } else if (modalType === "single" && singleRowToDelete) {
      if (singleRowToDelete.type === "property") {
        const updatedData = allPropertyData.filter(
          (item) => item.id !== singleRowToDelete.id
        );
        setAllPropertyData(updatedData);
        const newSelected = new Set(propertySelectedRows);
        newSelected.delete(singleRowToDelete.id.toString());
        setPropertySelectedRows(newSelected);
      } else {
        const updatedData = allBillingData.filter(
          (item) => item.id !== singleRowToDelete.id
        );
        setAllBillingData(updatedData);
        const newSelected = new Set(billingSelectedRows);
        newSelected.delete(singleRowToDelete.id.toString());
        setBillingSelectedRows(newSelected);
      }
    }
    setIsModalOpen(false);
    setSingleRowToDelete(null);
  };

  // Reset page when filters change
  useEffect(() => {
    setPropertyCurrentPage(1);
  }, [propertySearchTerm, propertyFilters]);

  useEffect(() => {
    setBillingCurrentPage(1);
  }, [billingSearchTerm, billingFilters]);

  // Property Filter Handlers
  const handlePropertyResetFilter = () => {
    setPropertyFilters({
      ownership: "",
      status: "",
      submittedDate: "",
    });
    setPropertySearchTerm("");
    setSubmittedDate(null);
  };

  const handlePropertyApplyFilter = () => {
    if (submittedDate) {
      setPropertyFilters((prev) => ({
        ...prev,
        submittedDate: submittedDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      }));
    }
    setIsPropertyFilterOpen(false);
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
  };

  const handleBillingApplyFilter = () => {
    const newFilters: typeof billingFilters = { ...billingFilters };

    if (purchaseDate) {
      newFilters.purchaseDate = purchaseDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (endDate) {
      newFilters.endDate = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    setBillingFilters(newFilters);
    setIsBillingFilterOpen(false);
  };

  const displayPropertyData = useMemo(() => {
    return filteredPropertyData.map(({ id, ...rest }) => {
      console.log(id);
      return rest;
    });
  }, [filteredPropertyData]);

  const displayBillingData = useMemo(() => {
    return filteredBillingData.map(({ id, ...rest }) => {
      console.log(id);
      return rest;
    });
  }, [filteredBillingData]);

  const propertyDropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (propertyCurrentPage - 1) * itemsPerPage + index;
        const originalRow = filteredPropertyData[globalIndex];
        console.log("View property details:", originalRow);
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (propertyCurrentPage - 1) * itemsPerPage + index;
        const originalRow = filteredPropertyData[globalIndex];
        openDeleteSingleModal(row, originalRow.id, "property");
      },
    },
  ];

  const billingDropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (billingCurrentPage - 1) * itemsPerPage + index;
        const originalRow = filteredBillingData[globalIndex];
        console.log("View billing details:", originalRow);
      },
    },
    {
      label: "Delete",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (billingCurrentPage - 1) * itemsPerPage + index;
        const originalRow = filteredBillingData[globalIndex];
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

      <nav className="flex py-3 mb-5 text-gray-200  rounded-lg bg-transparent">
        <ol className="inline-flex  items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
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
              Sarah Kim
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
            <h3 className="font-medium text-[24px] leading-7">Sarah Kim</h3>
            <p className="font-regular text-[16px] leading-5 text-[#FFFFFFCC] mt-2">
              sarah@gmail.com
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        {/* Status Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {" "}
          {/* Add ref here */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-3 pt-5  flex-wrap lg:flex-nowrap justify-between">
        {Credentials.map((item) => (
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
            const globalIndex =
              (propertyCurrentPage - 1) * itemsPerPage + index;
            const originalRow = filteredPropertyData[globalIndex];
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
          rowIds={filteredPropertyData.map((item) => item.id.toString())}
          dropdownItems={propertyDropdownItems}
          searchTerm={propertySearchTerm}
          onSearchChange={setPropertySearchTerm}
          totalItems={filteredPropertyData.length}
          showFilter={true}
          onFilterToggle={setIsPropertyFilterOpen}
          onDeleteAll={() => handleDeleteSelected("property")}
          isDeleteAllDisabled={
            propertySelectedRows.size === 0 ||
            propertySelectedRows.size < displayPropertyData.length
          }
        />
      </div>

      {/* Billing History Table */}
      <div className="mt-10">
        <Table
          data={displayBillingData}
          title="Billing History"
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const globalIndex = (billingCurrentPage - 1) * itemsPerPage + index;
            const originalRow = filteredBillingData[globalIndex];
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
          rowIds={filteredBillingData.map((item) => item.id.toString())}
          dropdownItems={billingDropdownItems}
          searchTerm={billingSearchTerm}
          onSearchChange={setBillingSearchTerm}
          totalItems={filteredBillingData.length}
          showFilter={true}
          onFilterToggle={setIsBillingFilterOpen}
          onDeleteAll={() => handleDeleteSelected("billing")}
          isDeleteAllDisabled={
            billingSelectedRows.size === 0 ||
            billingSelectedRows.size < displayBillingData.length
          }
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
