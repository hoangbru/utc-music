import prisma from "../../config/db.js";
import { successResponse } from "../../utils/helpers.js";

export const getAlbums = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = type ? { type } : {};

    const [albums, totalItems] = await Promise.all([
      prisma.album.findMany({
        skip,
        take: limit,
        where,
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
      }),
      prisma.album.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    successResponse(res, albums, null, pagination);
  } catch (error) {
    next(error);
  }
};

export const getAlbum = async (req, res, next) => {
  try {
    const album = await prisma.album.findUnique({
      where: { id: req.params.id },
      include: {
        songs: { orderBy: { trackNumber: "asc" } },
        artists: { include: { artist: true } },
      },
    });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    successResponse(res, album);
  } catch (error) {
    next(error);
  }
};
