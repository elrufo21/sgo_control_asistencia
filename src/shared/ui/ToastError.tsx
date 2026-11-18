import { Toast } from "./Toast";

export function ToastError({ mensaje, cerrar }: { mensaje: string; cerrar: () => void }) {
  return <Toast key={mensaje} mensaje={mensaje} cerrar={cerrar} />;
}
