import { useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ autoComplete = "one-time-code", evitarSugerencias = false, style, ...props }: Omit<ComponentPropsWithoutRef<"input">, "type"> & { evitarSugerencias?: boolean }) {
  const [visible, setVisible] = useState(false);
  const mascaraDisponible = evitarSugerencias && typeof CSS !== "undefined" && CSS.supports("-webkit-text-security", "disc");
  return <span className="password-input">
    <input {...props} type={visible || mascaraDisponible ? "text" : "password"} style={{ ...style, ...(mascaraDisponible && !visible ? { WebkitTextSecurity: "disc" } : {}) }} autoComplete={autoComplete} autoCorrect="off" autoCapitalize="off" spellCheck={false} data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" />
    <button type="button" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} onClick={() => setVisible((actual) => !actual)}>
      {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
    </button>
  </span>;
}
