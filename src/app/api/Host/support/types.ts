
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
  priority: string;
  status: string;
  assignedTo: string | null;
  attachmentUrls: string[];
  tags: string[];
  resolution: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User; // ✅ Add this property
}
export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: string; // issue type dropdown value
  priority: string; // priority dropdown value
  attachmentUrls?: string[];
  tags?: string[];
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
}
// types.ts

export interface Ticket {
  id: string;
  userId: number;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  attachmentUrls: string[];
  tags: string[];
  resolution: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  items:string;
  count: string;
  tickets: string;
    total?: number; // ✅ ADD THIS - for direct access

  
}

