"use client";
import React, { useState, useRef, useEffect } from "react";
import { setting } from "@/app/api/super-admin/setting";
import {
  RefundRequest,
  Transaction,
} from "@/app/api/super-admin/setting/types";
import { toast } from "react-hot-toast";

interface RefundDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onRefundSuccess?: () => void;
}

const RefundDrawer = ({
  isOpen,
  onClose,
  transaction,
  onRefundSuccess,
}: RefundDrawerProps) => {
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Initialize refund amount when transaction changes
  useEffect(() => {
    if (transaction) {
      setRefundAmount(transaction.amount);
    }
  }, [transaction]);

  // Handle mount/unmount with smooth transitions
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      setError(null);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else if (!isOpen && isMounted) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
        setRefundReason("");
        setRefundAmount(transaction?.amount || 0);
        setError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted, transaction]);

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string): string => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  // Generate refund ID
  const generateRefundId = (transactionId: string): string => {
    if (!transactionId) return "REF-N/A";
    return `REF-${transactionId.slice(-8).toUpperCase()}`;
  };

  // Handle refund submission
  // Handle refund submission
  // Handle refund submission
  const handleConfirmRefund = async (): Promise<void> => {
    // if (!refundReason.trim()) {
    //   setError("Please provide a reason for the refund");
    //   toast.error("Please provide a reason for the refund");
    //   return;
    // }

    if (refundAmount <= 0 || refundAmount > transaction.amount) {
      setError("Please enter a valid refund amount");
      toast.error("Please enter a valid refund amount");
      return;
    }

    // Check if transaction status allows refund
    if (transaction.status !== "COMPLETED") {
      const errorMsg = `Only completed payments can be refunded. Current status: ${transaction.status}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Prepare refund payload
      const refundPayload: RefundRequest = {
        paymentId: transaction.id,
        amount: refundAmount,
        reason: refundReason.trim(),
      };

      console.log("Processing refund with payload:", refundPayload);

      // Show loading toast
      // const loadingToast = toast.loading("Processing refund...");

      // Call the refund API
      const response = await setting.processRefund(refundPayload);

      console.log("Full API Response:", response);

      if (response.data) {
        console.log("Refund processed successfully:", response.data);

        // Update toast to success

        // Call success callback if provided
        if (onRefundSuccess) {
          onRefundSuccess();
        }

        // Close drawer
        setIsVisible(false);
        setTimeout(() => {
          onClose();
          setIsProcessing(false);
        }, 300);
      } else {
        // Check if response has error structure
        if (
          "errors" in response &&
          Array.isArray(response.errors) &&
          response.errors.length > 0
        ) {
          const errorMessage = response.errors[0] || "Refund failed";
          throw new Error(errorMessage);
        } else if (
          "message" in response &&
          typeof response.message === "string"
        ) {
          throw new Error(response.message);
        } else {
          throw new Error("Refund failed - no data received from server");
        }
      }
    } catch (error: unknown) {
      console.error("Error processing refund:", error);

      let errorMessage = "Failed to process refund. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Handle axios-like error response
        const apiError = error as {
          response?: {
            data?: {
              message?: string;
              errors?: string[];
            };
          };
          message?: string;
        };

        if (apiError.response?.data?.errors?.[0]) {
          errorMessage = apiError.response.data.errors[0];
        } else if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage, { duration: 5000 });
      setIsProcessing(false);
    }
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= transaction.amount) {
      setRefundAmount(value);
      setError(null);
    }
  };

  // Handle reason change
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRefundReason(e.target.value);
    setError(null);
  };

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    }

    if (isMounted) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMounted]);

  // Close on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isMounted) {
        handleClose();
      }
    }

    if (isMounted) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMounted]);

  // Handle drawer close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isMounted || !transaction) return null;

  // Prepare plan details
  const planDetails = [
    {
      title: "Host Name",
      value: transaction.host?.name || transaction.hostName || "N/A",
    },
    {
      title: "Plan Name",
      value: transaction.planName || "N/A",
    },
    {
      title: "Payment Status",
      value: transaction.status
        ? transaction.status.charAt(0) +
          transaction.status.slice(1).toLowerCase()
        : "N/A",
    },
  ];

  // Prepare transaction details
  const transactionDetails = [
    {
      title: "Transaction ID",
      value: transaction.transactionId || "N/A",
    },
    {
      title: "Amount Paid",
      value: formatCurrency(transaction.amount, transaction.currency),
    },
    {
      title: "Payment Method",
      value:
        transaction.method === "card"
          ? "Credit/Debit Card"
          : transaction.method === "MOCK"
          ? "Mock Payment"
          : transaction.method
          ? transaction.method.charAt(0) +
            transaction.method.slice(1).toLowerCase()
          : "N/A",
    },
    {
      title: "Transaction Date",
      value: formatDate(transaction.createdAt),
    },
  ];

  // Prepare refund details
  const refundDetails = [
    {
      title: "Refund ID",
      value: generateRefundId(transaction.id),
    },
    {
      title: "Refund Amount",
      value: (
        <input
          type="text"
          value={refundAmount}
          onChange={handleAmountChange}
          min="0"
          max={transaction.amount}
          step="0.01"
          className="bg-transparent appearance-none  [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-noneborder-none text-white font-medium text-[14px] leading-[18px] w-20 text-right focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded px-1"
        />
      ),
    },
    {
      title: "Currency",
      value: transaction.currency || "USD",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleOverlayClick}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 overflow-auto scrollbar-hide right-0 h-full bg-[#0A0C0B] border-l border-l-[#FFFFFF1F] text-white flex flex-col justify-between p-[28px] w-[90vw] sm:w-[608px] z-[9000] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Heading */}
        <div>
          <h2 className="text-[20px] font-medium mb-3 transition-all duration-300 ease-out">
            Issue Refund
          </h2>
          <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5 transition-all duration-300 ease-out">
            Review the transaction details below and confirm the refund. Once
            processed, the amount will be reversed to the host&apos;s payment
            method.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Plan Details */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Plan Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
              {planDetails.map((item, index) => (
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">
                      {item.title}
                    </p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Transaction Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
              {transactionDetails.map((item, index) => (
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">
                      {item.title}
                    </p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Details */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Refund Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
              {refundDetails.map((item, index) => (
                <div key={index} className="">
                  <div className="flex justify-between items-center">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">
                      {item.title}
                    </p>
                    {typeof item.value === "string" ? (
                      <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">
                        {item.value}
                      </p>
                    ) : (
                      item.value
                    )}
                  </div>
                </div>
              ))}
            </div>
            {transaction.status === "COMPLETED" ||
              (transaction.status === "PENDING" && (
                <p className="text-[#FFFFFF99] text-[12px] mt-2">
                  Maximum refundable amount:{" "}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              ))}
          </div>

          {/* Refund Reason */}
          {transaction.status === "COMPLETED" ||
            (transaction.status === "PENDING" && (
              <div className="mb-5">
                <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
                  Reason for refund
                </label>
                <textarea
                  placeholder="Give a reason for refund"
                  className="bg-gradient-to-b from-[#202020] border resize-none border-[#414141] to-[#101010] w-full rounded-[10px] p-3 focus:outline-none text-[14px] font-regular text-white placeholder-[#FFFFFF99]"
                  rows={4}
                  value={refundReason}
                  onChange={handleReasonChange}
                />
              </div>
            ))}
        </div>

        {transaction.status === "COMPLETED" || (transaction.status === "PENDING" && (
            <div className="transition-all duration-300 ease-out">
              <button
                onClick={handleConfirmRefund}
                disabled={isProcessing}
                className={`w-full h-[52px] py-4 mt-[50px] text-[18px] font-semibold rounded-md text-black text-sm 
                        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        hover:scale-[1.02] active:scale-[0.98] ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "yellow-btn hover:bg-yellow-600"
                        }`}
              >
                {isProcessing ? "Processing Refund..." : "Confirm Refund"}
              </button>
            </div>
          ))}
      </div>
    </>
  );
};

RefundDrawer.displayName = "RefundDrawer";

export default RefundDrawer;
