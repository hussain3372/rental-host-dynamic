// src/api/support/index.ts (super-admin Flow)
import { apiClient, ApiResponse } from "../../core/client";
import Cookies from "js-cookie";
import {
  GetTicketsResponse,
  ImageUploadResponse,
  
} from "@/app/api/Admin/support/types";

const token = Cookies.get("superAdminAccessToken");

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const uploadImage = async (file: File): Promise<ApiResponse<ImageUploadResponse>> => {
  const formData = new FormData();
  formData.append("image", file);

  return apiClient.post<ImageUploadResponse>("/applications/image-upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Let the browser set Content-Type with boundary for FormData
    },
  });
};

// Announcement types
interface Announcement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface GetAnnouncementsResponse {
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateAnnouncementPayload {
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
}

interface UpdateAnnouncementPayload {
  title?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

export const supportApi = {
  // Get super-admin Tickets (super-admin-specific endpoint)
  getsuperAdminTickets: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    status?: string,
    createdAt?: string
  ): Promise<ApiResponse<GetTicketsResponse>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (status) params.append("status", status);
    if (createdAt) params.append("createdAt", createdAt);

    return apiClient.get<GetTicketsResponse>(
      `/support/super-admin/tickets?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // Delete Single Ticket
  deleteTicket: async (ticketId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/support/tickets/${ticketId}`, {
      headers: getAuthHeaders(),
    });
  },

  // Delete Multiple Tickets
  deleteMultipleTickets: async (
    ticketIds: string[]
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/support/tickets`, {
      headers: getAuthHeaders(),
      body: { ticketIds: ticketIds },
    });
  },

  // ✅ Get Announcements
  getAnnouncements: async (
   
  ): Promise<ApiResponse<GetAnnouncementsResponse>> => {
    const params = new URLSearchParams();
   
    return apiClient.get<GetAnnouncementsResponse>(
      `/support/super-admin/announcements?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
  },

  // ✅ Create Announcement
  createAnnouncement: async (
    payload: CreateAnnouncementPayload
  ): Promise<ApiResponse<Announcement>> => {
    return apiClient.post<Announcement>("/support/super-admin/announcements", payload, {
      headers: getAuthHeaders(),
    });
  },

  // ✅ Delete Announcement
  deleteAnnouncement: async (announcementId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(`/support/super-admin/announcements/${announcementId}`, {
      headers: getAuthHeaders(),
    });
  },

   updateAnnouncement: async (
    announcementId: string,
    payload: UpdateAnnouncementPayload
  ): Promise<ApiResponse<Announcement>> => {
    return apiClient.put<Announcement>(
      `/support/super-admin/announcements/${announcementId}`,
      payload,
      {
        headers: getAuthHeaders(),
      }
    );
  },
  
};