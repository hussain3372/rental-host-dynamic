export interface DashboardStatsResponse {
  propertyListings: {
    count: number;
    changeFromLastMonth: number;
    changePercentage: number;
    leftThisMonth: number;
  };
  activeBadges: {
    count: number;
    changeFromLastMonth: number;
    changePercentage: number;
  };
  applicationsInProgress: {
    count: number;
    changeFromLastWeek: number;
  };
  expired: {
    count: number;
    recentlyExpired: number;
  };
}
// types.ts
export interface ApplicationTrackerItem {
  id: string;
  name: {
    address: string;
    ownership: string;
    propertyName: string;
    propertyType: string;
    rent?: number;
    images?: string[];
    bedrooms?: number;
    currency?: string;
    bathrooms?: number;
    maxGuests?: number;
    description?: string;
  };
  percentage: number;
}

export interface ApplicationTrackerResponse {
  message: string;
  count: number;
  data: ApplicationTrackerItem[];
}

export interface DashboardStatsResponse {
  // ... your existing stats types
  applicationTracker?: ApplicationTrackerResponse;
}