// All secrets come from environment variables in production.
// Local: copy `.env.example` to `.env` in this folder.
export const config = {
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev-only-change-me",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
};
