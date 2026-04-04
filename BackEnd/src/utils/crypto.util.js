import crypto from "crypto";

export const generateJoinCode = (length = 6) =>
  crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length).toUpperCase();
