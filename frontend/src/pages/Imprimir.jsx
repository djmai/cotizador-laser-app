import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { QuotesAPI, SettingsAPI } from "@/lib/api";
import { fmtMoney, fmtNum, fmtDate } from "@/lib/calc";

export default function Imprimir() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([QuotesAPI.get(id), SettingsAPI.get()])
      .then(([q, s]) => {
        setQuote(q);
        setSettings(s);
      })
      .catch(() => setError("No se pudo cargar la cotización"));
  }, [id]);

  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <p className="text-sm text-zinc-600 mb-4">{error}</p>
        <Button onClick={() => navigate("/historial")} className="rounded-sm">
          Volver al historial
        </Button>
      </div>
    );
  }

  if (!quote || !settings) {
    return <div className="p-8 text-sm text-zinc-500 font-mono">Cargando...</div>;
  }

  const symbol = quote.currencySymbol || "$";
  const folio = quote.id.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-100 print-page">
      <div className="no-print bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="rounded-sm border-zinc-300"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
          <Button
            onClick={() => window.print()}
            className="rounded-sm bg-[#FF3333] hover:bg-[#CC0000]"
            data-testid="btn-print"
          >
            <Printer className="w-4 h-4 mr-2" /> Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="bg-white border border-zinc-200 p-8 md:p-12">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {settings.logoDataUrl ? (
                  <img
                    src={settings.logoDataUrl}
                    alt={settings.businessName || "Logo"}
                    className="h-10 w-auto max-w-[160px] object-contain"
                  />
                ) : (
                  <>
                    <div className="w-8 h-8 bg-[#FF3333] flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-tight">
                      {settings.businessName || "CORTEX LÁSER"}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">COTIZACIÓN</h1>
              <div className="text-xs font-mono text-zinc-500 mt-1">
                FOLIO #{folio}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500">
                Fecha
              </div>
              <div className="text-sm font-mono">{fmtDate(quote.createdAt)}</div>
            </div>
          </div>

          {/* Project info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500 mb-1">
                Proyecto
              </div>
              <div className="text-base font-semibold" data-testid="print-project">
                {quote.projectName}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500 mb-1">
                Cliente
              </div>
              <div className="text-base">{quote.clientName || "—"}</div>
            </div>
          </div>

          {/* Specs */}
          <div className="border border-zinc-200 mb-6">
            <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-700">
              Especificaciones técnicas
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <SpecItem label="Material" value={quote.materialName} />
              <SpecItem
                label="Pieza"
                value={`${fmtNum(quote.pieceWidth, 0)} × ${fmtNum(
                  quote.pieceHeight,
                  0
                )} mm`}
              />
              <SpecItem label="Cantidad" value={quote.quantity} />
              <div data-no-print="true" className="contents">
                <SpecItem label="Tiempo corte" value={`${fmtNum(quote.cuttingTimeMin, 1)} min`} />
                <SpecItem label="Tiempo grabado" value={`${fmtNum(quote.engravingTimeMin, 1)} min`} />
                <SpecItem label="Margen" value={`${fmtNum(quote.profitMargin, 0)}%`} />
              </div>
            </div>
          </div>

          {/* Cost breakdown - hidden on print */}
          <div className="mb-6" data-no-print="true">
            <h2 className="text-sm font-semibold mb-2">Desglose de costos</h2>
            <table className="w-full text-sm border border-zinc-200">
              <tbody>
                <CostRow label="Material" value={fmtMoney(quote.materialCost, symbol)} />
                <CostRow label="Corte" value={fmtMoney(quote.cuttingCost, symbol)} />
                <CostRow label="Grabado" value={fmtMoney(quote.engravingCost, symbol)} />
                <CostRow label="Electricidad" value={fmtMoney(quote.electricityCost, symbol)} />
                <CostRow label="Mano de obra" value={fmtMoney(quote.laborCost, symbol)} />
                {quote.additionalCosts.map((c, i) => (
                  <CostRow key={i} label={c.label || "Extra"} value={fmtMoney(c.amount, symbol)} />
                ))}
                <CostRow
                  label="Subtotal"
                  value={fmtMoney(quote.subtotal, symbol)}
                  bold
                />
                <CostRow
                  label={`Ganancia (${fmtNum(quote.profitMargin, 0)}%)`}
                  value={fmtMoney(quote.profitAmount, symbol)}
                />
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="bg-zinc-900 text-white p-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">
                Total {quote.currency}
              </div>
              <div
                className="text-4xl font-bold font-mono tabular mt-1"
                data-testid="print-total"
              >
                {fmtMoney(quote.total, symbol)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">
                Por unidad
              </div>
              <div className="text-xl font-mono tabular text-[#FF6666]">
                {fmtMoney(quote.pricePerUnit, symbol)}
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="mt-6 pt-6 border-t border-zinc-200">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500 mb-2">
                Notas
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          <div className="mt-12 pt-4 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-400">
            <span>{settings.businessName || "Cortex Láser"}</span>
            <span>Cotización válida por 15 días</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500">
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function CostRow({ label, value, bold }) {
  return (
    <tr className={`border-b border-zinc-200 ${bold ? "bg-zinc-50" : ""}`}>
      <td className={`px-4 py-2.5 ${bold ? "font-semibold" : ""}`}>{label}</td>
      <td
        className={`px-4 py-2.5 text-right font-mono tabular ${
          bold ? "font-bold" : ""
        }`}
      >
        {value}
      </td>
    </tr>
  );
}
