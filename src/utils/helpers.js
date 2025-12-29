export const generateOrderId = () => {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const getPeriodDate = (period) => {
  if (period === "all") return null;

  const now = new Date();
  switch (period) {
    case "week":
      now.setDate(now.getDate() - 7);
      break;
    case "month":
      now.setMonth(now.getMonth() - 1);
      break;
    case "year":
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now;
};

export const getPreviousPeriodDate = (period) => {
  const now = new Date();

  switch (period) {
    case "week":
      now.setDate(now.getDate() - 14);
      break;
    case "month":
      now.setMonth(now.getMonth() - 2);
      break;
    case "year":
      now.setFullYear(now.getFullYear() - 2);
      break;
    default:
      return null;
  }

  return now;
};

export const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

export const successResponse = (
  res,
  data = {},
  message = null,
  meta = null,
  links = null,
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
    ...(links && { links }),
  });
};

/**
 * Adds isLiked field to songs
 * @param {Array|Object} songs - Array of songs or single song object
 * @param {string|null} userId - User ID (null if not authenticated)
 * @param {Object} prisma - Prisma client instance
 * @returns {Promise<Array|Object>} Songs with isLiked field
 */
export const addIsLikedToSongs = async (songs, userId, prisma) => {
  // If no userId, set isLiked to false for all songs
  if (!userId) {
    const isArray = Array.isArray(songs);
    if (isArray) {
      return songs.map((song) => ({
        ...song,
        isLiked: false,
      }));
    }
    return {
      ...songs,
      isLiked: false,
    };
  }

  // Get user's liked playlist
  const likedPlaylist = await prisma.playlist.findFirst({
    where: {
      userId,
      isFavorite: true,
    },
    select: { id: true },
  });

  // If no liked playlist, set isLiked to false
  if (!likedPlaylist) {
    const isArray = Array.isArray(songs);
    if (isArray) {
      return songs.map((song) => ({
        ...song,
        isLiked: false,
      }));
    }
    return {
      ...songs,
      isLiked: false,
    };
  }

  // Get all liked song IDs for this user
  const songIds = Array.isArray(songs)
    ? songs.map((song) => song.id)
    : [songs.id];

  const likedSongs = await prisma.playListSong.findMany({
    where: {
      playListId: likedPlaylist.id,
      songId: { in: songIds },
    },
    select: { songId: true },
  });

  const likedSongIds = new Set(likedSongs.map((ls) => ls.songId));

  // Add isLiked field to songs
  const isArray = Array.isArray(songs);
  if (isArray) {
    return songs.map((song) => ({
      ...song,
      isLiked: likedSongIds.has(song.id),
    }));
  }

  return {
    ...songs,
    isLiked: likedSongIds.has(songs.id),
  };
};
