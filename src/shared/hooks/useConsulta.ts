import { useEffect, useState } from "react";
import { mensajeError } from "../api/http";

export function useConsulta<T>(consultar: (signal: AbortSignal) => Promise<T>) {
  const [datos, setDatos] = useState<T>();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    setCargando(true);
    setError("");
    consultar(control.signal)
      .then((resultado) => {
        if (!control.signal.aborted) setDatos(resultado);
      })
      .catch((error: unknown) => {
        if (control.signal.aborted) return;
        setDatos(undefined);
        setError(mensajeError(error));
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false);
      });
    return () => control.abort();
  }, [consultar, revision]);

  return {
    datos,
    cargando,
    error,
    recargar: () => setRevision((actual) => actual + 1),
  };
}
