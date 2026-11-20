import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button, Field, Select } from "../../shared/ui/Controls";
import TextInput from "../../shared/ui/TextInput";
import { consultarHorario, guardarHorario, type Empleado } from "./api";
import { listarTurnos, guardarTurno, type Turno } from "../turnos/api";
import { mensajeError } from "../../shared/api/http";
import { ErrorVista } from "../../shared/ui/Pagina";
import { enfocarCampo } from "../../shared/ui/ValidacionFormulario";
import { usePermisos } from "../../shared/security/permisos";

const dias = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function HorarioSemanal({
  empleado,
  turnos,
  onClose,
}: {
  empleado: Empleado;
  turnos: Turno[];
  onClose: () => void;
}) {
  const puedeCrearTurnos = usePermisos("turnos").crear;
  const formularioRef = useRef<HTMLFormElement>(null);
  const [horario, setHorario] = useState<string[] | null>(null),
    [turnoRapido, setTurnoRapido] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [catalogo, setCatalogo] = useState(turnos),
    [crearTurno, setCrearTurno] = useState(false),
    [nuevo, setNuevo] = useState({
      nombre: "",
      entrada: "",
      salida: "",
      marcaciones: "4", salidaRefrigerio: "", retornoRefrigerio: "",
      toleranciaAntes: "60", toleranciaDespues: "60", minutosEntre: "60",
    });
  useEffect(() => {
    let active = true;
    consultarHorario(empleado.id)
      .then((result) => {
        if (!active) return;
        setHorario(
          dias.map((_, index) =>
            result.configurado
              ? String(
                  result.dias.find((d) => d.diaSemana === index + 1)?.turnoId ??
                    "",
                )
              : String(result.turnoAnterior ?? ""),
          ),
        );
      })
      .catch((e) => {
        if (active) setError(mensajeError(e));
      });
    return () => {
      active = false;
    };
  }, [empleado.id]);
  function asignar(indices: number[]) {
    setHorario(
      (current) =>
        current?.map((value, index) =>
          indices.includes(index) ? turnoRapido : value,
        ) ?? null,
    );
  }
  async function agregarTurno() {
    if (
      !nuevo.nombre.trim() ||
      !nuevo.entrada ||
      !nuevo.salida ||
      nuevo.entrada === nuevo.salida
    ) {
      setError("Ingresa un nombre y horas de entrada y salida diferentes.");
      const campo = !nuevo.nombre.trim() ? "nombreTurno" : !nuevo.entrada ? "entradaTurno" : "salidaTurno";
      enfocarCampo(formularioRef.current?.elements.namedItem(campo) as Element | null);
      return;
    }
    setBusy(true);
    setError("");
    let creado = false;
    try {
      await guardarTurno(undefined, {
        ...nuevo,
        nombre: nuevo.nombre.trim(),
        marcaciones: nuevo.marcaciones === "2" ? 2 : 4,
        salidaRefrigerio: nuevo.salidaRefrigerio || null,
        retornoRefrigerio: nuevo.retornoRefrigerio || null,
        toleranciaAntes: Number(nuevo.toleranciaAntes), toleranciaDespues: Number(nuevo.toleranciaDespues), minutosEntre: Number(nuevo.minutosEntre),
        estado: "ACTIVO",
      });
      creado = true;
      const actualizados = await listarTurnos();
      const anteriorIds = new Set(catalogo.map((t) => t.id));
      const agregado = actualizados.find((t) => !anteriorIds.has(t.id));
      setCatalogo(actualizados);
      if (agregado) setTurnoRapido(String(agregado.id));
      setNuevo({ nombre: "", entrada: "", salida: "", marcaciones: "4", salidaRefrigerio: "", retornoRefrigerio: "", toleranciaAntes: "60", toleranciaDespues: "60", minutosEntre: "60" });
      setCrearTurno(false);
    } catch (e) {
      setError(
        creado
          ? "Se creó el turno, pero no se pudo actualizar la lista. Cierra y abre el horario para verlo."
          : mensajeError(e),
      );
    } finally {
      setBusy(false);
    }
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!horario) return;
    setBusy(true);
    setError("");
    try {
      await guardarHorario(
        empleado.id,
        horario.map((turno, index) => ({
          diaSemana: index + 1,
          turnoId: turno ? Number(turno) : null,
        })),
      );
      onClose();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="dialog schedule-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="horario-title"
      >
        <div className="dialog-head">
          <div>
            <h2 id="horario-title">Horario semanal</h2>
            <p>
              {empleado.nombres} {empleado.apellidos} · {empleado.dni}
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <form ref={formularioRef} onSubmit={guardar}>
          <div className="schedule-content">
            {puedeCrearTurnos && <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setCrearTurno(!crearTurno);
                setError("");
              }}
            >
              {crearTurno ? "Cerrar nuevo turno" : "+ Crear turno"}
            </Button>}
            {crearTurno && (
              <div className="schedule-create">
                <strong>Nuevo turno</strong>
                <div className="schedule-create-grid">
                  <Field label="Nombre">
                    <TextInput
                      name="nombreTurno"
                      value={nuevo.nombre}
                      maxLength={100}
                      onChange={(e) =>
                        setNuevo({ ...nuevo, nombre: e.target.value })
                      }
                      placeholder="Ej. MAÑANA"
                    />
                  </Field>
                  <Field label="Entrada">
                    <TextInput
                      name="entradaTurno"
                      type="time"
                      value={nuevo.entrada}
                      onChange={(e) =>
                        setNuevo({ ...nuevo, entrada: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Salida">
                    <TextInput
                      name="salidaTurno"
                      type="time"
                      value={nuevo.salida}
                      onChange={(e) =>
                        setNuevo({ ...nuevo, salida: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Marcaciones">
                    <Select
                      value={nuevo.marcaciones}
                      onChange={(e) =>
                        setNuevo({ ...nuevo, marcaciones: e.target.value })
                      }
                    >
                      <option value="2">2 · Entrada y salida</option>
                      <option value="4">4 · Con refrigerio</option>
                    </Select>
                  </Field>
                  {nuevo.marcaciones === "4" && <><Field label="Salida a refrigerio"><TextInput type="time" value={nuevo.salidaRefrigerio} onChange={(e) => setNuevo({ ...nuevo, salidaRefrigerio: e.target.value })} /></Field><Field label="Retorno de refrigerio"><TextInput type="time" value={nuevo.retornoRefrigerio} onChange={(e) => setNuevo({ ...nuevo, retornoRefrigerio: e.target.value })} /></Field></>}
                  <Field label="Separación mínima (min)"><TextInput type="number" min="1" max="1440" value={nuevo.minutosEntre} onChange={(e) => setNuevo({ ...nuevo, minutosEntre: e.target.value })} /></Field>
                </div>
                <Button type="button" onClick={agregarTurno} disabled={busy}>
                  {busy ? "Guardando..." : "Guardar turno"}
                </Button>
              </div>
            )}
            {!catalogo.some((t) => t.estado === "ACTIVO") && (
              <div className="schedule-note">
                No hay turnos activos. Crea uno en el módulo Turnos para
                asignarlo al personal.
              </div>
            )}

            {horario && (
              <>
                <div className="schedule-quick">
                  <Field label="Aplicar un turno a varios días">
                    <Select
                      value={turnoRapido}
                      onChange={(e) => setTurnoRapido(e.target.value)}
                    >
                      <option value="">Día libre</option>
                      {catalogo
                        .filter((t) => t.estado === "ACTIVO")
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre} · {t.entrada} - {t.salida}
                          </option>
                        ))}
                    </Select>
                  </Field>
                  <div className="schedule-quick-buttons">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => asignar([0, 1, 2, 3, 4])}
                    >
                      Lunes a viernes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => asignar([0, 1, 2, 3, 4, 5, 6])}
                    >
                      Toda la semana
                    </Button>
                  </div>
                </div>
                <div className="schedule-days">
                  {dias.map((dia, index) => (
                    <div className="schedule-day" key={dia}>
                      <span>{dia}</span>
                      <Field label={`Turno de ${dia}`}>
                        <Select
                          value={horario[index]}
                          onChange={(e) => {
                            const next = e.target.value;
                            setHorario(
                              (current) =>
                                current?.map((value, i) =>
                                  i === index ? next : value,
                                ) ?? null,
                            );
                          }}
                        >
                          <option value="">Día libre</option>
                          {catalogo
                            .filter(
                              (t) =>
                                t.estado === "ACTIVO" ||
                                String(t.id) === horario[index],
                            )
                            .map((t) => (
                              <option
                                key={t.id}
                                value={t.id}
                                disabled={t.estado !== "ACTIVO"}
                              >
                                {t.nombre} · {t.entrada} - {t.salida}
                                {t.estado !== "ACTIVO" ? " (inactivo)" : ""}
                              </option>
                            ))}
                        </Select>
                      </Field>
                    </div>
                  ))}
                </div>
              </>
            )}
            <ErrorVista mensaje={error} cerrar={() => setError("")} />
          </div>
          <div className="dialog-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={busy || !horario}>
              {busy ? "Guardando..." : "Guardar horario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
