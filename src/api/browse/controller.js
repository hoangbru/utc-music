import prisma from "../../config/db.js"

export const search = async (req, res, next) => {
  try {
    const { q } = req.query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" })
    }

    const [songs, artists, albums, totalSongs, totalArtists, totalAlbums] = await Promise.all([
      prisma.song.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
        skip,
        take: limit,
      }),
      prisma.artist.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
          status: "ACTIVE",
        },
        skip,
        take: limit,
      }),
      prisma.album.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
        skip,
        take: limit,
      }),
      prisma.song.count({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
      }),
      prisma.artist.count({
        where: {
          name: { contains: q, mode: "insensitive" },
          status: "ACTIVE",
        },
      }),
      prisma.album.count({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
      }),
    ])

    const totalItems = totalSongs + totalArtists + totalAlbums
    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: {
        songs,
        artists,
        albums,
      },
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
