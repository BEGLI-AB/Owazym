import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const port = Number(process.env.PORT || 4000);

export const env = {
  port,
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  uploadBaseUrl: (process.env.UPLOAD_BASE_URL || `http://localhost:${port}/storage`).replace(/\/$/, ""),
  storagePublicPath:
    process.env.STORAGE_PUBLIC_PATH ||
    path.resolve(process.cwd(), "..", "laravel", "storage", "app", "public"),
};
