import jwt from "jsonwebtoken"
import { config } from "../config/env.js"

export function autenticar(req, res, next) {
    const authHeader = req.headers.authorization

    if(!authHeader) {
        return res.status(401).json({ error: "Token não fornecido"})
    }

    const [, token] = authHeader.split(" ")

    try {
        const decoded = jwt.verify(token, config.jwt.secret)
        req.usuario = decoded
        next()
    } catch (error) {
         return res.status(401).json({ error: "Token inválido ou expirado" })
    }
}
