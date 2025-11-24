import prisma from "../../../config/db.js";
import { successResponse } from "../../../utils/response.js";

export const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const genre = await prisma.genre.create({
      data: {
        name,
        description,
      },
    });

    const message = "Genre created successfully";

    successResponse(res, genre, message, null, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllGenres = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [genres, totalItems] = await Promise.all([
      prisma.genre.findMany({
        skip,
        take: limit,
      }),
      prisma.genre.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };
    const message = "Genres retrieved successfully";

    successResponse(res, genres, message, pagination);
  } catch (error) {
    next(error);
  }
};

export const updateGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const genre = await prisma.genre.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
      },
    });

    const message = "Album updated successfully";

    successResponse(res, album, message);
  } catch (error) {
    next(error);
  }
};

export const deleteGenre = async (req, res, next) => {
  try {
    await prisma.genre.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Genre deleted" });
    const message = "Album deleted successfully";

    successResponse(res, {}, message);
  } catch (error) {
    next(error);
  }
};
