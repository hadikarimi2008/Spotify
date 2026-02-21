/**
 * @project     Spotify Clone - Next.js
 * @author      Hadi (https://github.com/hadikarimi2008)
 * @copyright   Copyright (c) 2026 Hadi. All rights reserved.
 * @license     Proprietary - No unauthorized copying or distribution.
 * @published   February 21, 2026
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function setAdmin() {
  try {
    const user = await prisma.user.update({
      where: { email: "hadikarimi@gmail.com" },
      data: { isAdmin: true },
    });
    console.log("✅ User set as admin:", user.email);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
