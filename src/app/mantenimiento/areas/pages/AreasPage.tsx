import { Building2 } from "lucide-react";
import { Field } from "../../../../components/Controls";
import { campo } from "../../../../components/camposRegistro";
import { RegistroCatalogo } from "../../../../components/RegistroCatalogo";
import TextInput from "../../../../components/TextInput";
import { eliminarArea, guardarArea, listarAreas } from "../services/areasService";

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
