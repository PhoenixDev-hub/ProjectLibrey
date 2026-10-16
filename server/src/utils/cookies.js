import crypto from "crypto";


const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const CSRF_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function baseFlags(httpOnly) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie("access_token", accessToken, { ...baseFlags(true), maxAge: ACCESS_MAX_AGE });
  res.cookie("refresh_token", refreshToken, { ...baseFlags(true), maxAge: REFRESH_MAX_AGE });
}

export function ensureCsrfCookie(req, res) {
  const value = req?.cookies?.csrf_token || crypto.randomBytes(32).toString("hex");
  res.cookie("csrf_token", value, { ...baseFlags(false), maxAge: CSRF_MAX_AGE });
  return value;
}

export function clearAuthCookies(res) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  res.clearCookie("csrf_token", { path: "/" });
}
