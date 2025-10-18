import prisma from "../../config/db.js"

// --- SONGS ---

export const createSong = async (req, res, next) => {
  try {
    const { title, duration, releaseDate, albumId, url, coverUri, lyrics, trackNumber, artistIds, genreIds } = req.body

    const song = await prisma.song.create({
      data: {
        title,
        duration,
        releaseDate: new Date(releaseDate),
        albumId,
        url,
        coverUri,
        lyrics,
        trackNumber,
      },
    })

    // Add artists
    if (artistIds && artistIds.length > 0) {
      for (const artistId of artistIds) {
        await prisma.songArtist.create({
          data: { songId: song.id, artistId },
        })
      }
    }

    // Add genres
    if (genreIds && genreIds.length > 0) {
      for (const genreId of genreIds) {
        await prisma.genreSong.create({
          data: { songId: song.id, genreId },
        })
      }
    }

    res.status(201).json(song)
  } catch (error) {
    next(error)
  }
}

export const getAllSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [songs, totalItems] = await Promise.all([
      prisma.song.findMany({
        include: {
          album: true,
          artists: { include: { artist: true } },
          genres: { include: { genre: true } },
        },
        skip,
        take: limit,
      }),
      prisma.song.count(),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: songs,
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

export const updateSong = async (req, res, next) => {
  try {
    const { title, duration, releaseDate, lyrics } = req.body

    const song = await prisma.song.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(duration && { duration }),
        ...(releaseDate && { releaseDate: new Date(releaseDate) }),
        ...(lyrics && { lyrics }),
      },
    })

    res.status(200).json(song)
  } catch (error) {
    next(error)
  }
}

export const deleteSong = async (req, res, next) => {
  try {
    await prisma.song.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({ message: "Song deleted" })
  } catch (error) {
    next(error)
  }
}

// --- ARTISTS ---

export const createArtist = async (req, res, next) => {
  try {
    const { name, biography, avatarUri, country } = req.body

    const artist = await prisma.artist.create({
      data: {
        name,
        biography,
        avatarUri,
        country,
      },
    })

    res.status(201).json(artist)
  } catch (error) {
    next(error)
  }
}

export const getAllArtists = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [artists, totalItems] = await Promise.all([
      prisma.artist.findMany({
        skip,
        take: limit,
      }),
      prisma.artist.count(),
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

export const updateArtist = async (req, res, next) => {
  try {
    const { name, biography, avatarUri, country } = req.body

    const artist = await prisma.artist.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(biography && { biography }),
        ...(avatarUri && { avatarUri }),
        ...(country && { country }),
      },
    })

    res.status(200).json(artist)
  } catch (error) {
    next(error)
  }
}

export const deleteArtist = async (req, res, next) => {
  try {
    await prisma.artist.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({ message: "Artist deleted" })
  } catch (error) {
    next(error)
  }
}

export const verifyArtist = async (req, res, next) => {
  try {
    const artist = await prisma.artist.update({
      where: { id: req.params.id },
      data: { isVerified: true },
    })

    res.status(200).json(artist)
  } catch (error) {
    next(error)
  }
}

// --- ALBUMS ---

export const createAlbum = async (req, res, next) => {
  try {
    const { title, releaseDate, coverUri, description, artistIds } = req.body

    const album = await prisma.album.create({
      data: {
        title,
        releaseDate: new Date(releaseDate),
        coverUri,
        description,
      },
    })

    // Add artists
    if (artistIds && artistIds.length > 0) {
      for (const artistId of artistIds) {
        await prisma.artistAlbum.create({
          data: { albumId: album.id, artistId },
        })
      }
    }

    res.status(201).json(album)
  } catch (error) {
    next(error)
  }
}

export const getAllAlbums = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [albums, totalItems] = await Promise.all([
      prisma.album.findMany({
        include: {
          songs: true,
          artists: { include: { artist: true } },
        },
        skip,
        take: limit,
      }),
      prisma.album.count(),
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: albums,
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

export const updateAlbum = async (req, res, next) => {
  try {
    const { title, releaseDate, coverUri, description } = req.body

    const album = await prisma.album.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(releaseDate && { releaseDate: new Date(releaseDate) }),
        ...(coverUri && { coverUri }),
        ...(description && { description }),
      },
    })

    res.status(200).json(album)
  } catch (error) {
    next(error)
  }
}

export const deleteAlbum = async (req, res, next) => {
  try {
    await prisma.album.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({ message: "Album deleted" })
  } catch (error) {
    next(error)
  }
}

// --- GENRES ---

export const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body

    const genre = await prisma.genre.create({
      data: {
        name,
        description,
      },
    })

    res.status(201).json(genre)
  } catch (error) {
    next(error)
  }
}

export const getAllGenres = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [genres, totalItems] = await Promise.all([
      prisma.genre.findMany({
        skip,
        take: limit,
      }),
      prisma.genre.count(),
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

export const updateGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body

    const genre = await prisma.genre.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
      },
    })

    res.status(200).json(genre)
  } catch (error) {
    next(error)
  }
}

export const deleteGenre = async (req, res, next) => {
  try {
    await prisma.genre.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({ message: "Genre deleted" })
  } catch (error) {
    next(error)
  }
}

// --- USERS ---

export const getAllUsers = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

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
    ])

    const totalPages = Math.ceil(totalItems / limit)

    res.status(200).json({
      data: users,
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

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: {
        id: true,
        userName: true,
        email: true,
        status: true,
      },
    })

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}
