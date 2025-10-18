import prisma from "../../config/db.js"

export const getGenres = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [genres, totalItems] = await Promise.all([
      prisma.genre.findMany({
        where: { status: "ACTIVE" },
        skip,
        take: limit,
      }),
      prisma.genre.count({
        where: { status: "ACTIVE" },
      }),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: genres,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getGenreSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

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
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: songs.map((gs) => gs.song),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    })
  } catch (error) {
    next(error)
  }
}
