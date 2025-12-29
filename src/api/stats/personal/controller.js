import prisma from "../../../config/db.js";
import { artistSelectFields } from "../../../constants/artistSelect.js";
import { artistsSelect, songSelectFields } from "../../../constants/songSelect.js";
import {
  getPeriodDate,
  successResponse,
  addIsLikedToSongs,
} from "../../../utils/helpers.js";

export const getTopSongs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "month";
    const limit = Number.parseInt(req.query.limit) || 10;

    const dateFrom = getPeriodDate(period);

    // Group by songId and count plays
    const topSongs = await prisma.listeningHistory.groupBy({
      by: ["songId"],
      where: {
        userId,
        ...(dateFrom && { playedAt: { gte: dateFrom } }),
      },
      _count: {
        id: true,
      },
      _sum: {
        duration: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    // Get song details
    const songIds = topSongs.map((s) => s.songId);
    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      select: songSelectFields,
    });

    // Map results
    const result = topSongs.map((stat) => {
      const song = songs.find((s) => s.id === stat.songId);
      return {
        song,
        playCount: stat._count.id,
        totalDuration: stat._sum.duration || 0,
      };
    });

    // Add isLiked to songs in result
    const songsInResult = result
      .map((item) => item.song)
      .filter((song) => song != null);
    const songsWithIsLiked = await addIsLikedToSongs(
      songsInResult,
      userId,
      prisma
    );
    const songsWithIsLikedMap = new Map(
      songsWithIsLiked.map((song) => [song.id, song])
    );
    const resultWithIsLiked = result.map((item) => ({
      ...item,
      song: item.song
        ? songsWithIsLikedMap.get(item.song.id) || { ...item.song, isLiked: false }
        : item.song,
    }));

    successResponse(res, resultWithIsLiked);
  } catch (error) {
    next(error);
  }
};

export const getTopArtists = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "month";
    const limit = Number.parseInt(req.query.limit) || 10;

    const dateFrom = getPeriodDate(period);

    const listeningData = await prisma.listeningHistory.findMany({
      where: {
        userId,
        ...(dateFrom && { playedAt: { gte: dateFrom } }),
      },
      include: {
        song: {
          include: {
            artists: {
              include: {
                artist: {
                  select: artistSelectFields,
                },
              },
            },
          },
        },
      },
    });

    // Aggregate artist stats
    const artistStats = new Map();

    listeningData.forEach((history) => {
      history.song.artists.forEach((sa) => {
        const existing = artistStats.get(sa.artistId) || {
          artist: sa.artist,
          playCount: 0,
          totalDuration: 0,
        };

        existing.playCount++;
        existing.totalDuration += history.duration;
        artistStats.set(sa.artistId, existing);
      });
    });

    const result = Array.from(artistStats.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    successResponse(res, result, null);
  } catch (error) {
    next(error);
  }
};

export const getTopGenres = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "month";
    const limit = Number.parseInt(req.query.limit) || 5;

    const dateFrom = getPeriodDate(period);

    const listeningData = await prisma.listeningHistory.findMany({
      where: {
        userId,
        ...(dateFrom && { playedAt: { gte: dateFrom } }),
      },
      include: {
        song: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
    });

    // Aggregate genre stats
    const genreStats = new Map();

    listeningData.forEach((history) => {
      history.song.genres.forEach((gs) => {
        const existing = genreStats.get(gs.genreId) || {
          genre: gs.genre,
          playCount: 0,
          totalDuration: 0,
        };

        existing.playCount++;
        existing.totalDuration += history.duration;
        genreStats.set(gs.genreId, existing);
      });
    });

    const result = Array.from(genreStats.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    successResponse(res, result, null);
  } catch (error) {
    next(error);
  }
};

export const getTopAlbums = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "month";
    const limit = Number.parseInt(req.query.limit) || 10;

    const dateFrom = getPeriodDate(period);

    const listeningData = await prisma.listeningHistory.findMany({
      where: {
        userId,
        ...(dateFrom && { playedAt: { gte: dateFrom } }),
      },
      include: {
        song: {
          include: {
            album: {
              include: {
                artists: {
                  select: artistsSelect,
                },
              },
            },
          },
        },
      },
    });

    const albumStats = new Map();

    listeningData.forEach((history) => {
      const album = history.song.album;

      if (album.type === "SINGLE") return;

      const albumId = album.id;
      const existing = albumStats.get(albumId) || {
        album: album,
        playCount: 0,
        totalDuration: 0,
        uniqueSongs: new Set(),
      };

      existing.playCount++;
      existing.totalDuration += history.duration;
      existing.uniqueSongs.add(history.song.id);
      albumStats.set(albumId, existing);
    });

    const result = Array.from(albumStats.values())
      .map((stat) => ({
        album: stat.album,
        playCount: stat.playCount,
        totalDuration: stat.totalDuration,
        uniqueSongsPlayed: stat.uniqueSongs.size,
      }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getRecentlyPlayed = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = Number.parseInt(req.query.limit) || 20;

    const recentHistory = await prisma.listeningHistory.findMany({
      where: { userId },
      orderBy: {
        playedAt: "desc",
      },
      distinct: ["songId"],
      take: limit,
      include: {
        song: {
          select: songSelectFields,
        },
      },
    });

    // Add isLiked to songs in recentHistory
    const songsInHistory = recentHistory
      .map((item) => item.song)
      .filter((song) => song != null);
    const songsWithIsLiked = await addIsLikedToSongs(
      songsInHistory,
      userId,
      prisma
    );
    const songsWithIsLikedMap = new Map(
      songsWithIsLiked.map((song) => [song.id, song])
    );
    const recentHistoryWithIsLiked = recentHistory.map((item) => ({
      ...item,
      song: item.song
        ? songsWithIsLikedMap.get(item.song.id) || { ...item.song, isLiked: false }
        : item.song,
    }));

    successResponse(res, recentHistoryWithIsLiked, null);
  } catch (error) {
    next(error);
  }
};

