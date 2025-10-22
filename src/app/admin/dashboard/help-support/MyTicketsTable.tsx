"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/shared/tables/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "../../../shared/tables/Filter";

interface CertificationData {
    id: number;
    "Ticket Id": string;
    "Issue Type": string;
    Subject: string;
    "Created On": string;
    Status: string;
}

interface MyTicketsTableProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    isFilterOpen: boolean;
    onFilterToggle: (open: boolean) => void;
    onViewDetails: (ticket: CertificationData) => void; // Added this prop
}

export default function MyTicketsTable({
    searchTerm,
    onSearchChange,
    currentPage,
    onPageChange,
    itemsPerPage,
    isFilterOpen,
    onFilterToggle,
    onViewDetails // Added this prop
}: MyTicketsTableProps) {
    // Modal and delete states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [singleRowToDelete, setSingleRowToDelete] = useState<{
        row: Record<string, string>;
        id: number;
    } | null>(null);
    const [modalType, setModalType] = useState<'single' | 'multiple'>('multiple');

    const [certificationFilters, setCertificationFilters] = useState({
        status: "",
        submittedDate: "",
    });

    // State for date picker
    const [submittedDate, setSubmittedDate] = useState<Date | null>(null);

    // Dropdown states - only status dropdown needed
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    const [allCertificationData, setAllCertificationData] = useState<CertificationData[]>([
        {
            id: 1,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Tickets",
            Subject: "View and man...",
            "Created On": "Aug 20, 2025",
            Status: "Resolved",
        },
        {
            id: 2,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Queries",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Pending",
        },
        {
            id: 3,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Assistance Center",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Resolved",
        },
        {
            id: 4,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Tickets",
            Subject: "View and man...",
            "Created On": "Aug 20, 2025",
            Status: "Pending",
        },
        {
            id: 5,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Queries",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Pending",
        },
        {
            id: 6,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Assistance Center",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Resolved",
        },
        {
            id: 7,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Queries",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Pending",
        },
        {
            id: 8,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Tickets",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Resolved",
        },
        {
            id: 9,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Queries",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Pending",
        },
        {
            id: 10,
            "Ticket Id": "TIK - 8765",
            "Issue Type": "Support Queries",
            Subject: "View and man...",
            "Created On": "Aug 12, 2025",
            Status: "Pending",
        },
    ]);

    // Unique dropdown values - only status needed
    const uniqueStatuses = [
        ...new Set(allCertificationData.map((item) => item["Status"])),
    ];

    // Filter + search logic - simplified to only status and date
    const filteredCertificationData = useMemo(() => {
        let filtered = allCertificationData;

        if (searchTerm) {
            filtered = filtered.filter(
                (item) =>
                    item["Ticket Id"]
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    item["Issue Type"].toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item["Subject"].toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (certificationFilters.status) {
            filtered = filtered.filter(
                (item) => item["Status"] === certificationFilters.status
            );
        }

        if (certificationFilters.submittedDate) {
            filtered = filtered.filter((item) =>
                item["Created On"].includes(certificationFilters.submittedDate)
            );
        }

        return filtered;
    }, [searchTerm, certificationFilters, allCertificationData]);

    // Selection state calculations
    const isAllDisplayedSelected = useMemo(() => {
        return filteredCertificationData.length > 0 &&
            filteredCertificationData.every(item => selectedRows.has(item.id));
    }, [filteredCertificationData, selectedRows]);

    const isSomeDisplayedSelected = useMemo(() => {
        return filteredCertificationData.some(item => selectedRows.has(item.id)) &&
            !isAllDisplayedSelected;
    }, [filteredCertificationData, selectedRows, isAllDisplayedSelected]);

    // Transform data to exclude ID from display but keep it for navigation
    const displayData = useMemo(() => {
        return filteredCertificationData.map(({ id, ...rest }) => {
              console.log(id);
            return rest;
        });
    }, [filteredCertificationData]);

    // Delete handlers
    const handleDeleteApplications = (selectedRowIds: Set<number>) => {
        const idsToDelete = Array.from(selectedRowIds);
        const updatedData = allCertificationData.filter(item => !idsToDelete.includes(item.id));
        setAllCertificationData(updatedData);
        setIsModalOpen(false);
        setSelectedRows(new Set());
    };

    const handleDeleteSingleApplication = (row: Record<string, string>, id: number) => {
        const updatedData = allCertificationData.filter((item) => item.id !== id);
        setAllCertificationData(updatedData);
        setIsModalOpen(false);
        setSingleRowToDelete(null);

        const newSelected = new Set(selectedRows);
        newSelected.delete(id);
        setSelectedRows(newSelected);

        const remainingDataCount = updatedData.length;
        const maxPageAfterDeletion = Math.ceil(remainingDataCount / itemsPerPage);

        if (currentPage > maxPageAfterDeletion) {
            onPageChange(Math.max(1, maxPageAfterDeletion));
        }
    };

    const openDeleteSingleModal = (row: Record<string, string>, id: number) => {
        setSingleRowToDelete({ row, id });
        setModalType('single');
        setIsModalOpen(true);
    };

    // Handle select all for ALL filtered data
    const handleSelectAll = (checked: boolean) => {
        const newSelected = new Set(selectedRows);

        if (checked) {
            // Add ALL filtered data IDs
            filteredCertificationData.forEach(item => newSelected.add(item.id));
        } else {
            // Remove ALL filtered data IDs
            filteredCertificationData.forEach(item => newSelected.delete(item.id));
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
        if (modalType === 'multiple' && selectedRows.size > 0) {
            handleDeleteApplications(selectedRows);
        } else if (modalType === 'single' && singleRowToDelete) {
            handleDeleteSingleApplication(singleRowToDelete.row, singleRowToDelete.id);
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
}, [searchTerm, certificationFilters, onPageChange]);


    const handleResetFilter = () => {
        setCertificationFilters({
            status: "",
            submittedDate: "",
        });
        onSearchChange("");
        setSubmittedDate(null);
    };

    const handleApplyFilter = () => {
        if (submittedDate) {
            setCertificationFilters(prev => ({
                ...prev,
                submittedDate: submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }));
        }
        onFilterToggle(false);
    };

    // Handle delete selected - opens modal for confirmation
    const handleDeleteSelected = () => {
        if (selectedRows.size > 0) {
            setModalType('multiple');
            setIsModalOpen(true);
        }
    };

    // Dropdown items for table actions - FIXED: Now calls onViewDetails
    const dropdownItems = [
        {
            label: "View Details",
            onClick: (row: Record<string, string>, index: number) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const originalRow = filteredCertificationData[globalIndex];
                onViewDetails(originalRow); // Call the parent function
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

    return (
        <>
            {isModalOpen &&
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleModalConfirm}
                    title="Confirm Ticket Deletion"
                    description="Deleting this ticket means it will no longer appear in your requests."
                    image="/images/delete-modal.png"
                    confirmText="Delete"
                />
            }

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
                    rowIds={filteredCertificationData.map(item => item.id.toString())}
                    dropdownItems={dropdownItems}
                    searchTerm={searchTerm}
                    onSearchChange={onSearchChange}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredCertificationData.length}
                    showFilter={true}
                    onFilterToggle={onFilterToggle}
                    onDeleteAll={handleDeleteSelected}
                    isDeleteAllDisabled={selectedRows.size === 0 || selectedRows.size < displayData.length}
                />
            </div>

            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => onFilterToggle(false)}
                title="Apply Filter"
                description="Refine listings to find the right property faster."
                resetLabel="Reset"
                onReset={handleResetFilter}
                buttonLabel="Apply Filter"
                onApply={handleApplyFilter}
                filterValues={certificationFilters}
                onFilterChange={(filters) => {
                    setCertificationFilters(prev => ({
                        ...prev,
                        ...filters
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