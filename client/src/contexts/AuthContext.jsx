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
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.Authorization;

    let cancelled = false;

    async function loadUser() {
      try {
        const response = await api.get("/me", { skipAuthRedirect: true });
        if (!cancelled) {
          setUser({ ...response.data, authenticated: true });
        }
        return;
      } catch (error) {
        if (cancelled) return;

        if (error.response?.status !== 401) {
          setUser(null);
          return;
        }

        try {
          await api.post("/auth/refresh", {}, { skipAuthRedirect: true, __isRetry: true });
          const response = await api.get("/me", { skipAuthRedirect: true });
          if (!cancelled) {
            setUser({ ...response.data, authenticated: true });
          }
        } catch {
          if (!cancelled) {
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingAuth(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login({ email, password }) {
    const data = await loginRequest({ email, password });

    if (data.requireVerification) {
      return data;
    }

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

    setUser({
      ...data.usuario,
      authenticated: true,
    });

    return data;
  }

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {}, { skipAuthRedirect: true });
    } catch (error) {
      console.warn("Erro ao encerrar sessão no servidor", error);
    } finally {
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
