import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "@/constants/theme";
import { useRegionData } from "@/providers/RegionDataProvider";

import type {
  DailyWeather,
  HourlyWeather,
  WeatherCondition,
  WeeklyWeather,
} from "@/types/weather";

import { WeatherCard } from "./WeatherCard";

const WEATHER_ICON: Record<
  WeatherCondition,
  keyof typeof Ionicons.glyphMap
> = {
  clear: "sunny-outline",
  partly_cloudy: "partly-sunny-outline",
  cloudy: "cloud-outline",
  rain: "rainy-outline",
  rain_snow: "snow-outline",
  snow: "snow-outline",
  shower: "thunderstorm-outline",
  unknown: "help-circle-outline",
};

const WEATHER_LABEL: Record<WeatherCondition, string> = {
  clear: "맑음",
  partly_cloudy: "구름 조금",
  cloudy: "흐림",
  rain: "비",
  rain_snow: "비 또는 눈",
  snow: "눈",
  shower: "소나기",
  unknown: "정보 없음",
};

function getWeatherColor(condition: WeatherCondition): string {
  if (
    condition === "clear" ||
    condition === "partly_cloudy"
  ) {
    return COLORS.yellow;
  }

  if (
    condition === "rain" ||
    condition === "shower"
  ) {
    return COLORS.accent;
  }

  if (
    condition === "snow" ||
    condition === "rain_snow"
  ) {
    return COLORS.textPrimary;
  }

  return COLORS.textSecondary;
}

function formatTemperature(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return `${Math.round(value)}°`;
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return `${Math.round(value)}%`;
}

function formatWind(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(1)}m/s`;
}

function formatHour(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date
    .getHours()
    .toString()
    .padStart(2, "0")}시`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatWeekday(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const weekdays = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토",
  ];

  return weekdays[date.getDay()];
}

function getForecastDays(
  weekly: WeeklyWeather[],
  daily: DailyWeather[],
): Array<WeeklyWeather | DailyWeather> {
  if (weekly.length > 0) {
    return weekly.slice(0, 7);
  }

  return daily.slice(0, 7);
}

export function WeatherDashboard() {
  const {
    activeRegion,
    weather,
    isLocationLoading,
    isWeatherLoading,
    locationError,
    weatherError,
    refreshRegionData,
  } = useRegionData();

  const isLoading =
    isLocationLoading || isWeatherLoading;

  const forecastDays = useMemo(() => {
    if (!weather) {
      return [];
    }

    return getForecastDays(
      weather.weekly,
      weather.daily,
    );
  }, [weather]);

  const handleRefresh = useCallback(() => {
    void refreshRegionData();
  }, [refreshRegionData]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>날씨</Text>

          <Text style={styles.pageDescription}>
            {activeRegion
              ? `${activeRegion.name}의 실시간 날씨와 상세 예보를 확인하세요.`
              : "조회 지역을 확인하는 중입니다."}
          </Text>
        </View>

        <Pressable
          onPress={handleRefresh}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="refresh-outline"
            size={15}
            color={COLORS.textPrimary}
          />

          <Text style={styles.refreshText}>새로고침</Text>
        </Pressable>
      </View>

      {locationError && (
        <View style={styles.locationError}>
          <Ionicons
            name="warning-outline"
            size={16}
            color={COLORS.orange}
          />

          <Text style={styles.locationErrorText}>
            {locationError.message}
          </Text>
        </View>
      )}

      <View style={styles.currentWeatherRow}>
        <WeatherCard
          weather={weather}
          isLoading={isLoading}
          error={weatherError}
          locationName={
            activeRegion?.name ?? "현재 위치"
          }
        />

        <TodaySummaryCard
          weather={weather}
          isLoading={isLoading}
          error={weatherError}
        />
      </View>

      <HourlyForecastCard
        hourly={weather?.hourly ?? []}
        isLoading={isLoading}
        error={weatherError}
      />

      <WeeklyForecastCard
        days={forecastDays}
        isLoading={isLoading}
        error={weatherError}
      />
    </ScrollView>
  );
}

