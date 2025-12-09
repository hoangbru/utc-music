export const generateOrderId = () => {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

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

export const getPreviousPeriodDate = (period) => {
  const now = new Date();

  if (period === "week") {
    return new Date(now.setDate(now.getDate() - 7));
  }
  if (period === "month") {
    return new Date(now.setMonth(now.getMonth() - 1));
  }

  return null;
}


export const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

export const successResponse = (
  res,
  data = {},
  message = null,
  meta = null,
  links = null,
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
    ...(links && { links }),
  });
};
