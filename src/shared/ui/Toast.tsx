import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import "./toast.css";

export function Toast({ mensaje, tipo = "error", cerrar }: { mensaje: string; tipo?: "error" | "exito"; cerrar?: () => void }) {
  const [visible, setVisible] = useState(true);
  const cerrarRef = useRef(cerrar);
  cerrarRef.current = cerrar;
  useEffect(() => {
    if (!mensaje) return;
    const timer = window.setTimeout(() => { setVisible(false); cerrarRef.current?.(); }, 8000);
    return () => window.clearTimeout(timer);
  }, [mensaje]);
  if (!mensaje || !visible) return null;
  const Icono = tipo === "exito" ? CheckCircle2 : CircleAlert;
  return createPortal(<div className={`toast toast-${tipo}`} role={tipo === "error" ? "alert" : "status"}>
    <div className="toast-icono"><Icono size={16} aria-hidden="true" /></div>
    <span>{mensaje}</span>
    <button type="button" onClick={() => { setVisible(false); cerrarRef.current?.(); }} aria-label="Cerrar notificación"><X size={16} /></button>
  </div>, document.body);
}
