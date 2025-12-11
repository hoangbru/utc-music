import prisma from "../../config/db.js";
import { artistSelectFields } from "../../constants/artistSelect.js";
import { songSelectFields } from "../../constants/songSelect.js";
import { successResponse } from "../../utils/helpers.js";

export const getArtists = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [artists, totalItems] = await Promise.all([
      prisma.artist.findMany({
        where: { status: "ACTIVE" },
        skip,
        take: limit,
        select: artistSelectFields,
      }),
      prisma.artist.count({
        where: { status: "ACTIVE" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    successResponse(res, artists, null, pagination);
  } catch (error) {
    next(error);
  }
};

export const getArtist = async (req, res, next) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: req.params.id },
      include: {
        songs: { include: { song: { select: songSelectFields } } },
        albums: { include: { album: true } },
      },
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    successResponse(res, artist);
  } catch (error) {
    next(error);
  }
};

export const getArtistSongs = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [songs, totalItems] = await Promise.all([
      prisma.songArtist.findMany({
        where: { artistId: req.params.id },
        include: { song: { select: songSelectFields } },
        skip,
        take: limit,
      }),
      prisma.songArtist.count({
        where: { artistId: req.params.id },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const data = songs.map((sa) => sa.song);
    const pagination = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    successResponse(res, data, null, pagination);
  } catch (error) {
    next(error);
  }
};

export const getArtistAlbums = async (req, res, next) => {
  try {
    const albums = await prisma.artistAlbum.findMany({
      where: { artistId: req.params.id },
      include: { album: true },
    });

    const data = albums.map((aa) => aa.album);

    successResponse(res, data);
  } catch (error) {
    next(error);
  }
};
