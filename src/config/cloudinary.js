/**
 * Cloudinary Configuration
 * This is a stub for Cloudinary integration.
 * In production, initialize with: cloudinary.config({ cloud_name, api_key, api_secret })
 */

export const uploadFile = async (file, folder) => {
  // Stub: In production, use cloudinary.uploader.upload()
  console.log(`[Cloudinary] Uploading file to folder: ${folder}`)
  return {
    public_id: `${folder}/${Date.now()}`,
    secure_url: `https://res.cloudinary.com/demo/image/upload/${folder}/${Date.now()}.jpg`,
  }
}

export const deleteFile = async (publicId) => {
  // Stub: In production, use cloudinary.uploader.destroy()
  console.log(`[Cloudinary] Deleting file: ${publicId}`)
  return { result: "ok" }
}
