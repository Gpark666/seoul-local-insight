import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCurrentLocation } from "@/hooks/useCurrentLocation";

import {
  getNearbyPopulation,
} from "@/services/populationService";

import {
  getWeather,
} from "@/services/weatherService";

import type {
  NearbyPopulationResult,
} from "@/types/population";

import type {
  ActiveRegion,
  RegionSearchResult,
} from "@/types/region";

import type {
  WeatherResult,
} from "@/types/weather";

const REGION_DATA_REFRESH_MS = 30 * 60 * 1000;

interface RegionDataContextValue {
  activeRegion: ActiveRegion | null;

  weather: WeatherResult | null;
  population: NearbyPopulationResult | null;

  isLocationLoading: boolean;
  isWeatherLoading: boolean;
  isPopulationLoading: boolean;

  locationError: Error | null;
  weatherError: Error | null;
  populationError: Error | null;

  lastUpdatedAt: Date | null;

  setSearchRegion: (
    region: RegionSearchResult,
  ) => void;

  resetToCurrentLocation: () => void;

  refreshRegionData: () => Promise<void>;
}

const RegionDataContext =
  createContext<RegionDataContextValue | null>(null);

export function RegionDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    location,
    isLoading: isLocationLoading,
    error: locationError,
    refresh: refreshCurrentLocation,
  } = useCurrentLocation();

  const [activeRegion, setActiveRegion] =
    useState<ActiveRegion | null>(null);

  const [weather, setWeather] =
    useState<WeatherResult | null>(null);

  const [population, setPopulation] =
    useState<NearbyPopulationResult | null>(null);

  const [isWeatherLoading, setIsWeatherLoading] =
    useState(false);

  const [isPopulationLoading, setIsPopulationLoading] =
    useState(false);

  const [weatherError, setWeatherError] =
    useState<Error | null>(null);

  const [populationError, setPopulationError] =
    useState<Error | null>(null);

  const [lastUpdatedAt, setLastUpdatedAt] =
    useState<Date | null>(null);

  useEffect(() => {
    if (!location || activeRegion) {
      return;
    }

    setActiveRegion({
      id: `current-${location.latitude.toFixed(
        6,
      )}-${location.longitude.toFixed(6)}`,
      name: "현재 위치",
      address: "브라우저 위치 정보 기준",
      latitude: location.latitude,
      longitude: location.longitude,
      source: "current-location",
    });
  }, [activeRegion, location]);

  const refreshRegionData = useCallback(async () => {
    if (!activeRegion) {
      return;
    }

    setIsWeatherLoading(true);
    setIsPopulationLoading(true);

    setWeatherError(null);
    setPopulationError(null);

    const [
      weatherResult,
      populationResult,
    ] = await Promise.allSettled([
      getWeather({
        latitude: activeRegion.latitude,
        longitude: activeRegion.longitude,
      }),
      getNearbyPopulation({
        latitude: activeRegion.latitude,
        longitude: activeRegion.longitude,
        radiusM: 5_000,
        limit: 8,
      }),
    ]);

    if (weatherResult.status === "fulfilled") {
      setWeather(weatherResult.value);
    } else {
      setWeatherError(
        weatherResult.reason instanceof Error
          ? weatherResult.reason
          : new Error(
              "날씨 정보를 불러오지 못했습니다.",
            ),
      );
    }

    if (populationResult.status === "fulfilled") {
      setPopulation(populationResult.value);
    } else {
      setPopulationError(
        populationResult.reason instanceof Error
          ? populationResult.reason
          : new Error(
              "유동인구 정보를 불러오지 못했습니다.",
            ),
      );
    }

    setIsWeatherLoading(false);
    setIsPopulationLoading(false);
    setLastUpdatedAt(new Date());
  }, [activeRegion]);

  useEffect(() => {
    void refreshRegionData();
  }, [refreshRegionData]);

  useEffect(() => {
    const timer = setInterval(() => {
      void refreshRegionData();
    }, REGION_DATA_REFRESH_MS);

    return () => {
      clearInterval(timer);
    };
  }, [refreshRegionData]);

  const setSearchRegion = useCallback(
    (region: RegionSearchResult) => {
      setWeather(null);
      setPopulation(null);
      setWeatherError(null);
      setPopulationError(null);
      setLastUpdatedAt(null);

      setActiveRegion({
        id: region.id,
        name: region.name,
        address: region.address,
        latitude: region.latitude,
        longitude: region.longitude,
        source: "search",
      });
    },
    [],
  );

 const resetToCurrentLocation = useCallback(() => {
  if (!location) {
    refreshCurrentLocation();
    return;
  }

  setWeather(null);
  setPopulation(null);
  setWeatherError(null);
  setPopulationError(null);
  setLastUpdatedAt(null);

  setActiveRegion({
    id: `current-${location.latitude.toFixed(
      6,
    )}-${location.longitude.toFixed(6)}`,
    name: "현재 위치",
    address: "브라우저 위치 정보 기준",
    latitude: location.latitude,
    longitude: location.longitude,
    source: "current-location",
  });

  refreshCurrentLocation();
}, [location, refreshCurrentLocation]);

  const value = useMemo<RegionDataContextValue>(() => {
    return {
      activeRegion,

      weather,
      population,

      isLocationLoading,
      isWeatherLoading,
      isPopulationLoading,

      locationError,
      weatherError,
      populationError,

      lastUpdatedAt,

      setSearchRegion,
      resetToCurrentLocation,
      refreshRegionData,
    };
  }, [
    activeRegion,
    weather,
    population,
    isLocationLoading,
    isWeatherLoading,
    isPopulationLoading,
    locationError,
    weatherError,
    populationError,
    lastUpdatedAt,
    setSearchRegion,
    resetToCurrentLocation,
    refreshRegionData,
  ]);

  return (
    <RegionDataContext.Provider value={value}>
      {children}
    </RegionDataContext.Provider>
  );
}

export function useRegionData(): RegionDataContextValue {
  const context = useContext(RegionDataContext);

  if (!context) {
    throw new Error(
      "useRegionData는 RegionDataProvider 내부에서 사용해야 합니다.",
    );
  }

  return context;
}