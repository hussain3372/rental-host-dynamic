"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/shared/tables/Filter";
import ReceiptDrawer from "./ReceiptDrawer";
import RefundDrawer from "./RefundDrawer";
import { toast } from "react-hot-toast";
import { setting } from "@/app/api/super-admin/setting";

export interface PaymentResponse {
  payments: {
    id: string;
    applicationId: string;
    hostId: number;
    amount: string;
    currency: string;
    status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED" | "CANCELLED";
    paymentMethod: string;
    gatewayTransactionId: string;
    gatewayResponse: { mock?: boolean };
    refundedAmount: string | null;
    refundedAt: string | null;
    createdAt: string;
    updatedAt: string;
    application: {
      id: string;
      status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
      propertyDetails: {
        rent: number;
        images: string[];
        address: string;
        bedrooms: number;
        currency: string;
        bathrooms: number;
        maxGuests: number;
        ownership: string;
        description: string;
        propertyName: string;
        propertyType: string;
      };
    };
    host: {
      id: number;
      name: string;
      email: string;
    };
  }[];
  total: number;
}

interface FinanceData {
  id: string;
  hostName: string;
  transactionId: string;
  planName: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

interface ApiFilters {
  status?: string;
  search?: string;
  skip: number;
  take: number;
}

interface PaginationData {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Finances() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: string;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [financeFilters, setFinanceFilters] = useState({
    status: "",
  });

  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>(
    {}
  );

  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [paginationData, setPaginationData] = useState<PaginationData>({
    total: 0,
    pageSize: itemsPerPage,
    currentPage: 1,
    totalPages: 1,
    nextPage: null,
    prevPage: null,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Debounce search term - only update if 3+ characters or empty
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim().length >= 3 || searchTerm.trim() === "") {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearchTerm.trim() !== "" || financeFilters.status.trim() !== ""
    );
  }, [debouncedSearchTerm, financeFilters.status]);

  // Fetch billing data from API
  const fetchBillingData = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: ApiFilters = {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      };

