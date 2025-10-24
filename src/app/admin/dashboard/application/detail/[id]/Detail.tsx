"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import TicketDrawer from "../../Drawer";
import Checklist from "./Checklist";
import { application as applicationApi } from "@/app/api/Admin/application";
import type { Application } from "@/app/api/Admin/application/types";

interface PropertyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  checklists: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [thumbnailsHeight, setThumbnailsHeight] = useState(0);
  const [notes, setNotes] = useState<string[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [propertyTypeName, setPropertyTypeName] = useState<string>("N/A");
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchApplicationDetail = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await applicationApi.getApplicationDetail(
          id as string
        );

        if (response.success && response.data) {
          setApplication(response.data);

          const propertyTypeId = response.data.propertyDetails?.propertyType;
          if (propertyTypeId) {
            await fetchPropertyTypeName(propertyTypeId);
          }
        } else {
          console.error("Failed to fetch application:", response.message);
          setApplication(null);
        }
      } catch (error) {
        console.error("Error fetching application detail:", error);
        setApplication(null);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPropertyTypeName = async (propertyTypeId: string) => {
      try {
        console.log("🔹 Fetching property type for ID:", propertyTypeId);

        const response = await applicationApi.getPropertyType(propertyTypeId);
        console.log("🔹 Property type API response:", response);

        if (response.success && response.data) {
          const propertyType = response.data as PropertyType;
          console.log("🔹 Property type data:", propertyType);

          const capitalizedName =
            propertyType.name.charAt(0).toUpperCase() +
            propertyType.name.slice(1).toLowerCase();

          console.log("🔹 Capitalized property type name:", capitalizedName);
          setPropertyTypeName(capitalizedName);
        } else {
          console.error("❌ Failed to fetch property type:", response.message);
          setPropertyTypeName("N/A");
        }
      } catch (error) {
        console.error("🚨 Error fetching property type:", error);
        setPropertyTypeName("N/A");
      }
    };

    fetchApplicationDetail();
  }, [id]);

  const handleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const handleNoteSubmit = (note: string) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  useEffect(() => {
    const updateHeight = () => {
      if (thumbnailsContainerRef.current) {
        const height = thumbnailsContainerRef.current.offsetHeight;
        setThumbnailsHeight(height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [application]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const capitalizeStatus = (status: string): string => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <Image
            src="/images/empty.png"
            alt="not found"
            width={220}
            height={220}
          />
          <h1 className="text-2xl mb-3 text-white font-medium leading-[28px]">
            Application Not Found
          </h1>
          <p className="text-white/60 mb-6 max-w-[504px] font-regular text-[18px] leading-[22px]">
            The application you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
          <Link
            href="/admin/dashboard/application"
            className="inline-block yellow-btn w-[150px] text-black px-6 py-3 rounded-lg hover:bg-[#e8f566] transition-colors"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const propertyDetails = application.propertyDetails || {};
  const images = propertyDetails.images || [];
  const totalSteps = images.length;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const Credentials = [
    {
      id: 1,
      img: "/images/apartment.svg",
      val: propertyTypeName,
      title: "Property Type",
    },
    {
      id: 2,
      img: "/images/manager.svg",
      val: propertyDetails.ownership || "N/A",
      title: "Ownership",
    },
    {
      id: 3,
      img: "/images/date.svg",
      val: formatDate(application.submittedAt),
      title: "Submitted On",
    },
    {
      id: 4,
      img: "/images/pending.svg",
      val: capitalizeStatus(application.status),
      title: "Status",
    },
  ];

  return (
    <div className="text-white relative">
      {isDrawerOpen && (
        <TicketDrawer
          onNoteSubmit={handleNoteSubmit}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center text-[12px] sm:text-[16px] gap-3 font-regular leading-[20px] text-white/60 ">
          <Link
            href="/admin/dashboard/application"
            className="hover:text-[#EFFC76]"
          >
            Applications
          </Link>
          <Image
            src="/images/greater.svg"
            alt="linked"
            width={16}
            height={16}
          />
          <span className="text-white font-regular text-[12px] sm:text-[16px] leading-[20px] ">
            {application.id}
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
        <h1 className=" text-[16px] sm:text-[24px] font-medium leading-[28px] ">
          {propertyDetails.propertyName || "Property Name Not Available"}
        </h1>
        <button
          onClick={handleDrawer}
          className="text-[#EFFC76] opacity-80 hover:text-[#e8f566] underline cursor-pointer font-medium text-[12px] sm:text-[18px] leading-[22px] "
        >
          Add Note
        </button>
      </div>

      {/* Address */}
      <p className="text-white/80 font-medium leading-[20px] text-[12px] sm:text-[16px]  mb-[18px]">
        {propertyDetails.address || "Address not available"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-3 pt-5 pb-10 flex-wrap lg:flex-nowrap justify-between">
        {Credentials.map((item) => (
          <div key={item.id} className="gap-3">
            <div className="flex items-center bg-[#121315] rounded-xl gap-4 p-5">
              <Image src={item.img} alt={item.title} width={48} height={48} />
              <div>
                <h2 className="font-medium text-[18px] leading-[22px] text-white">
                  {item.val}
                </h2>
                <p className="text-white/80 font-regular text-[14px] leading-[18px] pt-2">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className=" w-full flex flex-col">
              <div
                className={`
                  relative w-full rounded-lg overflow-hidden bg-gray-900
                  ${thumbnailsHeight ? "" : ""} 
                `}
                style={{ height:  "300px" }}
              >
                <Image
                  src={images[currentStep]}
                  alt={`Property view ${currentStep + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative w-full  rounded-lg overflow-hidden bg-gray-900 sm:hidden">
                <Image
                  src={images[currentStep]}
                  alt={`Property view ${currentStep + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div
              ref={thumbnailsContainerRef}
              className=" relative flex sm:flex-col gap-3 aspect-[16/10] w-full sm:max-w-[145px] rounded-md max-h-[60px]  sm:max-h-[300px]  overflow-y-auto scrollbar-hide "
            >
              {images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-[16/10] w-full sm:max-w-[145px]"
                >
                  <Image
                    onClick={() => setCurrentStep(index)}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded-md cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 gap-3 sm:gap-[40px] w-full">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-8 h-8 p-2 cursor-pointer rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Image src="/images/left.svg" alt="back" width={24} height={24} />
            </button>

            <div className="flex items-center gap-3 sm:gap-10 flex-1 ">
              <span className=" text-white/60 leading-[20px] font-regular text-[16px]  flex-shrink-0">
                {String(currentStep + 1).padStart(2, "0")}
              </span>

              <div className="w-full h-[1px] bg-white/20 relative ">
                <div
                  className="absolute top-0 left-0 h-full bg-[#EFFC76] transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>

              <span className="text-sm text-white/60 leading-[20px] font-regular text-[16px]  flex-shrink-0">
                {String(totalSteps).padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === totalSteps - 1}
              className="w-8 h-8 rounded cursor-pointer p-2 border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Image
                src="/images/right.svg"
                alt="back"
                width={24}
                height={24}
              />
            </button>
          </div>
        </>
      )}

      <div className="mt-[60px] ">
        <p className="text-white/80 font-normal text-[16px] sm:text-[18px] tracking-[0%] leading-[22px] text-justify">
          {propertyDetails.description ||
            "No description available for this property."}
        </p>
      </div>

      <Checklist notes={notes} application={application} />
    </div>
  );
}
