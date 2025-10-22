"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { searchApi } from "../api/Host/search";
import toast from "react-hot-toast";
import { SearchResult } from "../api/Host/search/type";

type SearchDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce search with 3-letter minimum
  useEffect(() => {
    const delay = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      
      // Only search if query has at least 3 letters
      if (trimmedQuery && trimmedQuery.length >= 3) {
        fetchSearchResults(trimmedQuery);
      } else {
        setResults([]);
      }
    }, 400);
    
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    try {
      const response = await searchApi.getSearchResults(query);
      if (response?.data) {
        const data = Array.isArray(response.data)
          ? response.data
          : [response.data];
        
        // Set results only if we have data, otherwise empty array
        setResults(data.length > 0 ? (data as SearchResult[]) : []);
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

  // Check if query has at least 3 letters
  const hasMinimumLetters = searchQuery.trim().length >= 3;

  return (
    <div
      className={`fixed inset-0 z-[2000] bg-[#121315CC] flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full lg:max-w-[608px] md:max-w-[500px] max-w-[280px] p-5 sm:p-7 bg-[#0A0C0B] h-full overflow-y-auto rounded-[12px] border border-[#FFFFFF1F] transform transition-transform duration-300 ${
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
            placeholder="Type at least 3 letters to search..."
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
          ) : results.length > 1 ? (
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
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-white font-semibold text-lg truncate">
                      {item.name || "Unnamed"}
                    </p>
                    <p className="text-[#FFFFFF99] text-[14px] leading-[18px] font-normal truncate">
                      {item.description || "No description available"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchQuery && hasMinimumLetters ? (
            // Show empty state only when we've searched with minimum letters but got no results
            <div className="text-center py-8">
              <p className="text-white text-lg mb-2">No results found</p>
              <p className="text-[#FFFFFF99] text-sm">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : searchQuery && !hasMinimumLetters ? (
            // Show hint when typing but haven't reached 3 letters
            <div className="text-center py-8">
              <p className="text-[#FFFFFF99] text-sm">
                Type at least 3 letters to search...
              </p>
            </div>
          ) : (
            // Initial state - no typing yet
            <div className="text-center py-8">
              <p className="text-white opacity-70">Start typing to search...</p>
              <p className="text-[#FFFFFF99] text-sm mt-2">
                Enter at least 3 letters for better results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}