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

export function parseReleaseDate(value) {
  if (!value) return null;

  if (/^\d{4}$/.test(value)) {
    return new Date(`${value}-01-01T00:00:00.000Z`);
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-");
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  return null;
}

export function sanitizeCompletionRate(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || num < 0) return 0;
  if (num > 100) return 100;

  return Math.round(num * 100) / 100;
}
