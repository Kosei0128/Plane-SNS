import { SignJWT, jwtVerify } from "jose";

export type AdminUser = {
  id: string;
  username: string;
  role: "admin" | "editor";
};

// This is still a simplified user store. In a real production environment,
// you would fetch user credentials from a secure database.
const ADMIN_USERS = [
  { id: "admin-1", username: "admin", password: "admin123", role: "admin" as const },
  { id: "admin-2", username: "editor", password: "editor123", role: "editor" as const },
];

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "ADMIN_JWT_SECRET is not set in the environment variables. Please check your .env.local file.",
  );
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Validates the provided username and password against the hardcoded list.
 * In production, this should query a database.
 * @param username The admin's username.
 * @param password The admin's password.
 * @returns The user object if credentials are valid, otherwise null.
 */
export function validateAdminCredentials(
  username: string,
  password: string,
): (Omit<AdminUser, "id"> & { id: string }) | null {
  const user = ADMIN_USERS.find((u) => u.username === username && u.password === password);
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

/**
 * Creates a JWT for a given admin user.
 * @param user The user object to encode in the token.
 * @returns A promise that resolves with the signed JWT string.
 */
export async function createAdminSession(user: AdminUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.ADMIN_SESSION_DURATION || "7d")
    .sign(secretKey);

  return token;
}

/**
 * Verifies a JWT and returns its payload if valid.
 * @param token The JWT string to verify.
 * @returns A promise that resolves with the user payload if the token is valid, otherwise null.
 */
export async function verifyAdminSession(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (
      payload &&
      typeof payload.sub === "string" &&
      typeof payload.username === "string" &&
      (payload.role === "admin" || payload.role === "editor")
    ) {
      return {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      };
    }
    return null;
  } catch (error) {
    // This will catch expired tokens, invalid signatures, etc.
    console.error("Admin session verification failed:", error);
    return null;
  }
}
