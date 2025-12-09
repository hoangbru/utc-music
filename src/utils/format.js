export const formatDate = (date, format = "YYYYMMDDHHmmss") => {
  const map = {
    YYYY: date.getFullYear(),
    YY: String(date.getFullYear()).slice(-2),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    DD: String(date.getDate()).padStart(2, "0"),
    HH: String(date.getHours()).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0"),
  };

  return format.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, (matched) => map[matched]);
};

export function sanitizeCompletionRate(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || num < 0) return 0;
  if (num > 100) return 100;

  return Math.round(num * 100) / 100;
}
