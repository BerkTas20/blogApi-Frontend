// src/utils/categoryColor.tsx

export const CATEGORY_COLORS_BY_ID: Record<
  number,
  { bg: string; color: string }
> = {
  1: { bg: "blue.500", color: "white" },    // Bilim
  2: { bg: "orange.500", color: "white" }, // Seyahat
  3: { bg: "green.500", color: "white" },  // Yiyecek
  4: { bg: "red.500", color: "white" },    // Siyaset
  5: { bg: "yellow.400", color: "black" }, // Tarih
  6: { bg: "purple.600", color: "white" }, // 🎨 Sanat (MOR)
  7: { bg: "black", color: "white" },      // Film ve Diziler
};

export const getCategoryStyleById = (categoryId?: number) => {
  if (!categoryId) {
    return { bg: "gray.200", color: "gray.800" };
  }
  return (
    CATEGORY_COLORS_BY_ID[categoryId] ?? {
      bg: "gray.200",
      color: "gray.800",
    }
  );
};
