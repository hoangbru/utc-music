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
