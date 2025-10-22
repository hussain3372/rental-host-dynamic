// src/modules/properties/types.ts

export interface Property {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  propertyType?: string;
  numberOfGuests?: number;
  numberOfBedrooms?: number;
  numberOfBeds?: number;
  numberOfBathrooms?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface Host {
  id: number | string;
  name: string;
}

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
  appliedFilters: Record<
    string,
    string | number | boolean | string[] | number[]
  >;
}

export interface SearchResponse {
  status: string;
  message: string;
  data: SearchData;
}
export interface MappedProperty {
  id: string;
  title: string;
  address: string;
  image: string;
  status?: string;
  expiry?: string;
  location?: string;
  images?: string[];
  author?: string;


}
