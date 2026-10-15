import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "celebrium_admin_session";

function getSecret() {
  return new TextEncoder().encode("celebrium-local-development-session-key");
}

export async function createSessionToken(user: {
  id: string;
  fullName: string;
  username: string;
  role: "super_admin";
}) {
  return new SignJWT({ fullName: user.fullName, username: user.username, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  if (payload.role !== "super_admin" || typeof payload.sub !== "string") {
    throw new Error("Invalid admin session");
  }
  return payload;
}
