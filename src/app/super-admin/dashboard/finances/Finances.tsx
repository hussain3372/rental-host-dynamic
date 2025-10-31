"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/shared/tables/Filter";
import ReceiptDrawer from "./ReceiptDrawer";
import RefundDrawer from "./RefundDrawer";
import { toast } from "react-hot-toast";
import { setting } from "@/app/api/Host/setting";

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

export default function Finances() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: string;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [financeFilters, setFinanceFilters] = useState<
    Record<string, string | Date | null>
  >({
    status: "",
  });

  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>(
    {}
  );

  const handleDropdownToggle = (key: string, value: boolean) => {
    setDropdownStates((prev) => ({ ...prev, [key]: value }));
  };

  const itemsPerPage = 6;
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch billing data from API
  const fetchBillingData = async (filters: ApiFilters) => {
    try {
      setLoading(true);
      
      console.log('API Call with filters:', filters);

      const response = (await setting.getBillingWithParams(filters)) as { 
        success: boolean; 
        data: PaymentResponse 
      };

      if (response.success && response.data && response.data.payments) {
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
        setFinanceData(formattedData);
        setTotalItems(response.data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching billing data:", err);
      toast.error("Failed to load financial transactions");
    } finally {
      setLoading(false);
    }
  };

  // Main effect for fetching data when page or status filter changes
  useEffect(() => {
    const filters: ApiFilters = {
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage
    };
    
    // Add status filter if it exists
    if (financeFilters.status && typeof financeFilters.status === 'string') {
      filters.status = financeFilters.status;
    }
    
    // Add search term if it exists and is valid (3+ characters)
    if (searchTerm && searchTerm.length >= 3) {
      filters.search = searchTerm;
    }
    
    void fetchBillingData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, financeFilters.status]);

  // Debounced search effect - separate from pagination
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search term is less than 3 characters and not empty, don't make API call
    if (searchTerm.length > 0 && searchTerm.length < 3) {
      return;
    }

    // Set timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      
      const filters: ApiFilters = {
        skip: 0,
        take: itemsPerPage
      };
      
      // Add status filter if it exists
      if (financeFilters.status && typeof financeFilters.status === 'string') {
        filters.status = financeFilters.status;
      }
      
      // Add search term if it exists
      if (searchTerm && searchTerm.length >= 3) {
        filters.search = searchTerm;
      }
      
      void fetchBillingData(filters);
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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
      const filters: ApiFilters = {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
      };
      
      if (financeFilters.status && typeof financeFilters.status === 'string') {
        filters.status = financeFilters.status;
      }
      
      if (searchTerm && searchTerm.length >= 3) {
        filters.search = searchTerm;
      }
      
      await fetchBillingData(filters);
      
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

  const handleResetFilter = () => {
    setFinanceFilters({ status: "" });
    setSearchTerm("");
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
    setCurrentPage(1);
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

      <div className="flex flex-col !h-full justify-between">
        <Table
          data={displayData}
          title="Financial Transactions"
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
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          isLoading={loading}
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