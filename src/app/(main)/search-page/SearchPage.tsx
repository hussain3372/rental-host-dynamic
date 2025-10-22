"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Searchsection from "./Searchsection";
import VerifiedProperties from "./VerifiedProperties";
import { propertyAPI } from "../../api/user-flow/index";
import { Certification } from "../../api/user-flow/types";
import { MappedProperty } from "@/app/api/user-flow/types";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";

  // ✅ single state hooks
  const [searchText] = useState(queryFromUrl);
  const [filteredProperties, setFilteredProperties] = useState<
    MappedProperty[]
  >([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data from API and map to MappedProperty
  useEffect(() => {
    const fetchCertifiedProperties = async () => {
      try {
        const response = await propertyAPI.getCertifiedProperties();
        const certifications: Certification[] =
          response?.data?.data?.certifications || [];

        const mapped: MappedProperty[] = certifications.map((item) => ({
          id: String(item.id),
          title: item.property?.name || "Unnamed Property",
          address: item.property?.address || "Unknown Address",
          image: item.property?.images?.[0] || "/images/empty.png",
          status:
            item.status === "ACTIVE"
              ? "Verified"
              : item.status === "EXPIRED"
              ? "Expired"
              : "Pending",
          expiry: item.expiresAt
            ? new Date(item.expiresAt).toLocaleDateString()
            : "N/A",
        }));

        setFilteredProperties(mapped);
      } catch (error) {
        console.error("Error fetching certified properties:", error);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifiedProperties();
  }, []);

  // ✅ Filter properties when user types or selects filters
  useEffect(() => {
    if (!searchText) return;
    setFilteredProperties((prev) =>
      prev.filter((p) => {
        const titleMatch = p.title
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
        const addressMatch = p.address
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
        const statusMatch = p.status
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
        return titleMatch || addressMatch || statusMatch;
      })
    );
  }, [searchText]);

  if (loading) {
    return (
      <p className="text-center text-white py-10">
        Loading Certified Properties...
      </p>
    );
  }

  return (
    <>
      <Searchsection
        onSearch={setFilteredProperties}
        initialValue={searchText}
        properties={filteredProperties}
      />
      <div className="pt-[80px]">
        {/* ✅ VerifiedProperties expects Property[], but we’ll pass compatible MappedProperty[] */}
        <VerifiedProperties properties={filteredProperties} />
      </div>
    </>
  );
}
