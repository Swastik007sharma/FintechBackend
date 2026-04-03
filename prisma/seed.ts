import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { auth } from "../src/lib/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ── Load seed data ─────────────────────────────────────────────────────────
const seedData = JSON.parse(
  readFileSync(resolve(__dirname, "seed-data.json"), "utf-8"),
) as {
  categories: { name: string; description?: string }[];
  users: { name: string; email: string; password: string; role: "ADMIN" | "ANALYST" | "VIEWER" }[];
  records: {
    userEmail: string;
    category: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    description?: string;
  }[];
};

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ─────────────────────────────────────────────────────────
  const categoryMap: Record<string, string> = {};

  for (const cat of seedData.categories) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name, description: cat.description },
    });
    categoryMap[cat.name] = record.id;
  }

  console.log(`  ✔ ${seedData.categories.length} categories seeded`);

  // ── Users + Accounts ───────────────────────────────────────────────────
  const userMap: Record<string, string> = {};

  for (const u of seedData.users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      const response = await auth.api.signUpEmail({
        body: {
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          status: "ACTIVE",
          deletedAt: null as unknown as Date,
        },
      });
      userId = response.user.id;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: u.role, status: "ACTIVE", emailVerified: true },
    });

    userMap[u.email] = userId;
  }

  console.log(`  ✔ ${seedData.users.length} users seeded`);
  for (const u of seedData.users) {
    console.log(`    ${u.email.padEnd(25)} / ${u.password.padEnd(12)} (${u.role})`);
  }

  // ── Financial Records ──────────────────────────────────────────────────
  const records = seedData.records.map((r) => ({
    amount: r.amount,
    type: r.type,
    date: new Date(r.date),
    description: r.description,
    userId: userMap[r.userEmail]!,
    categoryId: categoryMap[r.category]!,
  }));

  await prisma.financialRecord.createMany({ data: records });

  console.log(`  ✔ ${records.length} financial records seeded`);
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
