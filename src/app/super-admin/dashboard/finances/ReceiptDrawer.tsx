"use client";
import React, { useState, useRef, useEffect } from "react";

interface DrawerProps {
  onClose: () => void;
  isOpen: boolean;
  transaction: {
    id: string;
    hostName: string;
    transactionId: string;
    planName: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
    currency: string;
    application?: {
      id: string;
      status: string;
      propertyDetails: {
        propertyName: string;
        address: string;
      };
    };
    host?: {
      name: string;
      email: string;
    };
    gatewayResponse?: {
      id?: string;
      customer?: string;
      receipt_email?: string;
    };
    refundedAmount?: string | null;
    refundedAt?: string | null;
  };
}

const ReceiptDrawer: React.FC<DrawerProps> = ({ onClose, isOpen, transaction }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Generate invoice number from transaction ID
  const generateInvoiceNumber = (transactionId: string): string => {
    return `INV-${transactionId.slice(-8).toUpperCase()}`;
  };

  // Handle download receipt
  const handleDownloadReceipt = () => {
    // In a real application, this would generate and download a PDF receipt
    console.log("Downloading receipt for transaction:", transaction.id);
    
    // For now, we'll just show a success message
    
    // Close the drawer after download
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Handle mount/unmount with smooth transitions
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else if (!isOpen && isMounted) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        setTimeout(onClose, 300);
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
  }, [isMounted, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && isMounted) {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }

    if (isMounted) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMounted, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMounted]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  if (!isMounted) return null;

  // Prepare transaction details
  const transactionDetails = [
    {
      title: "Transaction ID",
      value: transaction.transactionId || "N/A",
    },
    {
      title: "Date & Time",
      value: formatDate(transaction.createdAt),
    },
    {
      title: "Plan Name",
      value: transaction.planName,
    },
    {
      title: "Payment Status",
      value: transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase(),
    },
  ];

  // Prepare host information
  const hostInfo = [
    {
      title: "Host Name",
      value: transaction.host?.name || transaction.hostName || "N/A",
    },
    {
      title: "Email",
      value: transaction.host?.email || transaction.gatewayResponse?.receipt_email || "N/A",
    },
  ];

  // Prepare payment information
  const paymentInfo = [
    {
      title: "Amount",
      value: formatCurrency(transaction.amount, transaction.currency),
    },
    {
      title: "Payment Method",
      value: transaction.method === "card" ? "Credit/Debit Card" : 
             transaction.method === "MOCK" ? "Mock Payment" : 
             transaction.method.charAt(0) + transaction.method.slice(1).toLowerCase(),
    },
    {
      title: "Currency",
      value: transaction.currency,
    },
  ];

  // Prepare additional details
  const additionalDetails = [
    {
      title: "Invoice Number",
      value: generateInvoiceNumber(transaction.id),
    },
    {
      title: "Application ID",
      value: transaction.application?.id || "N/A",
    },
    ...(transaction.refundedAmount ? [{
      title: "Refunded Amount",
      value: formatCurrency(parseFloat(transaction.refundedAmount), transaction.currency),
    }] : []),
    ...(transaction.refundedAt ? [{
      title: "Refunded At",
      value: formatDate(transaction.refundedAt),
    }] : []),
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
            Transaction Receipt
          </h2>
          <p className="text-[#FFFFFF99] text-[16px] mb-10 leading-5 transition-all duration-300 ease-out">
            Detailed record of this transaction for your reference.
          </p>

          {/* Transaction Details */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Transaction Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
              {transactionDetails.map((item, index) => (
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">{item.title}</p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Host Information */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Host Information
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
              {hostInfo.map((item, index) => (
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">{item.title}</p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Payment Information
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
              {paymentInfo.map((item, index) => (
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">{item.title}</p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Additional Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
              {additionalDetails.map((item, index) => (
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">{item.title}</p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="transition-all duration-300 ease-out">
          <button
            onClick={handleDownloadReceipt}
            className="w-full h-[52px] py-4 mt-[50px] text-[18px] font-semibold rounded-md yellow-btn text-black text-sm 
                      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                      hover:scale-[1.02] active:scale-[0.98]"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </>
  );
};

ReceiptDrawer.displayName = "ReceiptDrawer";

export default ReceiptDrawer;