"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@/app/admin/tables-essentials/Tables";
import { Modal } from "@/app/shared/Modal";
import FilterDrawer from "@/app/shared/tables/Filter";
import ReceiptDrawer from "./ReceiptDrawer";
import RefundDrawer from "./RefundDrawer";

interface FinanceData {
  id: number;
  "Host Name": string;
  "Transaction ID": string;
  "Plan Name": string;
  Amount: string;
  Method: string;
  "Status": "Completed" | "Pending" | "Refunded" | "Failed";
}

export default function Finances() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ReceiptOpen, setReceiptOpen] = useState(false);
  const [RefundOpen, setRefundOpen] = useState(false);
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
// Change from Set<number> to Set<string>
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [singleRowToDelete, setSingleRowToDelete] = useState<{
    row: Record<string, string>;
    id: number;
  } | null>(null);
  const [modalType, setModalType] = useState<"single" | "multiple">("multiple");

  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [financeFilters, setFinanceFilters] = useState({
    planName: "",
    method: "",
    status: "",
  });

  const [allFinanceData, setAllFinanceData] = useState<FinanceData[]>([
    {
      id: 1,
      "Transaction ID": "TRANS-9876",
      "Host Name": "Emily John",
      "Plan Name": "Professional",
      Amount: "$24",
      Method: "Credit/Debit",
      "Status": "Failed"
    },
    {
      id: 2,
      "Transaction ID": "TRANS-9877",
      "Host Name": "John Smith",
      "Plan Name": "Starter",
      Amount: "$12",
      Method: "Bank",
      "Status": "Completed"
    },
    {
      id: 3,
      "Transaction ID": "TRANS-9878",
      "Host Name": "Sarah Wilson",
      "Plan Name": "Enterprise",
      Amount: "$48",
      Method: "Credit/Debit",
      "Status": "Pending"
    },
    {
      id: 4,
      "Transaction ID": "TRANS-9879",
      "Host Name": "Mike Johnson",
      "Plan Name": "Professional",
      Amount: "$24",
      Method: "Bank",
      "Status": "Pending"
    },
    {
      id: 5,
      "Transaction ID": "TRANS-9880",
      "Host Name": "Lisa Brown",
      "Plan Name": "Starter",
      Amount: "$12",
      Method: "Credit/Debit",
      "Status": "Failed"
    },
    {
      id: 6,
      "Transaction ID": "TRANS-9881",
      "Host Name": "David Lee",
      "Plan Name": "Enterprise",
      Amount: "$48",
      Method: "Bank",
      "Status": "Refunded"
    },
    {
      id: 7,
      "Transaction ID": "TRANS-9882",
      "Host Name": "Emma Davis",
      "Plan Name": "Professional",
      Amount: "$24",
      Method: "Credit/Debit",
      "Status": "Completed"
    },
    {
      id: 8,
      "Transaction ID": "TRANS-9883",
      "Host Name": "Robert Wilson",
      "Plan Name": "Starter",
      Amount: "$12",
      Method: "Bank",
      "Status": "Refunded"
    },
  ]);

  const openReceipt = (row: Record<string, string>, index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    const originalRow = filteredFinanceData[globalIndex];
    console.log("Opening receipt for:", originalRow);
    setReceiptOpen(true);
  };

  const openRefund = (row: Record<string, string>, index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    const originalRow = filteredFinanceData[globalIndex];
    console.log("Opening refund for:", originalRow);
    setRefundOpen(true);
  };

  // Get unique values for filter options
  const uniquePlanNames = [...new Set(allFinanceData.map((item) => item["Plan Name"]))];
  const uniqueMethods = [...new Set(allFinanceData.map((item) => item["Method"]))];
  const uniqueStatuses = [...new Set(allFinanceData.map((item) => item["Status"]))];

  const filteredFinanceData = useMemo(() => {
    let filtered = allFinanceData;
  
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item["Transaction ID"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Host Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          item["Plan Name"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (financeFilters.planName) {
      filtered = filtered.filter(
        (item) => item["Plan Name"] === financeFilters.planName
      );
    }

    if (financeFilters.method) {
      filtered = filtered.filter(
        (item) => item["Method"] === financeFilters.method
      );
    }

    if (financeFilters.status) {
      filtered = filtered.filter(
        (item) => item["Status"] === financeFilters.status
      );
    }

    return filtered;
  }, [searchTerm, financeFilters, allFinanceData]);

 const handleSelectAll = (checked: boolean) => {
  const newSelected = new Set<string>();
  if (checked) {
    filteredFinanceData.forEach((item) => newSelected.add(item.id.toString()));
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
    filteredFinanceData.length > 0 &&
    filteredFinanceData.every((item) => selectedRows.has(item.id.toString()))
  );
}, [filteredFinanceData, selectedRows]);

  const isSomeDisplayedSelected = useMemo(() => {
  return (
    filteredFinanceData.some((item) => selectedRows.has(item.id.toString())) &&
    !isAllDisplayedSelected
  );
}, [filteredFinanceData, selectedRows, isAllDisplayedSelected]);

 const handleDeleteFinances = (selectedRowIds: Set<string>) => {
  const idsToDelete = Array.from(selectedRowIds).map(id => parseInt(id));
  const updatedData = allFinanceData.filter((item) => !idsToDelete.includes(item.id));
  setAllFinanceData(updatedData);
  setIsModalOpen(false);
  setSelectedRows(new Set());
};

  const handleDeleteSingleFinance = (row: Record<string, string>, id: number) => {
  const updatedData = allFinanceData.filter((item) => item.id !== id);
  setAllFinanceData(updatedData);
  setIsModalOpen(false);
  setSingleRowToDelete(null);

  // Remove these 3 lines:
  // const newSelected = new Set(selectedRows);
  // newSelected.delete(id);
  // setSelectedRows(newSelected);

  const remainingDataCount = updatedData.length;
  const maxPageAfterDeletion = Math.ceil(remainingDataCount / itemsPerPage);

  if (currentPage > maxPageAfterDeletion) {
    setCurrentPage(Math.max(1, maxPageAfterDeletion));
  }
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
      handleDeleteFinances(selectedRows);
    } else if (modalType === "single" && singleRowToDelete) {
      handleDeleteSingleFinance(singleRowToDelete.row, singleRowToDelete.id);
    }
  };

  const displayData = useMemo(() => {
    return filteredFinanceData.map(({ id, ...rest }) => {
      console.log(id);
      return rest;
    });
  }, [filteredFinanceData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, financeFilters]);

  const handleResetFilter = () => {
    setFinanceFilters({
      planName: "",
      method: "",
      status: "",
    });
    setSearchTerm("");
  };

  const handleApplyFilter = () => {
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const dropdownItems = [
    {
      label: "View Receipt",
      onClick: openReceipt
    },
    {
      label: "Issue Refund",
      onClick: openRefund
    },
    {
      label: "Delete Transaction",
      onClick: (row: Record<string, string>, index: number) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index;
        const originalRow = filteredFinanceData[globalIndex];
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
          onDeleteSingle={(row, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index;
            const originalRow = filteredFinanceData[globalIndex];
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
          rowIds={filteredFinanceData.map((item) => item.id.toString())}
          dropdownItems={dropdownItems}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredFinanceData.length}
          showFilter={true}
          onFilterToggle={setIsFilterOpen}
          onDeleteAll={handleDeleteSelected}
          isDeleteAllDisabled={selectedRows.size === 0 || selectedRows.size < displayData.length}
        />
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Apply Filter"
        description="Refine transactions to find specific records faster."
        resetLabel="Reset"
        onReset={handleResetFilter}
        buttonLabel="Apply Filter"
        onApply={handleApplyFilter}
        filterValues={financeFilters}
        onFilterChange={(filters) => {
          setFinanceFilters(prev => ({
            ...prev,
            ...filters
          }));
        }}
        dropdownStates={{
          planName: showPlanDropdown,
          method: showMethodDropdown,
          status: showStatusDropdown,
        }}
        onDropdownToggle={(key, value) => {
          if (key === "planName") setShowPlanDropdown(value);
          if (key === "method") setShowMethodDropdown(value);
          if (key === "status") setShowStatusDropdown(value);
        }}
        fields={[
          {
            label: "Plan Name",
            key: "planName",
            type: "dropdown",
            placeholder: "Select plan",
            options: uniquePlanNames
          },
          {
            label: "Payment method",
            key: "method",
            type: "dropdown",
            placeholder: "Select method",
            options: uniqueMethods
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
      
      {ReceiptOpen && (
        <ReceiptDrawer isOpen={ReceiptOpen} onClose={() => setReceiptOpen(false)} />
      )}
      {RefundOpen && (
        <RefundDrawer isOpen={RefundOpen} onClose={() => setRefundOpen(false)} />
      )}
    </>
  );
}