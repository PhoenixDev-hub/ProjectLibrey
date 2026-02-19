import { createContext, useState } from "react";
import { loginRequest, registerRequest } from "../services/auth.service";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login({ email, password }) {
    const data = await loginRequest({ email, password });

    localStorage.setItem("token", data.token);
    setUser(data.usuario);
  }

  async function register(formData) {
    const data = await registerRequest(formData);

    localStorage.setItem("token", data.token);
    setUser(data.usuario);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
