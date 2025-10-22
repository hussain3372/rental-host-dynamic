"use client";
import React, { useState, useRef, useEffect } from "react";

interface RefundDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const RefundDrawer = ({ isOpen, onClose }: RefundDrawerProps) => {
  const [certificateName, setCertificateName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [validity, setValidity] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle mount/unmount with smooth transitions
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else if (!isOpen && isMounted) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  // Handle form submission
  const handleAddCertificate = () => {
    const certificateData = {
      certificateName,
      propertyType,
      validity,
      images: images.map((file) => file.name),
    };

    console.log("Adding certificate:", certificateData);

    // Reset form
    setCertificateName("");
    setPropertyType("");
    setValidity("");
    setImages([]);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

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

  const transaction = [
    {
      title:"Host Name",
      value:"Sarah Kim",
    },
    {
      title:"Plan Name",
      value:"Professional",
    },
    {
      title:"Plan Duration",
      value:"Monthly",
    },
    {
      title:"Status",
      value:"Completed",
    },
    
  ]
  const host = [
    {
      title:"Transaction ID",
      value:"TRANS - 9876",
    },
    {
      title:"Amount Paid",
      value:"$24",
    },
    {
      title:"Payment Method",
      value:"Debit / Credit",
    },
    {
      title:"Transaction Date",
      value:"Aug 15, 2025, 10:32 AM",
    },
    
  ]
  const payment = [
    {
      title:"Refund ID",
      value:"$REF - 9876",
    },
    {
      title:"Refund Amount",
      value:"$20",
    },
  ]
  

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50  transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
            Review the transaction details below and confirm the refund. Once processed, the amount will be reversed to the host’s payment method.
          </p>

          {/* Certificate Name */}
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Plan Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
            {
              transaction.map((item,index)=>(
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">{item.title}</p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">{item.value}</p>
                  </div>
                </div>
              ))
            }
          </div>
          </div>
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Transaction Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
            {
              host.map((item,index)=>(
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">{item.title}</p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">{item.value}</p>
                  </div>
                </div>
              ))
            }
          </div>
          </div>
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
              Refund Details
            </label>
            <div className="bg-gradient-to-b from-[#202020] to-[#101010] flex flex-col gap-3 py-3 px-5 w-full rounded-[10px]">
            {
              payment.map((item,index)=>(
                <div key={index} className="">
                  <div className="flex justify-between">
                    <p className="font-regular text-[14px] leading-[18px] text-[#FFFFFFCC]">{item.title}</p>
                    <p className="font-medium text-[14px] leading-[18px] text-[#FFFFFF]">{item.value}</p>
                  </div>
                </div>
              ))
            }
          </div>
          </div>
          <div className="mb-5">
            <label className="block text-[14px] text-[#FFFFFF] font-medium mb-[10px] transition-all duration-300 ease-out">
             Reason for refund
            </label>
           <textarea placeholder="Give a reason for refund" className="bg-gradient-to-b from-[#202020] border resize-none border-[#414141] to-[#101010] w-full rounded-[10px]  p-3 focus:outline-none text-[14px] font-regular" rows={4}  name="refund reason" id="refund">

           </textarea>
          </div>

          {/* Property Type */}
          

                  </div>

        <div className="transition-all duration-300 ease-out">
          <button
            onClick={handleAddCertificate}
            className="w-full h-[52px] py-4 mt-[50px] text-[18px] font-semibold rounded-md yellow-btn text-black text-sm 
                      transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                      hover:scale-[1.02] active:scale-[0.98]"
          >
            Confirm Refund
          </button>
        </div>
      </div>
    </>
  );
};

RefundDrawer.displayName = "RefundDrawer";

export default RefundDrawer;
