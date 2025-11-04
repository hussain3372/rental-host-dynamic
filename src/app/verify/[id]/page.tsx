"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Verification from "@/app/(main)/property-detail/Verification";
import StatusPill from "@/app/shared/StatusPills";
import Loader from "@/app/shared/loaders";
import { propertyAPI } from "@/app/api/user-flow";
import { CertificationData } from "@/app/api/Host/certification/types";
import { Property } from "@/app/api/user-flow/types";

// Create a combined type that matches your actual data structure
// Make 'application' optional here because the public QR API may return
// certification objects without a populated `application` field.
type CombinedCertificationData = Omit<CertificationData, "application" | "host"> & {
  // Use Partial here because the public API may omit nested fields like propertyDetails
  application?: Partial<CertificationData["application"]>;
  host?: Partial<CertificationData["host"]>;
  images: string[];
  propertyName?: string;
  address?: string;
  description?: string;
};

// 🔹 Helper: Transform certification API data into Property type
const transformToProperty = (certData: CombinedCertificationData): Property => {
  return {
    id: certData.id,
    name: certData.propertyName || "Verified Property",
    address: certData.address || "No address available",
    city: certData.address?.split(",")[0]?.trim() || "Unknown",
    description: certData.description || "",
    certificateStatus:
      certData.status === "ACTIVE" ||
      certData.status === "EXPIRED" ||
      certData.status === "PENDING"
        ? certData.status
        : "ACTIVE",
    certificateNumber: certData.certificateNumber,
    issuedAt: certData.issuedAt,
    expiresAt: certData.expiresAt,
    qrCodeUrl: certData.qrCodeUrl,
    badgeUrl: certData.badgeUrl,
    images: certData.images || [certData.badgeUrl].filter(Boolean),
    propertyDetails: {
      images: certData.images || [certData.badgeUrl].filter(Boolean),
      rent: certData.application?.propertyDetails?.rent || 0,
      address: certData.address || "",
      bedrooms: certData.application?.propertyDetails?.bedrooms || 0,
      currency: certData.application?.propertyDetails?.currency || "USD",
      bathrooms: certData.application?.propertyDetails?.bathrooms || 0,
      area: "0",
      maxGuests: certData.application?.propertyDetails?.maxGuests || 0,
      ownership: certData.application?.propertyDetails?.ownership || "Unknown",
      description: certData.description || "",
      propertyName: certData.propertyName || "Verified Property",
      propertyType:
        certData.application?.propertyDetails?.propertyType || "Unknown",
    },
    propertyType:
      certData.application?.propertyDetails?.propertyType || "Unknown",
    verificationUrl: certData.qrCodeUrl || "",
    hostName: certData.host?.name || "Unknown Host",
    hostCompany: certData.host?.companyName || "Unknown Company",
  };
};

export default function VerifyPage() {
  const { id } = useParams();
  const [application, setApplication] =
    useState<CombinedCertificationData | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ Fetch certificate detail by QR Code (public API)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await propertyAPI.getCertificationByQrCode(id as string);

        if (res?.data) {
          const certData = res.data;

          // Create the combined data structure
          const applicationData: CombinedCertificationData = {
            ...certData,
            images:
              certData.application?.propertyDetails?.images ||
              [certData.badgeUrl].filter(Boolean),
            propertyName: certData.application?.propertyDetails?.propertyName,
            address: certData.application?.propertyDetails?.address,
            description: certData.application?.propertyDetails?.description,
          };

          setApplication(applicationData);
          setProperty(transformToProperty(applicationData));
        } else {
          setApplication(null);
          setProperty(null);
        }
      } catch (error) {
        console.error("Error verifying certificate:", error);
        setApplication(null);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // 🟡 Status Pill Variant Helper
  const getVariantFromStatus = (
    status: string
  ): "success" | "error" | "warning" | "info" | "default" => {
    switch (status) {
      case "ACTIVE":
      case "Verified":
        return "success";
      case "EXPIRED":
      case "Expired":
        return "error";
      case "PENDING":
      case "Near Expiry":
        return "warning";
      default:
        return "default";
    }
  };

  // 🕓 Loading State
  if (loading) {
    return (
      <div className="sm:pt-[80px] pt-0 px-4 sm:px-6 lg:px-[120px]">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <Loader type="moon" size="large" color="#EFFC76" className="mb-6" />
          <h3 className="text-[24px] leading-7 font-medium text-white mb-2">
            Verifying Certificate
          </h3>
          <p className="text-[16px] leading-5 text-[#FFFFFF99] font-normal">
            Please wait while we verify the certificate details...
          </p>
        </div>
      </div>
    );
  }

  // ❌ Not Found
  if (!application || !property) {
    return (
      <div className="sm:pt-[80px] pt-0 px-4 sm:px-6 lg:px-[120px]">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <Image
            src="/images/empty.png"
            alt="Certificate not found"
            width={220}
            height={220}
            className="mb-6"
          />
          <h1 className="text-[32px] mb-3 text-white font-semibold">
            Certificate Not Found
          </h1>
          <p className="text-[16px] text-[#FFFFFF99] mb-8 text-center max-w-md">
            The certificate you are trying to verify does not exist or has been
            removed.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#EFFC76] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#e8f566] transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // 🖼️ Image Slider Controls
  const images = application.images?.length
    ? application.images
    : ["/images/empty.png"];
  const totalSteps = images.length;
  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // ✅ Main Layout
  return (
    <>
      <div className="sm:pt-[80px] pt-0 px-4 sm:px-6 lg:px-[120px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center">
          <div className="flex-1">
            <h1 className="text-[35px] sm:text-[48px] font-medium text-white">
              {application.propertyName || "Verified Property"}
            </h1>
            <p className="text-[#D5D5D5CC] pt-[25px] sm:pt-[16px] text-[24px]">
              {application.address || "No address available"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <StatusPill
              status={application.status || "Verified"}
              variant={getVariantFromStatus(application.status || "Verified")}
            />
          </div>
        </div>

        {/* Image Slider */}
        <div className="mt-8 sm:mt-12">
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gray-800">
            <Image
              src={images[currentStep]}
              alt={`${application.propertyName} view ${currentStep + 1}`}
              width={1200}
              height={411}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/empty.png";
              }}
            />
          </div>
        </div>

        {/* Progress Navigation */}
        <div className="mt-8 pb-[40px] sm:pb-[80px]">
          <div className="flex items-center gap-[20px] sm:gap-[40px] w-full">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/images/left.png"
                alt="Previous"
                width={11}
                height={13}
              />
            </button>

            <div className="flex-1 flex items-center gap-[20px] sm:gap-[40px]">
              <div className="text-white opacity-60 text-lg font-medium">
                {String(currentStep + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 relative h-[2px] bg-gray-600 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-[#EFFC76] transition-all duration-500 rounded-full"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="text-white opacity-60 text-lg font-medium">
                {String(totalSteps).padStart(2, "0")}
              </div>
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === totalSteps - 1}
              className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/images/right.png"
                alt="Next"
                width={11}
                height={13}
              />
            </button>
          </div>
        </div>

        {/* Property Description */}
        <p className="text-[#FFFFFFCC] text-[16px] sm:text-[24px] leading-[25px] sm:leading-[32px] font-medium text-justify pb-[40px]">
          {application.description ||
            `${application.propertyName} at ${application.address} is a fully verified and certified property. This certified listing is guaranteed authentic and comes with a digital badge for instant checks. Featuring verified legal documentation, this property offers both luxury and peace of mind.`}
        </p>
      </div>

      {/* Verification Component */}
      <Verification property={property} />
    </>
  );
}
