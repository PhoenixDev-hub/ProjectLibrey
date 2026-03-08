import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
