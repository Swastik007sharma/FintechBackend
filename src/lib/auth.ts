import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BASE_URL || "http://localhost:3000",

  trustedOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(",") 
    : [],
    
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: { type: "string" },
      status: { type: "string" },
      deletedAt: { type: "date" },
    },
  },
});
