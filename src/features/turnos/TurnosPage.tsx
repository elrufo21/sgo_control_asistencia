import { Clock3 } from "lucide-react";
import { Field, Select } from "../../shared/ui/Controls";
import {
  CampoEstado,
  campo,
  estadoRegistro,
} from "../../shared/ui/camposRegistro";
import { RegistroCatalogo } from "../../shared/ui/RegistroCatalogo";
import TextInput from "../../shared/ui/TextInput";
import { guardarTurno, listarTurnos } from "./api";

export function TurnosPage() {
  return (
    <RegistroCatalogo
      titulo="Turnos"
      singular="turno"
      descripcion="Define los horarios de trabajo del personal."
      icono={Clock3}
      listar={listarTurnos}
      columnas={[
        ["nombre", "Nombre"],
        ["entrada", "Entrada"],
        ["salida", "Salida"],
        ["marcaciones", "Marcaciones"],
        ["estado", "Estado"],
      ]}
      guardar={(id, datos) =>
        guardarTurno(id, {
          nombre: campo(datos, "nombre"),
          entrada: campo(datos, "entrada"),
          salida: campo(datos, "salida"),
          marcaciones: campo(datos, "marcaciones") === "2" ? 2 : 4,
          estado: estadoRegistro(datos),
        })
      }
      campos={(turno) => (
        <>
          <Field label="Nombre del turno">
            <TextInput name="nombre" defaultValue={turno?.nombre} required />
          </Field>
          <Field label="Hora de entrada">
            <TextInput
              name="entrada"
              type="time"
              defaultValue={turno?.entrada}
              required
            />
          </Field>
          <Field label="Hora de salida">
            <TextInput
              name="salida"
              type="time"
              defaultValue={turno?.salida}
              required
            />
          </Field>
          <Field label="Marcaciones por jornada">
            <Select name="marcaciones" defaultValue={turno?.marcaciones ?? 4}>
              <option value="2">2 · Entrada y salida</option>
              <option value="4">4 · Con refrigerio</option>
            </Select>
          </Field>
          <CampoEstado estado={turno?.estado} />
        </>
      )}
    />
  );
}
