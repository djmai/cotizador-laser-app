import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Trash2, Printer, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { QuotesAPI } from "@/lib/api";
import { fmtMoney, fmtDate } from "@/lib/calc";

export default function Historial() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await QuotesAPI.list();
      setQuotes(data);
    } catch (e) {
      toast.error("Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = quotes.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.projectName.toLowerCase().includes(s) ||
      (q.clientName || "").toLowerCase().includes(s) ||
      q.materialName.toLowerCase().includes(s)
    );
  });

  const handleDelete = async (id) => {
    try {
      await QuotesAPI.remove(id);
      toast.success("Cotización eliminada");
      load();
    } catch (e) {
      toast.error("Error al eliminar");
    }
  };

  const totalQuotes = quotes.length;
  const totalRevenue = quotes.reduce((s, q) => s + (q.total || 0), 0);
  const symbol = quotes[0]?.currencySymbol || "$";

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-2">
          // Historial / Quote Log
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Historial</h1>
        <p className="text-sm text-zinc-600 mt-2">
          Registro de cotizaciones guardadas. Visualiza, imprime o elimina.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat label="Cotizaciones" value={totalQuotes} testid="stat-count" />
        <Stat
          label="Suma total"
          value={fmtMoney(totalRevenue, symbol)}
          testid="stat-total-revenue"
          mono
        />
        <Stat
          label="Promedio"
          value={fmtMoney(totalQuotes ? totalRevenue / totalQuotes : 0, symbol)}
          testid="stat-avg"
          mono
        />
      </div>

      <div className="mb-4">
        <Input
          data-testid="input-search"
          placeholder="Buscar por proyecto, cliente o material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-sm max-w-sm"
        />
      </div>

      <div className="surface overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-sm font-mono">
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              {quotes.length === 0
                ? "No hay cotizaciones guardadas todavía."
                : "Sin resultados para tu búsqueda."}
            </p>
            {quotes.length === 0 && (
              <Button
                asChild
                className="mt-4 rounded-sm bg-[#FF3333] hover:bg-[#CC0000]"
                data-testid="btn-go-cotizador"
              >
                <Link to="/">Crear primera cotización</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <Th>Proyecto</Th>
                  <Th>Cliente</Th>
                  <Th>Material</Th>
                  <Th className="text-right">Cantidad</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="text-right">Por unidad</Th>
                  <Th>Fecha</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
                    data-testid={`row-quote-${q.id}`}
                  >
                    <Td className="font-medium">{q.projectName}</Td>
                    <Td className="text-zinc-600">{q.clientName || "—"}</Td>
                    <Td className="text-zinc-600">{q.materialName}</Td>
                    <Td className="text-right font-mono tabular">{q.quantity}</Td>
                    <Td className="text-right font-mono tabular font-semibold">
                      {fmtMoney(q.total, q.currencySymbol)}
                    </Td>
                    <Td className="text-right font-mono tabular text-zinc-600">
                      {fmtMoney(q.pricePerUnit, q.currencySymbol)}
                    </Td>
                    <Td className="text-zinc-500 text-xs font-mono">
                      {fmtDate(q.createdAt)}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          className="rounded-sm h-8 w-8"
                          data-testid={`btn-view-${q.id}`}
                        >
                          <Link to={`/cotizacion/${q.id}/imprimir`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="icon"
                          variant="ghost"
                          className="rounded-sm h-8 w-8"
                          data-testid={`btn-print-${q.id}`}
                        >
                          <Link to={`/cotizacion/${q.id}/imprimir`}>
                            <Printer className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-sm h-8 w-8 text-[#FF3333] hover:text-[#CC0000]"
                              data-testid={`btn-delete-${q.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. La cotización "
                                {q.projectName}" será eliminada permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-sm">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(q.id)}
                                className="rounded-sm bg-[#FF3333] hover:bg-[#CC0000]"
                                data-testid={`btn-confirm-delete-${q.id}`}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, mono, testid }) {
  return (
    <div className="surface p-4" data-testid={testid}>
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500 mb-1">
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${mono ? "font-mono tabular" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500 font-medium ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
