"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Searchsection from "./Searchsection";
import VerifiedProperties from "./VerifiedProperties";
import { propertyAPI } from "../../api/user-flow/index";
import { MappedProperty, SearchResponse } from "@/app/api/user-flow/types";

// interface PropertyData {
//   name: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
//   propertyType: string;
//   numberOfGuests: number;
//   numberOfBedrooms: number;
//   numberOfBeds: number;
//   numberOfBathrooms: number;
//   description: string;
//   amenities: string[];
//   images: string[];
// }

// interface CertificationItem {
//   id: string;
//   certificateNumber: string;
//   issuedAt: string;
//   expiresAt: string;
//   status: string;
//   host: {
//     id: number;
//     name: string;
//   };
//   property: PropertyData;
//   badgeUrl: string;
//   qrCodeUrl: string;
//   verificationUrl: string;
// }


export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";

  const [searchText, setSearchText] = useState(queryFromUrl);
  const [allProperties, setAllProperties] = useState<MappedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<MappedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async (query: string = "") => {
    setLoading(true);
    try {
      console.log("Fetching properties with query:", query);
      
      let response;
      
      if (query.trim() && query.length >= 3) {
        console.log("Using search/properties endpoint WITH query:", query);
        response = await propertyAPI.searchProperties(query.trim());
      } else {
        console.log("Using search/properties endpoint WITHOUT params (get all properties)");
        response = await propertyAPI.searchProperties("");
      }
      
      console.log("Full API Response:", response);
      
      // Fix: Access the correct response structure
      const apiData = response?.data as SearchResponse;
      const certificationsData = apiData?.data?.certifications || [];
      const mapped: MappedProperty[] = certificationsData.map((item) => ({
        id: item.id,
        title: item.property.name || "Unnamed Property",
        address: item.property.address || "Unknown Address",
        image: item.property.images?.[0] || "/images/empty.png",
        status: item.status === "ACTIVE" ? "Verified" : item.status === "EXPIRED" ? "Expired" : "Pending",
        expiry: item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "N/A",
        location: item.property.address || "Unknown",
      }));
      console.log("Mapped properties:", mapped);
      
      setAllProperties(mapped);
      setFilteredProperties(mapped);
    } catch (error) {
      console.error("Error fetching certified properties:", error);
      setAllProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initial mount with queryFromUrl:", queryFromUrl);
    const initialQuery = queryFromUrl.length >= 3 ? queryFromUrl : "";
    fetchProperties(initialQuery);
  }, [queryFromUrl]);

  const handleSearch = () => {
    console.log("Search button clicked with text:", searchText);
    fetchProperties(searchText);
  };

  const handleSearchTextChange = (value: string) => {
    console.log("Search text changed:", value);
    setSearchText(value);
  };


  return (
    <>
      <Searchsection
        onSearch={setFilteredProperties}
        initialValue={searchText}
        properties={allProperties}
        onSearchTextChange={handleSearchTextChange}
        onSearchClick={handleSearch}
      />
      <div className="pt-[80px]">
        <VerifiedProperties 
          properties={filteredProperties}
          isLoading={loading} 
        />
      </div>
    </>
  );
}