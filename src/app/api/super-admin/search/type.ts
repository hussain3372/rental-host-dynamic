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


export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  image?: string;
  [key: string]: unknown; // for any extra fields backend might send
}
