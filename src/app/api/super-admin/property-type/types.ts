export interface PropertyResponse {
  message: string;
  count: number;
  data: PropertyType[];
}

export interface PropertyType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  checklists: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
}
