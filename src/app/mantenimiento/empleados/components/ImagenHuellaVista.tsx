import { useEffect, useRef } from "react";
import type { ImagenHuella } from "../services/empleadosService";

export function ImagenHuellaVista({ imagen }: { imagen: ImagenHuella }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!imagen || !canvas.current) return;
    try {
      const { ancho, alto, pixeles } = imagen;
      if (
        !Number.isInteger(ancho) ||
        !Number.isInteger(alto) ||
        ancho <= 0 ||
        alto <= 0 ||
        ancho * alto > 4000000
      )
        return;
      const bytes = atob(pixeles);
      if (bytes.length !== ancho * alto) return;
      const elemento = canvas.current;
      elemento.width = ancho;
      elemento.height = alto;
      const contexto = elemento.getContext("2d");
      if (!contexto) return;
      const dibujo = contexto.createImageData(ancho, alto);
      for (let i = 0; i < bytes.length; i++) {
        const valor = bytes.charCodeAt(i),
          pos = i * 4;
        dibujo.data[pos] = valor;
        dibujo.data[pos + 1] = valor;
        dibujo.data[pos + 2] = valor;
        dibujo.data[pos + 3] = 255;
      }
      contexto.putImageData(dibujo, 0, 0);
    } catch {
      /* La lectura sigue siendo válida aunque no pueda mostrarse la imagen. */
    }
  }, [imagen]);
  return (
    <canvas
      ref={canvas}
      aria-label="Imagen de la última lectura de huella"
      role="img"
    />
  );
}
