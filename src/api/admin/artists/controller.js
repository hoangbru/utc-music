import prisma from "../../../config/db.js";
import {
  uploadStream,
  deleteFile,
  extractPublicId,
} from "../../../config/cloudinary.js";
import { successResponse } from "../../../utils/response.js";

export const createArtist = async (req, res, next) => {
  try {
    const { name, biography, country } = req.body;

    let avatarUri = null;

    if (req.file) {
      const avatarUpload = await uploadStream(req.file.buffer, {
        folder: "artists",
        resource_type: "image",
      });
      avatarUri = avatarUpload.secure_url;
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        biography,
        avatarUri,
        country,
      },
    });

    const message = "Artist created successfully";

    successResponse(res, artist, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllArtists = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [artists, totalItems] = await Promise.all([
      prisma.artist.findMany({
        skip,
        take: limit,
      }),
      prisma.artist.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };
    const message = "Artists retrieved successfully";

    successResponse(res, artists, message, pagination);
  } catch (error) {
    next(error);
  }
};

export const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, biography, country } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(biography && { biography }),
      ...(country && { country }),
    };

    // Upload new avatar if provided
    if (req.file) {
      // Get current artist to retrieve old file URLs
      const currentArtist = await prisma.artist.findUnique({
        where: { id },
        select: { avatarUri: true },
      });

      if (!currentArtist) {
        return res.status(404).json({ message: "Artist not found" });
      }

      const oldAvatarUri = currentArtist.avatarUri;
      const avatarUpload = await uploadStream(req.file.buffer, {
        folder: "artists",
        resource_type: "image",
      });
      updateData.avatarUri = avatarUpload.secure_url;

      // Delete old avatar
      if (oldAvatarUri) {
        try {
          const avatarPublicId = extractPublicId(oldAvatarUri);
          await deleteFile(avatarPublicId, "image");
        } catch (err) {
          console.warn("Failed to delete old avatar from Cloudinary:", err);
        }
      }
    }

    const artist = await prisma.artist.update({
      where: { id },
      data: updateData,
    });

    const message = "Artist updated successfully";

    successResponse(res, artist, message);
  } catch (error) {
    next(error);
  }
};

export const deleteArtist = async (req, res, next) => {
  try {
    const artist = await prisma.artist.delete({
      where: { id: req.params.id },
    });

    if (artist.avatarUri) {
      const avatarPublicId = extractPublicId(artist.avatarUri);
      if (avatarPublicId) {
        await deleteFile(avatarPublicId, "image").catch((err) => {
          console.error("[Cloudinary] Failed to delete avatar:", err);
        });
      }
    }

    const message = "Artist deleted successfully";

    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};

export const verifyArtist = async (req, res, next) => {
  try {
    const artist = await prisma.artist.update({
      where: { id: req.params.id },
      data: { isVerified: true },
    });

    const message = "Verify successfully";

    successResponse(res, artist, message);
  } catch (error) {
    next(error);
  }
};
