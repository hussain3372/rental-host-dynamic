"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Searchsection from "./Searchsection";
import VerifiedProperties from "./VerifiedProperties";
import { propertyAPI } from "../../api/user-flow/index";
import { MappedProperty} from "@/app/api/user-flow/types";

// Define the actual API response type based on your response


export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";

  const [searchText, setSearchText] = useState(queryFromUrl);
  const [allProperties, setAllProperties] = useState<MappedProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<MappedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Function to fetch properties from API
  const fetchProperties = async (query: string = "") => {
    setLoading(true);
    try {
      console.log("Fetching properties with query:", query);
      
      let response;
      
      if (query.trim() && query.length >= 3) {
        // ✅ If there's a search query, use /search/properties WITH search param
        console.log("Using search/properties endpoint WITH query:", query);
        response = await propertyAPI.searchProperties(query.trim());
      } else {
        // ✅ If no search query, use /search/properties WITHOUT any params
        console.log("Using search/properties endpoint WITHOUT params (get all properties)");
        response = await propertyAPI.searchProperties(""); // Empty string = no search param
      }
      
      console.log("Full API Response:", response);
      
      // ✅ FIX: Correct response structure mapping
      // const apiData = response?.data as ApiResponse;
      const propertiesData = response?.data?.data || [];      
      console.log("Properties data:", propertiesData);

      const mapped: MappedProperty[] = propertiesData.map((item) => ({
        id: item.id,
        title: item.name || "Unnamed Property",
        address: item.address || "Unknown Address",
        image: item.images?.[0] || "/images/empty.png",
        status:
          item.certificateStatus === "ACTIVE"
            ? "Verified"
            : item.certificateStatus === "EXPIRED"
            ? "Expired"
            : "Pending",
        expiry: item.expiresAt
          ? new Date(item.expiresAt).toLocaleDateString()
          : "N/A",
        location: item.address || "Unknown",
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

  // ✅ Initial fetch on mount
  useEffect(() => {
    console.log("Initial mount with queryFromUrl:", queryFromUrl);
    const initialQuery = queryFromUrl.length >= 3 ? queryFromUrl : "";
    fetchProperties(initialQuery);
  }, [queryFromUrl]); // Only run once on mount

  // ✅ Handle search button click
  const handleSearch = () => {
    console.log("Search button clicked with text:", searchText);
    
    // Fetch from API - logic inside fetchProperties will choose the right endpoint
    fetchProperties(searchText);
  };

  // ✅ Handle input text change
  const handleSearchTextChange = (value: string) => {
    console.log("Search text changed:", value);
    setSearchText(value);
  };

  if (loading) {
    return (
      <div className="text-center text-white py-10">
        <p>Loading Certified Properties...</p>
      </div>
    );
  }

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
        <VerifiedProperties properties={filteredProperties} />
      </div>
    </>
  );
}