import { useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput(props: Omit<ComponentPropsWithoutRef<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return <span className="password-input">
    <input {...props} type={visible ? "text" : "password"} />
    <button type="button" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} onClick={() => setVisible((actual) => !actual)}>
      {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
    </button>
  </span>;
}
