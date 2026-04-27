import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Cotizador from "@/pages/Cotizador";
import Historial from "@/pages/Historial";
import Materiales from "@/pages/Materiales";
import Configuracion from "@/pages/Configuracion";
import Autor from "@/pages/Autor";
import Imprimir from "@/pages/Imprimir";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/cotizacion/:id/imprimir" element={<Imprimir />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Cotizador />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/materiales" element={<Materiales />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/autor" element={<Autor />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
