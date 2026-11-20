import { useCallback, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, UsersRound } from "lucide-react";
import { Button } from "../../shared/ui/Controls";
import { PermisosAreaPage } from "./PermisosAreaPage";
import { PermisosUsuarioPage } from "./PermisosUsuarioPage";
import "../mantenimiento/mantenimiento.css";

export function SeguridadPage({ protegerSalida, actualizarSesion }: { protegerSalida: (verificar: (() => Promise<boolean>) | null) => void; actualizarSesion: () => Promise<void> }) {
  const [vista, setVista] = useState<"area" | "usuario" | null>(null);
  const salida = useRef<(() => Promise<boolean>) | null>(null);
  const registrar = useCallback((verificar: (() => Promise<boolean>) | null) => { salida.current = verificar; protegerSalida(verificar); }, [protegerSalida]);
  if (!vista) return <div className="mantenimiento-grid">{([
    { id: "area", titulo: "Permisos por área", descripcion: "Configura el acceso para cada área.", Icono: ShieldCheck },
    { id: "usuario", titulo: "Permisos por usuario", descripcion: "Define excepciones para cada usuario.", Icono: UsersRound },
  ] as const).map(({ id, titulo, descripcion, Icono }) => <button type="button" className="mantenimiento-card" key={id} onClick={() => setVista(id)}><span className="mantenimiento-icono areas"><Icono size={40} /></span><span className="mantenimiento-texto"><strong>{titulo}</strong><span>{descripcion}</span></span><ArrowRight className="mantenimiento-flecha" size={16} /></button>)}</div>;
  return <><Button type="button" variant="secondary" onClick={() => void (async () => { if (!salida.current || await salida.current()) setVista(null); })()}><ArrowLeft size={16} /> Volver a seguridad</Button>{vista === "area" ? <PermisosAreaPage protegerSalida={registrar} actualizarSesion={actualizarSesion} /> : <PermisosUsuarioPage protegerSalida={registrar} actualizarSesion={actualizarSesion} />}</>;
}
