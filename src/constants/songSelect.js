export const artistsSelect = {
  artistId: true,
  artist: {
    select: { name: true, followerCount: true, isVerified: true },
  },
};

export const albumSelect = {
  title: true,
  coverUri: true,
  type: true,
};

export const genresSelect = {
  genreId: true,
  genre: {
    select: { name: true, status: true },
  },
};

export const songSelectFields = {
  id: true,
  title: true,
  duration: true,
  releaseDate: true,
  albumId: true,
  album: { select: albumSelect },
  url: true,
  coverUri: true,
  views: true,
  trackNumber: true,
  artists: { select: artistsSelect },
  genres: { select: genresSelect },
};
