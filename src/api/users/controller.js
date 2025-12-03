import prisma from "../../config/db.js"
import { uploadStream, deleteFile, extractPublicId } from "../../config/cloudinary.js"

export const getCurrentUser = async (req, res, next) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...rest } = user;

    res.json(rest);
  } catch (error) {
    next(error);
  }
};


export const updateProfile = async (req, res, next) => {
  try {
    const { displayName } = req.body
    const userId = req.user.userId

    let avatarUri = undefined
    if (req.file) {
      // Get current user to retrieve old avatar
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUri: true },
      })

      // Delete old avatar if it exists
      if (currentUser?.avatarUri) {
        const oldPublicId = extractPublicId(currentUser.avatarUri)
        if (oldPublicId) {
          await deleteFile(oldPublicId, "image").catch((err) => {
            console.error("[Cloudinary] Failed to delete old avatar:", err)
          })
        }
      }

      // Upload new avatar
      const uploadResult = await uploadStream(req.file.buffer, {
        folder: "avatars",
        resource_type: "image",
      })
      avatarUri = uploadResult.secure_url
    }

    const user = await prisma.user.update({
      where: { id: userId },
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

export const deleteAvatar = async (req, res, next) => {
  try {
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUri: true },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    // Delete avatar from Cloudinary if it exists
    if (user.avatarUri) {
      const publicId = extractPublicId(user.avatarUri)
      if (publicId) {
        await deleteFile(publicId, "image").catch((err) => {
          console.error("[Cloudinary] Failed to delete avatar:", err)
        })
      }
    }

    // Update user to remove avatar
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUri: null },
    })

    res.status(200).json({ message: "Avatar deleted successfully" })
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
