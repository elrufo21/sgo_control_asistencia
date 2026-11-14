import { createRoot } from "react-dom/client";
import "./shared/styles/base.css";
import { App } from "./app/App";

const root = document.getElementById("root");
if (!root) throw new Error("Falta el elemento raíz de la aplicación.");
createRoot(root).render(<App />);
