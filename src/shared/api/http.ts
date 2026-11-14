type ErrorResponse = { mensaje?: string; detail?: string };

const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function urlApi(path: string) {
  return `${apiBase}/api/${path}`;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function enviar(path: string, options: RequestInit = {}) {
  const response = await fetch(urlApi(path), {
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const data: ErrorResponse | null = await response.json().catch(() => null);
    const fallback = {
      401: "Sesión no válida. Inicie sesión.",
      403: "No tiene permiso para realizar esta acción.",
    };
    const message =
      fallback[response.status as keyof typeof fallback] ??
      `No se pudo completar la operación (${response.status}).`;
    throw new ApiError(
      response.status,
      data?.mensaje || data?.detail || message,
    );
  }
  return response;
}

export async function consultar<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await enviar(path, options);
  return response.json();
}

export async function cambiar(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  data?: object,
) {
  await enviar(path, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function mensajeError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}
