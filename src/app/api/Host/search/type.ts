export interface Template {
  id: string;
  name: string;
  description: string;
  filters: {
    propertyType?: string;
    minGuests?: number;
    hasImages?: boolean;
    amenities?: string[];
    minBedrooms?: number;
    minBathrooms?: number;
    issuedAfter?: string;
    sortBy?: string;
    maxGuests?: number;
  };
}

export interface TemplatesPayload {
  templates: Template[];
}

// Single definition of SearchResult
export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  image?: string;
  [key: string]: unknown; // for any extra fields backend might send
}

// Remove this duplicate:
// export interface SearchResult {
//   id: string;
//   name: string;
//   description?: string;
//   image?: string;
//   [key: string]: unknown; 
// }

export interface SearchApiResponse {
  data: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}