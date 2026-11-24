export type RegionSource =
  | "current-location"
  | "search";

export interface ActiveRegion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  source: RegionSource;
}

export interface RegionSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}