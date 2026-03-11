import { adminService } from "../services/admin.service.js";
import { ok } from "../utils/response.js";

export const adminController = {
  async createData(req, res, next) {
    try {
      const data = await adminService.getCreateData({
        artistQ: req.query.artist_q,
        musicQ: req.query.music_q,
        categoryQ: req.query.category_q,
        locale: req.query.locale,
      });
      return ok(res, data);
    } catch (error) {
      return next(error);
    }
  },

  async createArtist(req, res, next) {
    try {
      const data = await adminService.createArtist(req.body);
      return ok(res, data, "Artist created", 201);
    } catch (error) {
      return next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const data = await adminService.createCategory(req.body);
      return ok(res, data, "Category created", 201);
    } catch (error) {
      return next(error);
    }
  },

  async addArtistPopular(req, res, next) {
    try {
      const data = await adminService.setArtistPopular(req.params.id, true);
      return ok(res, data, "Artist added to popular");
    } catch (error) {
      return next(error);
    }
  },

  async hideArtist(req, res, next) {
    try {
      const data = await adminService.setArtistVisibility(req.params.id, false);
      return ok(res, data, "Artist hidden for users");
    } catch (error) {
      return next(error);
    }
  },

  async showArtist(req, res, next) {
    try {
      const data = await adminService.setArtistVisibility(req.params.id, true);
      return ok(res, data, "Artist is visible for users");
    } catch (error) {
      return next(error);
    }
  },

  async removeArtistPopular(req, res, next) {
    try {
      const data = await adminService.setArtistPopular(req.params.id, false);
      return ok(res, data, "Artist removed from popular");
    } catch (error) {
      return next(error);
    }
  },

  async createMusic(req, res, next) {
    try {
      const data = await adminService.createMusic(req.body);
      return ok(res, data, "Music created", 201);
    } catch (error) {
      return next(error);
    }
  },

  async addMusicPopular(req, res, next) {
    try {
      const data = await adminService.setMusicPopular(req.params.id, true);
      return ok(res, data, "Music added to popular");
    } catch (error) {
      return next(error);
    }
  },

  async removeMusicPopular(req, res, next) {
    try {
      const data = await adminService.setMusicPopular(req.params.id, false);
      return ok(res, data, "Music removed from popular");
    } catch (error) {
      return next(error);
    }
  },

  async upsertBanner(req, res, next) {
    try {
      const data = await adminService.upsertBanner(req.body);
      return ok(res, data, "Banner saved");
    } catch (error) {
      return next(error);
    }
  },

  async deleteBanner(req, res, next) {
    try {
      await adminService.deleteBanner(req.params.id);
      return ok(res, null, "Banner deleted");
    } catch (error) {
      return next(error);
    }
  },

  async deleteArtist(req, res, next) {
    try {
      await adminService.deleteArtist(req.params.id);
      return ok(res, null, "Artist deleted");
    } catch (error) {
      return next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      await adminService.deleteCategory(req.params.id);
      return ok(res, null, "Category deleted");
    } catch (error) {
      return next(error);
    }
  },

  async deleteMusic(req, res, next) {
    try {
      await adminService.deleteMusic(req.params.id);
      return ok(res, null, "Music deleted");
    } catch (error) {
      return next(error);
    }
  },
};
