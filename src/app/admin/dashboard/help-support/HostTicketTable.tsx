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
  "Host Name": string;
  "Created On": string;
  Status: string;
}

interface HostTicketTableProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  isFilterOpen: boolean;
  onFilterToggle: (open: boolean) => void;
  onViewDetails: (ticket: CertificationData) => void;
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

export default function HostTicketTable({
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  isFilterOpen,
  onFilterToggle,
  onViewDetails
}: HostTicketTableProps) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Modal and delete states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  // API data states
  const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states - following the same pattern as HelpSupport
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

  // State for filter options - from API
  const [, setAllSubjects] = useState<string[]>([]);
  const [, setAllProperties] = useState<string[]>([]);
  const [allStatuses, setAllStatuses] = useState<string[]>([]);

  // Debounced search - same as HelpSupport
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch filter options - same pattern as HelpSupport
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch ALL tickets without filters for dropdown options
      const response = await supportApi.getTickets({
        page: 1,
        limit: 1000,
      });

      let ticketsData = null;

      // Extract data based on your API response structure - same logic
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

        const properties = [
          ...new Set(
            ticketsData
              .map((ticket: Ticket) => ticket.id || "")
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

        console.log("🟢 Host Tickets Filter options loaded:", {
          subjects: subjects.length,
          properties: properties.length,
          statuses: statuses.length,
        });
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  // Update filter options when main data changes - same pattern
  useEffect(() => {
    if (allCertificationData.length > 0) {
      console.log("🔄 Updating host tickets filter options from current data...");

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

      console.log("🟢 Updated host tickets filter options:", {
        subjects: subjects.length,
        properties: properties.length,
        statuses: statuses.length,
      });
    }
  }, [allCertificationData]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Sync temp filters when filter drawer opens - same pattern
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

  // Date formatting for API - same function
  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch tickets - same pattern but with Host Name
  const fetchTickets = useCallback(async () => {
    try {
      // setLoading(true);

       if (
      debouncedSearchTerm.trim().length > 0 && 
      debouncedSearchTerm.trim().length < 3 &&
      !appliedFilters.subject &&
      !appliedFilters.property &&
      !appliedFilters.status &&
      !appliedFilters.submittedDate
    ) {
      console.log("🟡 Skipping API call - search term too short and no filters applied");
      // setAllCertificationData([]);
      // setTotalItems(0);
      setLoading(false);
      return;
    }


      // Build API parameters correctly - same as HelpSupport
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

      if (appliedFilters.property?.trim()) {
        apiParams.property = appliedFilters.property.trim();
      }

      if (appliedFilters.status?.trim()) {
        apiParams.status = appliedFilters.status.trim();
      }

      if (appliedFilters.submittedDate) {
        apiParams.createdAt = appliedFilters.submittedDate;
      }

      console.log("🚀 HITTING HOST TICKETS API WITH PARAMS:", apiParams);

      const response = await supportApi.getTickets(apiParams);
      console.log("🔵 Full Host Tickets API Response:", response);

      // Extract data based on your API response structure - same logic
      let ticketsData = null;
      let apiTotal = 0;

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
        ticketsData = response.data?.tickets || response.data?.items || [];
        
        const totalFromResponse = response.data?.total || response.data?.count || ticketsData.length;
        apiTotal = Number(totalFromResponse) || ticketsData.length;
      }

      if (ticketsData && Array.isArray(ticketsData)) {
        console.log("🟢 Host Tickets data found:", ticketsData);

        const tickets: CertificationData[] = ticketsData.map(
          (item: Ticket, index: number) => ({
            id: index + 1,
            "Ticket Id": item.id,
            "Issue Type": item.category,
            Subject: item.subject,
            "Host Name": item.user?.name || `User ${item.userId}`, // Added Host Name
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
        console.error("🔴 No valid host tickets data found");
        setAllCertificationData([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("🔴 Error fetching host tickets:", error);
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
    console.log("🟢 Host Tickets allCertificationData updated:", allCertificationData);
    console.log("🟢 Host Tickets allCertificationData length:", allCertificationData.length);
    console.log("🟢 Host Tickets Applied Filters:", appliedFilters);
  }, [allCertificationData, appliedFilters]);

  // ✅ Same filtering approach - using API-filtered data directly
  const filteredCertificationData = useMemo(() => {
    console.log("🟠 Using API-filtered host tickets data directly");
    return allCertificationData;
  }, [allCertificationData]);

  const displayData = useMemo(() => {
    const result = filteredCertificationData.map(({ id, ...rest }) => {
      console.log(id);
      return rest;
    });

    console.log("🟢 Host Tickets Display Data for Table:", result.length, "items");
    return result;
  }, [filteredCertificationData]);

  // Filter handlers - same pattern as HelpSupport
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
    onSearchChange("");
    onPageChange(1);
    onFilterToggle(false);

    console.log("🟢 Host Tickets Filters reset");
  };

  const handleApplyFilter = () => {
    const dateString = formatDateForAPI(submittedDate);

    const filtersToApply = {
      subject: tempFilters.subject,
      property: tempFilters.property,
      status: tempFilters.status,
      submittedDate: dateString,
    };

    console.log("🟢 APPLYING HOST TICKET FILTERS:", filtersToApply);

    setAppliedFilters(filtersToApply);
    onPageChange(1);
    onFilterToggle(false);
  };

  const handleCloseFilter = () => {
    setTempFilters(appliedFilters);
    if (appliedFilters.submittedDate) {
      setSubmittedDate(new Date(appliedFilters.submittedDate));
    } else {
      setSubmittedDate(null);
    }
    onFilterToggle(false);
  };

  // ✅ FIXED: Delete multiple tickets with API call and refetch
  const handleDeleteApplications = async (selectedRowIds: Set<number>) => {
    try {
      const idsToDelete = Array.from(selectedRowIds).map(
        (id) =>
          allCertificationData.find((item) => item.id === id)?.["Ticket Id"]
      ).filter(Boolean) as string[];

      console.log("🔴 Deleting multiple tickets:", idsToDelete);

      // Call the API to delete tickets
      await supportApi.deleteMultipleTickets(idsToDelete);
      console.log("🟢 Multiple tickets deleted successfully");

      // Clear selected rows
      setSelectedRows(new Set());
      
      // Refetch tickets to get updated data from server
      await fetchTickets();
      
    } catch (error) {
      console.error("🔴 Error deleting multiple tickets:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  // ✅ FIXED: Delete single ticket with API call and refetch
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

      // ✅ Call the API to delete the ticket
      await supportApi.deleteTicket(ticketId);
      console.log("🟢 Single ticket deleted successfully");

      // Clear the row from selected rows
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      // ✅ Refetch tickets to get updated data from server
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

  // Selection handlers - same pattern
  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRows);

    if (checked) {
      filteredCertificationData.forEach((item) => newSelected.add(item.id));
    } else {
      filteredCertificationData.forEach((item) => newSelected.delete(item.id));
    }

    setSelectedRows(newSelected);
  };

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

  // Table control - same styling
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

  const handleDeleteSelected = () => {
    if (selectedRows.size > 0) {
      setModalType("multiple");
      setIsModalOpen(true);
    }
  };

  // Dropdown items for table actions - same pattern
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading host tickets...</p>
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
          title="Host Tickets"
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

      {/* FilterDrawer with same structure as HelpSupport */}
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
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: allStatuses,
          },
          {
            label: "Created Date",
            key: "submittedDate",
            type: "date",
            placeholder: "Select date",
          },
        ]}
      />
    </>
  );
}