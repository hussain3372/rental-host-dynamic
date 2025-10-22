"use client";
import React, { useMemo, useState } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/admin/tables-essentials/Filter";

interface CertificationData {
  id: number;
  "Admin Name": string;
  "Email": string;
  "Properties Verified": string;
  "Pending Applications": string;
  "Rejected Applications": string;
  Status: string;
}

export default function Applications() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
// Change from Set<number> to Set<string>
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [showPropertiesVerifiedDropdown, setShowPropertiesVerifiedDropdown] = useState(false);
  const [showPendingApplicationsDropdown, setShowPendingApplicationsDropdown] = useState(false);
  const [showRejectedApplicationsDropdown, setShowRejectedApplicationsDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [certificationFilters, setCertificationFilters] = useState({
    propertiesVerified: "",
    pendingApplications: "",
    rejectedApplications: "",
    status: "",
  });

  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([
    {
      id: 1,
      "Admin Name": "Sarah Kim",
      "Email": "jsarah@gmail.com",
      "Properties Verified": "45",
      "Pending Applications": "12",
      "Rejected Applications": "3",
      Status: "Active",
    },
    {
      id: 2,
      "Admin Name": "Sarah Kim",
      "Email": "sarah@gmail.com",
      "Properties Verified": "28",
      "Pending Applications": "8",
      "Rejected Applications": "5",
      Status: "Suspended",
    },
    {
      id: 3,
      "Admin Name": "Sarah Kim",
      "Email": "sarah@gmail.com",
      "Properties Verified": "67",
      "Pending Applications": "15",
      "Rejected Applications": "2",
      Status: "Active",
    },
    {
      id: 4,
      "Admin Name": "Sarah Kim",
      "Email": "sarah@gmail.com",
      "Properties Verified": "32",
      "Pending Applications": "6",
      "Rejected Applications": "7",
      Status: "Active",
    },
    {
      id: 5,
      "Admin Name": "Sarah Kim",
      "Email": "sarah@gmail.com",
      "Properties Verified": "32",
      "Pending Applications": "6",
      "Rejected Applications": "7",
      Status: "Active",
    },
    
  ]);

  // ✅ Filtering logic
  const filteredCertificationData = useMemo(() => {
    let filtered = allCertificationData;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Admin Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Email"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Properties Verified"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (certificationFilters.propertiesVerified) {
      filtered = filtered.filter(
        (item) => item["Properties Verified"] === certificationFilters.propertiesVerified
      );
    }

    if (certificationFilters.pendingApplications) {
      filtered = filtered.filter(
        (item) => item["Pending Applications"] === certificationFilters.pendingApplications
      );
    }

    if (certificationFilters.rejectedApplications) {
      filtered = filtered.filter(
        (item) => item["Rejected Applications"] === certificationFilters.rejectedApplications
      );
    }

    if (certificationFilters.status) {
      filtered = filtered.filter(
        (item) => item["Status"] === certificationFilters.status
      );
    }

    return filtered;
  }, [searchTerm, certificationFilters, allCertificationData]);

 const handleSelectAll = (checked: boolean) => {
  const newSelected = new Set<string>();
  if (checked) {
    filteredCertificationData.forEach((item) => newSelected.add(item.id.toString()));
  }
  setSelectedRows(newSelected);
};

 const handleSelectRow = (id: string, checked: boolean) => {
  const newSelected = new Set(selectedRows);
  if (checked) {
    newSelected.add(id);
  } else {
    newSelected.delete(id);
  }
  setSelectedRows(newSelected);
};
 const isAllDisplayedSelected = useMemo(() => {
  return (
    filteredCertificationData.length > 0 &&
    filteredCertificationData.every((item) => selectedRows.has(item.id.toString()))
  );
}, [filteredCertificationData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
  return (
    filteredCertificationData.some((item) => selectedRows.has(item.id.toString())) &&
    !isAllDisplayedSelected
  );
}, [filteredCertificationData, selectedRows, isAllDisplayedSelected]);

 const handleDeleteApplications = (selectedRowIds: Set<string>) => {
  const idsToDelete = Array.from(selectedRowIds).map(id => parseInt(id));
  const updatedData = allCertificationData.filter(
    (item) => !idsToDelete.includes(item.id)
  );
  setAllCertificationData(updatedData);
  setIsModalOpen(false);
  setSelectedRows(new Set());
};


 const handleDeleteSingleApplication = (
  row: Record<string, string>,
  id: number
) => {
  const updatedData = allCertificationData.filter((item) => item.id !== id);
  setAllCertificationData(updatedData);
  setIsModalOpen(false);
  setSingleRowToDelete(null);

  // Remove these 3 lines:
  // const newSelected = new Set(selectedRows);
  // newSelected.delete(id);
  // setSelectedRows(newSelected);
};

  const openDeleteSingleModal = (row: Record<string, string>, id: number) => {
    setSingleRowToDelete({ row, id });
    setModalType("single");
    setIsModalOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = () => {
    if (modalType === "multiple" && selectedRows.size > 0) {
      handleDeleteApplications(selectedRows);
    } else if (modalType === "single" && singleRowToDelete) {
      handleDeleteSingleApplication(
        singleRowToDelete.row,
        singleRowToDelete.id
      );
    }
  };

  const tableControl = {
    hover: true,
    striped: false,
    bordered: false,
    shadow: false,
    compact: false,
    headerBgColor: "#252628",
    headerTextColor: "white",
    rowBgColor: "black",
    rowTextColor: "#e5e7eb",
    hoverBgColor: "black",
    hoverTextColor: "#ffffff",
    fontSize: 13,
    textAlign: "left" as const,
    rowBorder: false,
    headerBorder: true,
    borderColor: "#374151",
    highlightRowOnHover: true,
  };

  const uniquePendingApplications = [
    ...new Set(allCertificationData.map((item) => item["Pending Applications"])),
  ];
  const uniqueRejectedApplications = [
    ...new Set(allCertificationData.map((item) => item["Rejected Applications"])),
  ];
  const uniqueStatuses = [
    ...new Set(allCertificationData.map((item) => item["Status"])),
  ];

  const displayData = useMemo(() => {
    return filteredCertificationData.map(({ id: _id, ...rest }) => rest); // eslint-disable-line @typescript-eslint/no-unused-vars
  }, [filteredCertificationData]);

  const handleResetFilter = () => {
    setCertificationFilters({
      propertiesVerified: "",
      pendingApplications: "",
      rejectedApplications: "",
      status: "",
    });
    setSearchTerm("");
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
  };

  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = filteredCertificationData[index];
        window.location.href = `/super-admin/dashboard/applications/detail/${originalRow.id}`;
      },
    },
    {
      label: "Delete Application",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = filteredCertificationData[index];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRows(new Set());
            setSingleRowToDelete(null);
          }}
          onConfirm={handleModalConfirm}
          title="Confirm Admin Deletion"
          description="Deleting this admin means they will no longer have access to the system."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      <div className="flex flex-col justify-between pt-5">
        <Table
          setHeight = {false}
          data={displayData}
          title="Registered Admins"
          control={tableControl}
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const originalRow = filteredCertificationData[index];
            openDeleteSingleModal(row, originalRow.id);
          }}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllDisplayedSelected}
          isSomeSelected={isSomeDisplayedSelected}
          rowIds={filteredCertificationData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalItems={filteredCertificationData.length}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={
            selectedRows.size === 0 || selectedRows.size < displayData.length
          }
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description="Referring to find the right property faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={certificationFilters}
        onFilterChange={(filters) => {
          setCertificationFilters((prev) => ({
            ...prev,
            ...filters,
          }));
        }}
        
        dropdownStates={{
          propertiesVerified: showPropertiesVerifiedDropdown,
          pendingApplications: showPendingApplicationsDropdown,
          rejectedApplications: showRejectedApplicationsDropdown,
          status: showStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "propertiesVerified") setShowPropertiesVerifiedDropdown(value);
          if (key === "pendingApplications") setShowPendingApplicationsDropdown(value);
          if (key === "rejectedApplications") setShowRejectedApplicationsDropdown(value);
          if (key === "status") setShowStatusDropdown(value);
        }}
        fields={[
          {
            label: "Properties verified",
            key: "propertiesVerified",
            type: "dropdown",
            placeholder: "Select Properties",
            options: ["0 - 50", "50 - 100", "100 - 200"]
          },
          {
            label: "Pending applications",
            key: "pendingApplications",
            type: "dropdown",
            placeholder: "Select applications",
            options: uniquePendingApplications
          },
          {
            label: "Rejected applications",
            key: "rejectedApplications",
            type: "dropdown",
            placeholder: "Select applications",
            options: uniqueRejectedApplications
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueStatuses
          },
        ]}
      />
    </>
  );
}