function TodaySummaryCard({
  weather,
  isLoading,
  error,
}: {
  weather: ReturnType<
    typeof useRegionData
  >["weather"];
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return (
      <View style={[styles.summaryCard, styles.centerState]}>
        <ActivityIndicator
          size="small"
          color={COLORS.accent}
        />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={[styles.summaryCard, styles.centerState]}>
        <Text style={styles.stateText}>
          날씨 요약 정보를 불러오지 못했습니다.
        </Text>
      </View>
    );
  }

  const current = weather.current;
  const today = weather.daily[0] ?? null;
  const condition = current.condition;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View>
          <Text style={styles.cardTitle}>오늘의 날씨</Text>

          <Text style={styles.cardDescription}>
            현재 관측값과 오늘의 기온 범위
          </Text>
        </View>

        <Ionicons
          name={WEATHER_ICON[condition]}
          size={28}
          color={getWeatherColor(condition)}
        />
      </View>

      <View style={styles.summaryTemperatureRow}>
        <Text style={styles.summaryTemperature}>
          {formatTemperature(current.temperature_c)}
        </Text>

        <View>
          <Text style={styles.summaryCondition}>
            {WEATHER_LABEL[condition]}
          </Text>

          <Text style={styles.summaryFeelsLike}>
            체감{" "}
            {formatTemperature(current.feels_like_c)}
          </Text>
        </View>
      </View>

      <View style={styles.summaryMetrics}>
        <WeatherMetric
          icon="thermometer-outline"
          label="최고 기온"
          value={formatTemperature(
            today?.max_temperature_c ?? null,
          )}
          color={COLORS.orange}
        />

        <WeatherMetric
          icon="thermometer-outline"
          label="최저 기온"
          value={formatTemperature(
            today?.min_temperature_c ?? null,
          )}
          color={COLORS.accent}
        />

        <WeatherMetric
          icon="water-outline"
          label="습도"
          value={formatPercent(
            current.humidity_percent,
          )}
          color={COLORS.textSecondary}
        />

        <WeatherMetric
          icon="speedometer-outline"
          label="풍속"
          value={formatWind(current.wind_speed_mps)}
          color={COLORS.textSecondary}
        />
      </View>
    </View>
  );
}

function WeatherMetric({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons
        name={icon}
        size={13}
        color={color}
      />

      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function HourlyForecastCard({
  hourly,
  isLoading,
  error,
}: {
  hourly: HourlyWeather[];
  isLoading: boolean;
  error: Error | null;
}) {
  const displayedHours = hourly.slice(0, 12);

  return (
    <View style={styles.forecastCard}>
      <View style={styles.forecastHeader}>
        <View>
          <Text style={styles.cardTitle}>시간별 예보</Text>

          <Text style={styles.cardDescription}>
            기온 · 날씨 상태 · 습도 · 풍속
          </Text>
        </View>

        <Text style={styles.dataBadge}>12시간</Text>
      </View>

      {isLoading && (
        <ForecastState message="시간별 예보를 불러오는 중입니다." />
      )}

      {!isLoading && error && (
        <ForecastState message="시간별 예보를 불러오지 못했습니다." />
      )}

      {!isLoading &&
        !error &&
        displayedHours.length === 0 && (
          <ForecastState message="시간별 예보 데이터가 없습니다." />
        )}

      {!isLoading &&
        !error &&
        displayedHours.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyContent}
          >
            {displayedHours.map((item, index) => (
              <HourlyForecastItem
                key={`${item.at}-${index}`}
                item={item}
                active={index === 0}
              />
            ))}
          </ScrollView>
        )}
    </View>
  );
}

function HourlyForecastItem({
  item,
  active,
}: {
  item: HourlyWeather;
  active: boolean;
}) {
  const condition = item.condition ?? "unknown";

  return (
    <View
      style={[
        styles.hourlyItem,
        active && styles.hourlyItemActive,
      ]}
    >
      <Text
        style={[
          styles.hourTime,
          active && styles.activeText,
        ]}
      >
        {active ? "현재" : formatHour(item.at)}
      </Text>

      <Ionicons
        name={WEATHER_ICON[condition]}
        size={23}
        color={
          active
            ? "#FFFFFF"
            : getWeatherColor(condition)
        }
      />

      <Text
        style={[
          styles.hourTemperature,
          active && styles.activeText,
        ]}
      >
        {formatTemperature(item.temperature_c)}
      </Text>

      <View style={styles.hourDivider} />

      <Text
        style={[
          styles.hourDetailLabel,
          active && styles.activeSubText,
        ]}
      >
        습도
      </Text>

      <Text
        style={[
          styles.hourDetailValue,
          active && styles.activeText,
        ]}
      >
        {formatPercent(item.humidity_percent)}
      </Text>

      <Text
        style={[
          styles.hourDetailLabel,
          active && styles.activeSubText,
        ]}
      >
        풍속
      </Text>

      <Text
        style={[
          styles.hourDetailValue,
          active && styles.activeText,
        ]}
      >
        {formatWind(item.wind_speed_mps)}
      </Text>
    </View>
  );
}

