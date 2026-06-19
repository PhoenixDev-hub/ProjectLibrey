import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { loginRequest, registerRequest } from "../services/auth.service.js";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
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

    localStorage.setItem("token", data.token);
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
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    setUser({
      ...data.usuario,
      authenticated: true,
    });

    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    delete api.defaults.headers.Authorization;
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
