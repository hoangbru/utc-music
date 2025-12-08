
export const artistsSelectFields = {
  select: {
    artistId: true,
    artist: {
      select: { name: true },
    },
  },
};

export const albumSelectFields = {
  select: { title: true },
};

export const genresSelectFields = {
  select: {
    genreId: true,
    genre: {
      select: { name: true },
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
