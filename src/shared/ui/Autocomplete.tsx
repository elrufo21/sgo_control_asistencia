import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import TextInput from "./TextInput";
import { moverFoco } from "./navegacionFormulario";
import { normalizeSearchText } from "./tableSearch";
import "./autocomplete.css";

type Opcion = { value: string; label: string };

export function Autocomplete({ name, opciones, defaultValue = "", placeholder, required = false, disabled = false, onSelect }: {
  name: string; opciones: Opcion[]; defaultValue?: string | number; placeholder: string; required?: boolean; disabled?: boolean; onSelect?: () => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [seleccion, setSeleccion] = useState(String(defaultValue));
  const [texto, setTexto] = useState(() => opciones.find((o) => o.value === String(defaultValue))?.label ?? "");
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(0);
  const filtro = seleccion && opciones.find((o) => o.value === seleccion)?.label === texto ? "" : texto;
  const opcionesVisibles = opciones.filter((o) => normalizeSearchText(o.label).includes(normalizeSearchText(filtro)));
  useEffect(() => { input.current?.setCustomValidity(required && !seleccion ? "Seleccione una opción de la lista." : ""); }, [required, seleccion]);

  function elegir(opcion: Opcion) {
    setSeleccion(opcion.value); setTexto(opcion.label); setAbierto(false);
    onSelect?.();
    input.current?.setCustomValidity("");
    input.current?.focus();
    if (input.current) requestAnimationFrame(() => { if (input.current) moverFoco(input.current, 1, true); });
  }
  return <div className="autocomplete">
    <input type="hidden" name={name} value={seleccion} disabled={disabled} />
    <TextInput ref={input} role="combobox" aria-label={placeholder} aria-expanded={abierto} aria-controls={`${id}-lista`} aria-autocomplete="list" aria-activedescendant={abierto && opcionesVisibles[indice] ? `${id}-${indice}` : undefined} autoComplete="off" placeholder={placeholder} value={texto} required={required} disabled={disabled}
      onFocus={() => { setAbierto(true); setIndice(0); }}
      onBlur={() => { setAbierto(false); if (!seleccion) setTexto(""); }}
      onChange={(e) => { setTexto(e.currentTarget.value); setSeleccion(""); setAbierto(true); setIndice(0); e.currentTarget.setCustomValidity(required ? "Seleccione una opción de la lista." : ""); }}
      onKeyDown={(e) => { if (!abierto || !["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) return; e.preventDefault(); if (e.key === "Escape") setAbierto(false); else if (e.key === "Enter" && opcionesVisibles[indice]) elegir(opcionesVisibles[indice]); else if (e.key === "ArrowDown") setIndice((n) => Math.min(n + 1, opcionesVisibles.length - 1)); else if (e.key === "ArrowUp") setIndice((n) => Math.max(n - 1, 0)); }} />
    <button type="button" aria-label="Mostrar opciones" disabled={disabled} tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => { const enfocado = document.activeElement === input.current; input.current?.focus(); setAbierto(enfocado ? !abierto : true); }}><ChevronDown size={16} /></button>
    {abierto && <div className="autocomplete-lista" role="listbox" id={`${id}-lista`}>{opcionesVisibles.length ? opcionesVisibles.map((opcion, n) => <div id={`${id}-${n}`} role="option" aria-selected={opcion.value === seleccion} className={n === indice ? "autocomplete-activa" : ""} key={opcion.value} onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(opcion)}>{opcion.label}</div>) : <div className="autocomplete-vacio">Sin resultados</div>}</div>}
  </div>;
}
