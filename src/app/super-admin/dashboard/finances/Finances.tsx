"use client";
import React, { useMemo, useState, useEffect } from "react";
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

  // dropdown open/close states for FilterDrawer
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

  // ✅ Fetch billing data from API
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const statusParam =
        typeof financeFilters.status === "string" && financeFilters.status
          ? financeFilters.status
          : "COMPLETED";

      const response = (await setting.getBillingWithParams({
        status: statusParam,
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
      })) as { success: boolean; data: PaymentResponse };

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

  useEffect(() => {
    fetchBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, financeFilters]);

  const displayData = useMemo(() => {
    return financeData.map((item) => ({
      "Host Name": item.hostName,
      "Transaction ID": item.transactionId,
      "Plan Name": item.planName,
      Amount: item.amount.toFixed(2),
      Method: item.method,
      Status: item.status,
    }));
  }, [financeData]);

  const handleDeleteSingleFinance = (
    row: Record<string, string>,
    id: string
  ) => {
    const updatedData = financeData.filter((item) => item.id !== id);
    setFinanceData(updatedData);
    setIsModalOpen(false);
    setSingleRowToDelete(null);
    toast.success("Transaction deleted successfully");
  };

  const openDeleteSingleModal = (row: Record<string, string>, id: string) => {
    setSingleRowToDelete({ row, id });
    setModalType("single");
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    if (modalType === "single" && singleRowToDelete) {
      handleDeleteSingleFinance(singleRowToDelete.row, singleRowToDelete.id);
    }
  };

  const handleResetFilter = () => {
    setFinanceFilters({ status: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
    setCurrentPage(1);
    fetchBillingData();
  };

  const filteredFinanceData = useMemo(() => {
    if (!searchTerm) return financeData;
    return financeData.filter(
      (item) =>
        item.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.planName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [financeData, searchTerm]);

  const isAllSelected = useMemo(() => {
    return (
      filteredFinanceData.length > 0 &&
      filteredFinanceData.every((item) => selectedRows.has(item.id))
    );
  }, [filteredFinanceData, selectedRows]);

  const isSomeSelected = useMemo(() => {
    return selectedRows.size > 0 && !isAllSelected;
  }, [selectedRows, isAllSelected]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set<string>();
    if (checked)
      filteredFinanceData.forEach((item) => newSelected.add(item.id));
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    checked ? newSelected.add(id) : newSelected.delete(id);
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
        const originalRow = filteredFinanceData[index];
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
          rowIds={filteredFinanceData.map((item) => item.id)}
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
