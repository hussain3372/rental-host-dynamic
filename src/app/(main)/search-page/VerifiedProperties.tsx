"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StatusPill from "@/app/shared/StatusPills";
import BlackButton from "@/app/shared/BlackButton";
import { Property, MappedProperty } from "@/app/api/user-flow/types";

type VerifiedPropertiesProps = {
  properties: (Property | MappedProperty)[];
};

type StatusVariant = "success" | "error" | "warning" | "info" | "default";

const getVariantFromStatus = (status?: string): StatusVariant => {
  switch (status) {
    case "Verified":
      return "success";
    case "Expired":
      return "error";
    case "Near Expiry":
      return "warning";
    default:
      return "default";
  }
};

export const VerifiedProperties: React.FC<VerifiedPropertiesProps> = ({ properties }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedProperties = showAll ? properties : properties.slice(0, 9);

  return (
    <div className="container-class bg-[#121315] text-white py-[40px] px-[20px] sm:py-[60px] sm:px-[40px] md:py-[70px] md:px-[80px] lg:py-[100px] lg:px-[120px]">
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/images/empty-state.png"
            alt="No Properties"
            width={344}
            height={321}
            className="mb-8"
          />
          <h2 className="text-[32px] leading-[40px] font-semibold text-white mb-3">
            No Certified Hosts Found
          </h2>
          <p className="text-[18px] leading-[26px] text-[#FFFFFF99] font-medium max-w-[486px]">
            No verified properties match your search. Try adjusting filters or exploring other certified listings.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <BlackButton
              text="Certified Properties"
              iconSrc="/images/value.png"
              iconWidth={32}
              iconHeight={32}
              className="w-[259px]"
            />
          </div>

          <h2 className="text-[48px] leading-[57.6px] font-medium mt-6">
            Your Verified Property Results
          </h2>

          <div className="grid gap-x-10 gap-y-[80px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-[80px]">
            {displayedProperties.map((property, index) => {
              // ✅ FIX: Check for both 'image' (MappedProperty) and 'images' (Property)
              const imageSrc = 
                'image' in property && property.image 
                  ? property.image // For MappedProperty
                  : Array.isArray(property.images) && property.images.length > 0
                  ? property.images[0] // For Property type
                  : "/images/empty.png";

              const title =
                "title" in property
                  ? property.title
                  : property.name || "Property";

              const author =
                "author" in property
                  ? property.author
                  : property.address || "Unknown";

              const status =
                "status" in property ? property.status : undefined;

              const expiry =
                "expiry" in property ? property.expiry : "N/A";

              const id = "id" in property ? property.id : index;

              return (
                <Link href={`/property-detail/${id}`} key={id}>
                  <div className="flex flex-col cursor-pointer">
                    <div className="bg-[#121315] shadow-md overflow-hidden max-w-[373px]">
                      <div className="relative h-56 w-full">
                        <Image
                          src={imageSrc}
                          alt={title}
                          width={373}
                          height={300}
                          className="object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = "/images/empty.png";
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col max-w-[373px]">
                      <div className="flex items-center justify-between mt-5">
                        <h3 className="text-[24px] leading-7 font-medium">{title}</h3>
                        {status && (
                          <StatusPill
                            status={status}
                            variant={getVariantFromStatus(status)}
                          />
                        )}
                      </div>
                      <p className="text-[20px] leading-6 text-[#FFFFFFCC] mt-2 font-normal">
                        {author}
                      </p>
                      <div className="flex items-center justify-between mt-[38px]">
                        <p className="text-[16px] leading-5 text-[#FFFFFFCC] font-normal">
                          Expiry: {expiry}
                        </p>
                        <div className="relative w-[32px] h-[32px] group">
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
              );
            })}
          </div>

          {!showAll && properties.length > 9 && (
            <div className="flex justify-center pt-[80px]">
              <button
                onClick={() => setShowAll(true)}
                className="px-[20px] py-[12px] border-[1px] border-[#EFFC76] bg-transparent text-[#EFFC76] rounded-[8px] font-semibold text-[16px] leading-[20px] cursor-pointer transition-all duration-300 hover:bg-[#EFFC76] hover:text-black"
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerifiedProperties;