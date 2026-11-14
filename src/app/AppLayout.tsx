import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ChevronRight,
  CircleHelp,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import type { Sesion } from "../features/auth/api";
import { navegacion, paginasDe, type Pagina } from "./navegacion";
import "./layout.css";

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
  const titulo = navegacion.find(({ id }) => id === pagina)?.titulo;
  useEffect(() => {
    if (!menu) return;
    function cerrar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setMenu(false);
    }
    document.addEventListener("keydown", cerrar);
    return () => document.removeEventListener("keydown", cerrar);
  }, [menu]);

  return (
    <div className="app">
      <aside
        id="menu-principal"
        aria-label="Menú principal"
        className={"sidebar " + (menu ? "open" : "")}
      >
        <div className="brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>
          <div>
            <strong>
              Asistencia<span>Salud</span>
            </strong>
            <small>CONTROL DE PERSONAL</small>
          </div>
        </div>
        <div className="side-caption">MENÚ PRINCIPAL</div>
        <nav>
          {paginasDe(sesion.rol).map(({ id, titulo, icono: Icono }) => (
            <button
              key={id}
              className={pagina === id ? "nav-item active" : "nav-item"}
              aria-current={pagina === id ? "page" : undefined}
              onClick={() => {
                navegar(id);
                setMenu(false);
              }}
            >
              <Icono size={19} />
              <span>{titulo}</span>
              {pagina === id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="help-icon">
            <CircleHelp size={19} />
          </div>
          <div>
            <strong>¿Necesitas ayuda?</strong>
            <small>Contacta al administrador</small>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-controls="menu-principal"
            aria-expanded={menu}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            Gestión de personal <ChevronRight size={15} />{" "}
            <strong>{titulo}</strong>
          </div>
          <div className="top-user">
            <div className="avatar">
              <UserRound size={19} />
            </div>
            <div>
              <strong>{sesion.usuario}</strong>
              <small>
                {sesion.rol === "ADMIN" ? "Administrador" : "Empleado"}
              </small>
            </div>
            <button
              className="icon-button"
              onClick={salir}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main>
          {children}
          <div className="footer">
            Control de asistencia <span>•</span> Gestión de personal
            hospitalario
          </div>
        </main>
      </div>
    </div>
  );
}
