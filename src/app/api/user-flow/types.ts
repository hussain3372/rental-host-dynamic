
// Core Property Interfaces
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  propertyType: string;
  description: string;
  propertyDetails: PropertyDetails;
  images: string[];
  certificateStatus: "ACTIVE" | "EXPIRED" | "PENDING";
  certificateNumber: string;
  issuedAt: string;
  expiresAt: string;
  qrCodeUrl: string;
  verificationUrl: string;
  badgeUrl: string;
  hostName: string;
  hostCompany: string;
  // Optional fields for backward compatibility
  state?: string;
  zipCode?: string;
  country?: string;
  numberOfGuests?: number;
  numberOfBedrooms?: number;
  numberOfBeds?: number;
  numberOfBathrooms?: number;
  amenities?: string[];
  certifications?:string
}

export interface PropertyDetails {
  rent: number;
  images: string[];
  address: string;
  bedrooms: number;
  currency: string;
  bathrooms: number;
  maxGuests: number;
  ownership: string;
  description: string;
  propertyName: string;
  propertyType: string;
  area:string;
}
export interface CertificationData {
  id: string;
  applicationId: string;
  hostId: number;
  certificateNumber: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revokedBy: number | null;
  revokeReason: string | null;
  badgeUrl: string;
  qrCodeUrl: string;
  qrCodeData: string;
  verificationUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  certificateTemplateId: string;

  host?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    companyName?: string;
  };

  application?: {
    id: string;
    hostId: number;
    status: string;
    currentStep: string;
    submittedAt: string;
    reviewedBy: number;
    reviewedAt: string;
    reviewNotes: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    propertyDetails?: {
      rent: number;
      images: string[];
      address: string;
      bedrooms: number;
      currency: string;
      bathrooms: number;
      maxGuests: number;
      ownership: string;
      description: string;
      propertyName: string;
      propertyType: string;
    };
    documents?: {
      id: string;
      applicationId: string;
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
      documentType: string;
      uploadedAt: string;
    }[];
  };
}


export interface Host {
  id: number | string;
  name: string;
}

// Certification Interface (for search responses)
export interface Certification {
  id: string;
  certificateNumber: string;
  issuedAt: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "PENDING" | string;
  host: Host;
  property: Property;
  badgeUrl?: string;
  qrCodeUrl?: string;
  verificationUrl?: string;
}

// Search Related Interfaces
export interface SearchParams {
  search?: string;
  location?: string;
  status?: string;
  expiry?: string;
  page?: number;
  limit?: number;
  propertyType?: string;
  amenities?: string[];
}

export interface Facets {
  propertyTypes: string[];
  locations: string[];
  amenities: string[];
  guestCapacities: string[];
}

export interface SearchData {
  certifications: Certification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  searchTime: number;
  highlightedTerms: string[];
  facets: Facets;
  appliedFilters: Record<string, string | number | boolean | string[] | number[]>;
}

// Main Search Response Interface
// Fix the SearchResponse interface to match the actual API structure
export interface SearchResponse {
  status: string;
  message: string;
  data: {
    certifications: Certification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    searchTime: number;
    highlightedTerms: string[];
    facets: Record<string, unknown>;
    appliedFilters: Record<string, unknown>;
  };
}

// Then use:

// For backward compatibility with legacy search responses
export interface LegacySearchResponse {
  status: string;
  message: string;
  data: SearchData;
}

// Mapped Property Interface (for frontend display)
export interface MappedProperty {
  id: string;
  title: string;
  address: string;
  image: string;
  status: string;
  expiry: string;
  location: string;
  // Optional fields for different use cases
  images?: string[];
  author?: string;
}

// Single Property Response
export interface PropertyResponse {
  data: Property;
  id : string
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  status?: string;
  message?: string;
}
export interface ApiProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  images: string[];
  certificateStatus: "ACTIVE" | "EXPIRED" | "PENDING";
  expiresAt: string;
  badgeUrl: string;
  qrcode: string;
  propertyType?: {
    rent: number;
    images: string[];
    address: string;
    bedrooms: number;
    currency: string;
    bathrooms: number;
    maxGuests: number;
    ownership: string;
    description: string;
    propertyName: string;
    propertyType: string;
  };
 

}
