import prisma from "../../config/db.js";
import {
  uploadStream,
  deleteFile,
  extractPublicId,
} from "../../config/cloudinary.js";
import { successResponse } from "../../utils/response.js";
import { songSelectFields } from "../../constants/songSelect.js";

export const getPublicPlaylists = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const [playlists, totalItems] = await Promise.all([
      prisma.playlist.findMany({
        where: {
          isPublic: true,
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          imageUri: true,
          followerCount: true,
          description: true,
          isPublic: true,
          userId: true,
          user: {
            select: { displayName: true },
          },
          createdAt: true,
        },
      }),

      prisma.playlist.count({
        where: {
          isPublic: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    successResponse(res, playlists, null, pagination);
  } catch (error) {
    next(error);
  }
};

export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, isPublic } = req.body;
    let imageUri = null;

    if (req.file) {
      const imageUpload = await uploadStream(req.file.buffer, {
        folder: "playlists",
        resource_type: "image",
      });
      imageUri = imageUpload.secure_url;
    }
    const playlist = await prisma.playlist.create({
      data: {
        userId: req.user.userId,
        title,
        imageUri,
        description,
        isPublic: isPublic || false,
        isFavorite: false,
      },
    });

    const message = "Playlist created successfully";

    successResponse(res, playlist, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getPlaylist = async (req, res, next) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
        songs: {
          orderBy: { position: "asc" },
          select: {
            song: {
              select: songSelectFields,
            },
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const formatted = {
      ...playlist,
      songs: playlist.songs.map((item) => item.song),
    };

    successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, imageUri, description, isPublic } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(imageUri && { imageUri }),
      ...(description && { description }),
      ...(isPublic !== undefined && { isPublic }),
    };

    const playlistCurrent = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlistCurrent) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (playlistCurrent.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (req.file) {
      const oldImageUri = playlistCurrent.imageUri;
      const imageUpload = await uploadStream(req.file.buffer, {
        folder: "playlists",
        resource_type: "image",
      });
      updateData.imageUri = imageUpload.secure_url;

      // Delete old image
      if (oldImageUri) {
        try {
          const imagePublicId = extractPublicId(oldImageUri);
          await deleteFile(imagePublicId, "image");
        } catch (err) {
          console.warn("Failed to delete old image from Cloudinary:", err);
        }
      }
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: updateData,
    });

    const message = "Playlist updated successfully";

    successResponse(res, playlist, message);
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: req.params.id },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (playlist.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (playlist.isFavorite) {
      return res.status(400).json({ error: "Cannot delete favorite playlist" });
    }

    if (playlist.imageUri) {
      const imagePublicId = extractPublicId(playlist.imageUri);
      if (imagePublicId) {
        await deleteFile(imagePublicId, "image").catch((err) => {
          console.error("[Cloudinary] Failed to delete image:", err);
        });
      }
    }

    await prisma.playlist.delete({
      where: { id: req.params.id },
    });

    const message = "Playlist deleted";
    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};

export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlistId = req.params.id;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (playlist.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const existing = await prisma.playListSong.findUnique({
      where: {
        songId_playListId: {
          songId,
          playListId: playlistId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Song already in playlist" });
    }

    const maxPosition = await prisma.playListSong.aggregate({
      where: { playListId: playlistId },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position || 0) + 1;

    await prisma.playListSong.create({
      data: {
        songId,
        playListId: playlistId,
        position: newPosition,
      },
    });

    const message = "Song added to playlist";
    successResponse(res, {}, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

export const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlistId = req.params.id;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (playlist.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.playListSong.delete({
      where: {
        songId_playListId: {
          songId,
          playListId: playlistId,
        },
      },
    });

    const message = "Song removed from playlist";
    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};

export const reorderSongs = async (req, res, next) => {
  try {
    const { songs } = req.body;
    const playlistId = req.params.id;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (playlist.userId !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    for (const { songId, newPosition } of songs) {
      await prisma.playListSong.update({
        where: {
          songId_playListId: {
            songId,
            playListId: playlistId,
          },
        },
        data: { position: newPosition },
      });
    }

    const message = "Songs reordered";
    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};
