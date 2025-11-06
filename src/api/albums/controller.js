import prisma from "../../config/db.js";

export const getAlbums = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [albums, totalItems] = await Promise.all([
      prisma.album.findMany({
        skip,
        take: limit,
        include: {
          artists: { include: { artist: true } },
        },
      }),
      prisma.album.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: albums,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
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

    res.status(200).json(album);
  } catch (error) {
    next(error);
  }
};
