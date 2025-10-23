"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { searchApi } from "../api/Admin/search";
import toast from "react-hot-toast";
import { SearchResult } from "../api/Admin/search/type";
import Cookies from "js-cookie";

type SearchDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Define the actual API response type based on your data
type ApiApplication = {
  id: string;
  type: string;
  propertyName: string;
  propertyType: string;
  hostName: string;
  hostEmail: string;
  hostCompany: string;
  status: string;
  currentStep: string;
  submittedAt: string | null;
  createdAt: string;
  thumbnail: string | null;
};



export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce search with 3-letter minimum
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        fetchSearchResults(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        setResults([]);
      }
      // Don't do anything if query length is 1-2 characters
    }, 400);
    
    return () => clearTimeout(delay);
  }, [searchQuery]);

const fetchSearchResults = async (query: string) => {
  if (query.trim().length < 3) {
    setResults([]);
    return;
  }
  Cookies.remove('accessToken')
  setLoading(true);
  try {
    const response = await searchApi.getSearchResults(query);
    
    // Fix: Access the nested data property properly
    if (response && response.data) {
      const apiResponse = response.data;
      
      // Check if the response has the expected structure
      if (apiResponse && 'data' in apiResponse && Array.isArray(apiResponse.data)) {
        const mappedResults: SearchResult[] = apiResponse.data.map((item) => ({
          id: item.id,
          name: item.propertyName,
          description: `${item.hostName} - ${item.hostCompany}`,
          image: item.thumbnail || "/images/search.png",
        }));
        
        setResults(mappedResults);
      } else {
        setResults([]);
      }
    } else {
      setResults([]);
    }
  } catch (error) {
    console.error("Search error:", error);
    toast.error("Failed to fetch search results");
    setResults([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className={`fixed inset-0 z-[2000] bg-[#121315CC] flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-y-auto scrollbar-hide rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative mb-6">
          <Image
            src="/images/search.png"
            alt="Search"
            width={20}
            height={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search... (min. 3 characters)"
            className="w-full pl-10 pr-10 p-3 rounded-[8px] bg-[#1F1F1F] text-white outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#FFFFFF99] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
            <p className="text-white opacity-70">Please type at least 3 characters to search</p>
          ) : results.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {results.map((item, index) => (
                <li
                  key={`${item.id || index}`}
                  className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 p-3 bg-[rgba(255,255,255,0.08)] rounded-[12px]"
                >
                  <div className="w-14 h-14 sm:w-[60px] sm:h-[60px] flex-shrink-0 rounded-full overflow-hidden">
                    <Image
                      src={item.image || "/images/search.png"}
                      alt={item.name || "Result"}
                      width={60}
                      height={60}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 text-center justify-center sm:justify-start sm:text-left">
                    <p className="text-white text-[12px] sm:text-[14px] font-semibold text-lg truncate max-w-[200px] !text-center sm:!text-start text-wrap sm:max-w-[300px]">
                      {item.name || "Unnamed"}
                    </p>
                    <p className="text-[#FFFFFF99] text-[12px] sm:text-[14px] text-wrap leading-[18px] font-normal truncate">
                      {item.description || "No description available"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchQuery.length >= 3 ? (
            <p className="text-white">No results found</p>
          ) : (
            <p className="text-white opacity-70">Start typing to search... (min. 3 characters)</p>
          )}
        </div>
      </div>
    </div>
  );
}