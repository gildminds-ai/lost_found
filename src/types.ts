export type Category =
  | 'All'
  | 'Engineering & Drafting'
  | 'Electronics & Calc'
  | 'Lab & Science'
  | 'Textbooks & Study'
  | 'Dorm & Campus';

export type AvailabilityStatus = 'available' | 'rented' | 'reserved';

export type PriceUnit = 'day' | 'week' | 'month' | 'semester';

export type ItemCondition = 'Brand New' | 'Like New' | 'Good' | 'Fair';

export interface Item {
  id: string;
  name: string;
  category: Exclude<Category, 'All'>;
  description: string;
  rentalPrice: number;
  priceUnit: PriceUnit;
  currency: string;
  availability: AvailabilityStatus;
  imageUrl: string;
  ownerName: string;
  ownerEmail: string;
  campusLocation: string;
  condition: ItemCondition;
  createdAt: string;
}

export interface RentalRequest {
  id: string;
  itemId: string;
  itemName: string;
  itemImageUrl: string;
  borrowerName: string;
  borrowerEmail: string;
  rentalDuration: string;
  startDate: string;
  notes?: string;
  status: 'Pending Owner Review' | 'Approved' | 'Returned';
  totalCostEstimate: string;
  createdAt: string;
}

export interface CreateItemPayload {
  name: string;
  category: Exclude<Category, 'All'>;
  description: string;
  rentalPrice: number;
  priceUnit: PriceUnit;
  currency?: string;
  imageUrl?: string;
  ownerName: string;
  ownerEmail: string;
  campusLocation: string;
  condition: ItemCondition;
}

export interface CreateRentalPayload {
  itemId: string;
  borrowerName: string;
  borrowerEmail: string;
  rentalDuration: string;
  startDate: string;
  notes?: string;
}
