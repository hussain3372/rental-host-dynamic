"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
// import { X, User, Briefcase, Calendar, Activity } from "lucide-react";
import Image from "next/image";
import Dropdown from "@/app/shared/Dropdown";
interface ColumnConfig {
  truncate?: boolean;
  className?: string;
}
export type TableControl = {
  hover?: boolean;
  striped?: boolean;
  bordered?: boolean;
  shadow?: boolean;
  compact?: boolean;
  borderStyle?: "solid" | "double" | "dashed" | "dotted";
  borderRadius?: number;
  borderColor?: string;
  rowBorder?: boolean;
  headerBorder?: boolean;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  headerBgColor?: string;
  headerTextColor?: string;
  rowBgColor?: string;
  rowTextColor?: string;
  zebraColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  nthChildColors?: string[];
  nthChildStart?: number;
  nthChildStep?: number;
  highlightRowOnHover?: boolean;
  columnConfig?: Record<string, ColumnConfig>;

};

interface TableProps<T> {
  title?: string;
  setHeight?: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (rowId: string, checked: boolean) => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  rowIds: string[];
  data: T[];
  control?: TableControl;
  onRowClick?: (row: T, index: number) => void;
  dropdownItems?: { label: string; onClick: (row: T, index: number) => void }[];
  clickable?: boolean;
  onDeleteSingle?: (row: T, index: number) => void;
  showDeleteButton?: boolean;
  selectedRows: Set<string>;
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<string>>>;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showPagination?: boolean;
  showFilter?: boolean;
  onFilterToggle?: (isOpen: boolean) => void;
  onDeleteAll?: () => void;
  isDeleteAllDisabled?: boolean;
  disableClientSidePagination?: boolean;
    isLoading?: boolean;


}

