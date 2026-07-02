import { api } from "./api";

export async function loginRequest(data) {
  const response = await api.post("/login", data, { skipAuthRedirect: true });
  return response.data;
}

export async function registerRequest(data) {
  const response = await api.post("/cadastro", data, { skipAuthRedirect: true });
  return response.data;
}
export async function verifyEmailRequest(data) {
  const response = await api.post("/verificar-email", data, { skipAuthRedirect: true });
  return response.data;
}

export async function resendVerificationRequest(data) {
  const response = await api.post("/reenviar-verificacao", data, { skipAuthRedirect: true });
  return response.data;
}
