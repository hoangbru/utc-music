import prisma from "../../config/db.js";
import { successResponse } from "../../utils/helpers.js";
import { songSelectFields } from "../../constants/songSelect.js"

export const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ error: "Search query must be at least 2 characters" });
    }

    const searchPattern = `%${q}%`;

    const [
      songIds,
      artistIds,
      albumIds,
      totalSongsResult,
      totalArtistsResult,
      totalAlbumsResult,
    ] = await Promise.all([
      prisma.$queryRaw`
          SELECT id FROM "Song" 
          WHERE immutable_unaccent_lower(title) LIKE immutable_unaccent_lower(${searchPattern})
          ORDER BY title
          LIMIT ${limit} OFFSET ${skip}
        `,

      prisma.$queryRaw`
          SELECT id FROM "Artist" 
          WHERE immutable_unaccent_lower(name) LIKE immutable_unaccent_lower(${searchPattern})
            AND status = 'ACTIVE'
          ORDER BY name
          LIMIT ${limit} OFFSET ${skip}
        `,

      prisma.$queryRaw`
          SELECT id FROM "Album" 
          WHERE immutable_unaccent_lower(title) LIKE immutable_unaccent_lower(${searchPattern})
          ORDER BY title
          LIMIT ${limit} OFFSET ${skip}
        `,

      // Total Songs
      prisma.$queryRaw`
          SELECT COUNT(*)::int as count FROM "Song" 
          WHERE immutable_unaccent_lower(title) LIKE immutable_unaccent_lower(${searchPattern})
        `,

      // Total Artists
      prisma.$queryRaw`
          SELECT COUNT(*)::int as count FROM "Artist" 
          WHERE immutable_unaccent_lower(name) LIKE immutable_unaccent_lower(${searchPattern})
            AND status = 'ACTIVE'
        `,

      // Total Albums
      prisma.$queryRaw`
          SELECT COUNT(*)::int as count FROM "Album" 
          WHERE immutable_unaccent_lower(title) LIKE immutable_unaccent_lower(${searchPattern})
        `,
    ]);

    const songs = await prisma.song.findMany({
      where: { id: { in: songIds.map((s) => s.id) } },
      select: songSelectFields,
    });

    const artists = await prisma.artist.findMany({
      where: { id: { in: artistIds.map((a) => a.id) } },
      select: {
        id: true,
        name: true,
        avatarUri: true,
        country: true,
        isVerified: true,
        status: true,
      },
    });

    const albums = await prisma.album.findMany({
      where: { type: { not: "SINGLE" }, id: { in: albumIds.map((a) => a.id) } },
      include: {
        artists: {
          select: {
            artistId: true,
            artist: {
              select: { name: true },
            },
          },
        },
      },
    });

    const totalSongs = totalSongsResult[0].count;
    const totalArtists = totalArtistsResult[0].count;
    const totalAlbums = totalAlbumsResult[0].count;
    const totalItems = totalSongs + totalArtists + totalAlbums;
    const totalPages = Math.ceil(totalItems / limit);

    const data = {
      songs,
      artists,
      albums,
    };

    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
      totalSongs,
      totalArtists,
      totalAlbums,
    };

    successResponse(res, data, null, pagination);
  } catch (error) {
    next(error);
  }
};