      if (financeFilters.status) {
        filters.status = financeFilters.status;
      }
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
        filters.search = debouncedSearchTerm;
      }

      console.log("📊 API Filters:", filters);

      const response = await setting.getBillingWithParams(filters);

      console.log("📥 API Response:", response);

      if (response.success && response.data) {
        const formattedData: FinanceData[] = response.data.payments.map(
          (payment) => ({
            id: payment.id,
            hostName: payment.host?.name || "N/A",
            transactionId: payment.gatewayTransactionId || "N/A",
            planName:
              payment.application?.propertyDetails?.propertyName || "N/A",
            amount: parseFloat(payment.amount) || 0,
            method: payment.paymentMethod || "N/A",
            status: payment.status,
            createdAt: payment.createdAt,
          })
        );

        // FIX: Use the meta object from API response
        const meta = response.data.meta;
        const total = meta?.total || 0;
        const totalPages = meta?.totalPages || 1;

        console.log("🔢 Pagination Data from API:", {
          total,
          currentPage: meta?.page || currentPage,
          itemsPerPage: meta?.limit || itemsPerPage,
          totalPages,
          hasNextPage: meta?.hasNextPage || false,
          hasPrevPage: meta?.hasPrevPage || false,
        });

        setFinanceData(formattedData);

        // FIX: Set pagination data from the meta object
        setPaginationData({
          total,
          pageSize: meta?.limit || itemsPerPage,
          currentPage: meta?.page || currentPage,
          totalPages,
          nextPage: meta?.hasNextPage ? (meta?.page || currentPage) + 1 : null,
          prevPage: meta?.hasPrevPage ? (meta?.page || currentPage) - 1 : null,
          hasNextPage: meta?.hasNextPage || false,
          hasPrevPage: meta?.hasPrevPage || false,
        });
      } else {
        console.error("Invalid API response structure:", response);
        setFinanceData([]);
        setPaginationData({
          total: 0,
          pageSize: itemsPerPage,
          currentPage: 1,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (err) {
      console.error("Error fetching billing data:", err);
      toast.error("Failed to load financial transactions");
      setFinanceData([]);
      setPaginationData({
        total: 0,
        pageSize: itemsPerPage,
        currentPage: 1,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, financeFilters.status, currentPage, itemsPerPage]);
  // Main effect for fetching data
  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const displayData = useMemo(() => {
    return financeData.map((item) => ({
      "Host Name": item.hostName,
      "Transaction ID": item.transactionId,
      "Plan Name": item.planName,
      Amount: `$${item.amount.toFixed(2)}`,
      Method: item.method,
      Status: item.status,
    }));
  }, [financeData]);

  const handleDeleteSingleFinance = async (id: string) => {
    try {
      // TODO: Replace with actual API call to delete transaction
      // await setting.deleteTransaction(id);

      // For now, just refetch the data
      await fetchBillingData();

      setIsModalOpen(false);
      setSingleRowToDelete(null);
      toast.success("Transaction deleted successfully");
    } catch (err) {
      console.error("Error deleting transaction:", err);
      toast.error("Failed to delete transaction");
    }
  };

  const openDeleteSingleModal = (row: Record<string, string>, id: string) => {
    setSingleRowToDelete({ row, id });
    setModalType("single");
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (modalType === "single" && singleRowToDelete) {
      void handleDeleteSingleFinance(singleRowToDelete.id);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, financeFilters.status]);

  const handleResetFilter = () => {
    setFinanceFilters({ status: "" });
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleDropdownToggle = (key: string, value: boolean) => {
    setDropdownStates((prev) => ({ ...prev, [key]: value }));
  };

  const isAllSelected = useMemo(() => {
    return (
      financeData.length > 0 &&
      financeData.every((item) => selectedRows.has(item.id))
    );
  }, [financeData, selectedRows]);

  const isSomeSelected = useMemo(() => {
    return selectedRows.size > 0 && !isAllSelected;
  }, [selectedRows, isAllSelected]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set<string>();
    if (checked) {
      financeData.forEach((item) => newSelected.add(item.id));
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Only reset page if we're actually going to search (3+ chars) or clearing search
    if (term.trim().length >= 3 || term.trim() === "") {
      setCurrentPage(1);
    }
  };

  const tableControls = {
    hover: true,
  };

  const dropdownItems = [
    {
      label: "View Receipt",
      onClick: () => setReceiptOpen(true),
    },
    {
      label: "Issue Refund",
      onClick: () => setRefundOpen(true),
    },
    {
      label: "Delete Transaction",
      onClick: (row: Record<string, string>, index: number) => {
        const originalRow = financeData[index];
        openDeleteSingleModal(row, originalRow.id);
      },
    },
  ];

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
          title="Confirm Transaction Deletion"
          description="Deleting this transaction means it will no longer appear in your financial records."
          image="/images/delete-modal.png"
          confirmText="Delete"
        />
      )}

      <div className="flex flex-col h-full justify-between">
        <Table
          data={displayData}
          title="Financial Transactions"
          control={tableControls}
          setHeight={true}
          showDeleteButton={true}
          showPagination={true}
          clickable={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          rowIds={financeData.map((item) => item.id)}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={paginationData.pageSize}
          totalItems={paginationData.total || 0}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          isLoading={isLoading}
          disableClientSidePagination={true}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Transactions"
        description="Filter transactions by status."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={financeFilters}
        onFilterChange={(filters) =>
          setFinanceFilters({ ...financeFilters, ...filters })
        }
        dropdownStates={dropdownStates}
        onDropdownToggle={handleDropdownToggle}
        fields={[
          {
            label: "Status",
            key: "status",
            type: "dropdown",
            placeholder: "Select status",
            options: [
              "COMPLETED",
              "PENDING",
              "REFUNDED",
              "FAILED",
              "CANCELLED",
            ],
          },
        ]}
      />

      {receiptOpen && (
        <ReceiptDrawer
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
        />
      )}
      {refundOpen && (
        <RefundDrawer
          isOpen={refundOpen}
          onClose={() => setRefundOpen(false)}
        />
      )}
    </>
  );
}
