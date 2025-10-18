import prisma from "../../config/db.js"

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        userName: true,
        email: true,
        displayName: true,
        avatarUri: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, avatarUri } = req.body

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(displayName && { displayName }),
        ...(avatarUri && { avatarUri }),
      },
      select: {
        id: true,
        userName: true,
        email: true,
        displayName: true,
        avatarUri: true,
      },
    })

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const getUserPlaylists = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [playlists, totalItems] = await Promise.all([
      prisma.playlist.findMany({
        where: { userId: req.user.userId },
        include: {
          songs: {
            include: { song: true },
            orderBy: { position: "asc" },
          },
        },
        skip,
        take: limit,
      }),
      prisma.playlist.count({
        where: { userId: req.user.userId },
      }),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: playlists,
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

export const getLikedSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const playlist = await prisma.playlist.findFirst({
      where: {
        userId: req.user.userId,
        isFavorite: true,
      },
    })

    if (!playlist) {
      return res.status(404).json({ error: "Liked songs playlist not found" })
    }

    const [songs, totalItems] = await Promise.all([
      prisma.playListSong.findMany({
        where: { playListId: playlist.id },
        include: { song: true },
        orderBy: { position: "asc" },
        skip,
        take: limit,
      }),
      prisma.playListSong.count({
        where: { playListId: playlist.id },
      }),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: songs.map((ps) => ps.song),
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
