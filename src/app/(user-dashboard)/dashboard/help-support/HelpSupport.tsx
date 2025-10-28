"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/shared/tables/Tables";
import { Modal } from "@/app/shared/Modal";
import TicketDetailDrawer from "./TicketDetailDrawer";
import HelpSupportDrawer from "./HelpSupportDrawer";
import FilterDrawer from "../../../shared/tables/Filter";
import { supportApi } from "@/app/api/Host/support";
import { Ticket } from "@/app/api/Host/support/types";

interface CertificationData {
  id: number;
  "Ticket Id": string;
  "Issue Type": string;
  Subject: string;
  "Created On": string;
  Status: string;
}
interface TicketApiParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  property?: string;
  status?: string;
  createdAt?: string;
}

export default function HelpSupport() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal and delete states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New state for selected ticket
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Filter states - similar to Applications table
  const [appliedFilters, setAppliedFilters] = useState({
    subject: "",
    property: "",
    status: "",
    submittedDate: "",
  });

  const [tempFilters, setTempFilters] = useState({
    subject: "",
    property: "",
    status: "",
    submittedDate: "",
  });

  // State for date picker
  const [submittedDate, setSubmittedDate] = useState<Date | null>(null);

  // Dropdown states
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [allCertificationData, setAllCertificationData] = useState<
    CertificationData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // State for filter options - from API
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [allProperties, setAllProperties] = useState<string[]>([]);
  const [allStatuses, setAllStatuses] = useState<string[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch ALL tickets without filters for dropdown options
      const response = await supportApi.getTickets({
        page: 1,
        limit: 1000,
      });

      let ticketsData = null;

      // Extract data based on your API response structure
      if (Array.isArray(response.data?.data?.data)) {
        ticketsData = response.data.data.data;
      } else if (Array.isArray(response.data?.data)) {
        ticketsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ticketsData = response.data;
      } else {
        ticketsData = response.data?.tickets || response.data?.items || [];
      }

      if (ticketsData && Array.isArray(ticketsData)) {
        // Get unique values for filters
        const subjects = [
          ...new Set(
            ticketsData
              .map((ticket: Ticket) => ticket.subject || "")
              .filter(Boolean)
          ),
        ];

        // FIX: If tickets don't have property data, remove this filter or use appropriate field
        const properties = [
          ...new Set(
            ticketsData
              .map(
                (ticket: Ticket) =>
                  // Use appropriate property field here, or remove if not available
                  ticket.id || "" // Using ID as fallback, replace with actual property field
              )
              .filter(Boolean)
          ),
        ];

        const statuses = [
          ...new Set(
            ticketsData
              .map((ticket: Ticket) => ticket.status || "")
              .filter(Boolean)
          ),
        ];

        setAllSubjects(subjects);
        setAllProperties(properties);
        setAllStatuses(statuses);

        console.log("🟢 Filter options loaded:", {
          subjects: subjects.length,
          properties: properties.length,
          statuses: statuses.length,
        });
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);
  // ✅ FIXED: Update filter options when main data changes
  useEffect(() => {
    if (allCertificationData.length > 0) {
      console.log("🔄 Updating filter options from current data...");

      const subjects = [
        ...new Set(allCertificationData.map((item) => item.Subject || "")),
      ].filter(Boolean);

      const properties = [
        ...new Set(allCertificationData.map((item) => item["Ticket Id"] || "")),
      ].filter(Boolean);

      const statuses = [
        ...new Set(allCertificationData.map((item) => item.Status || "")),
      ].filter(Boolean);

      setAllSubjects(subjects);
      setAllProperties(properties);
      setAllStatuses(statuses);

      console.log("🟢 Updated filter options:", {
        subjects: subjects.length,
        properties: properties.length,
        statuses: statuses.length,
      });
    }
  }, [allCertificationData]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Sync temp filters when filter drawer opens
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

  // Date formatting for API
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
const fetchTickets = useCallback(async () => {
  try {
    setLoading(true);

    // Build API parameters correctly
    const apiParams: TicketApiParams = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add search term if applicable
    if (debouncedSearchTerm.trim().length >= 3) {
      apiParams.search = debouncedSearchTerm.trim();
    }

    // Add filters - use correct parameter names
    if (appliedFilters.subject?.trim()) {
      apiParams.subject = appliedFilters.subject.trim();
    }

    // FIX: Use correct property parameter - if you have property data in tickets
    if (appliedFilters.property?.trim()) {
      // If tickets have property field, use it. Otherwise remove this filter.
      apiParams.property = appliedFilters.property.trim();
    }

    if (appliedFilters.status?.trim()) {
      apiParams.status = appliedFilters.status.trim();
    }

    if (appliedFilters.submittedDate) {
      apiParams.createdAt = appliedFilters.submittedDate;
    }

    console.log("🚀 HITTING TICKETS API WITH PARAMS:", apiParams);

    const response = await supportApi.getTickets(apiParams);
    console.log("🔵 Full API Response:", response);

    // Extract data based on your API response structure
    let ticketsData = null;
    let apiTotal = 0;

    // Adjust this based on your actual API response structure
    if (Array.isArray(response.data?.data?.data)) {
      ticketsData = response.data.data.data;
      apiTotal = Number(response.data.data.total) || 0;
    } else if (Array.isArray(response.data?.data)) {
      ticketsData = response.data.data;
      apiTotal = Number(response.data.total) || ticketsData.length;
    } else if (Array.isArray(response.data)) {
      ticketsData = response.data;
      apiTotal = ticketsData.length;
    } else {
      // Fallback: try to find array in response
      ticketsData = response.data?.tickets || response.data?.items || [];
      
      // Ensure apiTotal is always a number
      const totalFromResponse = response.data?.total || response.data?.count || ticketsData.length;
      apiTotal = Number(totalFromResponse) || ticketsData.length;
    }

    if (ticketsData && Array.isArray(ticketsData)) {
      console.log("🟢 Tickets data found:", ticketsData);

      const tickets: CertificationData[] = ticketsData.map(
        (item: Ticket, index: number) => ({
          id: index + 1,
          "Ticket Id": item.id,
          "Issue Type": item.category,
          Subject: item.subject,
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
      console.error("🔴 No valid tickets data found");
      setAllCertificationData([]);
      setTotalItems(0);
    }
  } catch (error) {
    console.error("🔴 Error fetching tickets:", error);
    setAllCertificationData([]);
    setTotalItems(0);
  } finally {
    setLoading(false);
  }
}, [
  currentPage,
  itemsPerPage,
  debouncedSearchTerm,
  appliedFilters.subject,
  appliedFilters.property,
  appliedFilters.status,
  appliedFilters.submittedDate,
]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Debug effects to track state changes
  useEffect(() => {
    console.log("🟢 allCertificationData updated:", allCertificationData);
    console.log("🟢 allCertificationData length:", allCertificationData.length);
    console.log("🟢 Applied Filters:", appliedFilters);
  }, [allCertificationData, appliedFilters]);

  // ✅ FIXED: Remove client-side filtering since API handles it
  const filteredCertificationData = useMemo(() => {
    console.log("🟠 Using API-filtered data directly");
    return allCertificationData;
  }, [allCertificationData]);

  const displayData = useMemo(() => {
    const result = filteredCertificationData.map(({ id, ...rest }) => {
      console.log(id);
      return rest;
    });

    console.log("🟢 Display Data for Table:", result.length, "items");
    return result;
  }, [filteredCertificationData]);

  const handleResetFilter = () => {
    const resetFilters = {
      subject: "",
      property: "",
      status: "",
      submittedDate: "",
    };

    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSubmittedDate(null);
    setSearchTerm("");
    setCurrentPage(1);
    setIsFilterOpen(false);

    console.log("🟢 Filters reset");
  };

  const handleApplyFilter = () => {
    const dateString = formatDateForAPI(submittedDate);

    const filtersToApply = {
      subject: tempFilters.subject,
      property: tempFilters.property,
      status: tempFilters.status,
      submittedDate: dateString,
    };

    console.log("🟢 APPLYING TICKET FILTERS:", filtersToApply);

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleCloseFilter = () => {
    setTempFilters(appliedFilters);
    if (appliedFilters.submittedDate) {
      setSubmittedDate(new Date(appliedFilters.submittedDate));
    } else {
      setSubmittedDate(null);
    }
    setIsFilterOpen(false);
  };

  // Rest of your existing functions remain exactly the same...
  const handleDeleteApplications = async (selectedRowIds: Set<number>) => {
    try {
      const idsToDelete = Array.from(selectedRowIds).map(
        (id) =>
          allCertificationData.find((item) => item.id === id)?.["Ticket Id"]
      );

      console.log(" Deleting multiple tickets:", idsToDelete);

      await supportApi.deleteMultipleTickets(idsToDelete as string[]);
      console.log("🟢 Multiple tickets deleted successfully");

      const updatedData = allCertificationData.filter(
        (item) => !selectedRowIds.has(item.id)
      );
      setAllCertificationData(updatedData);
      setSelectedRows(new Set());
    } catch (error) {
      console.error(" Error deleting multiple tickets:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  // ✅ Delete Single Ticket
  const handleDeleteSingleApplication = async (
    row: Record<string, string>,
    id: number
  ) => {
    try {
      const ticketId = allCertificationData.find((item) => item.id === id)?.[
        "Ticket Id"
      ];
      if (!ticketId) return;
      const updatedData = allCertificationData.filter((item) => item.id !== id);
      setAllCertificationData(updatedData);
      setSingleRowToDelete(null);
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting single ticket:", error);
    } finally {
      setIsModalOpen(false);
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
      // Add ALL filtered data IDs
      filteredCertificationData.forEach((item) => newSelected.add(item.id));
    } else {
      // Remove ALL filtered data IDs
      filteredCertificationData.forEach((item) => newSelected.delete(item.id));
    }

    setSelectedRows(newSelected);
  };

  // Handle individual row selection
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    const numericId = parseInt(id);

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
    setCurrentPage(1);
  }, [searchTerm, appliedFilters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle delete selected - opens modal for confirmation
  const handleDeleteSelected = () => {
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setIsModalOpen(true);
    }
  };

  const handleViewDetails = async (ticketId: string) => {
    try {
      console.log("🟡 Fetching ticket details for ID:", ticketId);
      const response = await supportApi.getTicketById(ticketId);
      console.log("🔵 Full Ticket Detail Response:", response);

      if (response?.data) {
        const t = response.data;

        console.log("🟢 Raw ticket data from API:", t);

        const formattedTicket: Ticket = {
          id: t.id,
          userId: t.userId,
          subject: t.subject,
          description: t.description,
          category: t.category,
          priority: t.priority,
          status: t.status,
          assignedTo: t.assignedTo,
          attachmentUrls: t.attachmentUrls || [],
          tags: t.tags || [],
          resolution: t.resolution,
          resolvedAt: t.resolvedAt,
          closedAt: t.closedAt,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          user: t.user,
        };

        console.log("🟢 Formatted ticket:", formattedTicket);

        setSelectedTicket(formattedTicket);
        setIsDetailDrawerOpen(true);
        console.log("✅ Drawer should open now with ticket data");
      } else {
        console.error("🔴 No data found in response");
      }
    } catch (error) {
      console.error("🔴 Error fetching ticket details:", error);
    }
  };

  // Dropdown items for table actions
  const dropdownItems = [
    {
      label: "View Details",
      onClick: async (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredCertificationData[globalIndex];
        const ticketId = originalRow["Ticket Id"];
        await handleViewDetails(ticketId);
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

  // Loading state
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

      <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row items-start justify-between mb-[22px]">
        <div>
          <h1 className="text-[20px] leading-[24px] font-semibold text-white mb-2">
            Help & Support
          </h1>
          <p className="text-[16px] leading-[20px] text-[#FFFFFF99] font-regular max-w-[573px]">
            Manage your support tickets and stay informed with system
            announcements.
          </p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="yellow-btn cursor-pointer text-black px-[20px] py-[12px] rounded-[8px] font-semibold text-[18px] leading-[22px] hover:bg-[#E5F266] transition-colors duration-300"
        >
          Create Ticket
        </button>
      </div>

      <div className="flex flex-col justify-between">
        <Table
          data={displayData}
          title="Tickets"
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
          isAllSelected={
            filteredCertificationData.length > 0 &&
            filteredCertificationData.every((item) => selectedRows.has(item.id))
          }
          isSomeSelected={
            filteredCertificationData.some((item) =>
              selectedRows.has(item.id)
            ) &&
            !(
              filteredCertificationData.length > 0 &&
              filteredCertificationData.every((item) =>
                selectedRows.has(item.id)
              )
            )
          }
          rowIds={filteredCertificationData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={
            selectedRows.size === 0 || selectedRows.size < displayData.length
          }
          showActionColumn={true}
          disableClientSidePagination={true}
        />
      </div>

      {/* Updated FilterDrawer with API-based options */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
        title="Apply Filter"
        description="Refine listings to find the right tickets faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={{
          subject: tempFilters.subject,
          property: tempFilters.property,
          status: tempFilters.status,
          submittedDate: submittedDate,
        }}
        onFilterChange={(newValues) => {
          if (newValues.subject !== undefined) {
            setTempFilters((prev) => ({
              ...prev,
              subject: newValues.subject as string,
            }));
          }
          if (newValues.property !== undefined) {
            setTempFilters((prev) => ({
              ...prev,
              property: newValues.property as string,
            }));
          }
          if (newValues.status !== undefined) {
            setTempFilters((prev) => ({
              ...prev,
              status: newValues.status as string,
            }));
          }
          if (newValues.submittedDate !== undefined) {
            setSubmittedDate(newValues.submittedDate as Date | null);
          }
        }}
        dropdownStates={{
          subject: subjectDropdownOpen,
          property: propertyDropdownOpen,
          status: statusDropdownOpen,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "subject") setSubjectDropdownOpen(value);
          if (key === "property") setPropertyDropdownOpen(value);
          if (key === "status") setStatusDropdownOpen(value);
        }}
        fields={[
          {
            label: "Subject",
            key: "subject",
            type: "dropdown",
            placeholder: "Select subject",
            options: allSubjects,
          },
          {
            label: "Ticket ID", // Changed from "Property" to be more accurate
            key: "property",
            type: "dropdown",
            placeholder: "Select ticket ID",
            options: allProperties,
          },
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: allStatuses,
          },
          {
            label: "Created Date", // More accurate label
            key: "submittedDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />

      {/* Rest of your JSX remains exactly the same */}
      <div
        className={`fixed inset-0 bg-[#121315CC] z-[3000000000] flex justify-end transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <HelpSupportDrawer onClose={() => setIsDrawerOpen(false)} />
        </div>
      </div>

      {/* Ticket Detail Drawer */}
      <div
        className={`fixed inset-0 bg-[#121315CC] z-[3000000001] flex justify-end transition-opacity duration-300 ${
          isDetailDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDetailDrawerOpen(false)}
      >
        <div
          className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] bg-[#0A0C0B] h-full flex flex-col rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ease-in-out ${
            isDetailDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <TicketDetailDrawer
              isOpen={isDetailDrawerOpen}
              onClose={() => setIsDetailDrawerOpen(false)}
              ticket={selectedTicket}
            />
          </div>
        </div>
      </div>
    </>
  );
}
