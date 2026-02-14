const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function resetAdminPassword() {
  try {
    const email = "hadikarimi@gmail.com";
    const password = "57608790";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      const user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          isAdmin: true,
        },
      });
      console.log("✅ User password updated and set as admin:", user.email);
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          name: "Hadi",
          email: email,
          password: hashedPassword,
          isAdmin: true,
        },
      });
      console.log("✅ New admin user created:", user.email);
    }

    console.log("✅ Admin account ready!");
    console.log("   Email:", email);
    console.log("   Password:", password);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

