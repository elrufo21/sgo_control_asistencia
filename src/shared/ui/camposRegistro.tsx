import { Field, Select } from "./Controls";
import type { Estado } from "../api/catalogo";

export function campo(datos: FormData, nombre: string) {
  const valor = datos.get(nombre);
  return typeof valor === "string" ? valor : "";
}

export function idOpcional(datos: FormData, nombre: string) {
  const valor = campo(datos, nombre);
  return valor ? Number(valor) : null;
}

export function estadoRegistro(datos: FormData): Estado {
  return campo(datos, "estado") === "INACTIVO" ? "INACTIVO" : "ACTIVO";
}

export function CampoEstado({ estado = "ACTIVO" }: { estado?: Estado }) {
  return (
    <Field label="Estado">
      <Select name="estado" defaultValue={estado}>
        <option>ACTIVO</option>
        <option>INACTIVO</option>
      </Select>
    </Field>
  );
}
