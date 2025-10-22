"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StatusPill from "@/app/shared/StatusPills";
import { certifications } from "@/app/api/Host/certification/index";
import { CertificationData } from "@/app/api/Host/certification/types";

type Property = {
  id: string;
  title: string;
  author: string;
  images: string[];
  status: string;
  expiry: string;
};

const getVariantFromStatus = (
  status: string
): "success" | "error" | "warning" | "info" | "default" => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "VERIFIED":
      return "success";
    case "REVOKED":
      return "error";
    case "EXPIRING":
    case "NEAR EXPIRY":
      return "warning";
    default:
      return "default";
  }
};

const Certificates: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setIsLoading(true);
        const response = await certifications.getCertifications();
        const data = response.data?.certifications;

        if (data && data.length > 0) {
          const formatted = data.map((item: CertificationData) => ({
            id: item.id,
            title:
              item.application?.propertyDetails?.propertyName ||
              item.application?.propertyDetails?.name ||
              "Unknown Property",
            author:
              item.application?.propertyDetails?.address || "Address unavailable",
            images:
              item.application?.propertyDetails?.images?.length > 0
                ? item.application.propertyDetails.images
                : ["/images/property-placeholder.png"],
            status: item.status,
            expiry: new Date(item.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
          }));
          setProperties(formatted);
        } else {
          // API returned empty → set empty array
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching certifications:", error);
        setProperties([]); // show empty state on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="text-white pb-5">
      <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row items-start justify-between mb-2">
        <div>
          <h1 className="text-[20px] leading-[24px] font-semibold text-white mb-2">
            Earned Certificates
          </h1>
          <p className="text-[16px] leading-[20px] text-[#FFFFFF99] font-regular max-w-[573px]">
            Access the certificates you&apos;ve achieved. Download official copies or
            share them as proof of your accomplishments.
          </p>
        </div>
        <Link href="/listing">
          <button className="yellow-btn cursor-pointer text-black px-[20px] py-[12px] rounded-[8px] font-semibold text-[16px] leading-[20px] hover:bg-[#E5F266] transition-colors duration-300">
            Apply Now
          </button>
        </Link>
      </div>

      <div className="grid gap-x-4 gap-y-[16px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-[40px]">
        {properties.length > 0 ? (
          properties.map((property) => (
            <Link
              href={`/dashboard/certificates/detail/${property.id}`}
              key={property.id}
            >
              <div className="flex bg-[#121315] rounded-lg group flex-col cursor-pointer">
                <div className="shadow-md overflow-hidden">
                  <div className="relative w-full">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={373}
                      height={300}
                      className="object-cover w-full h-[250px]"
                    />
                  </div>
                </div>
                <div className="flex pb-4 px-4 flex-col">
                  <div className="flex items-center justify-between mt-5">
                    <h3 className="text-[18px] leading-[22px] text-white font-medium">
                      {property.title}
                    </h3>
                    <StatusPill
                      status={property.status}
                      variant={getVariantFromStatus(property.status)}
                    />
                  </div>
                  <p className="text-[14px] leading-[18px] text-white/60 mt-2 font-regular">
                    {property.author}
                  </p>
                  <div className="flex items-center justify-between mt-[33px]">
                    <p className="text-[14px] leading-[18px] text-white/80 font-normal">
                      Expiry: {property.expiry}
                    </p>
                    <div className="relative w-[32px] h-[32px]">
                      <Image
                        src="/images/white-arrow-right.svg"
                        alt="arrow"
                        width={32}
                        height={32}
                        className="cursor-pointer absolute top-0 left-0 transition-opacity duration-300 group-hover:opacity-0"
                      />
                      <Image
                        src="/images/yellow-arrow-right.svg"
                        alt="arrow-yellow"
                        width={32}
                        height={32}
                        className="cursor-pointer absolute top-0 left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center p-10">
            <Image
              src="/images/empty.png"
              alt="No certificates"
              width={200}
              height={200}
            />
            <p className="text-white/60 mt-4 text-center">
              No certificates available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
