"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { certifications } from "@/app/api/Host/certification/index";

interface CertificationData {
  id: string;
  certificateNumber: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  qrCodeUrl: string;
}

export default function Verification() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verification, setVerification] = useState<
    { id: string; value: string; title: string }[]
  >([]);

  useEffect(() => {
    const fetchCertification = async () => {
      try {
        const res = await certifications.getCertifications();

        if (res?.data?.certifications?.length > 0) {
          const cert = res.data.certifications[0] as CertificationData;

          // ✅ Set QR Code
          setQrCodeUrl(cert.qrCodeUrl);

          // ✅ Dynamically fill verification details
          setVerification([
            { id: "0", value: cert.status || "N/A", title: "Status" },
            { id: "1", value: cert.certificateNumber || "N/A", title: "Certificate ID" },
            {
              id: "2",
              value: new Date(cert.issuedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              title: "Issue Date",
            },
            {
              id: "3",
              value: new Date(cert.expiresAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              title: "Expiry Date",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching certification:", error);
      }
    };

    fetchCertification();
  }, []);

  return (
    <div className="pt-[60px] pb-[41px]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[20px] max-w-[100%]">
        {/* Left Section - QR Code */}
        <div className="col-span-12 lg:col-span-7 sm:mr-[25px] mr-0">
          <div className="bg-[#121315] rounded-lg max-h-none pb-[20px] w-full">
            <div className="flex flex-col items-center gap-2 justify-center px-4 sm:px-6 lg:px-0">
              <h2 className="font-semibold pt-[20px] text-[24px] text-center leading-[28px]">
                Your Certificate
              </h2>
              <p className="font-medium text-[12px] sm:text-[16px] leading-[20px] w-full max-w-[352px] text-center items-center text-white/40">
                Scan the QR code below to confirm this property&apos;s certification and authenticity.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center pt-[28px] gap-[28px]">
              <div className="w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[420px]">
                {qrCodeUrl ? (
                  <Image
                    src={qrCodeUrl}
                    alt="QR code"
                    width={331}
                    height={237}
                    className="w-full h-auto"
                  />
                ) : (
                  <p className="text-white/50 text-center">Loading QR code...</p>
                )}
              </div>

              <Link href="/docs/certificates.pdf" target="_blank">
                <p className="text-[#EFFC76] font-regular underline text-[20px] leading-[24px]">
                  View Certificate
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section - Verification Details */}
        <div className="col-span-12 lg:col-span-5">
          <div className="flex flex-col bg-[#121315] rounded-md p-5 gap-[28px] w-full lg:w-auto">
            {verification.length > 0 ? (
              verification.map((item, index) => (
                <div key={item.id}>
                  <h2 className="font-semibold text-[12px] pt-3 sm:text-[18px] leading-[18px] sm:leading-[22px] text-white">
                    {item.value}
                  </h2>
                  <p className="pt-[18px] font-regular text-[16px] leading-[20px] text-white/80">
                    {item.title}
                  </p>
                  {index !== verification.length - 1 && (
                    <div className="w-full sm:max-w-[350px] lg:max-w-[386px] h-[1px] bg-gradient-to-r from-[#121315] via-white to-[#121315] mt-[26px]"></div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center">Loading verification details...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
