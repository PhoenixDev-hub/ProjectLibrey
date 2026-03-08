import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { loginRequest, registerRequest } from "../services/auth.service.js";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        setUser({
          id: decoded.id,
          tipoUsuario: decoded.tipoUsuario,
          authenticated: true,
        });

        api.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setLoadingAuth(false);
  }, []);

  async function login({ email, password }) {
    const data = await loginRequest({ email, password });

    const decoded = jwtDecode(data.token);

    localStorage.setItem("token", data.token);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    setUser({
      id: decoded.id,
      tipoUsuario: decoded.tipoUsuario,
      authenticated: true,
    });

    return data;
  }

  async function register(formData) {
    const data = await registerRequest(formData);

    const decoded = jwtDecode(data.token);

    localStorage.setItem("token", data.token);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    setUser({
      id: decoded.id,
      tipoUsuario: decoded.tipoUsuario,
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
