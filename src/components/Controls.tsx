import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { moverFoco } from "./navegacionFormulario";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "secondary";
};

export function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={["button", variant, className].filter(Boolean).join(" ")}
    />
  );
}

export function BotonNuevo({ nombre, ...props }: Omit<ButtonProps, "children"> & { nombre: string }) {
  return <Button {...props} className="button-new" aria-label={`Nuevo ${nombre}`} title={`Nuevo ${nombre}`}><Plus size={18} aria-hidden="true" /></Button>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Select({ onChange, onKeyDown, onKeyUp, onPointerDown, ...props }: ComponentPropsWithoutRef<"select">) {
  const navegandoConTeclado = useRef(false);
  return <select {...props}
    onPointerDown={(evento) => { navegandoConTeclado.current = false; onPointerDown?.(evento); }}
    onKeyDown={(evento) => { if (["ArrowDown", "ArrowUp", "Home", "End"].includes(evento.key)) navegandoConTeclado.current = true; onKeyDown?.(evento); }}
    onKeyUp={(evento) => { navegandoConTeclado.current = false; onKeyUp?.(evento); }}
    onChange={(evento) => {
      const campo = evento.currentTarget;
      onChange?.(evento);
      if (!campo.form || campo.multiple || navegandoConTeclado.current || !campo.validity.valid) return;
      requestAnimationFrame(() => { if (document.activeElement === campo) moverFoco(campo, 1, true); });
    }}
  />;
}

export function FileInput(
  props: Omit<ComponentPropsWithoutRef<"input">, "type">,
) {
  return <input {...props} type="file" />;
}
