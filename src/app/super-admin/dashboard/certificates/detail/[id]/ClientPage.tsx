"use client";
import React, { useEffect, useState } from "react";
import Detail from "./Detail";
import CertificationSetup from "./CertificationSetup";
import { certificateTemplate } from "@/app/api/super-admin/certificates";
import { CertificateDetailResponse } from "@/app/api/super-admin/certificates/types";

export default function ClientPage({ templateId }: { templateId: string }) {
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] =
    useState<CertificateDetailResponse | null>(null);

  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setLoading(true);
        const response =
          await certificateTemplate.fetchCertificateTemplateDetail(templateId);
        if (response?.data) {
          setCertificateData(response.data);
        }
      } catch (error) {
        console.error("Error fetching certificate template:", error);
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplateData();
    }
  }, [templateId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-lg">Loading certificate details...</p>
      </div>
    );

  if (!certificateData)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-lg">No certificate data found.</p>
      </div>
    );

  return (
    <div>
      <CertificationSetup
        certificateData={certificateData}
        templateId={templateId}
      />
      <Detail
        certificates={certificateData.certificates}
        templateId={templateId}
      />
    </div>
  );
}
