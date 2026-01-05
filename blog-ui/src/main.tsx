import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeModeProvider } from "./theme/ThemeModeProvider";
import { system } from "./chakra"; // ✅ BUNU EKLE
import "./index.css";

const saved = localStorage.getItem("chakra-ui-color-mode") || "light";
document.documentElement.setAttribute("data-theme", saved);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider value={system}> {/* ✅ BURAYI DEĞİŞTİR */}
        <ThemeModeProvider>
          <App />
        </ThemeModeProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);


/*import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeModeProvider } from "./theme/ThemeModeProvider";

const saved = localStorage.getItem("chakra-ui-color-mode") || "light";
document.documentElement.setAttribute("data-theme", saved);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider value={defaultSystem}>
        <ThemeModeProvider>
          <App />
        </ThemeModeProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);*/
