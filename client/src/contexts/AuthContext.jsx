import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { loginRequest, registerRequest } from "../services/auth.service.js";
import { AuthContext } from "./authContext";

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("refreshToken");
      setUser(null);
      setLoadingAuth(false);
      return;
    }

    api.defaults.headers.Authorization = `Bearer ${token}`;

    async function loadUser() {
      try {
        const response = await api.get("/me");
        setUser({
          ...response.data,
          authenticated: true,
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.Authorization;
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    }

    loadUser();
  }, []);

  async function login({ email, password }) {
    const data = await loginRequest({ email, password });

    if (data.requireVerification) {
      return data;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    setUser({
      ...data.usuario,
      authenticated: true,
    });

    return data;
  }

  async function register(formData) {
    const data = await registerRequest(formData);

    if (data.requireVerification) {
      return data;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    setUser({
      ...data.usuario,
      authenticated: true,
    });

    return data;
  }

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken }, { skipAuthRedirect: true });
      }
    } catch (error) {
      console.warn("Erro ao encerrar sessão no servidor", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      delete api.defaults.headers.Authorization;
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = async () => {
      await logout();
      navigate("/", { replace: true });
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [logout, navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadingAuth,
        login,
        register,
        logout,
        authenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
