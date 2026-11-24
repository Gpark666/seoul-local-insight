import { Stack } from "expo-router";
import React from "react";

import { RegionDataProvider } from "@/providers/RegionDataProvider";

export default function RootLayout() {
  return (
    <RegionDataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="density" />
        <Stack.Screen name="map" />
      </Stack>
    </RegionDataProvider>
  );
}