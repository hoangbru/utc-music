import prisma from "../../config/db.js";
import { successResponse } from "../../utils/helpers.js";

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
      songs,
      artists,
      albums,
      totalSongsResult,
      totalArtistsResult,
      totalAlbumsResult,
    ] = await Promise.all([
      // Songs
      prisma.$queryRaw`
          SELECT * FROM "Song" 
          WHERE immutable_unaccent_lower(title) LIKE immutable_unaccent_lower(${searchPattern})
          ORDER BY title
          LIMIT ${limit} OFFSET ${skip}
        `,

      // Artists
      prisma.$queryRaw`
          SELECT * FROM "Artist" 
          WHERE immutable_unaccent_lower(name) LIKE immutable_unaccent_lower(${searchPattern})
            AND status = 'ACTIVE'
          ORDER BY name
          LIMIT ${limit} OFFSET ${skip}
        `,

      // Albums
      prisma.$queryRaw`
          SELECT * FROM "Album" 
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
