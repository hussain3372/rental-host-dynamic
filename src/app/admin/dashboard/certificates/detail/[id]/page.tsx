"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { certificateApi } from '@/app/api/Admin/certificate';
import { Certification } from '@/app/api/Admin/certificate/types';
import Detail from './Detail';
import Verification from './Verification';
import Checklist from './CheckList';

export default function CertificateDetailPage() {
  const { id } = useParams();
  const certificateId = id as string;

  const [certificate, setCertificate] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch certificate details
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const response = await certificateApi.getCertificateById(certificateId);
        if (response.data) {
          setCertificate(response.data);
        } else {
          throw new Error('No certificate data received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch certificate details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="pt-[150px] text-center text-white">
        Loading certificate details...
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="pt-[150px] text-center text-white">
        {error || "Certificate not found"}
      </div>
    );
  }

  return (
    <div>
      <Detail certificate={certificate} />
      <Checklist certificate={certificate} />
      <Verification certificate={certificate} />
    </div>
  );
}