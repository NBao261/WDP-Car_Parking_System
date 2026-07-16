import { useState, useRef, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface UseAddressSearchReturn {
  /** Current search query */
  query: string;
  /** Update search query (triggers debounced API call) */
  setQuery: (q: string) => void;
  /** Suggestions from Nominatim */
  suggestions: NominatimResult[];
  /** Whether the API call is in progress */
  isLoading: boolean;
  /** Whether the dropdown should be shown */
  showDropdown: boolean;
  /** Hide the dropdown */
  hideDropdown: () => void;
  /** Clear search state */
  clearSearch: () => void;
  /** Reverse geocode: coordinates → address string */
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>;
}

// ─── Nominatim API base URL ─────────────────────────────────────────────────
// Nominatim is free and doesn't have CORS issues (it allows cross-origin requests)
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const DEBOUNCE_MS = 400; // Debounce delay to avoid spamming the API

/**
 * Custom hook for address autocomplete and reverse geocoding using OpenStreetMap Nominatim.
 *
 * Usage:
 * ```tsx
 * const { query, setQuery, suggestions, isLoading, showDropdown, reverseGeocode } = useAddressSearch();
 * ```
 *
 * Notes:
 * - Nominatim Usage Policy: max 1 request/second, include User-Agent
 * - No CORS issues — Nominatim allows cross-origin requests
 * - Results are biased towards Vietnam (countrycodes=vn, viewbox around HCMC)
 */
export function useAddressSearch(): UseAddressSearchReturn {
  const [query, setQueryState] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if the user manually selected a suggestion (to prevent re-search)
  const isManualSet = useRef(false);

  // ─── Forward geocode: query → suggestions ─────────────────────────────
  const searchAddress = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        format: 'json',
        q: searchQuery,
        limit: '6',
        countrycodes: 'vn', // Bias results to Vietnam
        addressdetails: '1',
        // Viewbox around HCMC for relevance
        viewbox: '106.5,10.6,107.0,11.0',
        bounded: '0', // Don't strictly bound, just bias
      });

      const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
        headers: {
          // Nominatim requires a User-Agent to identify the app
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Nominatim search failed');

      const data: NominatimResult[] = await response.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Set query with debounce ──────────────────────────────────────────
  const setQuery = useCallback((q: string, skipSearch = false) => {
    setQueryState(q);

    // If skipSearch or manual set (from selecting a suggestion), don't re-search
    if (skipSearch || isManualSet.current) {
      isManualSet.current = false;
      setShowDropdown(false);
      return;
    }

    // Clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call
    debounceRef.current = setTimeout(() => {
      searchAddress(q);
    }, DEBOUNCE_MS);
  }, [searchAddress]);

  // ─── Hide dropdown ────────────────────────────────────────────────────
  const hideDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  // ─── Clear all search state ───────────────────────────────────────────
  const clearSearch = useCallback(() => {
    setQueryState('');
    setSuggestions([]);
    setShowDropdown(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ─── Reverse geocode: coordinates → address string ────────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    try {
      const params = new URLSearchParams({
        format: 'json',
        lat: lat.toString(),
        lon: lng.toString(),
        zoom: '18',
        addressdetails: '1',
      });

      const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error('Nominatim reverse failed');

      const data = await response.json();
      if (data.display_name) {
        // Set the address without triggering a new search
        isManualSet.current = true;
        setQueryState(data.display_name);
        return data.display_name;
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
    return null;
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    showDropdown,
    hideDropdown,
    clearSearch,
    reverseGeocode,
  };
}
