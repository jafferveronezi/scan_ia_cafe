// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for CaféDiag IA
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "clock.fill": "history",
  "person.fill": "person",

  // Actions
  "camera.fill": "camera-alt",
  "photo.on.rectangle": "photo-library",
  "paperplane.fill": "send",
  "square.and.arrow.up": "share",
  "arrow.clockwise": "refresh",
  "plus.circle.fill": "add-circle",
  "xmark.circle.fill": "cancel",
  "checkmark.circle.fill": "check-circle",

  // Content
  "leaf.fill": "eco",
  "chart.bar.fill": "bar-chart",
  "list.bullet": "list",
  "magnifyingglass": "search",
  "info.circle.fill": "info",
  "exclamationmark.triangle.fill": "warning",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.left.forwardslash.chevron.right": "code",

  // Settings
  "gear": "settings",
  "bell.fill": "notifications",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
  "arrow.right.square.fill": "logout",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] ?? "help-outline";
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
