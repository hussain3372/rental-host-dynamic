"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Detail from "./Detail";
import Checklist from "./Checklist";
import { application as applicationApi } from "@/app/api/Host/application"; // Uncomment this
import { ApplicationData } from "@/app/api/Host/application/types";

export default function Page() {
  const { id } = useParams();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError("No application ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log("🔄 Parent - Fetching application with ID:", id);
        const response = await applicationApi.getApplicationById(id as string); // Uncomment this
        console.log("📡 Parent - Full API Response:", response);

        let appData: ApplicationData | null = null;

        if (response?.success) {
          if (response.data && typeof response.data === "object") {
            if ("application" in response.data) {
              appData = response.data.application;
              console.log("✅ Parent - Found application in nested structure");
            } else {
              appData = response.data as ApplicationData;
              console.log("✅ Parent - Found application in direct structure");
            }
          }
        }

        if (appData) {
          setApplication(appData);
          console.log("✅ Parent - Application data set:", appData);
        } else {
          console.warn(
            "❌ Parent - No application data found in response",
            response
          );
          setError("Application not found in response");
        }
      } catch (err) {
        console.error("🚨 Parent - Error fetching application:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load application"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-lg">Loading application details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-red-400 text-lg mb-2">
            Error Loading Application
          </h2>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#EFFC76] text-black rounded-lg hover:bg-[#d8e465] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <Image
          src="/images/empty.png"
          alt="No Data Found"
          width={250}
          height={250}
          className="opacity-80 mb-4"
        />
        <h2 className="text-white text-xl font-semibold mb-2">
          No Data Available
        </h2>
        <p className="text-white/60">
          There&apos;s nothing to display right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-[60px]">
      <Detail application={application} />
      <Checklist application={application} />
    </div>
  );
}
