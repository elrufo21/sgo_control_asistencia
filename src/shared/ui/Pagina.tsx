import { Plus } from "lucide-react";
import { Button } from "./Controls";
import { Toast } from "./Toast";

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
  cerrar,
}: {
  mensaje: string;
  cerrar?: () => void;
}) {
  return <Toast key={mensaje} mensaje={mensaje} cerrar={cerrar} />;
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
