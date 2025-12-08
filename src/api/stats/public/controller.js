import prisma from "../../../config/db.js";
import { songSelectFields } from "../../../constants/songSelect.js";
import { getPeriodDate, successResponse } from "../../../utils/helpers.js";

export const getTop50SongsByViews = async (req, res, next) => {
  try {
    const songs = await prisma.song.findMany({
      take: 50,
      orderBy: {
        views: "desc",
      },
      select: songSelectFields,
    });

    successResponse(res, songs);
  } catch (error) {
    next(error);
  }
};

export const getTop50SongsByGenres = async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const songs = await prisma.song.findMany({
      where: {
        genres: {
          some: {
            genreId: genreId,
          },
        },
      },
      take: 50,
      orderBy: {
        views: "desc",
      },
      select: songSelectFields,
    });

    successResponse(res, songs);
  } catch (error) {
    next(error);
  }
};

export const getArtistMonthlyListeners = async (req, res, next) => {
  try {
    const { artistId } = req.params;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all songs by this artist
    const artistSongs = await prisma.songArtist.findMany({
      where: { artistId },
      select: { songId: true },
    });

    const songIds = artistSongs.map((s) => s.songId);

    // Count unique listeners
    const uniqueListeners = await prisma.listeningHistory.findMany({
      where: {
        songId: { in: songIds },
        playedAt: { gte: thirtyDaysAgo },
      },
      distinct: ["userId"],
      select: { userId: true },
    });

    // Total plays
    const totalPlays = await prisma.listeningHistory.count({
      where: {
        songId: { in: songIds },
        playedAt: { gte: thirtyDaysAgo },
      },
    });

    const result = {
      artistId,
      monthlyListeners: uniqueListeners.length,
      totalPlays,
      period: "30 days",
    };

    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getTrendingSongs = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 50;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingSongs = await prisma.listeningHistory.groupBy({
      by: ["songId"],
      where: {
        playedAt: { gte: sevenDaysAgo },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    const songIds = trendingSongs.map((s) => s.songId);
    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      select: songSelectFields,
    });

    const result = trendingSongs.map((stat, index) => {
      const song = songs.find((s) => s.id === stat.songId);
      return {
        rank: index + 1,
        song,
        playsThisWeek: stat._count.id,
      };
    });

    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getTopChartSongs = async (req, res, next) => {
  try {
    const period = req.query.period || "week";
    const limit = Number.parseInt(req.query.limit) || 50;

    const dateFrom = getPeriodDate(period);

    const chartSongs = await prisma.listeningHistory.groupBy({
      by: ["songId"],
      where: dateFrom ? { playedAt: { gte: dateFrom } } : undefined,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    const songIds = chartSongs.map((s) => s.songId);
    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      select: songSelectFields,
    });

    const result = chartSongs.map((stat, index) => {
      const song = songs.find((s) => s.id === stat.songId);
      return {
        position: index + 1,
        song,
        playCount: stat._count.id,
      };
    });

    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};
