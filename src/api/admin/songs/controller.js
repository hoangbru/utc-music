import prisma from "../../../config/db.js";
import {
  uploadStream,
  deleteFile,
  extractPublicId,
} from "../../../config/cloudinary.js";
import { successResponse } from "../../../utils/response.js";

export const createSong = async (req, res, next) => {
  try {
    if (!req.files?.songFile || !req.files?.coverImage) {
      return res
        .status(400)
        .json({ error: "Both songFile and coverImage are required" });
    }

    const { title, releaseDate, albumId, lyrics, trackNumber } = req.body;
    let { artistIds } = req.body;
    let { genreIds } = req.body;

    if (artistIds.includes(",")) {
      artistIds = artistIds.split(",").map((id) => id.trim());
    } else {
      artistIds = [artistIds.trim()];
    }

    if (genreIds.includes(",")) {
      genreIds = genreIds.split(",").map((id) => id.trim());
    } else {
      genreIds = [genreIds.trim()];
    }

    // Upload song file to Cloudinary
    const songUpload = await uploadStream(req.files.songFile[0].buffer, {
      folder: "songs",
      resource_type: "video", // Cloudinary treats audio as video
    });

    // Upload cover image to Cloudinary
    const coverUpload = await uploadStream(req.files.coverImage[0].buffer, {
      folder: "covers",
      resource_type: "image",
    });

    const finalAlbumId =
      albumId && albumId.trim() !== "" && albumId !== "null" ? albumId : null;

    // Create song with uploaded URLs and duration
    const song = await prisma.song.create({
      data: {
        title,
        duration: Math.round(songUpload.duration || 0), // Round duration to integer
        releaseDate: new Date(releaseDate),
        albumId: finalAlbumId,
        url: songUpload.secure_url,
        coverUri: coverUpload.secure_url,
        lyrics,
        trackNumber: Number(trackNumber),
      },
    });

    // Add artists
    if (artistIds && artistIds.length > 0) {
      const artistIdArray = Array.isArray(artistIds) ? artistIds : [artistIds];
      for (const artistId of artistIdArray) {
        await prisma.songArtist.create({
          data: { songId: song.id, artistId },
        });
      }
    }

    // Add genres
    if (genreIds && genreIds.length > 0) {
      const genreIdArray = Array.isArray(genreIds) ? genreIds : [genreIds];
      for (const genreId of genreIdArray) {
        await prisma.genreSong.create({
          data: { songId: song.id, genreId },
        });
      }
    }

    const message = "Song created successfully";

    successResponse(res, song, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [songs, totalItems] = await Promise.all([
      prisma.song.findMany({
        include: {
          album: true,
          artists: { include: { artist: true } },
          genres: { include: { genre: true } },
        },
        skip,
        take: limit,
      }),
      prisma.song.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    const message = "Songs retrieved successfully";

    successResponse(res, songs, message, pagination);
  } catch (error) {
    next(error);
  }
};

export const updateSong = async (req, res, next) => {
  try {
    const { title, releaseDate, lyrics, trackNumber } = req.body;
    const songId = req.params.id;

    const updateData = {
      ...(title && { title }),
      ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(lyrics && { lyrics }),
      ...(trackNumber && { trackNumber: Number(trackNumber) }),
    };

    // Get current song to retrieve old file URLs
    const currentSong = await prisma.song.findUnique({
      where: { id: songId },
      select: { url: true, coverUri: true },
    });

    // Upload new song file if provided
    if (req.files?.songFile) {
      const songUpload = await uploadStream(req.files.songFile[0].buffer, {
        folder: "songs",
        resource_type: "video",
      });
      updateData.url = songUpload.secure_url;
      updateData.duration = Math.round(songUpload.duration || 0);

      // Delete old song file
      if (currentSong?.url) {
        const oldPublicId = extractPublicId(currentSong.url);
        if (oldPublicId) {
          await deleteFile(oldPublicId, "video").catch((err) => {
            console.error("[Cloudinary] Failed to delete old song:", err);
          });
        }
      }
    }

    // Upload new cover image if provided
    if (req.files?.coverImage) {
      const coverUpload = await uploadStream(req.files.coverImage[0].buffer, {
        folder: "covers",
        resource_type: "image",
      });
      updateData.coverUri = coverUpload.secure_url;

      // Delete old cover image
      if (currentSong?.coverUri) {
        const oldPublicId = extractPublicId(currentSong.coverUri);
        if (oldPublicId) {
          await deleteFile(oldPublicId, "image").catch((err) => {
            console.error("[Cloudinary] Failed to delete old cover:", err);
          });
        }
      }
    }

    const song = await prisma.song.update({
      where: { id: songId },
      data: updateData,
    });

    const message = "Song updated successfully";

    successResponse(res, song, message);
  } catch (error) {
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id },
      select: { url: true, coverUri: true },
    });

    if (song) {
      // Delete song file from Cloudinary
      if (song.url) {
        const songPublicId = extractPublicId(song.url);
        if (songPublicId) {
          await deleteFile(songPublicId, "video").catch((err) => {
            console.error("[Cloudinary] Failed to delete song file:", err);
          });
        }
      }

      // Delete cover image from Cloudinary
      if (song.coverUri) {
        const coverPublicId = extractPublicId(song.coverUri);
        if (coverPublicId) {
          await deleteFile(coverPublicId, "image").catch((err) => {
            console.error("[Cloudinary] Failed to delete cover image:", err);
          });
        }
      }
    }

    await prisma.song.delete({
      where: { id: req.params.id },
    });

    const message = "Song deleted successfully";

    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};
