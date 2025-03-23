import cookieParser from "cookie-parser";

export const cookieParserOptions: cookieParser.CookieParseOptions = {};

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
  domain: process.env.NODE_ENV === "production" ? "egwinch.com" : "localhost",
};
