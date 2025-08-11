export interface FilterOption {
  value: string;
  label: string;
  category: string;
}

export interface FilterCategory {
  [key: string]: string;
}

export interface FilterData {
  options: FilterOption[];
  categories: FilterCategory;
}

export interface FilterResponse {
  success: boolean;
  message: string;
  data: {
    furniture: FilterData;
    amenities: FilterData;
  };
}

export interface FilterState {
  loading: boolean;
  furniture: FilterOption[];
  amenities: FilterOption[];
  furnitureCategories: FilterCategory;
  amenitiesCategories: FilterCategory;
  error: string | null;
}
