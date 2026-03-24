import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute({ children }) {
  const { user, loadingAuth } = useAuth();

  // Aguarda a verificação do token no localStorage antes de decidir
  if (loadingAuth) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}>
        Carregando...
      </div>
    );
  }

  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
