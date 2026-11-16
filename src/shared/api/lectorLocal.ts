import { ApiError } from "./http";

const url = "http://127.0.0.1:5195";
export const usaLectorLocal = Boolean(import.meta.env.VITE_API_URL);
let token: string | null = null;

async function enviar<T>(ruta: string, signal: AbortSignal, body: object = {}, autenticado = false): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${url}${ruta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(autenticado && token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("No se detectó el lector de huella. Inicia el intermediario en esta computadora.");
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    if (respuesta.status === 401 && autenticado) token = null;
    throw new ApiError(respuesta.status, datos.mensaje || "No se pudo procesar la lectura.");
  }
  return datos as T;
}

export function marcarLocal<T>(signal: AbortSignal, modo: string) {
  return enviar<T>("/marcar", signal, { modo });
}

export function registrarAtencionLocal<T>(signal: AbortSignal, datos: object) {
  return enviar<T>("/atencion", signal, datos);
}

export function confirmarLocal<T>(signal: AbortSignal, tokenConfirmacion: string) {
  return enviar<T>("/confirmar", signal, { token: tokenConfirmacion });
}

export function capturarLocal<T>(id: number, signal: AbortSignal) {
  return enviar<T>(`/empleados/${id}/huella`, signal, {}, true);
}

export async function iniciarSesionLector(usuario: string, clave: string, signal: AbortSignal) {
  const resultado = await enviar<{ token: string }>("/sesion", signal, { usuario, clave });
  token = resultado.token;
}

export function tieneSesionLector() { return token !== null; }

export function cerrarSesionLector() {
  const anterior = token;
  token = null;
  if (!anterior) return;
  void fetch(`${url}/salir`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${anterior}` },
    body: "{}",
  }).catch(() => {});
}
