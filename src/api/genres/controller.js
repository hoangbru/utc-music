import prisma from "../../config/db.js";
import { successResponse } from "../../utils/helpers.js";

export const getGenres = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [genres, totalItems] = await Promise.all([
      prisma.genre.findMany({
        where: { status: "ACTIVE" },
        skip,
        take: limit,
      }),
      prisma.genre.count({
        where: { status: "ACTIVE" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    successResponse(res, genres, null, pagination);
  } catch (error) {
    next(error);
  }
};

export const getGenreSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [songs, totalItems] = await Promise.all([
      prisma.genreSong.findMany({
        where: { genreId: req.params.id },
        include: { song: true },
        skip,
        take: limit,
      }),
      prisma.genreSong.count({
        where: { genreId: req.params.id },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const data = songs.map((gs) => gs.song);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    successResponse(res, data, null, pagination);
  } catch (error) {
    next(error);
  }
};
