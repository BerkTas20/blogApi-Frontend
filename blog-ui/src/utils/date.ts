export const formatDate = (isoDate?: string) => {
  if (!isoDate) return "-";

  const d = new Date(isoDate);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};
