import { useEffect } from "react";
import { CircleAlert, X } from "lucide-react";
import "./toast.css";

export function ToastError({ mensaje, cerrar }: { mensaje: string; cerrar: () => void }) {
  useEffect(() => {
    if (!mensaje) return;
    const timer = window.setTimeout(cerrar, 8000);
    return () => window.clearTimeout(timer);
  }, [mensaje, cerrar]);

  if (!mensaje) return null;
  return (
    <div className="toast-error" role="alert">
      <CircleAlert size={20} aria-hidden="true" />
      <span>{mensaje}</span>
      <button type="button" onClick={cerrar} aria-label="Cerrar notificación">
        <X size={18} />
      </button>
    </div>
  );
}
