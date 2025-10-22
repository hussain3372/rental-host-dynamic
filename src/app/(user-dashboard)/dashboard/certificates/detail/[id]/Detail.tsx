"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { certifications } from "@/app/api/Host/certification/index";
import { CertificationData, PropertyDetails } from "@/app/api/Host/certification/types";


export default function ApplicationDetail() {
  const { id } = useParams();
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [thumbnailsHeight, setThumbnailsHeight] = useState(0);
  // const [application, setApplication] = useState<any>(null);
  const [application, setApplication] = useState<(CertificationData & PropertyDetails) | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ Fetch certificate detail by ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await certifications.getCertificationById(id as string);

        if (res?.data) {
          const certData = res.data;
          const imageArray =
            certData.application?.propertyDetails?.images ||
            [certData.badgeUrl].filter(Boolean);

          setApplication({
            ...certData,
            ...certData.application?.propertyDetails,
            images: imageArray,
          });
        } else {
          setApplication(null);
        }
      } catch (error) {
        console.error("Error fetching certificate detail:", error);
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleDownload = async () => {
    try {
      // Try to download via API endpoint first
      await certifications.downloadCertificate(id as string);
    } catch (error) {
      console.error("Download failed:", error);

      if (application?.badgeUrl) {
        const link = document.createElement("a");
        link.href = application.badgeUrl;
        link.download = `certificate-${application.certificateNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("No certificate file available for download.");
      }
    }
  };


  // ✅ Maintain thumbnail section height
  useEffect(() => {
    const updateHeight = () => {
      if (thumbnailsContainerRef.current) {
        setThumbnailsHeight(thumbnailsContainerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [application]);

  if (loading) return <p className="text-white">Loading certificate details...</p>;

  if (!application) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <Image src="/images/empty.png" alt="not found" width={220} height={220} />
          <h1 className="text-2xl mb-3 text-white font-medium leading-[28px]">
            No Certificate Found
          </h1>
          <Link
            href="/dashboard/application"
            className="inline-block yellow-btn w-[150px] text-black px-6 py-3 rounded-lg hover:bg-[#e8f566] transition-colors"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  const images = application.images?.length
    ? application.images
    : ["/images/placeholder.jpg"];
  const totalSteps = images.length;
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="text-white">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center text-[12px] sm:text-[16px] gap-3 font-regular leading-[20px] text-white/40">
          <Link href="/dashboard/certificates" className="hover:text-[#EFFC76]">
            My Certificates    </Link>
          <Image src="/images/greater.svg" alt="linked" width={16} height={16} />
          <span className="text-white">
            {application.propertyName || "Certificate"}
          </span>
        </div>
      </nav>

      {/* Header with Download Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
        <h1 className="text-[16px] sm:text-[24px] font-medium leading-[28px]">
          {application.propertyName || "Verified Property"}
        </h1>

        <button
          onClick={handleDownload}
          className="yellow-btn text-black py-3 px-5 font-semibold text-[16px] leading-[20px]"
        >
          Download Certificate
        </button>

      </div>

      <p className="text-white/80 mb-[18px]">
        {application.address || "No address available"}
      </p>

      {/* Image Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="w-full flex flex-col">
          <div
            className={`relative w-full rounded-lg overflow-hidden bg-gray-900 ${thumbnailsHeight ? "hidden sm:block" : ""}`}
            style={{ height: thumbnailsHeight || "auto" }}
          >
            <Image
              src={images[currentStep]}
              alt={`Property view ${currentStep + 1}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Mobile View */}
          <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gray-900 sm:hidden">
            <Image
              src={images[currentStep]}
              alt={`Property view ${currentStep + 1}`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div
          ref={thumbnailsContainerRef}
          className="w-full max-w-[300px] sm:w-[145px] flex flex-wrap justify-between gap-3 sm:flex-col sm:justify-center sm:items-center"
        >
          {images.map((image: string, index: number) => (
            <div key={index} className="relative aspect-[16/10] w-full sm:max-w-[145px]">
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

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6 gap-3 sm:gap-[40px] w-full">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="w-8 h-8 p-2 cursor-pointer rounded border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Image src="/images/left.svg" alt="back" width={24} height={24} />
        </button>

        <div className="flex items-center gap-3 sm:gap-10 flex-1 ">
          <span className="text-white/60 leading-[20px] font-regular text-[16px] flex-shrink-0">
            {String(currentStep + 1).padStart(2, "0")}
          </span>
          <div className="w-full h-[1px] bg-white/20 relative ">
            <div
              className="absolute top-0 left-0 h-full bg-[#EFFC76] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-sm text-white/60 leading-[20px] font-regular text-[16px] flex-shrink-0">
            {String(totalSteps).padStart(2, "0")}
          </span>
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === totalSteps - 1}
          className="w-8 h-8 rounded cursor-pointer p-2 border border-gray-600 flex items-center justify-center hover:border-[#EFFC76] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Image src="/images/right.svg" alt="forward" width={24} height={24} />
        </button>
      </div>

      {/* Description */}
      <div className="mt-[60px] max-w-[1134px]">
        <p className="text-white/80 text-[16px] sm:text-[18px] leading-[22px] text-justify">
          {application.description ||
            "This verified property has been officially certified. All details are validated and can be verified online."}
        </p>
      </div>
    </div>
  );
}
