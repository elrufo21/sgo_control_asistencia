import { useState, type FormEvent } from "react";
import { Activity, ChevronRight, Fingerprint } from "lucide-react";
import { Button, Field } from "../../../components/Controls";
import TextInput from "../../../components/TextInput";
import PasswordInput from "../../../components/PasswordInput";
import { campo } from "../../../components/camposRegistro";
import { mensajeError } from "../../../shared/api/http";
import { consultarSesion, iniciarSesion, type Sesion } from "../services/authService";
import { ErrorVista } from "../../../components/Pagina";
import "../login.css";

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
      await iniciarSesion(campo(data, "usuario"), campo(data, "clave"));
      onLogin(await consultarSesion(new AbortController().signal));
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
        <form autoComplete="off" onSubmit={submit}>
          <Field label="Usuario">
            <TextInput name="usuario" required />
          </Field>
          <Field label="Contraseña">
            <PasswordInput
              name="clave"
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
