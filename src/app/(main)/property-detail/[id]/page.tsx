"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PropertyDetailPage from "./PropertyDetailPage";
import Verification from "../Verification";
import { propertyAPI } from "@/app/api/user-flow/index";
import { Property } from "@/app/api/user-flow/types";

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
        
        // Check the actual response structure
        if (response && response.data) {
          // If the response.data is the property object directly
          if (response.data.id) {
            console.log("Property data found in response.data");
            setProperty(response.data);
          } 
          // If the response.data has a data property
          // else if (response.data.data && response.data.data.id) {
          //   console.log("Property data found in response.data.data");
          //   setProperty(response.data.data);
          // }
          // If it's an array with the property
          else if (Array.isArray(response.data) && response.data[0] && response.data[0].id) {
            console.log("Property data found in response.data array");
            setProperty(response.data[0]);
          }
          else {
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

  // If loading
  if (loading) {
    return (
      <div className="pt-[150px] text-center text-white">
        <p>Loading Property Details...</p>
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
      <PropertyDetailPage property={property} />
      <Verification property={property} />
    </>
  );
}