import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.user.update({
      where: { email: "hadikarimi@gmail.com" },
      data: { isAdmin: true },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${user.email} is now an admin` 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

