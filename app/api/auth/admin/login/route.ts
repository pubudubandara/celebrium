import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/mongodb";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

const loginRequestSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Username/email and password are required." }, { status: 400 });
  }

  try {
    const database = await getDatabase();
    const identifier = parsed.data.identifier.toLowerCase();
    const user = await database.collection("users").findOne({
      role: "super_admin",
      $or: [{ email: identifier }, { username: identifier }],
      isActive: true,
    });

    if (!user || typeof user.passwordHash !== "string" || !(await compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await createSessionToken({
      id: String(user._id),
      fullName: user.fullName,
      username: user.username,
      role: "super_admin",
    });
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
}