function WeeklyForecastCard({
  days,
  isLoading,
  error,
}: {
  days: Array<WeeklyWeather | DailyWeather>;
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <View style={styles.forecastCard}>
      <View style={styles.forecastHeader}>
        <View>
          <Text style={styles.cardTitle}>주간 예보</Text>

          <Text style={styles.cardDescription}>
            7일 날씨 · 최저/최고 기온 · 강수확률
          </Text>
        </View>

        <Text style={styles.dataBadge}>7일 예보</Text>
      </View>

      {isLoading && (
        <ForecastState message="주간 예보를 불러오는 중입니다." />
      )}

      {!isLoading && error && (
        <ForecastState message="주간 예보를 불러오지 못했습니다." />
      )}

      {!isLoading && !error && days.length === 0 && (
        <ForecastState message="주간 예보 데이터가 없습니다." />
      )}

      {!isLoading && !error && days.length > 0 && (
        <View style={styles.weeklyList}>
          <View style={styles.weeklyColumnHeader}>
            <Text style={styles.weekdayHeader}>날짜</Text>
            <Text style={styles.conditionHeader}>날씨</Text>
            <Text style={styles.temperatureHeader}>최저</Text>
            <Text style={styles.temperatureHeader}>최고</Text>
            <Text style={styles.rainHeader}>강수확률</Text>
          </View>

          {days.map((item) => (
            <WeeklyForecastItem
              key={item.date}
              item={item}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function WeeklyForecastItem({
  item,
}: {
  item: WeeklyWeather | DailyWeather;
}) {
  const condition = item.condition ?? "unknown";

  const rainProbability =
    "rain_probability_percent" in item
      ? item.rain_probability_percent
      : null;

  return (
    <View style={styles.weeklyItem}>
      <View style={styles.weekdayCell}>
        <Text style={styles.weekday}>
          {formatWeekday(item.date)}
        </Text>

        <Text style={styles.weekDate}>
          {formatDate(item.date)}
        </Text>
      </View>

      <View style={styles.conditionCell}>
        <Ionicons
          name={WEATHER_ICON[condition]}
          size={18}
          color={getWeatherColor(condition)}
        />

        <Text style={styles.conditionText}>
          {WEATHER_LABEL[condition]}
        </Text>
      </View>

      <Text style={styles.lowTemperature}>
        {formatTemperature(item.min_temperature_c)}
      </Text>

      <Text style={styles.highTemperature}>
        {formatTemperature(item.max_temperature_c)}
      </Text>

      <Text style={styles.rainProbability}>
        {rainProbability === null
          ? "-"
          : formatPercent(rainProbability)}
      </Text>
    </View>
  );
}

function ForecastState({
  message,
}: {
  message: string;
}) {
  return (
    <View style={styles.forecastState}>
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 18,
    paddingBottom: 30,
  },

  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: "800",
  },

  pageDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
  },

  refreshButton: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 38,
    paddingHorizontal: 14,
  },

  refreshText: {
    color: COLORS.textPrimary,
    fontSize: 11,
  },

  pressed: {
    opacity: 0.72,
  },

  locationError: {
    alignItems: "center",
    backgroundColor: "rgba(242, 139, 48, 0.10)",
    borderColor: "rgba(242, 139, 48, 0.24)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  locationErrorText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 11,
  },

  currentWeatherRow: {
    flexDirection: "row",
    gap: 18,
  },

  summaryCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    minHeight: 270,
    padding: 20,
  },

  centerState: {
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  cardDescription: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 5,
  },

  summaryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryTemperatureRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 26,
  },

  summaryTemperature: {
    color: COLORS.textPrimary,
    fontSize: 52,
    fontWeight: "300",
  },

  summaryCondition: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  summaryFeelsLike: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },

  summaryMetrics: {
    flexDirection: "row",
    gap: 9,
    marginTop: 26,
  },

  metric: {
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    minWidth: 0,
    padding: 10,
  },

  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
  },

  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },

  forecastCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 17,
    borderWidth: 1,
    minHeight: 230,
    padding: 20,
  },

  forecastHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  dataBadge: {
    backgroundColor: "rgba(103, 54, 234, 0.17)",
    borderColor: "rgba(133, 91, 255, 0.36)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#B89BFF",
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  forecastState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },

  stateText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
  },

  hourlyContent: {
    gap: 10,
    paddingRight: 4,
  },

  hourlyItem: {
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderColor: COLORS.border,
    borderRadius: 13,
    borderWidth: 1,
    gap: 8,
    minHeight: 172,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: 92,
  },

  hourlyItemActive: {
    backgroundColor: COLORS.accent,
    borderColor: "#895FFF",
  },

  hourTime: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  hourTemperature: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },

  hourDivider: {
    backgroundColor: "rgba(255,255,255,0.16)",
    height: 1,
    width: "100%",
  },

  hourDetailLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
  },

  hourDetailValue: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    marginTop: -4,
  },

  activeText: {
    color: "#FFFFFF",
  },

  activeSubText: {
    color: "rgba(255,255,255,0.74)",
  },

  weeklyList: {
    overflow: "hidden",
  },

  weeklyColumnHeader: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingBottom: 9,
  },

  weekdayHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    width: "17%",
  },

  conditionHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    width: "39%",
  },

  temperatureHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    width: "12%",
  },

  rainHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "right",
    width: "20%",
  },

  weeklyItem: {
    alignItems: "center",
    borderBottomColor: "rgba(36, 55, 86, 0.62)",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 52,
  },

  weekdayCell: {
    flexDirection: "row",
    gap: 7,
    width: "17%",
  },

  weekday: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },

  weekDate: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  conditionCell: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    width: "39%",
  },

  conditionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  lowTemperature: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    width: "12%",
  },

  highTemperature: {
    color: COLORS.orange,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    width: "12%",
  },

  rainProbability: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: "right",
    width: "20%",
  },
});