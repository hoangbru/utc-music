import prisma from "../../config/db.js";
import {
  uploadStream,
  deleteFile,
  extractPublicId,
} from "../../config/cloudinary.js";

// --- SONGS ---

export const createSong = async (req, res, next) => {
  try {
    if (!req.files?.songFile || !req.files?.coverImage) {
      return res
        .status(400)
        .json({ error: "Both songFile and coverImage are required" });
    }

    const { title, releaseDate, albumId, lyrics, trackNumber } = req.body;
    let { artistIds } = req.body;
    let { genreIds } = req.body;

    if (artistIds.includes(",")) {
      artistIds = artistIds.split(",").map((id) => id.trim());
    } else {
      artistIds = [artistIds.trim()];
    }

    if (genreIds.includes(",")) {
      genreIds = genreIds.split(",").map((id) => id.trim());
    } else {
      genreIds = [genreIds.trim()];
    }

    // Upload song file to Cloudinary
    const songUpload = await uploadStream(req.files.songFile[0].buffer, {
      folder: "songs",
      resource_type: "video", // Cloudinary treats audio as video
    });

    // Upload cover image to Cloudinary
    const coverUpload = await uploadStream(req.files.coverImage[0].buffer, {
      folder: "covers",
      resource_type: "image",
    });

    const finalAlbumId =
      albumId && albumId.trim() !== "" && albumId !== "null" ? albumId : null;

    // Create song with uploaded URLs and duration
    const song = await prisma.song.create({
      data: {
        title,
        duration: Math.round(songUpload.duration || 0), // Round duration to integer
        releaseDate: new Date(releaseDate),
        albumId: finalAlbumId,
        url: songUpload.secure_url,
        coverUri: coverUpload.secure_url,
        lyrics,
        trackNumber: Number(trackNumber),
      },
    });

    // Add artists
    if (artistIds && artistIds.length > 0) {
      const artistIdArray = Array.isArray(artistIds) ? artistIds : [artistIds];
      for (const artistId of artistIdArray) {
        await prisma.songArtist.create({
          data: { songId: song.id, artistId },
        });
      }
    }

    // Add genres
    if (genreIds && genreIds.length > 0) {
      const genreIdArray = Array.isArray(genreIds) ? genreIds : [genreIds];
      for (const genreId of genreIdArray) {
        await prisma.genreSong.create({
          data: { songId: song.id, genreId },
        });
      }
    }

    res.status(201).json(song);
  } catch (error) {
    next(error);
  }
};

export const getAllSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

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
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: songs,
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

export const updateSong = async (req, res, next) => {
  try {
    const { title, releaseDate, lyrics, trackNumber } = req.body;
    const songId = req.params.id;

    const updateData = {
      ...(title && { title }),
      ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(lyrics && { lyrics }),
      ...(trackNumber && { trackNumber: Number(trackNumber) }),
    };

    // Get current song to retrieve old file URLs
    const currentSong = await prisma.song.findUnique({
      where: { id: songId },
      select: { url: true, coverUri: true },
    });

    // Upload new song file if provided
    if (req.files?.songFile) {
      const songUpload = await uploadStream(req.files.songFile[0].buffer, {
        folder: "songs",
        resource_type: "video",
      });
      updateData.url = songUpload.secure_url;
      updateData.duration = Math.round(songUpload.duration || 0);

      // Delete old song file
      if (currentSong?.url) {
        const oldPublicId = extractPublicId(currentSong.url);
        if (oldPublicId) {
          await deleteFile(oldPublicId, "video").catch((err) => {
            console.error("[Cloudinary] Failed to delete old song:", err);
          });
        }
      }
    }

    // Upload new cover image if provided
    if (req.files?.coverImage) {
      const coverUpload = await uploadStream(req.files.coverImage[0].buffer, {
        folder: "covers",
        resource_type: "image",
      });
      updateData.coverUri = coverUpload.secure_url;

      // Delete old cover image
      if (currentSong?.coverUri) {
        const oldPublicId = extractPublicId(currentSong.coverUri);
        if (oldPublicId) {
          await deleteFile(oldPublicId, "image").catch((err) => {
            console.error("[Cloudinary] Failed to delete old cover:", err);
          });
        }
      }
    }

    const song = await prisma.song.update({
      where: { id: songId },
      data: updateData,
    });

    res.status(200).json(song);
  } catch (error) {
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id },
      select: { url: true, coverUri: true },
    });

    if (song) {
      // Delete song file from Cloudinary
      if (song.url) {
        const songPublicId = extractPublicId(song.url);
        if (songPublicId) {
          await deleteFile(songPublicId, "video").catch((err) => {
            console.error("[Cloudinary] Failed to delete song file:", err);
          });
        }
      }

      // Delete cover image from Cloudinary
      if (song.coverUri) {
        const coverPublicId = extractPublicId(song.coverUri);
        if (coverPublicId) {
          await deleteFile(coverPublicId, "image").catch((err) => {
            console.error("[Cloudinary] Failed to delete cover image:", err);
          });
        }
      }
    }

    await prisma.song.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: "Song deleted" });
  } catch (error) {
    next(error);
  }
};

// --- ARTISTS ---

