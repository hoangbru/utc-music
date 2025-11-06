import prisma from "../../config/db.js";

export const getSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [songs, totalItems] = await Promise.all([
      prisma.song.findMany({
        skip,
        take: limit,
        orderBy: {
          views: "desc",
        },
        include: {
          artists: {
            include: {
              artist: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.song.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: songs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
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

    res.status(200).json(song);
  } catch (error) {
    next(error);
  }
};

export const playSong = async (req, res, next) => {
  try {
    const song = await prisma.song.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    res.status(200).json({ message: "Song play recorded", views: song.views });
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

    res.status(201).json({ message: "Song liked" });
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

    res.status(200).json({ message: "Song unliked" });
  } catch (error) {
    next(error);
  }
};
