export type LifeAreaAccent = {
  hex: string;
  chip: string;
  chipActive: string;
  iconBg: string;
};

const LIFE_AREA_ACCENTS_BY_VALUE: Record<string, LifeAreaAccent> = {
  health: {
    hex: "#22C55E",
    chip: "bg-green-50 text-green-700 border-green-100 hover:bg-green-100",
    chipActive: "bg-green-600 text-white shadow-green-600/20",
    iconBg: "bg-green-100 text-green-600",
  },
  appearance: {
    hex: "#EC4899",
    chip: "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100",
    chipActive: "bg-pink-600 text-white shadow-pink-600/20",
    iconBg: "bg-pink-100 text-pink-600",
  },
  love: {
    hex: "#EF4444",
    chip: "bg-red-50 text-red-700 border-red-100 hover:bg-red-100",
    chipActive: "bg-red-600 text-white shadow-red-600/20",
    iconBg: "bg-red-100 text-red-600",
  },
  family: {
    hex: "#F59E0B",
    chip: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100",
    chipActive: "bg-amber-600 text-white shadow-amber-600/20",
    iconBg: "bg-amber-100 text-amber-600",
  },
  friends: {
    hex: "#06B6D4",
    chip: "bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100",
    chipActive: "bg-cyan-600 text-white shadow-cyan-600/20",
    iconBg: "bg-cyan-100 text-cyan-600",
  },
  career: {
    hex: "#2563EB",
    chip: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100",
    chipActive: "bg-blue-600 text-white shadow-blue-600/20",
    iconBg: "bg-blue-100 text-blue-600",
  },
  money: {
    hex: "#16A34A",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
    chipActive: "bg-emerald-600 text-white shadow-emerald-600/20",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  "self-growth": {
    hex: "#8B5CF6",
    chip: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100",
    chipActive: "bg-violet-600 text-white shadow-violet-600/20",
    iconBg: "bg-violet-100 text-violet-600",
  },
  spirituality: {
    hex: "#7C3AED",
    chip: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100",
    chipActive: "bg-purple-600 text-white shadow-purple-600/20",
    iconBg: "bg-purple-100 text-purple-600",
  },
  recreation: {
    hex: "#F97316",
    chip: "bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100",
    chipActive: "bg-orange-600 text-white shadow-orange-600/20",
    iconBg: "bg-orange-100 text-orange-600",
  },
  environment: {
    hex: "#10B981",
    chip: "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100",
    chipActive: "bg-teal-600 text-white shadow-teal-600/20",
    iconBg: "bg-teal-100 text-teal-600",
  },
  community: {
    hex: "#0EA5E9",
    chip: "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100",
    chipActive: "bg-sky-600 text-white shadow-sky-600/20",
    iconBg: "bg-sky-100 text-sky-600",
  },
};

const LIFE_AREA_VALUE_BY_ID: Record<number, string> = {
  1: "health",
  2: "appearance",
  3: "love",
  4: "family",
  5: "friends",
  6: "career",
  7: "money",
  8: "self-growth",
  9: "spirituality",
  10: "recreation",
  11: "environment",
  12: "community",
};

const LIFE_AREA_VALUE_BY_NAME: Record<string, string> = {
  health: "health",
  appearance: "appearance",
  love: "love",
  family: "family",
  friends: "friends",
  career: "career",
  money: "money",
  "self-growth": "self-growth",
  spirituality: "spirituality",
  recreation: "recreation",
  environment: "environment",
  community: "community",
};

const DEFAULT_LIFE_AREA_ACCENT = LIFE_AREA_ACCENTS_BY_VALUE.career;

export function toLifeAreaValue(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

export function getLifeAreaAccent(input: {
  id?: number | null;
  value?: string | null;
  name?: string | null;
}) {
  const valueFromId =
    typeof input.id === "number" ? LIFE_AREA_VALUE_BY_ID[input.id] : undefined;
  const normalizedValue = input.value ? toLifeAreaValue(input.value) : undefined;
  const normalizedName = input.name ? toLifeAreaValue(input.name) : undefined;
  const resolvedValue =
    valueFromId ??
    (normalizedValue ? LIFE_AREA_VALUE_BY_NAME[normalizedValue] : undefined) ??
    (normalizedName ? LIFE_AREA_VALUE_BY_NAME[normalizedName] : undefined);

  if (!resolvedValue) return DEFAULT_LIFE_AREA_ACCENT;
  return LIFE_AREA_ACCENTS_BY_VALUE[resolvedValue] ?? DEFAULT_LIFE_AREA_ACCENT;
}

export function toRgba(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const parsed = Number.parseInt(sanitized, 16);

  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
