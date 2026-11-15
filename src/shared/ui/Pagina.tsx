import { Plus } from "lucide-react";
import { Button } from "./Controls";

export function Encabezado({
  titulo,
  descripcion,
  nuevo,
}: {
  titulo: string;
  descripcion: string;
  nuevo?: { nombre: string; abrir: () => void };
}) {
  return (
    <div className="heading">
      <div>
        <div className="eyebrow">
          <span /> GESTIÓN HOSPITALARIA
        </div>
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
      </div>
      {nuevo && (
        <Button onClick={nuevo.abrir}>
          <Plus size={18} /> Nuevo {nuevo.nombre}
        </Button>
      )}
    </div>
  );
}

export function ErrorVista({
  mensaje,
  className,
}: {
  mensaje: string;
  className?: string;
}) {
  if (!mensaje) return null;
  return (
    <div className={className ? `error ${className}` : "error"} role="alert">
      {mensaje}
    </div>
  );
}

export function AccionesFormulario({
  guardando,
  cancelar,
  eliminar,
}: {
  guardando: boolean;
  cancelar: () => void;
  eliminar?: () => void;
}) {
  return (
    <div className="dialog-actions">
      {eliminar && (
        <Button
          type="button"
          variant="secondary"
          onClick={eliminar}
          disabled={guardando}
        >
          Eliminar
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={cancelar}
        disabled={guardando}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar registro"}
      </Button>
    </div>
  );
}
