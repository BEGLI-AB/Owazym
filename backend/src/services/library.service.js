import { prisma } from "../config/prisma.js";
import { fallbackCover, resolveStorageUrl } from "../utils/covers.js";
import { toNumber } from "../utils/serialize.js";

const normalizePlan = (user) => {
  const plan = String(user?.subscriptionPlan || "").toLowerCase();
  if (["free", "plus", "premium"].includes(plan)) return plan;
  return user?.subscribes ? "premium" : "free";
};

const mapArtist = (artist) => ({
  id: toNumber(artist.id),
  name: artist.name,
  photo_url: resolveStorageUrl(artist.photoPath),
  is_popular: Boolean(artist.isPopular),
  is_visible: artist.isVisible !== false,
});

const artistSelect = {
  id: true,
  name: true,
  photoPath: true,
  isPopular: true,
  isVisible: true,
};

const trackSelect = {
  id: true,
  name: true,
  plays: true,
  isPopular: true,
  isVisible: true,
  audioPath: true,
  coverPath: true,
  year: {
    select: {
      id: true,
      date: true,
    },
  },
  language: {
    select: {
      id: true,
      name: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  musicArtist: {
    select: {
      artistId: true,
      artist: {
        select: artistSelect,
      },
    },
  },
};

const mapTrack = (music) => {
  if (!music || !music.id) return null;
  const artists = (music.musicArtist || []).map((item) => item.artist).filter(Boolean);
  const cover = music.coverPath ? resolveStorageUrl(music.coverPath) : fallbackCover(music.id, music.name);

  return {
    id: toNumber(music.id),
    name: music.name,
    title: music.name,
    artists: artists.map(mapArtist),
    artist: artists.map((artist) => artist.name).join(", "),
    year: music.year?.date ?? null,
    plays: toNumber(music.plays),
    is_popular: Boolean(music.isPopular),
    is_visible: music.isVisible !== false,
    audio_url: resolveStorageUrl(music.audioPath),
    cover_url: cover,
    category: music.category
      ? {
          id: toNumber(music.category.id),
          name: music.category.name,
        }
      : null,
    language: music.language
      ? {
          id: toNumber(music.language.id),
          name: music.language.name,
        }
      : null,
  };
};

const searchTrackWhere = (query = "", filters = {}) => {
  const where = { isVisible: true };
  if (query) {
    where.OR = [
      { name: { contains: query } },
      {
        musicArtist: {
          some: {
            artist: {
              name: { contains: query },
            },
          },
        },
      },
    ];
  }

  if (filters.genreId) where.categoryId = BigInt(filters.genreId);
  if (filters.countryId) where.languageId = BigInt(filters.countryId);
  if (filters.yearId) where.yearId = BigInt(filters.yearId);
  if (filters.artistId) {
    where.musicArtist = {
      some: { artistId: BigInt(filters.artistId) },
    };
  }
  return where;
};

const getUserPlaylistsWithTracks = async (userId) => {
  const playlists = await prisma.playlist.findMany({
    where: { userId: BigInt(userId) },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      tracks: {
        where: {
          music: {
            isVisible: true,
          },
        },
        select: {
          music: {
            select: trackSelect,
          },
        },
      },
    },
  });

  const mapped = playlists.map((playlist) => ({
    id: toNumber(playlist.id),
    name: playlist.name,
    tracks: playlist.tracks
      .map((t) => t.music)
      .filter(Boolean)
      .map(mapTrack),
  }));

  return mapped;
};

export const libraryService = {
  async getHome(userId, { artistId, musicId }) {
    const whereByArtist = {
      isVisible: true,
      ...(artistId ? { musicArtist: { some: { artistId: BigInt(artistId) } } } : {}),
    };
    const baseTracks = await prisma.music.findMany({
      where: whereByArtist,
      select: trackSelect,
      orderBy: [{ isPopular: "desc" }, { plays: "desc" }, { id: "desc" }],
      take: 30,
    });

    const selectedTrack = musicId
      ? await prisma.music.findFirst({
          where: { id: BigInt(musicId), isVisible: true },
          select: trackSelect,
        })
      : null;

    let tracks = baseTracks.map(mapTrack).slice(0, 10);
    if (!tracks.length && selectedTrack) {
      tracks = [mapTrack(selectedTrack)];
    }

    const artists = await prisma.artist.findMany({
      where: {
        isVisible: true,
        music: { some: { music: { isVisible: true } } },
      },
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
      take: 20,
      select: artistSelect,
    });

    const newReleases = await prisma.music.findMany({
      where: { isVisible: true },
      select: trackSelect,
      orderBy: { id: "desc" },
      take: 15,
    });

    const categories = await prisma.category.findMany({
      where: {
        tracks: {
          some: {
            isVisible: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: { select: { tracks: true } },
      },
      orderBy: { tracks: { _count: "desc" } },
      take: 3,
    });

    const popularGenres = await Promise.all(
      categories.map(async (category) => {
        const genreTracks = await prisma.music.findMany({
          where: { categoryId: category.id, isVisible: true },
          select: trackSelect,
          orderBy: { id: "desc" },
          take: 8,
        });
        return {
          id: toNumber(category.id),
          name: category.name,
          musics_count: category._count.tracks,
          tracks: genreTracks.map(mapTrack),
        };
      }),
    );

    const playlists = userId ? await getUserPlaylistsWithTracks(userId) : [];
    const banners = await prisma.homeBanner.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        url: true,
        imagePath: true,
        imageUrl: true,
      },
    });
    const banner = banners[0] || null;

    return {
      featured_track: tracks.find((track) => track.id === Number(musicId)) || tracks[0] || null,
      tracks,
      popular_artists: artists.map(mapArtist),
      new_releases: newReleases.map(mapTrack),
      popular_genres: popularGenres,
      playlists: playlists.map(({ tracks: _tracks, ...p }) => p),
      active_playlist: playlists[0] || null,
      selected_artist_id: Number(artistId || 0),
      selected_music_id: Number(musicId || 0),
      home_banner: banner
        ? {
            id: toNumber(banner.id),
            title: banner.title,
            subtitle: banner.subtitle,
            url: banner.url,
            image_url: banner.imagePath ? resolveStorageUrl(banner.imagePath) : banner.imageUrl,
          }
        : null,
      home_banners: banners.map((item) => ({
        id: toNumber(item.id),
        title: item.title,
        subtitle: item.subtitle,
        url: item.url,
        image_url: item.imagePath ? resolveStorageUrl(item.imagePath) : item.imageUrl,
      })),
    };
  },

  async getAlbumData({ artistId, musicId }) {
    let selectedArtistId = Number(artistId || 0);
    let selectedMusic = null;

    if (musicId) {
      selectedMusic = await prisma.music.findFirst({
        where: { id: BigInt(musicId), isVisible: true },
        select: trackSelect,
      });
      if (!selectedArtistId && selectedMusic?.musicArtist?.[0]?.artistId) {
        selectedArtistId = toNumber(selectedMusic.musicArtist[0].artistId);
      }
    }

    const where = selectedArtistId
      ? { isVisible: true, musicArtist: { some: { artistId: BigInt(selectedArtistId) } } }
      : { isVisible: true };
    const albumTracks = await prisma.music.findMany({
      where,
      select: trackSelect,
      orderBy: { id: "desc" },
      take: 12,
    });
    const selectedArtist = selectedArtistId
      ? await prisma.artist.findFirst({
          where: { id: BigInt(selectedArtistId), isVisible: true },
          select: {
            id: true,
            photoPath: true,
          },
        })
      : null;
    const mappedTracks = albumTracks.map(mapTrack).filter(Boolean);
    const fallbackFeatured = mapTrack(selectedMusic || albumTracks[0] || null);
    const featured = mappedTracks.find((track) => track.id === Number(musicId)) || fallbackFeatured;
    const heroCover = selectedArtist?.photoPath ? resolveStorageUrl(selectedArtist.photoPath) : featured?.cover_url || "";

    return {
      featured: featured?.id ? { ...featured, hero_cover_url: heroCover } : null,
      tracks: mappedTracks,
      lock_album_cover: Boolean(selectedArtistId),
      artist_id: selectedArtistId,
      music_id: Number(musicId || 0),
      hero_cover_url: heroCover,
    };
  },

  async listTracks({ q, genreId, countryId, yearId, page = 1, pageSize = 60 }) {
    const where = searchTrackWhere(q, { genreId, countryId, yearId });
    const skip = (Math.max(1, Number(page)) - 1) * Number(pageSize);
    const take = Math.max(1, Number(pageSize));

    const [rows, total] = await Promise.all([
      prisma.music.findMany({
        where,
        select: trackSelect,
        orderBy: [{ isPopular: "desc" }, { plays: "desc" }, { id: "desc" }],
        skip,
        take,
      }),
      prisma.music.count({ where }),
    ]);

    return {
      items: rows.map(mapTrack),
      meta: {
        page: Number(page),
        page_size: take,
        total,
        total_pages: Math.max(1, Math.ceil(total / take)),
      },
    };
  },

  async getTrackById(id) {
    const row = await prisma.music.findFirst({
      where: { id: BigInt(id), isVisible: true },
      select: trackSelect,
    });
    if (!row) {
      const error = new Error("Track not found");
      error.status = 404;
      throw error;
    }
    return mapTrack(row);
  },

  async incrementPlay(id) {
    const row = await prisma.music.findFirst({
      where: { id: BigInt(id), isVisible: true },
      select: { id: true },
    });
    if (!row) {
      const error = new Error("Track not found");
      error.status = 404;
      throw error;
    }

    const updated = await prisma.music.update({
      where: { id: row.id },
      data: { plays: { increment: 1 } },
    });
    return { music_id: toNumber(updated.id), plays: toNumber(updated.plays) };
  },

  async listArtists({ q }) {
    const where = {
      isVisible: true,
      ...(q ? { name: { contains: q } } : {}),
    };

    const rows = await prisma.artist.findMany({
      where,
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
      select: {
        ...artistSelect,
        _count: { select: { music: true } },
      },
    });
    return rows.map((artist) => ({
      ...mapArtist(artist),
      musics_count: artist._count.music,
    }));
  },

  async getArtistsIndexData({ q = "" } = {}) {
    const query = String(q || "").trim();
    const where = {
      isVisible: true,
      ...(query ? { name: { contains: query } } : {}),
    };

    const [artists, popularArtists] = await Promise.all([
      prisma.artist.findMany({
        where,
        orderBy: { name: "asc" },
        select: {
          ...artistSelect,
          _count: { select: { music: true } },
        },
      }),
      prisma.artist.findMany({
        where: { isPopular: true, isVisible: true },
        orderBy: { name: "asc" },
        take: 30,
        select: artistSelect,
      }),
    ]);

    return {
      artists: artists.map((artist) => ({
        ...mapArtist(artist),
        musics_count: Number(artist._count?.music || 0),
      })),
      popular_artists: popularArtists.map(mapArtist),
      q: query,
    };
  },

  async getMusicsIndexData({ q = "" } = {}) {
    const query = String(q || "").trim();
    const where = query ? searchTrackWhere(query, {}) : {};

    const [musics, popularMusics, autoPopularMusics] = await Promise.all([
      prisma.music.findMany({
        where,
        select: trackSelect,
        orderBy: { id: "desc" },
      }),
      prisma.music.findMany({
        where: { isPopular: true, isVisible: true },
        select: trackSelect,
        orderBy: { id: "desc" },
        take: 30,
      }),
      prisma.music.findMany({
        where: { isVisible: true },
        select: trackSelect,
        orderBy: [{ plays: "desc" }, { id: "desc" }],
        take: 30,
      }),
    ]);

    return {
      musics: musics.map(mapTrack),
      popular_musics: popularMusics.map(mapTrack),
      auto_popular_musics: autoPopularMusics.map(mapTrack),
      q: query,
    };
  },

  async getArtistById(id) {
    const artist = await prisma.artist.findFirst({
      where: { id: BigInt(id), isVisible: true },
      select: {
        ...artistSelect,
        music: {
          where: {
            music: {
              isVisible: true,
            },
          },
          select: {
            music: {
              select: trackSelect,
            },
          },
        },
      },
    });
    if (!artist) {
      const error = new Error("Artist not found");
      error.status = 404;
      throw error;
    }
    return {
      ...mapArtist(artist),
      tracks: artist.music.map((item) => mapTrack(item.music)),
    };
  },

  async listCategories() {
    const rows = await prisma.category.findMany({
      where: {
        tracks: {
          some: {
            isVisible: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: { select: { tracks: true } },
      },
      orderBy: { name: "asc" },
    });
    return rows.map((row) => ({
      id: toNumber(row.id),
      name: row.name,
      musics_count: row._count.tracks,
    }));
  },

  async getFilters() {
    const [genres, countries, years] = await Promise.all([
      prisma.category.findMany({
        where: {
          tracks: {
            some: {
              isVisible: true,
            },
          },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.language.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.year.findMany({
        orderBy: { date: "desc" },
        select: {
          id: true,
          date: true,
        },
      }),
    ]);

    return {
      genres: genres.map((g) => ({ id: toNumber(g.id), name: g.name })),
      countries: countries.map((c) => ({ id: toNumber(c.id), name: c.name })),
      years: years.map((y) => ({ id: toNumber(y.id), date: y.date })),
    };
  },

  async getSubscriptionSummary(userId) {
    const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
    const playlistsCount = await prisma.playlist.count({ where: { userId: BigInt(userId) } });
    const plan = normalizePlan(user);
    const downloadsUsed = Number(user?.downloadsUsedMonth || 0);

    return {
      plan,
      stats: {
        playlists_count: playlistsCount,
        downloads_used: downloadsUsed,
        downloads_left: plan === "plus" ? Math.max(0, 30 - downloadsUsed) : null,
        month_start: user?.downloadsMonthStartsAt ? user.downloadsMonthStartsAt.toISOString().slice(0, 10) : null,
      },
    };
  },

  async updateSubscription(userId, plan) {
    const normalizedPlan = String(plan || "").trim().toLowerCase();
    if (!["free", "plus", "premium"].includes(normalizedPlan)) {
      const error = new Error("Invalid plan");
      error.status = 422;
      throw error;
    }

    const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
    const updatePayload = {
      subscriptionPlan: normalizedPlan,
      subscribes: normalizedPlan === "premium",
    };
    if (normalizedPlan === "plus" && !user?.downloadsMonthStartsAt) {
      updatePayload.downloadsMonthStartsAt = new Date();
      updatePayload.downloadsUsedMonth = 0;
    }
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: updatePayload,
    });
    return this.getSubscriptionSummary(userId);
  },

  async getDownloadInfo(musicId, userId) {
    const [music, user] = await Promise.all([
      prisma.music.findFirst({ where: { id: BigInt(musicId), isVisible: true }, select: trackSelect }),
      prisma.user.findUnique({ where: { id: BigInt(userId) } }),
    ]);
    if (!music) {
      const error = new Error("Track not found");
      error.status = 404;
      throw error;
    }

    const plan = normalizePlan(user);
    if (plan === "free") {
      const error = new Error("Download is not available on free plan");
      error.status = 403;
      throw error;
    }

    if (!music.audioPath) {
      const error = new Error("Audio file is missing");
      error.status = 404;
      throw error;
    }

    if (plan === "plus") {
      const monthStart = user.downloadsMonthStartsAt ? new Date(user.downloadsMonthStartsAt) : null;
      const now = new Date();
      let used = Number(user.downloadsUsedMonth || 0);
      let activeMonth = monthStart;

      if (!monthStart || monthStart.getUTCMonth() !== now.getUTCMonth() || monthStart.getUTCFullYear() !== now.getUTCFullYear()) {
        used = 0;
        activeMonth = now;
      }
      if (used >= 30) {
        const error = new Error("Plus monthly download limit reached");
        error.status = 429;
        throw error;
      }
      await prisma.user.update({
        where: { id: BigInt(userId) },
        data: {
          downloadsUsedMonth: used + 1,
          downloadsMonthStartsAt: activeMonth,
        },
      });
    }

    return {
      track: mapTrack(music),
      download_url: resolveStorageUrl(music.audioPath),
      filename: `${music.name || "track"}.mp3`,
    };
  },

  async markMusicPopular(id, popular) {
    const row = await prisma.music.update({
      where: { id: BigInt(id) },
      data: { isPopular: Boolean(popular) },
      select: trackSelect,
    });
    return mapTrack(row);
  },

  async markArtistPopular(id, popular) {
    const row = await prisma.artist.update({
      where: { id: BigInt(id) },
      data: { isPopular: Boolean(popular) },
      select: artistSelect,
    });
    return mapArtist(row);
  },
};
