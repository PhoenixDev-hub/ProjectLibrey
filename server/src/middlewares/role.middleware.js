
export function roleMiddleware(perfisPermitidos) {
    return ( req, res, next) => {
        const { tipoUsuario } = req.usuario

        if (!perfisPermitidos.includes(tipoUsuario)) {
            return res.status(403).json({
                error: "Acesso negado",
            })
        }

        next()
    }
}

export const soBibliotecaria = roleMiddleware(['BIBLIOTECARIA', 'ADMINISTRADOR'])
