type Campo = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function moverFoco(campo: Campo, direccion: 1 | -1, omitirConsulta = false) {
  if (!campo.form) return false;
  const campos = Array.from(campo.form.elements).filter((elemento): elemento is Campo =>
    (elemento instanceof HTMLInputElement || elemento instanceof HTMLSelectElement || elemento instanceof HTMLTextAreaElement) &&
    !elemento.disabled && !("readOnly" in elemento && elemento.readOnly) && elemento.tabIndex >= 0 &&
    !(elemento instanceof HTMLInputElement && ["hidden", "file", "checkbox", "radio", "submit", "button", "reset"].includes(elemento.type)) &&
    elemento.getClientRects().length > 0,
  );
  const indice = campos.indexOf(campo);
  if (indice < 0) return false;
  let destino = indice + direccion;
  while (omitirConsulta && campos[destino]?.hasAttribute("data-omitir-al-seleccionar")) destino += direccion;
  const siguiente = campos[destino];
  if (!siguiente) return false;
  siguiente.focus({ preventScroll: true });
  siguiente.scrollIntoView({ block: "nearest", behavior: "smooth" });
  return true;
}
