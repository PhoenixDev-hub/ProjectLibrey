import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Cadastro from "../pages/Auth/Cadastro";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Login from "../pages/Auth/Login";
import ResetPassword from "../pages/Auth/ResetPassword";
import PrivateRoute from "./PrivateRoute";

const Home = lazy(() => import("../pages/Dashboard/Home"));

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/:tab"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/leitores" element={<Navigate to="/dashboard/leitores" replace />} />
        <Route path="/catalogo" element={<Navigate to="/dashboard/catalogo" replace />} />
        <Route path="/emprestimos" element={<Navigate to="/dashboard/emprestimos" replace />} />
        <Route path="/reservas" element={<Navigate to="/dashboard/reservas" replace />} />
        <Route path="/ajuda" element={<Navigate to="/dashboard/ajuda" replace />} />
        <Route path="/configuracoes" element={<Navigate to="/dashboard/configuracoes" replace />} />
      </Routes>
    </Suspense>
  );
}
