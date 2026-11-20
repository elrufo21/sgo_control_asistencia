import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import type { Sesion } from "../features/auth/api";
import SearchInput from "../shared/ui/SearchInput";
import { normalizeSearchText } from "../shared/ui/tableSearch";
import { navegacion, paginasDe, type Pagina } from "./navegacion";
import "./layout.css";

const mantenimiento = new Set<Pagina>(["empleados", "usuarios", "feriados", "areas", "turnos"]);

export function AppLayout({
  sesion,
  pagina,
  navegar,
  salir,
  children,
}: {
  sesion: Sesion;
  pagina: Pagina;
  navegar: (pagina: Pagina) => void;
  salir: () => void;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [menuUsuario, setMenuUsuario] = useState(false);
  const usuarioRef = useRef<HTMLDivElement>(null);
  const botonUsuarioRef = useRef<HTMLButtonElement>(null);
  const titulo = pagina === "mantenimiento" ? "Mantenimiento" : navegacion.find(({ id }) => id === pagina)?.titulo;
  const paginas = paginasDe(sesion);
  const textoBusqueda = normalizeSearchText(busqueda);
  const coincideGrupo = !!textoBusqueda && normalizeSearchText("Mantenimiento").includes(textoBusqueda);
  const paginasMantenimiento = paginas.filter(({ id, titulo }) => mantenimiento.has(id) && (coincideGrupo || normalizeSearchText(titulo).includes(textoBusqueda)));
  const paginasPrincipales = paginas.filter(({ id, titulo }) => !mantenimiento.has(id) && normalizeSearchText(titulo).includes(textoBusqueda));
  function botonPagina({ id, titulo, icono: Icono }: (typeof navegacion)[number]) {
    return <button key={id} className={pagina === id ? "nav-item active" : "nav-item"} aria-current={pagina === id ? "page" : undefined} aria-label={titulo} title={titulo} onClick={() => { navegar(id); setMenu(false); }}>
      <Icono size={19} /><span>{titulo}</span>{pagina === id && <ChevronRight size={16} />}
    </button>;
  }
  useEffect(() => {
    if (!menu) return;
    function cerrar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setMenu(false);
    }
    document.addEventListener("keydown", cerrar);
    return () => document.removeEventListener("keydown", cerrar);
  }, [menu]);
  useEffect(() => {
    if (!menuUsuario) return;
    function cerrarFuera(evento: PointerEvent) {
      if (!usuarioRef.current?.contains(evento.target as Node))
        setMenuUsuario(false);
    }
    function cerrarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setMenuUsuario(false);
        botonUsuarioRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", cerrarFuera);
    document.addEventListener("keydown", cerrarEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarFuera);
      document.removeEventListener("keydown", cerrarEscape);
    };
  }, [menuUsuario]);

  return (
    <div className="app">
      <aside
        id="menu-principal"
        aria-label="Menú principal"
        className={`sidebar ${menu ? "open" : ""} ${colapsado ? "collapsed" : ""}`}
      >
        <div className="brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>
          <div className="brand-text">
            <strong>
              Asistencia<span>Salud</span>
            </strong>
            <small>CONTROL DE PERSONAL</small>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={colapsado ? "Expandir menú" : "Contraer menú"}
            aria-expanded={!colapsado}
            aria-controls="menu-principal"
            onClick={() => {
              setColapsado((valor) => !valor);
              setBusqueda("");
            }}
          >
            {colapsado ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Cerrar menú"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="sidebar-search">
          <SearchInput
            aria-label="Buscar módulo"
            placeholder="Buscar módulo..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.currentTarget.value)}
            onClear={() => setBusqueda("")}
          />
        </div>
        <nav aria-label="Módulos">
          {paginasPrincipales.filter(({ id }) => id === "lector" || id === "atenciones").map(botonPagina)}
          {paginasMantenimiento.length > 0 && (
            <button type="button" className={pagina === "mantenimiento" || mantenimiento.has(pagina) ? "nav-item active" : "nav-item"} aria-current={pagina === "mantenimiento" ? "page" : undefined} aria-label="Mantenimiento" title="Mantenimiento" onClick={() => { navegar("mantenimiento"); setMenu(false); }}>
              <Settings size={19} /><span>Mantenimiento</span>{pagina === "mantenimiento" && <ChevronRight size={16} />}
            </button>
          )}
          {paginasPrincipales.filter(({ id }) => id !== "lector" && id !== "atenciones").map(botonPagina)}
          {textoBusqueda && !paginasPrincipales.length && !paginasMantenimiento.length && <p className="sidebar-empty">No se encontraron módulos.</p>}
        </nav>
      </aside>
      {menu && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMenu(false)}
        />
      )}
      <div className={"main" + (colapsado ? " sidebar-collapsed" : "")}>
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            onClick={() => { setMenu(!menu); setColapsado(false); }}
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-controls="menu-principal"
            aria-expanded={menu}
          >
            <Menu size={22} />
          </button>
          <div className={pagina === "mantenimiento" || mantenimiento.has(pagina) ? "breadcrumb breadcrumb-mantenimiento" : "breadcrumb"}>
            {pagina === "mantenimiento" || mantenimiento.has(pagina) ? <strong>Mantenimiento</strong> : <>Gestión de personal <ChevronRight size={15} /> <strong>{titulo}</strong></>}
          </div>
          <div className="top-user" ref={usuarioRef}>
            <button
              ref={botonUsuarioRef}
              type="button"
              className="top-user-trigger"
              aria-label={`Menú de ${sesion.usuario}`}
              aria-expanded={menuUsuario}
              aria-controls="menu-usuario"
              onClick={() => setMenuUsuario((abierto) => !abierto)}
            >
              <span className="avatar">
                <UserRound size={19} />
              </span>
              <span className="top-user-info">
                <strong>{sesion.usuario}</strong>
                <small>
                  {sesion.rol === "ADMIN" ? "Administrador" : "Empleado"}
                </small>
              </span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            {menuUsuario && (
              <div id="menu-usuario" className="top-user-menu">
                <button
                  type="button"
                  onClick={() => {
                    setMenuUsuario(false);
                    salir();
                  }}
                >
                  <LogOut size={16} aria-hidden="true" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
