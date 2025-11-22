export const getPeriodDate = (period) => {
  if (period === "all") return null;

  const now = new Date();
  switch (period) {
    case "week":
      now.setDate(now.getDate() - 7);
      break;
    case "month":
      now.setMonth(now.getMonth() - 1);
      break;
    case "year":
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now;
};