export const createArtist = async (req, res, next) => {
  try {
    const { name, biography, country } = req.body;

    let avatarUri = null;

    if (req.file) {
      const avatarUpload = await uploadStream(req.file.buffer, {
        folder: "artists",
        resource_type: "image",
      });
      avatarUri = avatarUpload.secure_url;
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        biography,
        avatarUri,
        country,
      },
    });

    res.status(201).json(artist);
  } catch (error) {
    next(error);
  }
};

export const getAllArtists = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [artists, totalItems] = await Promise.all([
      prisma.artist.findMany({
        skip,
        take: limit,
      }),
      prisma.artist.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: artists,
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

export const updateArtist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, biography, country } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(biography && { biography }),
      ...(country && { country }),
    };

    // Upload new avatar if provided
    if (req.file) {
      // Get current artist to retrieve old file URLs
      const currentArtist = await prisma.artist.findUnique({
        where: { id },
        select: { avatarUri: true },
      });

      if (!currentArtist) {
        return res.status(404).json({ message: "Artist not found" });
      }

      const oldAvatarUri = currentArtist.avatarUri;
      const avatarUpload = await uploadStream(req.file.buffer, {
        folder: "artists",
        resource_type: "image",
      });
      updateData.avatarUri = avatarUpload.secure_url;

      // Delete old avatar
      if (oldAvatarUri) {
        try {
          const avatarPublicId = extractPublicId(oldAvatarUri);
          await deleteFile(avatarPublicId, "image");
        } catch (err) {
          console.warn("Failed to delete old avatar from Cloudinary:", err);
        }
      }
    }

    const artist = await prisma.artist.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(artist);
  } catch (error) {
    next(error);
  }
};

export const deleteArtist = async (req, res, next) => {
  try {
    const artist = await prisma.artist.delete({
      where: { id: req.params.id },
    });

    if (artist.avatarUri) {
      const avatarPublicId = extractPublicId(artist.avatarUri);
      if (avatarPublicId) {
        await deleteFile(avatarPublicId, "image").catch((err) => {
          console.error("[Cloudinary] Failed to delete avatar:", err);
        });
      }
    }

    res.status(200).json({ message: "Artist deleted" });
  } catch (error) {
    next(error);
  }
};

export const verifyArtist = async (req, res, next) => {
  try {
    const artist = await prisma.artist.update({
      where: { id: req.params.id },
      data: { isVerified: true },
    });

    res.status(200).json(artist);
  } catch (error) {
    next(error);
  }
};

// --- ALBUMS ---

export const createAlbum = async (req, res, next) => {
  try {
    const { title, releaseDate, description } = req.body;
    let coverUri = null;
    let { artistIds } = req.body;

    if (artistIds.includes(",")) {
      artistIds = artistIds.split(",").map((id) => id.trim());
    } else {
      artistIds = [artistIds.trim()];
    }

    if (req.file) {
      const coverUpload = await uploadStream(req.file.buffer, {
        folder: "albums",
        resource_type: "image",
      });
      coverUri = coverUpload.secure_url;
    }

    const album = await prisma.album.create({
      data: {
        title,
        releaseDate: new Date(releaseDate),
        coverUri,
        description,
      },
    });

    // Add artists
    if (artistIds && artistIds.length > 0) {
      for (const artistId of artistIds) {
        await prisma.artistAlbum.create({
          data: { albumId: album.id, artistId },
        });
      }
    }

    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
};

export const getAllAlbums = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

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

export const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, releaseDate, coverUri, description } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(coverUri && { coverUri }),
      ...(description && { description }),
    };

    // Upload new cover image if provided
    if (req.file) {
      // Get current album to retrieve old file URLs
      const currentAlbum = await prisma.album.findUnique({
        where: { id },
        select: { coverUri: true },
      });

      if (!currentAlbum) {
        return res.status(404).json({ message: "Album not found" });
      }

      const oldCoverUri = currentAlbum.coverUri;
      const coverUpload = await uploadStream(req.file.buffer, {
        folder: "albums",
        resource_type: "image",
      });
      updateData.coverUri = coverUpload.secure_url;

      // Delete old cover image
      if (oldCoverUri) {
        try {
          const coverPublicId = extractPublicId(oldCoverUri);
          await deleteFile(coverPublicId, "image");
        } catch (err) {
          console.warn(
            "Failed to delete old cover image from Cloudinary:",
            err
          );
        }
      }
    }

    const album = await prisma.album.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(album);
  } catch (error) {
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const album = await prisma.album.delete({
      where: { id: req.params.id },
    });

    if (album.coverUri) {
      const coverPublicId = extractPublicId(album.coverUri);
      if (coverPublicId) {
        await deleteFile(coverPublicId, "image").catch((err) => {
          console.error("[Cloudinary] Failed to delete cover image:", err);
        });
      }
    }

    res.status(200).json({ message: "Album deleted" });
  } catch (error) {
    next(error);
  }
};

// --- GENRES ---

export const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const genre = await prisma.genre.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(genre);
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

    res.status(200).json({
      data: genres,
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

    res.status(200).json(genre);
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
  } catch (error) {
    next(error);
  }
};

// --- USERS ---

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

    res.status(200).json({
      data: users,
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

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
