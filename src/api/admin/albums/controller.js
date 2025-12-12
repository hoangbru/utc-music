import prisma from "../../../config/db.js";
import {
  uploadStream,
  deleteFile,
  extractPublicId,
} from "../../../config/cloudinary.js";
import { successResponse } from "../../../utils/helpers.js";

export const createAlbum = async (req, res, next) => {
  try {
    const { title, releaseDate, type } = req.body;
    let coverUri = null;
    let { artistIds } = req.body;

    if (artistIds.includes(",")) {
      artistIds = artistIds.split(",").map((id) => id.trim());
    } else {
      artistIds = [artistIds.trim()];
    }

    if (req.file) {
      const coverUpload = await uploadStream(req.file.buffer, {
        folder: "albums",
        resource_type: "image",
      });
      coverUri = coverUpload.secure_url;
    }

    const album = await prisma.album.create({
      data: {
        title,
        releaseDate,
        coverUri,
        type
      },
    });

    // Add artists
    if (artistIds && artistIds.length > 0) {
      for (const artistId of artistIds) {
        await prisma.artistAlbum.create({
          data: { albumId: album.id, artistId },
        });
      }
    }

    const message = "Album created successfully";

    successResponse(res, album, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllAlbums = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [albums, totalItems] = await Promise.all([
      prisma.album.findMany({
        include: {
          songs: true,
          artists: { include: { artist: true } },
        },
        skip,
        take: limit,
      }),
      prisma.album.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };
    const message = "Albums retrieved successfully";

    successResponse(res, albums, message, pagination);
  } catch (error) {
    next(error);
  }
};

export const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, releaseDate, coverUri } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(releaseDate && { releaseDate }),
      ...(coverUri && { coverUri }),
    };

    // Upload new cover image if provided
    if (req.file) {
      // Get current album to retrieve old file URLs
      const currentAlbum = await prisma.album.findUnique({
        where: { id },
        select: { coverUri: true },
      });

      if (!currentAlbum) {
        return res.status(404).json({ message: "Album not found" });
      }

      const oldCoverUri = currentAlbum.coverUri;
      const coverUpload = await uploadStream(req.file.buffer, {
        folder: "albums",
        resource_type: "image",
      });
      updateData.coverUri = coverUpload.secure_url;

      // Delete old cover image
      if (oldCoverUri) {
        try {
          const coverPublicId = extractPublicId(oldCoverUri);
          await deleteFile(coverPublicId, "image");
        } catch (err) {
          console.warn(
            "Failed to delete old cover image from Cloudinary:",
            err
          );
        }
      }
    }

    const album = await prisma.album.update({
      where: { id },
      data: updateData,
    });

    const message = "Album updated successfully";

    successResponse(res, album, message);
  } catch (error) {
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const album = await prisma.album.delete({
      where: { id: req.params.id },
    });

    if (album.coverUri) {
      const coverPublicId = extractPublicId(album.coverUri);
      if (coverPublicId) {
        await deleteFile(coverPublicId, "image").catch((err) => {
          console.error("[Cloudinary] Failed to delete cover image:", err);
        });
      }
    }

    const message = "Album deleted successfully";

    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};
