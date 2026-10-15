import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  try {
    const session = await verifySessionToken(token);
    return NextResponse.json({
      fullName: typeof session.fullName === "string" ? session.fullName : session.username,
      username: session.username,
    });
  } catch {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }
}
