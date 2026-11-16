import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Plus } from "lucide-react";

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

export function Select(props: ComponentPropsWithoutRef<"select">) {
  return <select {...props} />;
}

export function FileInput(
  props: Omit<ComponentPropsWithoutRef<"input">, "type">,
) {
  return <input {...props} type="file" />;
}
