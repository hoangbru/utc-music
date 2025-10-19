import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract public_id from Cloudinary secure_url
 * Example: https://res.cloudinary.com/demo/image/upload/v123/avatars/abc123.jpg
 * Returns: avatars/abc123
 */
const extractPublicId = (secureUrl) => {
  if (!secureUrl) return null;

  // Split the URL at the '/upload/' part
  const parts = secureUrl.split("/upload/");
  if (parts.length < 2) return null;

  let path = parts[1];

  // Remove version prefix (e.g. v123/)
  path = path.replace(/^v\d+\//, "");

  // Remove file extension (e.g. .jpg, .png, .webp)
  path = path.replace(/\.[^/.]+$/, "");

  return path;
};

/**
 * Upload file to Cloudinary using stream
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - Upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} - { secure_url, public_id, duration (for audio/video) }
 */
export const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: options.folder || "uploads",
        resource_type: options.resource_type || "auto",
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration, // For audio/video files
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, video, raw, etc.)
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFile = async (publicId, resourceType = "image") => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error(`[Cloudinary] Error deleting file ${publicId}:`, error);
    throw error;
  }
};

export { extractPublicId };
