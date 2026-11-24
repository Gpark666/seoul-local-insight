import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  searchRegions,
} from "@/services/regionSearchService";

import type {
  RegionSearchResult,
} from "@/types/region";

interface UseRegionSearchResult {
  keyword: string;
  results: RegionSearchResult[];
  isLoading: boolean;
  error: Error | null;
  setKeyword: (value: string) => void;
  clear: () => void;
}

export function useRegionSearch(): UseRegionSearchResult {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<
    RegionSearchResult[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] =
    useState<Error | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  useEffect(() => {
    const normalizedKeyword = keyword.trim();

    abortControllerRef.current?.abort();

    if (normalizedKeyword.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);

      return;
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    const timer = setTimeout(() => {
      setIsLoading(true);
      setError(null);

      searchRegions(normalizedKeyword, controller.signal)
        .then((nextResults) => {
          if (!controller.signal.aborted) {
            setResults(nextResults);
          }
        })
        .catch((searchError) => {
          if (controller.signal.aborted) {
            return;
          }

          setResults([]);

          setError(
            searchError instanceof Error
              ? searchError
              : new Error(
                  "지역 검색에 실패했습니다.",
                ),
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword]);

  const clear = useCallback(() => {
    abortControllerRef.current?.abort();
    setKeyword("");
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    keyword,
    results,
    isLoading,
    error,
    setKeyword,
    clear,
  };
}