// pages/api/auth/csrf.js

import { getCsrfToken } from "next-auth/react";

export default async function handler(req, res) {
  const csrfToken = await getCsrfToken({ req });
  if (!csrfToken) {
    return res.status(500).json({ error: "Impossible de générer le CSRF token" });
  }
  res.status(200).json({ csrfToken });
}
