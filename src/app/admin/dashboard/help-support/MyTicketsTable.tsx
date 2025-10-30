"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/shared/tables/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "../../../shared/tables/Filter";
import { supportApi } from "@/app/api/Admin/support";
import { Ticket } from "@/app/api/Admin/support/types";

interface CertificationData {
  id: number;
  "Ticket Id": string;
  "Issue Type": string;
  Subject: string;
  "Created On": string;
  Status: string;
  "Host Name"?: string;
}
interface DetailedTicket {
  id: string;
  ticketId: string;
  issueType: string;
  subject: string;
  description: string;
  createdOn: string;
  status: string;
  attachment?: {
    name: string;
    size: string;
    url: string;
  };
}

interface MyTicketsTableProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  isFilterOpen: boolean;
  onFilterToggle: (open: boolean) => void;
  onViewDetails: (ticket: CertificationData) => void;
  refreshTrigger?: number;
}

export default function MyTicketsTable({
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  isFilterOpen,
  onFilterToggle,
  onViewDetails,
  refreshTrigger = 0,
}: MyTicketsTableProps) {
  // Modal and delete states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: Separate applied filters and temp filters like Applications table
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
    submittedDate: "",
  });

  const [tempFilters, setTempFilters] = useState({
    status: "",
    submittedDate: "",
  });

  // State for date picker
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);

  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  // ✅ FIXED: Sync temp filters when filter drawer opens
  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(appliedFilters);
      if (appliedFilters.submittedDate) {
        setSubmittedDate(new Date(appliedFilters.submittedDate));
      } else {
        setSubmittedDate(null);
      }
    }
  }, [isFilterOpen, appliedFilters]);
// ✅ Add function to fetch detailed ticket data
// const fetchTicketDetails = useCallback(async (ticketId: string) => {
//   try {
//     console.log("🟡 Fetching detailed ticket data for:", ticketId);
    
//     // Assuming you have an API method to get single ticket details
//     const response = await supportApi.getTicketById(ticketId);
//     console.log("🔵 Detailed Ticket API Response:", response);

//     // Adjust this based on your API response structure
//     const ticketData = response.data || response.data;
    
//     if (ticketData) {
//       const detailedTicket: DetailedTicket = {
//         id: ticketData.id,
//         ticketId: ticketData.id, // or ticketData.ticketId if available
//         issueType: ticketData.category,
//         subject: ticketData.subject,
//         description: ticketData.description || "No description available",
//         createdOn: new Date(ticketData.createdAt).toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         }),
//         status: ticketData.status,
//         attachment: ticketData.attachmentUrls && ticketData.attachmentUrls.length > 0 ? {
//           name: "Attachment", // You might want to get the actual file name from API
//           size: "N/A", // You might want to get the actual file size from API
//           url: ticketData.attachmentUrls[0] // Get the first attachment
//         } : undefined
//       };
      
