import { Clock3 } from "lucide-react";
import { Field, Select } from "../../shared/ui/Controls";
import {
  CampoEstado,
  campo,
  estadoRegistro,
} from "../../shared/ui/camposRegistro";
import { RegistroCatalogo } from "../../shared/ui/RegistroCatalogo";
import TextInput from "../../shared/ui/TextInput";
import { eliminarTurno, guardarTurno, listarTurnos } from "./api";

export function TurnosPage() {
  return (
    <RegistroCatalogo
      titulo="Turnos"
      singular="turno"
      descripcion="Define los horarios de trabajo del personal."
      icono={Clock3}
      listar={listarTurnos}
      eliminar={eliminarTurno}
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
          salidaRefrigerio: campo(datos, "salidaRefrigerio") || null,
          retornoRefrigerio: campo(datos, "retornoRefrigerio") || null,
          toleranciaAntes: Number(campo(datos, "toleranciaAntes")),
          toleranciaDespues: Number(campo(datos, "toleranciaDespues")),
          minutosEntre: Number(campo(datos, "minutosEntre")),
        })
      }
      campos={(turno) => (
        <>
          <TextInput type="hidden" name="toleranciaAntes" defaultValue={turno?.toleranciaAntes ?? 60} />
          <TextInput type="hidden" name="toleranciaDespues" defaultValue={turno?.toleranciaDespues ?? 60} />
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
          <Field label="Salida a refrigerio (turnos de 4 marcas)"><TextInput name="salidaRefrigerio" type="time" defaultValue={turno?.salidaRefrigerio ?? ""} /></Field>
          <Field label="Retorno de refrigerio (turnos de 4 marcas)"><TextInput name="retornoRefrigerio" type="time" defaultValue={turno?.retornoRefrigerio ?? ""} /></Field>
          <Field label="Separación mínima entre marcas (min)"><TextInput name="minutosEntre" type="number" min="1" max="1440" step="1" required defaultValue={turno?.minutosEntre ?? 60} /></Field>
          <CampoEstado estado={turno?.estado} />
        </>
      )}
    />
  );
}
