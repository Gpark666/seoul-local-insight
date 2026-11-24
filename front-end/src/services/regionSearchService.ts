import type {
  RegionSearchResult,
} from "@/types/region";

interface LocalSearchItem {
  title?: string;
  address?: string;
  roadAddress?: string;
  mapx?: string | number;
  mapy?: string | number;
  x?: string | number;
  y?: string | number;
  lng?: string | number;
  lat?: string | number;
}

interface LocalSearchResponse {
  items?: LocalSearchItem[];
  error?: string;
  errorMessage?: string;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function isWgs84(
  longitude: number,
  latitude: number,
): boolean {
  return (
    longitude >= 110 &&
    longitude <= 140 &&
    latitude >= 20 &&
    latitude <= 50
  );
}

function toCoordinate(
  item: LocalSearchItem,
): {
  latitude: number;
  longitude: number;
} | null {
  const rawLongitude = Number(
    item.mapx ?? item.x ?? item.lng,
  );

  const rawLatitude = Number(
    item.mapy ?? item.y ?? item.lat,
  );

  if (
    Number.isNaN(rawLongitude) ||
    Number.isNaN(rawLatitude)
  ) {
    return null;
  }

  if (isWgs84(rawLongitude, rawLatitude)) {
    return {
      longitude: rawLongitude,
      latitude: rawLatitude,
    };
  }

  const longitude = rawLongitude / 10_000_000;
  const latitude = rawLatitude / 10_000_000;

  if (isWgs84(longitude, latitude)) {
    return {
      longitude,
      latitude,
    };
  }

  return null;
}

function getRegionPriority(
  result: RegionSearchResult,
): number {
  const text = `${result.name} ${result.address}`;

  if (text.includes("특별시") && text.includes("구")) {
    return 0;
  }

  if (text.includes("동")) {
    return 1;
  }

  if (text.includes("구")) {
    return 2;
  }

  return 3;
}

export async function searchRegions(
  keyword: string,
  signal?: AbortSignal,
): Promise<RegionSearchResult[]> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return [];
  }

  const query = normalizedKeyword.includes("서울")
    ? normalizedKeyword
    : `서울 ${normalizedKeyword}`;

  const params = new URLSearchParams({
    query,
  });

  const response = await fetch(
    `/api/search?${params.toString()}`,
    {
      signal,
    },
  );

  const payload =
    (await response.json().catch(() => {
      return {};
    })) as LocalSearchResponse;

  if (!response.ok) {
    throw new Error(
      payload.errorMessage ??
        payload.error ??
        "지역 검색에 실패했습니다.",
    );
  }

  const deduplicated = new Map<
    string,
    RegionSearchResult
  >();

  (payload.items ?? []).forEach((item) => {
    const coordinate = toCoordinate(item);

    if (!coordinate) {
      return;
    }

    const name = stripHtml(String(item.title ?? ""));
    const address = String(
      item.roadAddress ??
        item.address ??
        "",
    ).trim();

    if (!name || !address) {
      return;
    }

    const id = [
      name,
      coordinate.latitude.toFixed(6),
      coordinate.longitude.toFixed(6),
    ].join("-");

    deduplicated.set(id, {
      id,
      name,
      address,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  });

  return [...deduplicated.values()]
    .sort((left, right) => {
      return (
        getRegionPriority(left) -
        getRegionPriority(right)
      );
    })
    .slice(0, 8);
}