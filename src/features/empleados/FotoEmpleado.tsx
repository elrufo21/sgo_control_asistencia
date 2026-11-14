import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, Fingerprint } from "lucide-react";
import { Button, FileInput } from "../../shared/ui/Controls";
import FotoPersonal from "../../shared/ui/FotoPersonal";
import { capturarHuella, type Empleado, type ImagenHuella } from "./api";
import { mensajeError, urlApi } from "../../shared/api/http";
import { ImagenHuellaVista } from "./ImagenHuellaVista";

export default function FotoEmpleado({
  empleado,
  foto,
  setFoto,
  eliminar,
  setEliminar,
  setError,
  onHuellaRegistrada,
}: {
  empleado: Partial<Empleado>;
  foto: File | null;
  setFoto: (foto: File | null) => void;
  eliminar: boolean;
  setEliminar: (eliminar: boolean) => void;
  setError: (mensaje: string) => void;
  onHuellaRegistrada: () => void;
}) {
  const [preview, setPreview] = useState("");
  const [lecturas, setLecturas] = useState(0),
    [capturando, setCapturando] = useState(false),
    [huella, setHuella] = useState(Boolean(empleado.tieneHuella)),
    [mensaje, setMensaje] = useState("");
  const [imagenHuella, setImagenHuella] = useState<ImagenHuella | null>(null);
  const control = useRef<AbortController | null>(null);
  useEffect(() => () => control.current?.abort(), []);
  useEffect(() => {
    if (!foto) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(foto);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);
  const src =
    preview ||
    (!eliminar && empleado.id && empleado.tieneFoto
      ? urlApi(`empleados/${empleado.id}/foto`)
      : "");
  function seleccionar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 3 * 1024 * 1024 ||
      file.size === 0
    ) {
      setError("Selecciona una foto JPG, PNG o WEBP de hasta 3 MB.");
      return;
    }
    setError("");
    setFoto(file);
    setEliminar(false);
  }
  function quitar() {
    setFoto(null);
    setEliminar(true);
    setError("");
  }
  async function capturar() {
    if (!empleado.id || control.current) return;
    if (
      huella &&
      lecturas === 0 &&
      !window.confirm(
        "¿Deseas reemplazar la huella registrada de este empleado?",
      )
    )
      return;
    const abort = new AbortController();
    control.current = abort;
    setCapturando(true);
    setImagenHuella(null);
    setError("");
    setMensaje("Coloca el dedo en el lector.");
    try {
      let ultimaLectura = lecturas;
      while (!abort.signal.aborted) {
        const result = await capturarHuella(empleado.id, abort.signal);
        if (abort.signal.aborted) return;
        setImagenHuella(result.imagen || null);
        if (result.registrada) {
          setHuella(true);
          setLecturas(0);
          setMensaje("Huella registrada correctamente.");
          onHuellaRegistrada();
          break;
        }
        if (
          !Number.isInteger(result.lecturas) ||
          result.lecturas <= ultimaLectura ||
          result.lecturas > 2
        )
          throw new Error("No se pudo continuar el registro de huella.");
        ultimaLectura = result.lecturas;
        setLecturas(result.lecturas);
        setMensaje(
          `Lectura ${result.lecturas} de 3 completada. Retira el dedo y vuelve a colocarlo.`,
        );
      }
    } catch (error) {
      if (!abort.signal.aborted) setMensaje(mensajeError(error));
    } finally {
      if (!abort.signal.aborted) setCapturando(false);
      control.current = null;
    }
  }
  return (
    <div className="employee-media">
      <FotoPersonal
        className="employee-photo"
        src={src}
        nombre={`${empleado.nombres || ""} ${empleado.apellidos || ""}`.trim()}
        iconSize={42}
      />
      <div className="employee-media-details">
        <strong>Fotografía</strong>
        <span>JPG, PNG o WEBP · máximo 3 MB</span>
        <label className="photo-upload">
          <Camera size={16} /> Seleccionar foto
          <FileInput
            accept="image/jpeg,image/png,image/webp"
            onChange={seleccionar}
          />
        </label>
        {(foto || (!eliminar && empleado.tieneFoto)) && (
          <Button type="button" variant="secondary" onClick={quitar}>
            Quitar foto
          </Button>
        )}
      </div>
      <div className="fingerprint-status">
        <Fingerprint size={20} />
        <div className="fingerprint-info">
          <strong>Huella: {huella ? "registrada" : "sin registrar"}</strong>
          <span aria-live="polite">
            {empleado.id
              ? mensaje ||
                "Se requieren tres lecturas del mismo dedo. La huella se guarda al terminar."
              : "Guarda primero al empleado para registrar su huella."}
          </span>
          {empleado.id && (
            <Button
              type="button"
              variant="secondary"
              disabled={capturando || empleado.estado === "INACTIVO"}
              onClick={capturar}
            >
              {capturando
                ? "Esperando lectura..."
                : lecturas
                  ? "Continuar registro"
                  : huella
                    ? "Reemplazar huella"
                    : "Registrar huella"}
            </Button>
          )}
          {empleado.estado === "INACTIVO" && (
            <span>La captura requiere un empleado activo.</span>
          )}
        </div>
      </div>
      {empleado.id && (
        <div className="fingerprint-preview">
          {imagenHuella ? (
            <ImagenHuellaVista imagen={imagenHuella} />
          ) : (
            <div className="fingerprint-preview-empty" aria-hidden="true">
              <Fingerprint size={38} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
