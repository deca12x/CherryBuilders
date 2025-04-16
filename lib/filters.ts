import { FiltersProp } from "@/lib/types";

// Key for storing filters in sessionStorage
const FILTERS_STORAGE_KEY = "cherry-filters";

/**
 * Get filters from sessionStorage
 * @returns The filters from sessionStorage or null if not found
 */
export const getFiltersFromSession = (): FiltersProp | null => {
  if (typeof window === "undefined") return null;

  try {
    const filtersJson = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!filtersJson) return null;

    const filters = JSON.parse(filtersJson) as FiltersProp;
    return filters;
  } catch (error) {
    console.error("Error retrieving filters from sessionStorage:", error);
    return null;
  }
};

/**
 * Save filters to sessionStorage
 * @param filters The filters to save
 */
export const saveFiltersToSession = (filters: FiltersProp): void => {
  if (typeof window === "undefined") return;

  try {
    const filtersJson = JSON.stringify(filters);
    sessionStorage.setItem(FILTERS_STORAGE_KEY, filtersJson);
  } catch (error) {
    console.error("Error saving filters to sessionStorage:", error);
  }
};

/**
 * Clear filters from sessionStorage
 */
export const clearFiltersFromSession = (): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(FILTERS_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing filters from sessionStorage:", error);
  }
};
