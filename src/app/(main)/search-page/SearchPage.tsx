// SearchPageClient.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Searchsection from "./Searchsection";
import VerifiedProperties from "./VerifiedProperties";
import { propertyAPI } from "../../api/user-flow/index";
import { MappedProperty, SearchResponse } from "@/app/api/user-flow/types";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("query") || "";

  const [searchText, setSearchText] = useState(queryFromUrl);
  const [filteredProperties, setFilteredProperties] = useState<MappedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  const isInitialMount = useRef(true);
  const lastSearchParams = useRef<string>("");

  // Simple debounce hook
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchText = useDebounce(searchText, 500);

  const mapApiDataToProperties = useCallback((certificationsData: SearchResponse['data']['certifications']): MappedProperty[] => {
    if (!certificationsData || !Array.isArray(certificationsData)) return [];
    
    return certificationsData.map((item) => ({
      id: item.id,
      title: item.property?.name || "Unnamed Property",
      address: item.property?.address || "Unknown Address",
      image: item.property?.images?.[0] || "/images/empty.png",
      status: item.status === "ACTIVE" ? "Verified" : item.status === "EXPIRED" ? "Expired" : "Pending",
      expiry: item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "N/A",
      location: item.property?.address || "Unknown",
    }));
  }, []);

const extractFilterOptions = useCallback((certificationsData: SearchResponse['data']['certifications']) => {    if (!certificationsData || !Array.isArray(certificationsData)) {
      return { locations: [], statuses: [] };
    }
    
    const locations = Array.from(
      new Set(
        certificationsData
          .map(item => item.property?.address)
          .filter((addr): addr is string => Boolean(addr && addr.trim() !== ""))
      )
    );
    
    const statuses = Array.from(
      new Set(
        certificationsData.map(item => 
          item.status === "ACTIVE" ? "Verified" : 
          item.status === "EXPIRED" ? "Expired" : 
          "Pending"
        )
      )
    );
    
    return { locations, statuses };
  }, []);
 const getParamsString = useCallback((params: Record<string, string>): string => {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('&');
  }, []);
  // In SearchPageClient.tsx - update the buildCleanParams function
const buildCleanParams = useCallback((
  search: string = "",
  location?: string,
  status?: string,
  expiryDate?: string
): Record<string, string> => {
  const params: Record<string, string> = {};
  
  const trimmedSearch = search.trim();
  if (trimmedSearch.length >= 3) {
    params.search = trimmedSearch; // Changed from 'query' to 'search'
  }
  
  if (location && location !== "All Locations") {
    params.location = location;
  }
  
  if (status && status !== "Status") {
    params.status = status.toUpperCase();
  }
  
  if (expiryDate) {
    params.expiryDate = expiryDate;
  }

  return params;
}, []);

// Update the fetchProperties function
const fetchProperties = useCallback(async (
  search: string = "", // Changed from query to search
  location?: string,
  status?: string,
  expiryDate?: string
) => {
  const params = buildCleanParams(search, location, status, expiryDate);
  const paramsString = getParamsString(params);
  
  // Prevent duplicate API calls
  if (paramsString === lastSearchParams.current && !isInitialMount.current) {
    return;
  }
  
  lastSearchParams.current = paramsString;
  setLoading(true);
  
  try {
    console.log("API call with params:", params);

    // Call API with search parameter
    const response = await propertyAPI.searchProperties({
      search, // This will become ?search=something
      location,
      status, 
      expiryDate
    });
    
    const apiData = response?.data as SearchResponse;
    const certificationsData = apiData?.data?.certifications || [];
    
    const mappedProperties = mapApiDataToProperties(certificationsData);
    const { locations, statuses } = extractFilterOptions(certificationsData);
    
    setFilteredProperties(mappedProperties);
    setAvailableLocations(locations);
    setAvailableStatuses(statuses);
    
  } catch (error) {
    console.error("Error fetching certified properties:", error);
    setFilteredProperties([]);
    setAvailableLocations([]);
    setAvailableStatuses([]);
  } finally {
    setLoading(false);
    isInitialMount.current = false;
  }
}, [buildCleanParams, getParamsString, mapApiDataToProperties, extractFilterOptions]);

 

  // const fetchProperties = useCallback(async (
  //   query: string = "",
  //   location?: string,
  //   status?: string,
  //   expiryDate?: string
  // ) => {
  //   const params = buildCleanParams(query, location, status, expiryDate);
  //   const paramsString = getParamsString(params);
    
  //   // Prevent duplicate API calls
  //   if (paramsString === lastSearchParams.current && !isInitialMount.current) {
  //     return;
  //   }
    
  //   lastSearchParams.current = paramsString;
  //   setLoading(true);
    
  //   try {
  //     console.log("API call with params:", params);

  //     // Direct API call with clean params object
  //     const response = await propertyAPI.searchProperties(params);
      
  //     const apiData = response?.data as SearchResponse;
  //     const certificationsData = apiData?.data?.certifications || [];
      
  //     const mappedProperties = mapApiDataToProperties(certificationsData);
  //     const { locations, statuses } = extractFilterOptions(certificationsData);
      
  //     setFilteredProperties(mappedProperties);
  //     setAvailableLocations(locations);
  //     setAvailableStatuses(statuses);
      
  //   } catch (error) {
  //     console.error("Error fetching certified properties:", error);
  //     setFilteredProperties([]);
  //     setAvailableLocations([]);
  //     setAvailableStatuses([]);
  //   } finally {
  //     setLoading(false);
  //     isInitialMount.current = false;
  //   }
  // }, [buildCleanParams, getParamsString, mapApiDataToProperties, extractFilterOptions]);

  // Initial load - only once
  useEffect(() => {
    if (isInitialMount.current) {
      const initialQuery = queryFromUrl.length >= 3 ? queryFromUrl : "";
      fetchProperties(initialQuery);
    }
  }, [queryFromUrl, fetchProperties]);

  // Debounced search
  useEffect(() => {
    if (isInitialMount.current) return;
    
    if (debouncedSearchText.length >= 3 || debouncedSearchText.length === 0) {
      fetchProperties(debouncedSearchText);
    }
  }, [debouncedSearchText, fetchProperties]);

  const handleSearch = useCallback((
    query?: string,
    location?: string,
    status?: string,
    expiryDate?: string
  ) => {
    const searchQuery = query ?? searchText;
    fetchProperties(searchQuery, location, status, expiryDate);
  }, [searchText, fetchProperties]);

  const handleSearchTextChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  return (
    <>
      <Searchsection
        onSearch={setFilteredProperties}
        initialValue={searchText}
        properties={filteredProperties}
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