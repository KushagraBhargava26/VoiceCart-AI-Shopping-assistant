import prisma from "../config/prisma.js";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Ensures default guest user exists in DB.
 */
export async function getOrCreateDefaultUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: "Guest User",
        email: "guest@voicecart.ai",
      },
    });
  }

  return user;
}

/**
 * Log in an existing user or create a user by email.
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Auto-register for clean UX if first time signing in with email
    const defaultName = normalizedEmail.split("@")[0];
    user = await prisma.user.create({
      data: {
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: normalizedEmail,
      },
    });
  }

  return {
    id: user.id,
    name: user.name || "VoiceCart User",
    email: user.email,
    token: `token_${user.id}_${Date.now()}`,
  };
}

/**
 * Register a new user account.
 */
export async function signupUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return loginUser({ email: normalizedEmail, password });
  }

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
    },
  });

  // Ensure user has a default shopping list created
  await prisma.shoppingList.create({
    data: {
      name: `${user.name}'s Shopping List`,
      userId: user.id,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: `token_${user.id}_${Date.now()}`,
  };
}

/**
 * Authenticate via Google SSO payload.
 */
export async function googleAuthUser({ name, email }) {
  const normalizedEmail = (email || `google_user_${Date.now()}@voicecart.ai`).toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name || "Google User",
        email: normalizedEmail,
      },
    });

    await prisma.shoppingList.create({
      data: {
        name: `${user.name}'s Shopping List`,
        userId: user.id,
      },
    });
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: `token_${user.id}_${Date.now()}`,
  };
}
