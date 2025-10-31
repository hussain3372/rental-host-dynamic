"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PropertyDetailPage from "./PropertyDetailPage";
import Verification from "../Verification";
import { propertyAPI } from "@/app/api/user-flow/index";
import { Property } from "@/app/api/user-flow/types";
import { MoonLoader } from "react-spinners"; // ✅ added

export default function PropertyDetailLayout() {
  const { id } = useParams();
  const propertyId = Array.isArray(id) ? id[0] : id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setError("Property ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching property with ID:", propertyId);

        const response = await propertyAPI.getPropertyById(propertyId);
        console.log("Full API Response:", response);

        if (response && response.data) {
          if (response.data.id) {
            console.log("Property data found in response.data");
            setProperty(response.data);
          } else if (Array.isArray(response.data) && response.data[0]?.id) {
            console.log("Property data found in response.data array");
            setProperty(response.data[0]);
          } else {
            console.log("Unexpected response structure:", response);
            setError("Unexpected response format");
          }
        } else {
          setError("No data received from API");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Failed to load property details");
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // ✅ Show loader while data is fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F0F0F]">
        <MoonLoader color="#EFFC76" size={60} />
      </div>
    );
  }

  // If error
  if (error) {
    return (
      <div className="pt-[150px] text-center text-white">
        <h1>Error</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // If property not found
  if (!property) {
    return (
      <div className="pt-[150px] text-center text-white">
        <h1>Property Not Found</h1>
        <p>The requested property could not be found.</p>
      </div>
    );
  }

  console.log("Rendering with property:", property);

  return (
    <>
      <PropertyDetailPage property={property} isLoading={false} />
      <Verification property={property} />
    </>
  );
}
