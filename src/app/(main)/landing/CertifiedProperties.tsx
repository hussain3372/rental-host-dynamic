"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BlackButton from "../../shared/BlackButton";
import { propertyAPI } from "../../api/user-flow/index";
import { Certification } from "../../api/user-flow/types";
import { useRouter } from "next/navigation";

type PropertyItem = {
  id: string;
  title: string;
  address: string;
  image: string;
};

const CertifiedProperties = () => {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter()

// Helper function to safely extract certifications
// Replace the extractCertifications function with this:
const extractCertifications = (response: unknown): Certification[] => {
  if (!response || typeof response !== 'object') return [];
  
  const possiblePaths = [
    (response as { data?: { certifications?: Certification[] } })?.data?.certifications,
    (response as { data?: { data?: Certification[] } })?.data?.data,
    (response as { certifications?: Certification[] })?.certifications,
    (response as { data?: Certification[] })?.data,
    response as Certification[]
  ];
  
  for (const path of possiblePaths) {
    if (Array.isArray(path) && path.length > 0) {
      return path;
    }
  }
  
  return [];
};

// Then in your useEffect:
useEffect(() => {
  const fetchCertifiedProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getCertifiedProperties();
      const certifications = extractCertifications(response);

      if (certifications.length > 0) {
        const mapped: PropertyItem[] = certifications.map(
          (item: Certification) => ({
            id: item.id,
            title: item.property?.name || "Unnamed Property",
            address: item.property?.address || "",
            image: item.property?.images?.[0] || "/images/empty.png",
          })
        );
        setProperties(mapped);
      } else {
        setProperties([
          {
            id: "empty",
            title: "No Certified Properties",
            address: "",
            image: "/images/empty.png",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching certified properties:", error);
      setProperties([
        {
          id: "empty",
          title: "No Certified Properties",
          address: "",
          image: "/images/empty.png",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  fetchCertifiedProperties();
}, []);

  if (loading) {
    return <p className="text-white text-center py-10">Loading...</p>;
  }

  return (
    <section className="bg-[#121315] max-w-[1440px] mx-auto text-white px-4 md:px-[90px] lg:px-[120px] sm:py-20 py-9">
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BlackButton
            text="Certified Properties"
            iconSrc="/images/how-it-works.png"
            iconWidth={32}
            iconHeight={32}
            className="w-[259px] mb-5 sm:mb-10"
          />
        </div>
        <div>
          <h2 className="text-[20px] md:text-[30px] lg:text-[48px] lg:leading-[56px] md:leading-[40px] leading-[36px] font-medium  w-full max-w-[810px]">
            Explore Our Collection of Officially Certified and Verified
            Properties
          </h2>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
            <p className="text-[#FFFFFF99] font-medium text-[14px] leading-[22px] sm:text-[18px] mt-6 flex-1 w-full max-w-[688px]">
              Browse through a trusted selection of properties that meet the
              highest standards of quality, authenticity, and reliability.
            </p>

            <Link
              href="/search-page"
              className="text-[#EFFC76] font-normal underline whitespace-nowrap text-[20px] leading-[24px] self-end sm:self-auto"
            >
              Explore More
            </Link>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="mt-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[80px] items-start">
          {properties.map((property, index) => {
            let colSpan = "";
            let width = 420;
            let height = 420;
            let extraClasses = "group";

            const isEmptyState = property.id === "empty";

            if (!isEmptyState) {
              if (index % 4 === 0) {
                colSpan = "lg:col-span-7";
                width = 700;
                height = 700;
              } else if (index % 4 === 1) {
                colSpan = "lg:col-span-5";
              } else if (index % 4 === 2) {
                colSpan = "lg:col-span-5";
              } else if (index % 4 === 3) {
                colSpan = "lg:col-span-7";
                width = 700;
                height = 700;
              }
            } else {
              colSpan = "lg:col-span-12 flex flex-col items-center";
              extraClasses = "";
              width = 300;
              height = 300;
            }

            return (
              <div onClick={()=>{router.push(`/property-detail/${property.id}`)}}
                key={property.id}
                className={`${colSpan} ${extraClasses} mb-8`}
              >
                <div
                  className={`overflow-hidden ${
                    isEmptyState ? "pointer-events-none" : ""
                  }`}
                >
                  <Image
                    src={property.image}
                    alt={property.title}
                    width={width}
                    height={height}
                    className={`object-cover ${
                      isEmptyState
                        ? ""
                        : "w-full transform transition-transform duration-1000 ease-in-out group-hover:scale-[1.2]"
                    }`}
                  />
                </div>

                {isEmptyState ? (
                  <p className="text-[#FFFFFFCC] text-center mt-4 text-[18px]">
                    Properties not found
                  </p>
                ) : (
                  <CardFooter
                    title={property.title}
                    address={property.address}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CertifiedProperties;

const CardFooter = ({ title, address }: { title: string; address: string }) => {
  return (
    <div className="flex justify-between items-center mt-4 cursor-pointer">
      <div>
        <h3 className="font-medium sm:text-[28px] text-[22px] sm:leading-[32px] leading-6">
          {title}
        </h3>
        {address && (
          <p className="sm:text-[24px] text-[16px] sm:leading-[24px] leading-4 mt-2 text-[#FFFFFFCC]">
            {address}
          </p>
        )}
      </div>

      {/* Arrow animation */}
      <div className="relative w-[32px] h-[32px] overflow-hidden mt-[-12px]">
        <Image
          src="/images/stash_arrow-up-light1.png"
          alt="Arrow"
          width={24}
          height={24}
          className="absolute inset-0 transition-all duration-500 ease-in-out group-hover:translate-x-6 group-hover:opacity-0"
        />
        <Image
          src="/images/yellow-arrow-right.svg"
          alt="Arrow Hover"
          width={32}
          height={32}
          className="absolute inset-0 -translate-x-6 mt-[-6px] opacity-0 transition-all duration-500 ease-in-out group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>
    </div>
  );
};
