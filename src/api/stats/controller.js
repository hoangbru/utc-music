import prisma from "../../config/db.js";
import { songSelectFields } from "../../constants/songSelect.js";
import { successResponse } from "../../utils/response.js";

export const getTop100SongsByViews = async (req, res, next) => {
  try {
    const songs = await prisma.song.findMany({
      take: 100,
      orderBy: {
        views: "desc",
      },
      select: songSelectFields,
    });

    successResponse(res, songs, null);
  } catch (error) {
    next(error);
  }
};

export const getTop100SongsByGenres = async (req, res, next) => {
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
      take: 100,
      orderBy: {
        views: "desc",
      },
      select: songSelectFields,
    });

    successResponse(res, songs, null);
  } catch (error) {
    next(error);
  }
};
