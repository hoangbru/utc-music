import prisma from "../../config/db.js"

export const getArtists = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [artists, totalItems] = await Promise.all([
      prisma.artist.findMany({
        where: { status: "ACTIVE" },
        skip,
        take: limit,
      }),
      prisma.artist.count({
        where: { status: "ACTIVE" },
      }),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: artists,
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

export const getArtist = async (req, res, next) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: req.params.id },
      include: {
        songs: { include: { song: true } },
        albums: { include: { album: true } },
      },
    })

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" })
    }

    res.status(200).json(artist)
  } catch (error) {
    next(error)
  }
}

export const getArtistSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [songs, totalItems] = await Promise.all([
      prisma.songArtist.findMany({
        where: { artistId: req.params.id },
        include: { song: true },
        skip,
        take: limit,
      }),
      prisma.songArtist.count({
        where: { artistId: req.params.id },
      }),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: songs.map((sa) => sa.song),
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

export const getArtistAlbums = async (req, res, next) => {
  try {
    const albums = await prisma.artistAlbum.findMany({
      where: { artistId: req.params.id },
      include: { album: true },
    })

    res.status(200).json(albums.map((aa) => aa.album))
  } catch (error) {
    next(error)
  }
}