export function Table<T extends Record<string, unknown>>({
  title,
  setHeight = true,
  data,
  control = {},
  onRowClick,
  clickable = true,
  showDeleteButton = false,
  dropdownItems,
  selectedRows = new Set(),
  setSelectedRows = () => { },
  onSelectAll,
  onSelectRow,
  isAllSelected = false,
  isSomeSelected = false,
  rowIds = [],
  searchTerm = "",
  onSearchChange = () => { },
  currentPage = 1,
  onPageChange = () => { },
  itemsPerPage = 6,
  totalItems = 0,
  showPagination = true,
  showFilter = false,
  onFilterToggle = () => { },
  onDeleteAll = () => { },
  isDeleteAllDisabled = true,
  disableClientSidePagination = false, // ✅ ADD THIS


}: TableProps<T>) {
  const [displayData, setDisplayData] = useState<T[]>(data);
  const [activeSortDropdown, setActiveSortDropdown] = useState<string | null>(
    null
  );
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  useEffect(() => {
    setDisplayData([...data]);
  }, [data, setSelectedRows]);

  const tableId = `table-${Math.random().toString(36).substr(2, 9)}`;

  const renderStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let badgeClasses =
      "inline-flex px-2 py-1 rounded-full text-xs font-medium ";

    if (
      statusLower === "verified" ||
      statusLower === "approved" ||
      statusLower === "active"
    ) {
      badgeClasses += "bg-[#2d2d2d] text-[#EFFC76] py-2 px-3";
    } else if (
      statusLower === "near expiry" ||
      statusLower === "pending" ||
      statusLower === "inactive"
    ) {
      badgeClasses += "bg-[#2d2d2d] text-[#FFB52B] py-2 px-3";
    } else if (
      statusLower === "expired" ||
      statusLower === "rejected" ||
      statusLower === "suspended" ||
      statusLower === "failed"
    ) {
      badgeClasses += "bg-[#2d2d2d] text-[#FF5050] py-2 px-3";
    } else if (statusLower === "refunded") {
      badgeClasses += "bg-[#2d2d2d] text-[#28EB1D] py-2 px-3";
    } else {
      badgeClasses += "bg-[#2d2d2d] text-[#EFFC76] py-2 px-3";
    }

    return <span className={badgeClasses}>{status}</span>;
  };

  const renderCellContent = (key: string, value: unknown) => {
    if (key.toLowerCase() === "status" && typeof value === "string") {
      return renderStatusBadge(value);
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return String(value ?? "");
  };

  const generateRowCSS = useCallback(() => {
    let css = "";

    displayData.forEach((_, idx) => {
      let bgColor = control.rowBgColor || "#ffffff";

      if (control.nthChildColors && control.nthChildColors.length > 0) {
        const nthColors = control.nthChildColors || [];
        const nthStart = control.nthChildStart || 1;
        const nthStep = control.nthChildStep || 1;
        const rowNumber = idx + 1;

        if (rowNumber >= nthStart) {
          const adjustedPosition = rowNumber - nthStart;
          if (adjustedPosition % nthStep === 0) {
            const colorIndex =
              Math.floor(adjustedPosition / nthStep) % nthColors.length;
            bgColor = nthColors[colorIndex];
          }
        }
      } else if (control.striped && idx % 2 === 1) {
        bgColor = control.zebraColor || "#f9f9f9";
      }

      css += `
        #${tableId} tbody tr:nth-child(${idx + 1}) {
          background-color: ${bgColor} !important;
          color: ${control.rowTextColor || "#424242"} !important;
          transition: all 0.3s ease !important;
        }
      `;

      if (control.hover || control.highlightRowOnHover) {
        css += `
          #${tableId} tbody tr:hover {
            background-color: ${control.hoverBgColor || "#f0f0f0"} !important;
            color: ${control.hoverTextColor || "#424242"} !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
            z-index: 1 !important;
            position: relative !important;
          }
        `;
      }
    });

    return css;
  }, [displayData, control, tableId]);

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = generateRowCSS();
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [generateRowCSS]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeSortDropdown &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveSortDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeSortDropdown]);


  const totalPages = showPagination ? Math.ceil(totalItems / itemsPerPage) : 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const tableData = disableClientSidePagination
    ? data
    : (showPagination
      ? data.slice(startIndex, startIndex + itemsPerPage)
      : data);
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= 1) {
      return null;
    }

    buttons.push(
      <button
        type="button"
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center p-[13px] justify-center text-gray-400 hover:text-white transition-colors border border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image src="/images/arrow-left.svg" height={14} width={14} alt="Back" />
      </button>
    );

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      if (currentPage <= maxVisiblePages) {
        endPage = maxVisiblePages;
      } else {
        startPage = currentPage - Math.floor(maxVisiblePages / 2);
        endPage = currentPage + Math.floor(maxVisiblePages / 2);

        if (startPage < 1) {
          startPage = 1;
          endPage = maxVisiblePages;
        }
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = totalPages - maxVisiblePages + 1;
        }
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          type="button"
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm leading-[18px] p-[13px] transition-colors border cursor-pointer ${currentPage === i
            ? "bg-[#EFFC76] text-black font-medium border-[#EFFC76]"
            : "text-white opacity-60 border-gray-600"
            }`}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button
        type="button"
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 p-[13px]"
      >
        <Image
          src="/images/arrow-right.svg"
          height={14}
          width={14}
          alt="Back"
        />
      </button>
    );

    return buttons;
  };

  const keys = displayData.length > 0 ? Object.keys(displayData[0]) : [];
  const paddingSize = control.compact ? "8px 12px" : "12px 16px";

  const getBorderWidth = () => {
    if (control.borderStyle === "double") {
      return "3px";
    }
    return "2px";
  };

  const handleRowClick = (row: T, index: number, e?: React.MouseEvent) => {
    if (clickable && onRowClick && e) {
      const target = e.target as HTMLElement;
      if (
        !target.closest('input[type="checkbox"]') &&
        !target.closest("button") &&
        !target.closest("label")
      ) {
        onRowClick(row, index);
      }
    }
  };

  return (
    <div style={{ marginBottom: 15 }}>
      <div
        className={`bg-[#121315] overflow-auto ${setHeight ? "custom-height" : ""
          }  rounded-lg relative z-[10] scrollbar-hide`}
      >
        <div className="flex flex-col sm:flex-row justify-between lg:items-center pt-5 px-5">
          <h2 className="text-white text-[16px] font-semibold leading-[20px]">
            {title}
          </h2>
          <div className="flex flex-wrap sm:flex-row items-start sm:items-center pt-3 sm:pt-0 gap-3">
            <div className="relative w-full sm:w-[204px]">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                autoFocus
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-white/12 border rounded-lg text-white/40 placeholder-white/60 w-full px-3 py-2 text-sm pl-8 border-none outline-none"
              />
              <div className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500">
                <Image
                  src="/images/search.png"
                  alt="search"
                  width={16}
                  height={16}
                />
              </div>
            </div>

            {showFilter && (
              <button
                type="button"
                onClick={() => onFilterToggle(true)}
                className="h-[34px] cursor-pointer w-[86px] rounded-md bg-[#2e2f31] py-2 px-3 flex items-center gap-1"
              >
                <span className="text-sm leading-[18px] font-medium text-white opacity-60">
                  Filter
                </span>
                <Image
                  src="/images/filter1.png"
                  alt="filter"
                  height={9}
                  width={13}
                />
              </button>
            )}

            {showDeleteButton && (
              <button
                type="button"
                onClick={onDeleteAll}
                disabled={isDeleteAllDisabled}
                className="flex cursor-pointer items-center gap-[6px] p-2 rounded-[8px] 
                  border border-[rgba(239,252,118,0.32)] text-[#EFFC76] text-[12px] font-normal leading-[16px]
                  disabled:bg-[transparent] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Image
                  src="/images/delete-row.svg"
                  alt="Delete selected"
                  width={12}
                  height={12}
                />
                Delete All
              </button>
            )}
          </div>
        </div>

        <div className="p-0 cursor-pointer">
          <div
            className="scrollbar-hide"
            style={{
              overflowX: "auto",
              width: "100%",
              borderRadius: control.borderRadius
                ? `${control.borderRadius}px`
                : "0",
              boxShadow: control.shadow ? "0 4px 6px rgba(0,0,0,0.1)" : "none",
              border: control.bordered
                ? `${getBorderWidth()} ${control.borderStyle || "solid"} ${control.borderColor || "#e0e0e0"
                }`
                : "none",
            }}
          >
            <div className="p-5">
              <table
                id={tableId}
                className="p-5 scrollbar-hide"
                style={{
                  width: "100%",
                  overflow: "auto",
                  minWidth: "max-content",
                  borderCollapse: "collapse",
                  backgroundColor: "transparent",
                  fontSize: control.fontSize || 14,
                  textAlign: control.textAlign || "left",
                }}
              >
                <thead className={!data || data.length === 0 ? "hidden" : ""}>
                  <tr
                    style={{ backgroundColor: control.headerBgColor || "#333" }}
                  >
                    {showDeleteButton && (
                      <th
                        style={{
                          padding: paddingSize,
                          fontWeight: 700,
                          color: "white",
                          fontSize: "12px",
                          lineHeight: "16px",
                          whiteSpace: "nowrap",
                          width: "24px",
                          borderTopLeftRadius: control.borderRadius || 8,
                        }}
                      >
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = isSomeSelected;
                              }
                            }}
                            onChange={(e) => onSelectAll?.(e.target.checked)}
                            className="peer hidden"
                          />
                          <span
                            className="absolute inset-0 rounded-md border-2 border-[#FFFFFFCC] translate-x-1 translate-y-1 
                          peer-checked:border-[#EFFC76]"
                          ></span>
                          <span
                            className="relative w-5 h-5 rounded-md border-2 border-[#FFFFFFCC] bg-[#252628] 
                            flex items-center justify-center 
                            peer-checked:bg-[#EFFC76] peer-checked:border-[#EFFC76]
                            peer-checked:after:content-['✓'] peer-checked:after:text-black peer-checked:after:text-xs peer-checked:after:font-bold"
                          ></span>
                        </label>
                      </th>
                    )}

                    {keys.map((key, index) => (
                      <th
                        key={key}
                        style={{
                          padding: paddingSize,
                          fontWeight: 700,
                          color: "white",
                          textAlign: control.textAlign || "left",
                          fontSize: "12px",
                          lineHeight: "16px",
                          whiteSpace: "nowrap",
                          position: "relative",
                          borderTopLeftRadius:
                            !showDeleteButton && index === 0
                              ? control.borderRadius || 8
                              : 0,
                          borderTopRightRadius:
                            index === keys.length - 1 && !showDeleteButton
                              ? control.borderRadius || 8
                              : 0,
                        }}
                      >
                        <div
                          ref={index === 0 ? sortDropdownRef : null}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSortDropdown(
                              activeSortDropdown === key ? null : key
                            );
                          }}
                        >
                          {key}
                          <Image
                            src="/images/menu.png"
                            alt="menu"
                            height={16}
                            width={16}
                          />
                        </div>
                      </th>
                    ))}

                    {showDeleteButton && (
                      <th
                        className="flex gap-2 !pt-[17px]"
                        style={{
                          padding: paddingSize,
                          fontWeight: 700,
                          color: "white",
                          fontSize: "12px",
                          lineHeight: "16px",
                          whiteSpace: "nowrap",
                          borderTopRightRadius: control.borderRadius || 8,
                        }}
                      >
                        Action
                        <Image
                          src="/images/menu.png"
                          alt="menu"
                          height={16}
                          width={16}
                        />
                      </th>
                    )}
                  </tr>
                </thead>

                {!data || data.length === 0 ? (
                  <tbody>
                    <tr>
                      <td
                        colSpan={Math.max(
                          keys.length + (showDeleteButton ? 1 : 0),
                          1
                        )}
                      >
                        <div
                          className="text-center bg-[#121315] custom-height flex flex-col justify-center items-center"
                          style={{
                            padding: 20,
                            textAlign: "center",
                            color: "#666",
                          }}
                        >
                          <Image
                            src="/images/empty.png"
                            alt="No data"
                            width={120}
                            height={120}
                            className="mb-3"
                          />
                          <p className="text-white/60 font-medium text-[16px] leading-[20px]">
                            No data available
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="!bg-transparent table-container">
                    {tableData.map((row, idx) => (
                      <tr
                        className="rounded-md !bg-transparent"
                        key={idx}
                        style={{ cursor: "default" }}
                        onClick={() => handleRowClick(row, idx)}
                      >
                        {showDeleteButton && (
                          <td
                            style={{
                              padding: paddingSize,
                              whiteSpace: "nowrap",
                              width: "24px",
                            }}
                          >
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedRows.has(
                                  rowIds[
                                  showPagination ? startIndex + idx : idx
                                  ]
                                )}
                                onChange={(e) => {
                                  const rowId =
                                    rowIds[
                                    showPagination ? startIndex + idx : idx
                                    ];
                                  onSelectRow?.(rowId, e.target.checked);
                                }}
                                className="peer hidden"
                              />
                              <span
                                className="absolute inset-0 rounded-md border-2 border-[#FFFFFFCC] translate-x-1 translate-y-1 
                              peer-checked:border-[#EFFC76]"
                              ></span>
                              <span
                                className="relative w-5 h-5 rounded-md border-2 border-[#FFFFFFCC] bg-[#252628] 
                                          flex items-center justify-center 
                                          peer-checked:bg-[#EFFC76] peer-checked:border-[#EFFC76]
                                          peer-checked:after:content-['✓'] peer-checked:after:text-black peer-checked:after:text-xs peer-checked:after:font-bold"
                              ></span>
                            </label>
                          </td>
                        )}

                        {keys.map((key) => (
                          <td
                            key={key}
                            style={{
                              padding: paddingSize,
                              fontWeight: 400,
                              fontSize: "14px",
                              lineHeight: "18px",
                              color: "#FFFFFF99",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "150px", // 👈 adjust this width as needed
                            }}
                          >
                            {renderCellContent(key, row[key])}
                          </td>
                        ))}

                        {showDeleteButton && (
                          <td style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => handleDropdownToggle(idx, e)}
                              className={`px-6 py-1 text-white rounded cursor-pointer`}
                            >
                              <Image
                                src="/images/menu.svg"
                                alt="Open detail"
                                width={3}
                                height={12}
                              />
                            </button>

                            {activeDropdown === idx && dropdownItems && (
                              <Dropdown
                                isOpen={true}
                                onClose={() => setActiveDropdown(null)}
                                items={dropdownItems.map((item) => {
                                  let disabled = false;
                                  if (
                                    item.label === "Delete Application" ||
                                    item.label.toLowerCase().includes("delete")
                                  ) {
                                    const rowId =
                                      rowIds[
                                      showPagination ? startIndex + idx : idx
                                      ];
                                    disabled = !selectedRows.has(rowId);
                                  }

                                  return {
                                    label: item.label,
                                    disabled,
                                    className: disabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : "",
                                    onClick: () => {
                                      if (!disabled) {
                                        item.onClick(row, idx);
                                        setActiveDropdown(null);
                                      }
                                    },
                                  };
                                })}
                              />
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex justify-center mt-[20px]">
          <div className="flex items-center gap-2">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
}
