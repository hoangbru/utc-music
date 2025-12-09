export const artistsSelectFields = {
  select: {
    artistId: true,
    artist: {
      select: { name: true, isVerified: true },
    },
  },
};

export const albumSelectFields = {
  select: { title: true, coverUri: true, type: true },
};

export const genresSelectFields = {
  select: {
    genreId: true,
    genre: {
      select: { name: true, status: true },
    },
  },
};

export const songSelectFields = {
  id: true,
  title: true,
  duration: true,
  releaseDate: true,
  albumId: true,
  album: albumSelectFields,
  url: true,
  coverUri: true,
  views: true,
  trackNumber: true,
  artists: artistsSelectFields,
  genres: genresSelectFields,
};
