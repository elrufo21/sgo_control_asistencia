import { useState, type FormEvent } from "react";
import { Activity, ChevronRight, Fingerprint } from "lucide-react";
import { Button, Field } from "../../shared/ui/Controls";
import TextInput from "../../shared/ui/TextInput";
import { campo } from "../../shared/ui/camposRegistro";
import { mensajeError } from "../../shared/api/http";
import { iniciarSesion, type Sesion } from "./api";
import { ErrorVista } from "../../shared/ui/Pagina";
import "./login.css";

export function LoginPage({
  onLogin,
  onReader,
}: {
  onLogin: (sesion: Sesion) => void;
  onReader: () => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      onLogin(
        await iniciarSesion(campo(data, "usuario"), campo(data, "clave")),
      );
    } catch (error) {
      setError(mensajeError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-icon">
          <Activity size={24} />
        </div>
        <h1>
          Asistencia<span>Salud</span>
        </h1>
        <p>Ingresa para continuar al control de asistencia.</p>
        <form onSubmit={submit}>
          <Field label="Usuario">
            <TextInput name="usuario" autoComplete="username" required />
          </Field>
          <Field label="Contraseña">
            <TextInput
              name="clave"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <ErrorVista mensaje={error} cerrar={() => setError("")} />
          <Button disabled={busy}>
            {busy ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>
        <div className="login-lector">
          <span>REGISTRO DE ASISTENCIA</span>
          <button type="button" onClick={onReader}>
            <Fingerprint size={18} /> Acceder al lector biométrico{" "}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