export const getDiscoveryStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "week";

    const dateFrom = getPeriodDate(period);

    // Get songs in current period
    const currentPeriodSongs = await prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: { gte: dateFrom },
      },
      distinct: ["songId"],
      select: {
        songId: true,
      },
    });

    // Get songs before this period
    const previousSongs = await prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: { lt: dateFrom },
      },
      distinct: ["songId"],
      select: {
        songId: true,
      },
    });

    const previousSongIds = new Set(previousSongs.map((s) => s.songId));

    // New songs = current period songs NOT in previous
    const newSongIds = currentPeriodSongs
      .filter((s) => !previousSongIds.has(s.songId))
      .map((s) => s.songId);

    const newSongs = await prisma.song.findMany({
      where: {
        id: { in: newSongIds },
      },
      select: songSelectFields,
    });

    // Add isLiked to newSongs
    const newSongsWithIsLiked = await addIsLikedToSongs(
      newSongs,
      userId,
      prisma
    );

    const result = {
      period,
      totalNewSongs: newSongsWithIsLiked.length,
      newSongs: newSongsWithIsLiked,
    };

    successResponse(res, result, null);
  } catch (error) {
    next(error);
  }
};

export const getYearWrapped = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const year = parseInt(req.params.year);

    if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    // Get all listening history for the year
    const yearHistory = await prisma.listeningHistory.findMany({
      where: {
        userId,
        playedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        song: {
          include: {
            artists: { include: { artist: true } },
            genres: { include: { genre: true } },
            album: {
              include: {
                artists: {
                  select: artistsSelect,
                },
              },
            },
          },
        },
      },
    });

    // Total minutes listened
    const totalMinutes = Math.round(
      yearHistory.reduce((sum, h) => sum + h.duration, 0) / 60
    );

    // Top 5 songs
    const songPlayCount = new Map();
    yearHistory.forEach((h) => {
      songPlayCount.set(h.songId, (songPlayCount.get(h.songId) || 0) + 1);
    });

    const topSongIds = Array.from(songPlayCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topSongs = await prisma.song.findMany({
      where: { id: { in: topSongIds } },
      select: songSelectFields,
    });

    // Add isLiked to topSongs
    const topSongsWithIsLiked = await addIsLikedToSongs(
      topSongs,
      userId,
      prisma
    );

    // Top 5 artists
    const artistPlayCount = new Map();
    yearHistory.forEach((h) => {
      h.song.artists.forEach((sa) => {
        artistPlayCount.set(
          sa.artistId,
          (artistPlayCount.get(sa.artistId) || 0) + 1
        );
      });
    });

    const topArtistIds = Array.from(artistPlayCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topArtists = await prisma.artist.findMany({
      where: { id: { in: topArtistIds } },
      select: artistSelectFields,
    });

    // Top 3 genres
    const genrePlayCount = new Map();
    yearHistory.forEach((h) => {
      h.song.genres.forEach((gs) => {
        genrePlayCount.set(
          gs.genreId,
          (genrePlayCount.get(gs.genreId) || 0) + 1
        );
      });
    });

    const topGenreIds = Array.from(genrePlayCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const topGenres = await prisma.genre.findMany({
      where: { id: { in: topGenreIds } },
    });

    // Top 5 albums
    const albumPlayCount = new Map();
    yearHistory.forEach((h) => {
      const album = h.song.album;

      if (album.type === "SINGLE") return;

      const albumId = h.song.albumId;
      const existing = albumPlayCount.get(albumId) || {
        count: 0,
        album: album,
        uniqueSongs: new Set(),
      };
      existing.count++;
      existing.uniqueSongs.add(h.songId);
      albumPlayCount.set(albumId, existing);
    });

    const topAlbums = Array.from(albumPlayCount.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([albumId, data]) => ({
        album: data.album,
        playCount: data.count,
        uniqueSongsPlayed: data.uniqueSongs.size,
      }));

    const result = {
      year,
      totalMinutesListened: totalMinutes,
      totalSongsPlayed: yearHistory.length,
      uniqueSongsPlayed: new Set(yearHistory.map((h) => h.songId)).size,
      topSongs: topSongsWithIsLiked.map((song) => ({
        song,
        playCount: songPlayCount.get(song.id) || 0,
      })),
      topArtists: topArtists.map((artist) => ({
        artist,
        playCount: artistPlayCount.get(artist.id) || 0,
      })),
      topGenres: topGenres.map((genre) => ({
        genre,
        playCount: genrePlayCount.get(genre.id) || 0,
      })),
      topAlbums,
    };

    successResponse(res, result, null);
  } catch (error) {
    next(error);
  }
};
