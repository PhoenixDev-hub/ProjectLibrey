import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRouter";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
