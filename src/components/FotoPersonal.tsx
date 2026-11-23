import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

export default function FotoPersonal({
  src,
  nombre,
  className,
  iconSize = 28,
}: {
  src?: string | null;
  nombre?: string;
  className: string;
  iconSize?: number;
}) {
  const [fallo, setFallo] = useState(false);
  useEffect(() => setFallo(false), [src]);
  return (
    <div className={className}>
      {src && !fallo ? (
        <img
          src={src}
          alt={nombre ? `Foto de ${nombre}` : "Foto del empleado"}
          onError={() => setFallo(true)}
        />
      ) : (
        <UserRound size={iconSize} />
      )}
    </div>
  );
}
