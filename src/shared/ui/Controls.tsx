import type { ComponentPropsWithoutRef, ReactNode } from "react";

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
