"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Searchsection from "./Searchsection";
import VerifiedProperties from "./VerifiedProperties";
import { propertyAPI } from "../../api/user-flow/index";
import { MappedProperty, SearchResponse } from "@/app/api/user-flow/types";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";

  const [searchText, setSearchText] = useState(queryFromUrl);
  const [allProperties, setAllProperties] = useState<MappedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<MappedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic filter options
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  const fetchProperties = async (
    query: string = "",
    location?: string,
    status?: string,
    expiryDate?: string
  ) => {
    setLoading(true);
    try {
      console.log("Fetching properties with params:", { query, location, status, expiryDate });
      
      // Build query string manually
      const params = new URLSearchParams();
      
      if (query.trim() && query.length >= 3) {
        params.append('query', query.trim());
      }
      if (location && location !== "All Locations") {
        params.append('location', location);
      }
      if (status && status !== "Status") {
        // Map frontend status to backend status
        const backendStatus = status === "Verified" ? "ACTIVE" : 
                             status === "Expired" ? "EXPIRED" : 
                             status === "Pending" ? "PENDING" : status;
        params.append('status', backendStatus);
      }
      if (expiryDate) {
        params.append('expiryDate', expiryDate);
      }

      const queryString = params.toString();
      const url = queryString ? `?${queryString}` : '';
      
      console.log("API URL with params:", url);

      const response = await propertyAPI.searchProperties(url);
      
      console.log("Full API Response:", response);
      
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
      
      // Extract unique locations and statuses
      const locations = Array.from(
        new Set(
          certificationsData
            .map(item => item.property.address)
            .filter(addr => addr && addr.trim() !== "")
        )
      );
      setAvailableLocations(locations);
      
      const statuses = Array.from(
        new Set(
          certificationsData.map(item => 
            item.status === "ACTIVE" ? "Verified" : 
            item.status === "EXPIRED" ? "Expired" : 
            "Pending"
          )
        )
      );
      setAvailableStatuses(statuses);
      
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

  const handleSearch = (
    query?: string,
    location?: string,
    status?: string,
    expiryDate?: string
  ) => {
    console.log("Search triggered with:", { query, location, status, expiryDate });
    fetchProperties(
      query !== undefined ? query : searchText,
      location,
      status,
      expiryDate
    );
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
        availableLocations={availableLocations}
        availableStatuses={availableStatuses}
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