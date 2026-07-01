import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { loginRequest, registerRequest } from "../services/auth.service.js";

export const AuthContext = createContext({});

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
      } catch (error) {
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

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.Authorization;
      setUser(null);
      navigate("/", { replace: true });
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [navigate]);

  async function login({ email, password }) {
    const data = await loginRequest({ email, password });

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

    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    setUser({
      ...data.usuario,
      authenticated: true,
    });

    return data;
  }

  async function logout() {
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
  }

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
