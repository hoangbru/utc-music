import prisma from "../../../config/db.js";
import { getPeriodDate } from "../../../utils/dateRange.js";
import { songSelectFields } from "../../../constants/songSelect.js";
import { successResponse } from "../../../utils/response.js";

export const getTopSongs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "month";
    const limit = parseInt(req.query.limit) || 10;

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

    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/personal/top-artists
 * Get user's top artists
 */
export const getTopArtists = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "month";
    const limit = parseInt(req.query.limit) || 10;

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
                artist: true,
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

/**
 * GET /api/stats/personal/top-genres
 * Get user's top genres
 */
export const getTopGenres = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "month";
    const limit = parseInt(req.query.limit) || 5;

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

/**
 * GET /api/stats/personal/listening-history
 * Get full listening history
 */
export const getListeningHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;

    const history = await prisma.listeningHistory.findMany({
      where: { userId },
      include: {
        song: {
          select: songSelectFields,
        },
      },
      orderBy: {
        playedAt: "desc",
      },
      take: limit,
    });

    successResponse(res, history, null);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/personal/recently-played
 * Get recently played songs (unique)
 */
export const getRecentlyPlayed = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

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

    successResponse(res, recentHistory, null);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/personal/discovery
 * Get newly discovered songs
 */
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

    const result = {
      period,
      totalNewSongs: newSongs.length,
      newSongs,
    };

    successResponse(res, result, null);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/personal/wrapped/:year
 * Year-end wrapped summary
 */
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
            album: true,
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

    const result = {
      year,
      totalMinutesListened: totalMinutes,
      totalSongsPlayed: yearHistory.length,
      uniqueSongsPlayed: new Set(yearHistory.map((h) => h.songId)).size,
      topSongs: topSongs.map((song) => ({
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
    };

    successResponse(res, result, null);
  } catch (error) {
    next(error);
  }
};
