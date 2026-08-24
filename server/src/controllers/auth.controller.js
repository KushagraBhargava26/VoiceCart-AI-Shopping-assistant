import { loginUser, signupUser, googleAuthUser, getOrCreateDefaultUser } from "../services/auth.service.js";

function sendError(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}

export async function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !email.trim()) {
    return sendError(res, 422, "VALIDATION_ERROR", "A valid email address is required.");
  }

  try {
    const userData = await loginUser({ email, password });
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    sendError(res, 500, "AUTH_ERROR", "Failed to sign in. Please try again.");
  }
}

export async function handleSignup(req, res) {
  const { name, email, password } = req.body;

  if (!email || !email.trim()) {
    return sendError(res, 422, "VALIDATION_ERROR", "Email address is required.");
  }

  try {
    const userData = await signupUser({ name: name || "User", email, password });
    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.error("Error signing up:", err);
    sendError(res, 500, "AUTH_ERROR", "Failed to create account. Please try again.");
  }
}

export async function handleGoogleAuth(req, res) {
  const { name, email } = req.body;

  try {
    const userData = await googleAuthUser({ name, email });
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.error("Error with Google auth:", err);
    sendError(res, 500, "AUTH_ERROR", "Google authentication failed. Please try again.");
  }
}

export async function handleGetMe(req, res) {
  try {
    const defaultUser = await getOrCreateDefaultUser();
    res.status(200).json({
      success: true,
      data: {
        id: defaultUser.id,
        name: defaultUser.name,
        email: defaultUser.email,
      },
    });
  } catch (err) {
    sendError(res, 500, "DATABASE_ERROR", "Could not fetch user profile.");
  }
}
