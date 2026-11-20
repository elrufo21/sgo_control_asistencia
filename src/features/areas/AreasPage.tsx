import { Building2 } from "lucide-react";
import { Field } from "../../shared/ui/Controls";
import { campo } from "../../shared/ui/camposRegistro";
import { RegistroCatalogo } from "../../shared/ui/RegistroCatalogo";
import TextInput from "../../shared/ui/TextInput";
import { eliminarArea, guardarArea, listarAreas } from "./api";

export function AreasPage({ volver }: { volver: () => void }) {
  return (
    <RegistroCatalogo
      modulo="areas"
      dialogoDxn
      volver={volver}
      titulo="Áreas"
      singular="área"
      descripcion="Organiza los servicios y áreas del hospital."
      icono={Building2}
      listar={listarAreas}
      eliminar={eliminarArea}
      columnas={[["nombre", "Área"]]}
      guardar={(id, datos) =>
        guardarArea(id, { nombre: campo(datos, "nombre") })
      }
      campos={(area) => (
        <Field label="Nombre del área">
          <TextInput name="nombre" defaultValue={area?.nombre} placeholder="Ingrese área" autoFocus required />
        </Field>
      )}
    />
  );
}