//       setSelectedTicketDetails(detailedTicket);
//       setIsDetailDrawerOpen(true);
//     }
//   } catch (error) {
//     console.error("🔴 Error fetching ticket details:", error);
//     // Fallback to basic data if detailed fetch fails
//     const basicTicket = allCertificationData.find(ticket => ticket["Ticket Id"] === ticketId);
//     if (basicTicket) {
//       const fallbackTicket: DetailedTicket = {
//         id: basicTicket["Ticket Id"],
//         ticketId: basicTicket["Ticket Id"],
//         issueType: basicTicket["Issue Type"],
//         subject: basicTicket.Subject,
//         description: "Description not available",
//         createdOn: basicTicket["Created On"],
//         status: basicTicket.Status,
//         attachment: undefined
//       };
//       setSelectedTicketDetails(fallbackTicket);
//       setIsDetailDrawerOpen(true);
//     }
//   }
// }, [allCertificationData]);
  // Format date for API
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ FIXED: Fetch tickets function with proper filter application
  const fetchTickets = useCallback(async () => {
    try {
      // setLoading(true);

       if (
      searchTerm.trim().length > 0 && 
      searchTerm.trim().length < 3 &&
      !appliedFilters.status &&
      !appliedFilters.submittedDate 
    ) {
      console.log("🟡 Skipping API call - search term too short and no filters applied");
      // setAllCertificationData([]);
      // setTotalItems(0);
      setLoading(false);
      return;
    }


      const response = await supportApi.getAdminTickets(
        currentPage,
        itemsPerPage,
        searchTerm.trim() || undefined,
        undefined,
        appliedFilters.status || undefined,
        appliedFilters.submittedDate || undefined
      );

      console.log("🔵 Admin Tickets API Response:", response);

      let ticketsData = null;
      let apiTotal = 0;

      if (Array.isArray(response.data?.data?.data)) {
        ticketsData = response.data.data.data;
        apiTotal = response.data.data.total;
      } else if (Array.isArray(response.data?.data)) {
        ticketsData = response.data.data;
        apiTotal = response.data.total || ticketsData.length;
      } else if (Array.isArray(response.data)) {
        ticketsData = response.data;
        apiTotal = ticketsData.length;
      }

      if (ticketsData && Array.isArray(ticketsData)) {
        console.log("🟢 Admin tickets data found:", ticketsData);

        const tickets: CertificationData[] = ticketsData.map(
          (item: Ticket, index: number) => ({
            id: index + 1,
            "Ticket Id": item.id,
            "Issue Type": item.category,
            Subject: item.subject,
            // "Host Name": item.user?.name || "N/A", 
            "Created On": new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            Status: item.status,
          })
        );

        setAllCertificationData(tickets);
        setTotalItems(apiTotal);
      } else {
        console.error("🔴 No valid admin tickets data found");
        setAllCertificationData([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("🔴 Error fetching admin tickets:", error);
      setAllCertificationData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    appliedFilters.status,
    appliedFilters.submittedDate,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, refreshTrigger]);

  // Unique dropdown values
  const uniqueStatuses = [
    ...new Set(allCertificationData.map((item) => item["Status"])),
  ];

  // ✅ FIXED: Use server-side filtered data directly
  const filteredCertificationData = useMemo(() => {
    return allCertificationData;
  }, [allCertificationData]);

  // Selection state calculations
  const isAllDisplayedSelected = useMemo(() => {
    return (
      filteredCertificationData.length > 0 &&
      filteredCertificationData.every((item) => selectedRows.has(item.id))
    );
  }, [filteredCertificationData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
    return (
      filteredCertificationData.some((item) => selectedRows.has(item.id)) &&
      !isAllDisplayedSelected
    );
  }, [filteredCertificationData, selectedRows, isAllDisplayedSelected]);

  const displayData = useMemo(() => {
    return filteredCertificationData.map(({ id, ...rest }) => {
        console.log(id);
      return rest;
    });
  }, [filteredCertificationData]);

  // ✅ FIXED: Delete multiple tickets with API call and refetch
  const handleDeleteApplications = async (selectedRowIds: Set<number>) => {
    try {
      const idsToDelete = Array.from(selectedRowIds)
        .map(
          (id) =>
            allCertificationData.find((item) => item.id === id)?.["Ticket Id"]
        )
        .filter(Boolean) as string[];

      console.log("🔴 Deleting multiple tickets:", idsToDelete);

      await supportApi.deleteMultipleTickets(idsToDelete);
      console.log("🟢 Multiple tickets deleted successfully");

      setSelectedRows(new Set());
      await fetchTickets();
    } catch (error) {
      console.error("🔴 Error deleting multiple tickets:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleDeleteSingleApplication = async (
    row: Record<string, string>,
    id: number
  ) => {
    try {
      const ticketId = allCertificationData.find((item) => item.id === id)?.[
        "Ticket Id"
      ];

      if (!ticketId) {
        console.error("🔴 Ticket ID not found");
        return;
      }

      console.log("🔴 Deleting single ticket:", ticketId);

      await supportApi.deleteTicket(ticketId);
      console.log("🟢 Single ticket deleted successfully");

      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      await fetchTickets();
    } catch (error) {
      console.error("🔴 Error deleting single ticket:", error);
    } finally {
      setIsModalOpen(false);
      setSingleRowToDelete(null);
    }
  };

  const openDeleteSingleModal = (row: Record<string, string>, id: number) => {
    setSingleRowToDelete({ row, id });
    setModalType("single");
    setIsModalOpen(true);
  };

  // Handle select all for ALL filtered data
  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRows);

    if (checked) {
      filteredCertificationData.forEach((item) => newSelected.add(item.id));
    } else {
      filteredCertificationData.forEach((item) => newSelected.delete(item.id));
    }

    setSelectedRows(newSelected);
  };

  // Handle individual row selection
  const handleSelectRow = (_id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    const numericId = parseInt(_id);

    if (checked) {
      newSelected.add(numericId);
    } else {
      newSelected.delete(numericId);
    }
    setSelectedRows(newSelected);
  };

  // Handle confirmation from modal
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

  // Table control
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

  // Reset pagination when filters change
  useEffect(() => {
    onPageChange(1);
  }, [searchTerm, appliedFilters, onPageChange]);

  // ✅ FIXED: Enhanced reset filter function like Applications table
  const handleResetFilter = () => {
    const resetFilters = {
      status: "",
      submittedDate: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSubmittedDate(null);
    onFilterToggle(false);
    fetchTickets()
  };

  // ✅ FIXED: Enhanced apply filter function like Applications table
  const handleApplyFilter = () => {
    const filtersToApply = {
      ...tempFilters,
      submittedDate: submittedDate ? formatDateForAPI(submittedDate) : "",
    };

    console.log("Applying filters:", filtersToApply);
    setAppliedFilters(filtersToApply);
    onFilterToggle(false);
  };

  // ✅ FIXED: Enhanced close filter function like Applications table
  const handleCloseFilter = () => {
    setTempFilters(appliedFilters);
    if (appliedFilters.submittedDate) {
      setSubmittedDate(new Date(appliedFilters.submittedDate));
    } else {
      setSubmittedDate(null);
    }
    onFilterToggle(false);
  };

  // Handle delete selected - opens modal for confirmation
  const handleDeleteSelected = () => {
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setIsModalOpen(true);
    }
  };

  // Dropdown items for table actions
  const dropdownItems = [
    {
      label: "View Details",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        onViewDetails(originalRow);
      },
    },
    {
      label: "Delete Ticket",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading tickets...</p>
      </div>
    );
  }

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
          title="Confirm Ticket Deletion"
          description="Deleting this ticket means it will no longer appear in your requests."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      <div className="flex flex-col justify-between">
        <Table
          data={displayData}
          title="My Tickets"
          control={tableControl}
          showDeleteButton={true}
          onDeleteSingle={(row, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index;
            const originalRow = filteredCertificationData[globalIndex];
            openDeleteSingleModal(row, originalRow.id);
          }}
          showPagination={true}
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
          onSearchChange={onSearchChange}
          currentPage={currentPage}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          showFilter={true}
          onFilterToggle={onFilterToggle}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={
            selectedRows.size < 2
          }
          showActionColumn={true}
          disableClientSidePagination={true}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={handleCloseFilter} // ✅ Use enhanced close function
        title="Apply Filter"
        description="Refine listings to find the right property faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={tempFilters} // ✅ Use tempFilters instead of certificationFilters
        onFilterChange={(filters) => {
          setTempFilters((prev) => ({
            ...prev,
            ...filters,
          }));
        }}
        dropdownStates={{
          status: statusDropdownOpen,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "status") setStatusDropdownOpen(value);
        }}
        fields={[
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: uniqueStatuses,
          },
          {
            label: "Submitted date",
            key: "submittedDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}