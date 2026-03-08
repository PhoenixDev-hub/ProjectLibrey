
export function roleMiddleware(perfisPermitidos) {
    return ( req, res, next) => {
        const { tipoUsuario } = req.user

        if (!perfisPermitidos.includes(tipoUsuario)) {
            return res.status(403).json({
                error: "Acesso negado",
            })
        }

        next()
    }
}
