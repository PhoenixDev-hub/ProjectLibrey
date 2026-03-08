import { api } from "./api.js";

export async function requestPasswordReset(email) {
    const response = await api.post("/auth/request-password-reset", { email});
    return response.data;


}

export async function validateResetToken(token, email) {
    const response = await api.post ("/auth/validate-reset-token", { token, email });
    return response.data;
}

export async function resetPassword(data) {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
}
