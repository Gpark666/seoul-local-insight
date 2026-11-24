import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS } from "@/constants/theme";
import { useRegionSearch } from "@/hooks/useRegionSearch";
import { useRegionData } from "@/providers/RegionDataProvider";

import type {
  RegionSearchResult,
} from "@/types/region";

type Page = "weather" | "density" | "map";

type Props = {
  activePage: Page;
  children: ReactNode;
};

export default function DashboardLayout({
  activePage,
  children,
}: Props) {
  const router = useRouter();

  const {
    activeRegion,
    isLocationLoading,
    isWeatherLoading,
    isPopulationLoading,
    lastUpdatedAt,
    setSearchRegion,
    resetToCurrentLocation,
    refreshRegionData,
  } = useRegionData();

  const {
    keyword,
    results,
    isLoading: isSearchLoading,
    error: searchError,
    setKeyword,
    clear,
  } = useRegionSearch();

  const handleSelectRegion = useCallback(
    (region: RegionSearchResult) => {
      setSearchRegion(region);
      clear();
    },
    [clear, setSearchRegion],
  );

  const handleRefresh = useCallback(() => {
    void refreshRegionData();
  }, [refreshRegionData]);

  const isRefreshing =
    isWeatherLoading || isPopulationLoading;

  return (
    <View style={styles.page}>
      <View style={styles.sidebar}>
        <View>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <View style={styles.brandIconInner} />
            </View>

            <View>
              <Text style={styles.brandName}>
                WeatherFlow
              </Text>

              <Text style={styles.brandSub}>
                Desktop Dashboard
              </Text>
            </View>
          </View>

          <View style={styles.menu}>
            <MenuItem
              active={activePage === "weather"}
              icon="cloud-outline"
              label="날씨"
              onPress={() => router.push("/")}
            />

            <MenuItem
              active={activePage === "density"}
              icon="people-outline"
              label="유동인구"
              onPress={() => router.push("/density")}
            />

            <MenuItem
              active={activePage === "map"}
              icon="location-outline"
              label="지도"
              onPress={() => router.push("/map")}
            />
          </View>

          <View style={styles.regionSection}>
            <Text style={styles.regionSectionTitle}>
              지역 조회
            </Text>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={14}
                color={COLORS.textMuted}
              />

              <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder="구·동·지역명 검색"
                placeholderTextColor={COLORS.textMuted}
                style={styles.searchInput}
              />

              {isSearchLoading && (
                <ActivityIndicator
                  color={COLORS.accent}
                  size="small"
                />
              )}

              {!isSearchLoading && keyword.length > 0 && (
                <Pressable onPress={clear}>
                  <Ionicons
                    name="close-circle"
                    size={15}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              )}
            </View>

            {searchError && (
              <Text style={styles.searchError}>
                검색 결과를 불러오지 못했습니다.
              </Text>
            )}

            {results.length > 0 && (
              <View style={styles.searchResults}>
                {results.map((result) => (
                  <Pressable
                    key={result.id}
                    onPress={() =>
                      handleSelectRegion(result)
                    }
                    style={({ pressed }) => [
                      styles.searchResult,
                      pressed && styles.searchResultPressed,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={COLORS.accent}
                    />

                    <View style={styles.searchResultText}>
                      <Text
                        numberOfLines={1}
                        style={styles.searchResultName}
                      >
                        {result.name}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={styles.searchResultAddress}
                      >
                        {result.address}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.activeRegion}>
              <View style={styles.activeRegionHeader}>
                <Ionicons
                  name="location"
                  size={13}
                  color={COLORS.accent}
                />

                <Text style={styles.activeRegionCaption}>
                  현재 조회 지역
                </Text>
              </View>

              {isLocationLoading && !activeRegion ? (
                <Text style={styles.activeRegionLoading}>
                  위치를 확인하는 중입니다.
                </Text>
              ) : (
                <>
                  <Text
                    style={styles.activeRegionName}
                    numberOfLines={1}
                  >
                    {activeRegion?.name ??
                      "위치 정보 없음"}
                  </Text>

                  <Text
                    style={styles.activeRegionAddress}
                    numberOfLines={2}
                  >
                    {activeRegion?.address ??
                      "브라우저 위치 권한을 확인해 주세요."}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.regionActions}>
              <Pressable
                onPress={resetToCurrentLocation}
                style={({ pressed }) => [
                  styles.regionActionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="locate-outline"
                  size={13}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.regionActionText}>
                  현재 위치
                </Text>
              </Pressable>

              <Pressable
                disabled={!activeRegion || isRefreshing}
                onPress={handleRefresh}
                style={({ pressed }) => [
                  styles.regionActionButton,
                  (!activeRegion || isRefreshing) &&
                    styles.disabledButton,
                  pressed && styles.pressed,
                ]}
              >
                {isRefreshing ? (
                  <ActivityIndicator
                    color={COLORS.textSecondary}
                    size="small"
                  />
                ) : (
                  <Ionicons
                    name="refresh-outline"
                    size={13}
                    color={COLORS.textSecondary}
                  />
                )}

                <Text style={styles.regionActionText}>
                  최신화
                </Text>
              </Pressable>
            </View>

            {lastUpdatedAt && (
              <Text style={styles.updatedAt}>
                마지막 갱신{" "}
                {lastUpdatedAt
                  .getHours()
                  .toString()
                  .padStart(2, "0")}
                :
                {lastUpdatedAt
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.sidebarBottom}>
          <View style={styles.sidebarLine} />

          <View style={styles.updateRow}>
            <View style={styles.greenDot} />

            <Text style={styles.sidebarText}>
              30분 간격 자동 갱신
            </Text>
          </View>

          <View style={styles.sidebarLine} />

          <Text style={styles.copyright}>
            © 2026 WeatherFlow
          </Text>
        </View>
      </View>

      <View style={styles.main}>{children}</View>
    </View>
  );
}

function MenuItem({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.menuItem,
        active && styles.menuItemActive,
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={
          active
            ? COLORS.textPrimary
            : COLORS.textSecondary
        }
      />

      <Text
        style={[
          styles.menuText,
          active && styles.menuTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    flex: 1,
    flexDirection: "row",
    minHeight: "100%" as never,
  },

  sidebar: {
    backgroundColor: "#071126",
    borderRightColor: COLORS.border,
    borderRightWidth: 1,
    justifyContent: "space-between",
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: 30,
    width: 220,
  },

  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
    marginBottom: 36,
    paddingHorizontal: 4,
  },

  brandIcon: {
    alignItems: "center",
    backgroundColor: "#6334E8",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  brandIconInner: {
    backgroundColor: "#7B4CF2",
    borderRadius: 8,
    height: 25,
    width: 25,
  },

  brandName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },

  brandSub: {
    color: COLORS.textMuted,
    fontSize: 8,
    marginTop: 3,
  },

  menu: {
    gap: 9,
  },

  menuItem: {
    alignItems: "center",
    borderRadius: 13,
    flexDirection: "row",
    gap: 14,
    height: 48,
    paddingHorizontal: 15,
  },

  menuItemActive: {
    backgroundColor: "#6736EA",
  },

  menuText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  menuTextActive: {
    color: COLORS.textPrimary,
  },

  regionSection: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 24,
    paddingTop: 18,
  },

  regionSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 9,
  },

  searchBox: {
    alignItems: "center",
    backgroundColor: "#0C1930",
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 35,
    paddingHorizontal: 9,
  },

  searchInput: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 10,
    outlineStyle: "none" as never,
    padding: 0,
  },

  searchError: {
    color: COLORS.red,
    fontSize: 9,
    marginTop: 7,
  },

  searchResults: {
    backgroundColor: "#0C1930",
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 7,
    overflow: "hidden",
  },

  searchResult: {
    alignItems: "center",
    borderBottomColor: "rgba(35, 52, 82, 0.8)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 45,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  searchResultPressed: {
    backgroundColor: "rgba(103, 54, 234, 0.14)",
  },

  searchResultText: {
    flex: 1,
    minWidth: 0,
  },

  searchResultName: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: "700",
  },

  searchResultAddress: {
    color: COLORS.textMuted,
    fontSize: 8,
    marginTop: 3,
  },

  activeRegion: {
    backgroundColor: "#0B1830",
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },

  activeRegionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  activeRegionCaption: {
    color: COLORS.textMuted,
    fontSize: 9,
  },

  activeRegionLoading: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 8,
  },

  activeRegionName: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7,
  },

  activeRegionAddress: {
    color: COLORS.textMuted,
    fontSize: 8,
    lineHeight: 12,
    marginTop: 4,
  },

  regionActions: {
    flexDirection: "row",
    gap: 7,
    marginTop: 8,
  },

  regionActionButton: {
    alignItems: "center",
    backgroundColor: "#101E36",
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 4,
    height: 30,
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  regionActionText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: "600",
  },

  updatedAt: {
    color: COLORS.textMuted,
    fontSize: 8,
    marginTop: 8,
    textAlign: "right",
  },

  pressed: {
    opacity: 0.72,
  },

  sidebarBottom: {
    gap: 13,
  },

  sidebarLine: {
    backgroundColor: COLORS.border,
    height: 1,
    marginBottom: 4,
  },

  updateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  greenDot: {
    backgroundColor: COLORS.green,
    borderRadius: 4,
    height: 7,
    width: 7,
  },

  sidebarText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },

  copyright: {
    color: COLORS.textMuted,
    fontSize: 9,
  },

  main: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 30,
    paddingHorizontal: 28,
    paddingTop: 30,
  },
});