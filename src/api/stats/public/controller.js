import prisma from "../../../config/db.js";
import {
  artistsSelect,
  songSelectFields,
} from "../../../constants/songSelect.js";
import { parseReleaseDate } from "../../../utils/format.js";
import {
  getPeriodDate,
  getPreviousPeriodDate,
  successResponse,
} from "../../../utils/helpers.js";

export const newReleases = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 20;
    const now = new Date();

    const songs = await prisma.song.findMany({
      select: songSelectFields,
    });

    const newReleases = songs
      .map((song) => {
        const parsedDate = parseReleaseDate(song.releaseDate);
        if (!parsedDate) return null;

        return {
          ...song,
          _releaseDate: parsedDate,
        };
      })
      .filter((song) => song && song._releaseDate <= now)
      .sort((a, b) => b._releaseDate.getTime() - a._releaseDate.getTime())
      .slice(0, limit)
      .map(({ _releaseDate, ...song }) => song);

    successResponse(res, newReleases);
  } catch (error) {
    next(error);
  }
};

export const featuredAlbums = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 20;

    const albums = await prisma.album.findMany({
      take: limit,
      include: {
        artists: {
          select: artistsSelect,
        },
        songs: {
          select: {
            views: true,
          },
        },
      },
    });

    const featuredAlbums = albums
      .map((a) => ({
        ...a,
        songs: undefined,
        totalViews: a.songs.reduce((s, x) => s + x.views, 0),
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 10);

    successResponse(res, featuredAlbums);
  } catch (error) {
    next(error);
  }
};

export const popularArtists = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit) || 10;

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);

    const artistStats = await prisma.listeningHistory.groupBy({
      by: ["songId"],
      where: {
        playedAt: {
          gte: dateFrom,
        },
      },
      _count: {
        id: true,
      },
    });

    const songIds = artistStats.map((s) => s.songId);

    const songs = await prisma.song.findMany({
      where: {
        id: { in: songIds },
      },
      select: {
        id: true,
        artists: {
          select: {
            artist: true,
          },
        },
      },
    });

    const artistPlayMap = {};

    songs.forEach((song) => {
      const playCount =
        artistStats.find((s) => s.songId === song.id)?._count.id || 0;

      song.artists.forEach(({ artist }) => {
        if (!artistPlayMap[artist.id]) {
          artistPlayMap[artist.id] = {
            artist,
            playCount: 0,
          };
        }
        artistPlayMap[artist.id].playCount += playCount;
      });
    });

    const result = Object.values(artistPlayMap)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    successResponse(res, result, null);
  } catch (error) {
    next(error);
  }
};

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

    const previousDateFrom = getPreviousPeriodDate(period);

    const currentChart = await prisma.listeningHistory.groupBy({
      by: ["songId"],
      where: dateFrom ? { playedAt: { gte: dateFrom } } : undefined,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    const previousChart = await prisma.listeningHistory.groupBy({
      by: ["songId"],
      where: previousDateFrom
        ? { playedAt: { gte: previousDateFrom, lt: dateFrom } }
        : undefined,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    const previousPositionsMap = previousChart.reduce((map, stat, idx) => {
      map[stat.songId] = idx + 1;
      return map;
    }, {});

    const songIds = currentChart.map((s) => s.songId);
    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      select: songSelectFields,
    });

    const result = currentChart.map((stat, index) => {
      const song = songs.find((s) => s.id === stat.songId);

      const rank = index + 1;
      const previousRank = previousPositionsMap[stat.songId] ?? null;

      const isNewEntry = previousRank === null;

      let rankDiff = null;
      let trend = "new";

      if (!isNewEntry) {
        rankDiff = previousRank - rank;

        if (rankDiff > 0) trend = "up";
        else if (rankDiff < 0) trend = "down";
        else trend = "same";
      }

      return {
        rank,
        previousRank,
        rankDiff,
        trend,
        isNewEntry,
        song,
        playCount: stat._count.id,
      };
    });

    successResponse(res, result);
  } catch (error) {
    next(error);
  }
};
