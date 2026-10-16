import crypto from "crypto"
import jwt from "jsonwebtoken"
import { config } from "../config/env.js"

const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"]

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) {
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

export function autenticar(req, res, next) {
    const authHeader = req.headers.authorization
    let token = null
    let authSource = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7)
        authSource = "header"
    } else if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token
        authSource = "cookie"
    }

    if (!token) {
        return res.status(401).json({ error: "Token não fornecido"})
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret)
        req.usuario = decoded
        req.authSource = authSource

        if (authSource === "cookie" && MUTATING_METHODS.includes(req.method)) {
            const headerToken = req.headers["x-csrf-token"]
            const cookieToken = req.cookies.csrf_token
            if (!headerToken || !cookieToken || !safeEqual(headerToken, cookieToken)) {
                return res.status(403).json({ error: "CSRF token inválido ou ausente" })
            }
        }

        next()
    } catch (error) {
         return res.status(401).json({ error: "Token inválido ou expirado" })
    }
}
