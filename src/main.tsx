import { createRoot } from "react-dom/client";
import "./shared/styles/base.css";
import { App } from "./app/App";
import { Confirmaciones } from "./shared/ui/Confirmacion";
import { ValidacionFormulario } from "./shared/ui/ValidacionFormulario";

const root = document.getElementById("root");
if (!root) throw new Error("Falta el elemento raíz de la aplicación.");
createRoot(root).render(<ValidacionFormulario><Confirmaciones><App /></Confirmaciones></ValidacionFormulario>);
