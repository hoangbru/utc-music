import prisma from "../../config/db.js";
import { songSelectFields } from "../../constants/songSelect.js";
import { successResponse } from "../../utils/helpers.js";

export const getSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [songs, totalItems] = await Promise.all([
      prisma.song.findMany({
        skip,
        take: limit,
        orderBy: { releaseDate: "desc" },
        select: songSelectFields,
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

    successResponse(res, songs, null, pagination);
  } catch (error) {
    next(error);
  }
};

export const getSong = async (req, res, next) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id },
      include: {
        album: true,
        artists: { include: { artist: true } },
        genres: { include: { genre: true } },
      },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    successResponse(res, song);
  } catch (error) {
    next(error);
  }
};

export const trackListening = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const songId = req.params.id;
    const { duration, completionRate } = req.body;

    await prisma.listeningHistory.create({
      data: {
        userId,
        songId,
        duration,
        completionRate
      },
    });

    const song = await prisma.song.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    const message = "Listening tracked successfully";
    const data = { views: song.views };

    successResponse(res, data, message);
  } catch (error) {
    next(error);
  }
};

export const likeSong = async (req, res, next) => {
  try {
    const likedPlaylist = await prisma.playlist.findFirst({
      where: {
        userId: req.user.userId,
        isFavorite: true,
      },
    });

    if (!likedPlaylist) {
      return res.status(404).json({ error: "Liked songs playlist not found" });
    }

    // Check if song already in playlist
    const existing = await prisma.playListSong.findUnique({
      where: {
        songId_playListId: {
          songId: req.params.id,
          playListId: likedPlaylist.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Song already liked" });
    }

    // Get max position
    const maxPosition = await prisma.playListSong.aggregate({
      where: { playListId: likedPlaylist.id },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position || 0) + 1;

    await prisma.playListSong.create({
      data: {
        songId: req.params.id,
        playListId: likedPlaylist.id,
        position: newPosition,
      },
    });

    const message = "Song liked";

    successResponse(res, {}, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

export const unlikeSong = async (req, res, next) => {
  try {
    const likedPlaylist = await prisma.playlist.findFirst({
      where: {
        userId: req.user.userId,
        isFavorite: true,
      },
    });

    if (!likedPlaylist) {
      return res.status(404).json({ error: "Liked songs playlist not found" });
    }

    await prisma.playListSong.delete({
      where: {
        songId_playListId: {
          songId: req.params.id,
          playListId: likedPlaylist.id,
        },
      },
    });

    const message = "Song unliked";

    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};
