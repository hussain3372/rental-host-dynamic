

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Ticket {
  id: string;
  userId: number;
  subject: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo: string | null;
  attachmentUrls: string[];
  tags: string[];
  resolution: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  property?: string;
  createdBy?: string;
  attachments?: string[];
  data: string;
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: string; 
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; 
  attachmentUrls?: string[];
  tags?: string[];
  property?: string;
  attachments?: string[];
}

export interface CreateTicketResponse {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  attachmentUrls: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface TicketPagination {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTicketsResponse {
  success: boolean;
  message: string;
  data: TicketPagination;
  items?: string;
  count?: string;
  tickets?: string;
  total?: number;
}

export interface TicketFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  property?: string;
  status?: string;
  createdAt?: string;
}

export interface UpdateTicketPayload {
  status?: string;
  assignedTo?: string;
  resolution?: string;
  subject?: string;
  description?: string;
  priority?: string;
  category?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface ImageUploadResponse {
  status: string;
  message: string;
  data: {
    url: string;
    key: string;
    name: string;
  };
}
