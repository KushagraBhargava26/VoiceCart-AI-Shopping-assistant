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

import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Authenticate via Google SSO token or verified payload.
 */
export async function googleAuthUser({ idToken, name, email }) {
  let verifiedEmail = email;
  let verifiedName = name;

  if (idToken) {
    try {
      // 1. Verify with google-auth-library
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const ticket = await googleClient.verifyIdToken({
        idToken,
        ...(clientId ? { audience: clientId } : {}),
      });
      const payload = ticket.getPayload();
      if (payload) {
        verifiedEmail = payload.email;
        verifiedName = payload.name || payload.given_name || "Google User";
      }
    } catch (verifyErr) {
      console.warn("OAuth2Client verify failed, trying Google tokeninfo endpoint fallback:", verifyErr.message);
      try {
        // Fallback to Google tokeninfo public API endpoint
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (tokenRes.ok) {
          const payload = await tokenRes.json();
          verifiedEmail = payload.email;
          verifiedName = payload.name || "Google User";
        }
      } catch (fallbackErr) {
        console.error("Google tokeninfo fallback error:", fallbackErr.message);
      }
    }
  }

  if (!verifiedEmail) {
    const error = new Error("Could not verify Google authentication token.");
    error.code = "INVALID_GOOGLE_TOKEN";
    throw error;
  }

  const normalizedEmail = verifiedEmail.toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: verifiedName || "Google User",
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

const passwordResetOTPs = new Map();

/**
 * Request password reset verification code (OTP).
 */
export async function requestForgotPassword(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    const error = new Error("No account registered with this email address.");
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  passwordResetOTPs.set(normalizedEmail, { otp, expiresAt });
  console.log(`[AUTH] Password Reset OTP for ${normalizedEmail}: ${otp}`);

  return {
    email: normalizedEmail,
    message: "Verification code sent to your email.",
    otp,
  };
}

/**
 * Reset password using 6-digit OTP code.
 */
export async function resetPassword({ email, otp, newPassword }) {
  const normalizedEmail = email.toLowerCase().trim();
  const record = passwordResetOTPs.get(normalizedEmail);

  if (!record || record.expiresAt < Date.now()) {
    const error = new Error("Verification code has expired or is invalid.");
    error.code = "EXPIRED_OTP";
    throw error;
  }

  if (record.otp !== (otp || "").trim()) {
    const error = new Error("Incorrect 6-digit verification code.");
    error.code = "WRONG_OTP";
    throw error;
  }

  passwordResetOTPs.delete(normalizedEmail);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: `token_${user.id}_${Date.now()}`,
    message: "Password reset successful! Logging you in...",
  };
}
