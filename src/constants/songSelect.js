export const songSelectFields = {
  id: true,
  title: true,
  duration: true,
  releaseDate: true,
  albumId: true,
  album: {
    select: { title: true },
  },
  url: true,
  coverUri: true,
  views: true,
  trackNumber: true,
  artists: {
    select: {
      artistId: true,
      artist: {
        select: { name: true },
      },
    },
  },
  genres: {
    select: {
      genreId: true,
      genre: {
        select: { name: true },
      },
    },
  },
};