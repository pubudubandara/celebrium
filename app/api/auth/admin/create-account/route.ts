import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/mongodb";

const createAccountSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  username: z.string().trim().min(3).max(30).regex(/^[a-z0-9_-]+$/).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid account details.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const database = await getDatabase();
    const users = database.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ username: 1 }, { unique: true });

    const { password, ...accountData } = parsed.data;
    const passwordHash = await hash(password, 12);
    const result = await users.insertOne({
      ...accountData,
      passwordHash,
      role: "super_admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("E11000")) {
      return NextResponse.json({ error: "An account with that email or username already exists." }, { status: 409 });
    }
    console.error("Admin account creation failed", error);
    return NextResponse.json({ error: "Account service is unavailable." }, { status: 503 });
  }
}
