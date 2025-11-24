import prisma from "../../../config/db.js";
import { successResponse } from "../../../utils/response.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          userName: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
          createdAt: true,
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };
    const message = "Users retrieved successfully";

    successResponse(res, users, message, pagination);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: {
        id: true,
        userName: true,
        email: true,
        status: true,
      },
    });

    const message = "User updated successfully";

    successResponse(res, user, message);
  } catch (error) {
    next(error);
  }
};
