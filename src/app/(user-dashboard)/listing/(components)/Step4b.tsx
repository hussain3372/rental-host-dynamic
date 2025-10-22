"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropdown from "@/app/shared/InputDropDown";

export default function Step4b() {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [selectedBank, setSelectedBank] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const bankDropdownRef = useRef<HTMLDivElement>(null);

  const banks = [
    "Bank of America",
    "Chase Bank",
    "HSBC",
    "Citibank",
    "Barclays",
    "Deutsche Bank",
    "Standard Chartered",
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBankDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <h3 className="font-bold text-[20px] sm:text-[28px] ">Choose Your Payment Method</h3>
      <p className="max-w-[573px] font-regular text-[12px] sm:text-[16px] leading-4 sm:leading-5 text-white/60 pt-3">
        Select the most convenient option to securely complete your subscription
        payment.
      </p>

      <div className="pt-10 flex flex-col md:flex-row gap-6">
        {/* Credit / Debit Card */}
        <label
          className={`flex items-center sm:gap-[38px] justify-between rounded-lg  p-4 cursor-pointer  ${
            selectedMethod === "card"
              ? "border-[#9ba44f] border bg-[#1c1f14]"
              : " bg-transparent bg-gradient-to-b from-[#202020] to-[#101010]"
          }`}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/images/credit-card.png"
              alt="use credit card"
              width={64}
              height={64}
            />
            <div>
              <h4 className="text-white text-[14px] sm:text-[16px] font-regular leading-5">Credit / Debit Card</h4>
              <p className="text-white/60 font-regular text-[10px] sm:text-[12px] pt-2 max-w-[215px]">
                Pay instantly using Visa, MasterCard, or other major cards
              </p>
            </div>
          </div>

          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={selectedMethod === "card"}
            onChange={() => setSelectedMethod("card")}
            className="w-5 h-5 accent-[#EFFC76] cursor-pointer"
          />
        </label>

        {/* Bank Transfer */}
        <label
          className={`flex items-center sm:gap-[38px] justify-between rounded-lg  p-4 cursor-pointer  ${
            selectedMethod === "bank"
              ? "border-[#9ba44f] border bg-[#1c1f14]"
              : " bg-transparent bg-gradient-to-b from-[#202020] to-[#101010]"
          }`}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/images/bank-card.png"
              alt="use bank transfer"
              width={64}
              height={64}
            />
            <div>
              <h4 className="text-white text-[14px] sm:text-[16px] font-regular leading-5">Bank Transfer</h4>
              <p className="text-white/60 font-regular text-[10px] sm:text-[12px] pt-2 max-w-[215px]">
                    Transfer from your bank. Confirmation may take 1–2 days.
              </p>
            </div>
          </div>

          <input
            type="radio"
            name="paymentMethod"
            value="bank"
            checked={selectedMethod === "bank"}
            onChange={() => setSelectedMethod("bank")}
            className="w-5 h-5 accent-[#EFFC76] cursor-pointer"
          />
        </label>
      </div>

      {/* Credit Card Details */}
      {selectedMethod === "card" && (
        <div className="pt-10">
          <h4 className="text-white font-medium text-[18px] mb-5">
            Add Your Card Details
          </h4>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                Account holder name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full text-[14px] font-regular h-12 bg-gradient-to-b from-[#202020] to-[#101010] placeholder:text-white/40 border border-[#4a4a4a] rounded-lg px-4 text-white  focus:outline-none "
              />
            </div>

            <div>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                Card number
              </label>
              <input
                type="text"
                placeholder="Enter number"
                className="w-full text-[14px] font-regular h-12 bg-gradient-to-b from-[#202020] to-[#101010] placeholder:text-white/40 border border-[#4a4a4a] rounded-lg px-4 text-white  focus:outline-none "
              />
            </div>

            <div>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                Expiry date
              </label>
              <div className="relative">
                <DatePicker
                  selected={expiryDate}
                  onChange={(date) => setExpiryDate(date)}
                  dateFormat="MM/yy"
                  showMonthYearPicker
                  minDate={new Date()} // prevent past dates
                  className="w-full h-12 text-[14px] font-regular cursor-pointer bg-gradient-to-b from-[#202020] to-[#101010] placeholder:text-white/40 border border-[#4a4a4a] rounded-lg px-4 text-white  focus:outline-none "
                  placeholderText="Select date"
                />
                <Image
                  src="/images/calender.svg"
                  alt="Date"
                  width={20}
                  height={20}
                  className="absolute top-3 right-3 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                CVC/CVV
              </label>
              <input
                type="text"
                placeholder="Enter CVC/CVV"
                className="w-full h-12 text-[14px] font-regular bg-gradient-to-b from-[#202020] to-[#101010] placeholder:text-white/40 border border-[#4a4a4a] rounded-lg px-4 text-white  focus:outline-none "
              />
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Details */}
      {selectedMethod === "bank" && (
        <div className="pt-10">
          <h4 className="text-white font-medium text-[18px] mb-5">
            Add Your Bank Details
          </h4>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                Account holder name
              </label>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full text-[14px] font-regular h-12 bg-gradient-to-b from-[#202020] to-[#101010] placeholder:text-white/40 border border-[#4a4a4a] rounded-lg px-4 text-white  focus:outline-none "
              />
            </div>

            <div ref={bankDropdownRef}>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                Bank name
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBankDropdown((prev) => !prev)}
                  className={`
                    w-full h-12 px-4 pr-10 rounded-lg border border-[#464646]
                    bg-gradient-to-b from-[#202020] to-[#101010]
                    text-[14px] font-regular text-left
                    ${selectedBank === "" ? "text-white/40" : "text-white"}
                    cursor-pointer transition duration-200 ease-in-out
                  `}
                >
                  {selectedBank || "Select bank"}
                  <Image
                    src="/images/dropdown.svg"
                    alt="dropdown"
                    width={15}
                    height={8}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </button>

                {showBankDropdown && (
                  <div className="absolute z-10 mt-1 w-full">
                    <Dropdown
                      items={banks.map((bank) => ({
                        label: bank,
                        onClick: () => {
                          setSelectedBank(bank);
                          setShowBankDropdown(false);
                        },
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Enter number"
                className="w-full text-[14px] font-regular h-12 bg-gradient-to-b from-[#202020] to-[#101010] placeholder:text-white/40 border border-[#4a4a4a] rounded-lg px-4 text-white  focus:outline-none "
              />
            </div>

            <div>
              <label className="block font-medium leading-[18px] text-white text-sm mb-[10px]">
                BIC
              </label>
              <input
                type="text"
                placeholder="Enter BIC"
                className="w-full h-12 text-[14px] font-regular bg-gradient-to-b from-[#202020] to-[#101010] placeholder:text-white/40 border border-[#4a4a4a] rounded-lg px-4 text-white  focus:outline-none "
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}