import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, Printer, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { MaterialsAPI, SettingsAPI, QuotesAPI } from "@/lib/api";
import { computeQuote, fmtMoney, fmtNum } from "@/lib/calc";

const initialForm = {
  projectName: "",
  clientName: "",
  notes: "",
  materialId: "",
  pieceWidth: 100,
  pieceHeight: 100,
  quantity: 1,
  cuttingTimeMin: 5,
  engravingTimeMin: 0,
  additionalCosts: [],
  profitMargin: 30,
};

export default function Cotizador() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([MaterialsAPI.list(), SettingsAPI.get()])
      .then(([mats, st]) => {
        setMaterials(mats);
        setSettings(st);
        setForm((f) => ({
          ...f,
          materialId: mats[0]?.id || "",
          profitMargin: st.defaultProfitMargin ?? 30,
        }));
      })
      .catch((e) => {
        toast.error("Error al cargar datos iniciales");
        console.error(e);
      });
  }, []);

  const selectedMaterial = useMemo(
    () => materials.find((m) => m.id === form.materialId),
    [materials, form.materialId]
  );

  const result = useMemo(() => {
    if (!selectedMaterial || !settings) return null;
    return computeQuote({
      pricePerSheet: selectedMaterial.pricePerSheet,
      sheetWidth: selectedMaterial.sheetWidth,
      sheetHeight: selectedMaterial.sheetHeight,
      wasteFactor: selectedMaterial.wasteFactor,
      pieceWidth: parseFloat(form.pieceWidth) || 0,
      pieceHeight: parseFloat(form.pieceHeight) || 0,
      quantity: parseInt(form.quantity) || 1,
      cuttingTimeMin: parseFloat(form.cuttingTimeMin) || 0,
      engravingTimeMin: parseFloat(form.engravingTimeMin) || 0,
      machineHourlyRate: settings.machineHourlyRate,
      engravingHourlyRate: settings.engravingHourlyRate,
      electricityCostPerHour: settings.electricityCostPerHour,
      laborCostPerHour: settings.laborCostPerHour,
      additionalCosts: form.additionalCosts,
      profitMargin: parseFloat(form.profitMargin) || 0,
    });
  }, [form, selectedMaterial, settings]);

  const symbol = settings?.currencySymbol || "$";

  const updateForm = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addExtraCost = () =>
    setForm((f) => ({
      ...f,
      additionalCosts: [...f.additionalCosts, { label: "", amount: 0 }],
    }));
  const updateExtraCost = (i, k, v) =>
    setForm((f) => {
      const arr = [...f.additionalCosts];
      arr[i] = { ...arr[i], [k]: v };
      return { ...f, additionalCosts: arr };
    });
  const removeExtraCost = (i) =>
    setForm((f) => ({
      ...f,
      additionalCosts: f.additionalCosts.filter((_, idx) => idx !== i),
    }));

  const resetForm = () =>
    setForm({
      ...initialForm,
      materialId: materials[0]?.id || "",
      profitMargin: settings?.defaultProfitMargin ?? 30,
    });

  const saveQuote = async ({ thenPrint = false } = {}) => {
    if (!selectedMaterial || !settings || !result) {
      toast.error("Selecciona un material para guardar");
      return;
    }
    if (!form.projectName.trim()) {
      toast.error("Ingresa el nombre del proyecto");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        projectName: form.projectName.trim(),
        clientName: form.clientName.trim(),
        notes: form.notes.trim(),
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        pricePerSheet: selectedMaterial.pricePerSheet,
        sheetWidth: selectedMaterial.sheetWidth,
        sheetHeight: selectedMaterial.sheetHeight,
        wasteFactor: selectedMaterial.wasteFactor,
        pieceWidth: parseFloat(form.pieceWidth) || 0,
        pieceHeight: parseFloat(form.pieceHeight) || 0,
        quantity: parseInt(form.quantity) || 1,
        cuttingTimeMin: parseFloat(form.cuttingTimeMin) || 0,
        engravingTimeMin: parseFloat(form.engravingTimeMin) || 0,
        machineHourlyRate: settings.machineHourlyRate,
        engravingHourlyRate: settings.engravingHourlyRate,
        electricityCostPerHour: settings.electricityCostPerHour,
        laborCostPerHour: settings.laborCostPerHour,
        additionalCosts: form.additionalCosts.map((c) => ({
          label: c.label || "Extra",
          amount: parseFloat(c.amount) || 0,
        })),
        profitMargin: parseFloat(form.profitMargin) || 0,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        materialCost: result.materialCost,
        cuttingCost: result.cuttingCost,
        engravingCost: result.engravingCost,
        electricityCost: result.electricityCost,
        laborCost: result.laborCost,
        additionalTotal: result.additionalTotal,
        subtotal: result.subtotal,
        profitAmount: result.profitAmount,
        total: result.total,
        pricePerUnit: result.pricePerUnit,
      };
      const saved = await QuotesAPI.create(payload);
      toast.success("Cotización guardada");
      if (thenPrint) {
        navigate(`/cotizacion/${saved.id}/imprimir`);
      } else {
        resetForm();
      }
    } catch (e) {
      toast.error("Error al guardar la cotización");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-2">
            // Cotizador / Calculadora
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Calcula tu cotización
          </h1>
          <p className="text-sm text-zinc-600 mt-2 max-w-xl">
            Ingresa medidas, tiempos y materiales. El total se calcula en tiempo real
            con tarifas de máquina, mano de obra y margen de ganancia.
          </p>
        </div>
        <div className="flex items-center gap-3 surface px-4 py-2.5">
          <Sparkles className="w-4 h-4 text-[#FF3333]" />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500">
              Tarifa máquina
            </div>
            <div className="font-mono text-sm font-semibold">
              {fmtMoney(settings?.machineHourlyRate || 0, symbol)}/h
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project info */}
          <section className="surface p-5">
            <SectionTitle index="01" title="Proyecto" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Field label="Nombre del proyecto">
                <Input
                  data-testid="input-project-name"
                  placeholder="Llaveros corporativos"
                  value={form.projectName}
                  onChange={(e) => updateForm("projectName", e.target.value)}
                  className="rounded-sm"
                />
              </Field>
              <Field label="Cliente (opcional)">
                <Input
                  data-testid="input-client-name"
                  placeholder="Acme S.A."
                  value={form.clientName}
                  onChange={(e) => updateForm("clientName", e.target.value)}
                  className="rounded-sm"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Notas">
                  <Textarea
                    data-testid="input-notes"
                    rows={2}
                    placeholder="Detalles del trabajo, tinte, embalaje..."
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    className="rounded-sm resize-none"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Material & dimensions */}
          <section className="surface p-5">
            <SectionTitle index="02" title="Material y medidas" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <Field label="Material">
                  <Select
                    value={form.materialId}
                    onValueChange={(v) => updateForm("materialId", v)}
                  >
                    <SelectTrigger data-testid="select-material" className="rounded-sm">
                      <SelectValue placeholder="Selecciona un material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id} data-testid={`material-opt-${m.id}`}>
                          {m.name} — {fmtMoney(m.pricePerSheet, symbol)}/lámina
                          ({m.sheetWidth}×{m.sheetHeight}mm)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Ancho pieza (mm)">
                <Input
                  data-testid="input-piece-width"
                  type="number"
                  min="0"
                  value={form.pieceWidth}
                  onChange={(e) => updateForm("pieceWidth", e.target.value)}
                  className="rounded-sm font-mono"
                />
              </Field>
              <Field label="Alto pieza (mm)">
                <Input
                  data-testid="input-piece-height"
                  type="number"
                  min="0"
                  value={form.pieceHeight}
                  onChange={(e) => updateForm("pieceHeight", e.target.value)}
                  className="rounded-sm font-mono"
                />
              </Field>
              <Field label="Cantidad">
                <Input
                  data-testid="input-quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => updateForm("quantity", e.target.value)}
                  className="rounded-sm font-mono"
                />
              </Field>
              {selectedMaterial && (
                <div className="bg-zinc-50 border border-zinc-200 p-3 flex flex-col justify-center">
                  <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500">
                    Aprovechamiento
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {result ? fmtNum(result.sheetsUsed * 100, 1) : "0.00"}% lámina
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Desperdicio +{fmtNum((selectedMaterial.wasteFactor || 0) * 100, 0)}%
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Time */}
          <section className="surface p-5">
            <SectionTitle index="03" title="Tiempo de máquina" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Field label="Tiempo de corte (min)">
                <Input
                  data-testid="input-cutting-time"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.cuttingTimeMin}
                  onChange={(e) => updateForm("cuttingTimeMin", e.target.value)}
                  className="rounded-sm font-mono"
                />
              </Field>
              <Field label="Tiempo de grabado (min)">
                <Input
                  data-testid="input-engraving-time"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.engravingTimeMin}
                  onChange={(e) => updateForm("engravingTimeMin", e.target.value)}
                  className="rounded-sm font-mono"
                />
              </Field>
            </div>
          </section>

          {/* Extra costs */}
          <section className="surface p-5">
            <div className="flex items-center justify-between">
              <SectionTitle index="04" title="Costos adicionales" />
              <Button
                data-testid="btn-add-extra-cost"
                type="button"
                variant="outline"
                size="sm"
                onClick={addExtraCost}
                className="rounded-sm border-zinc-300"
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {form.additionalCosts.length === 0 && (
                <p className="text-xs text-zinc-500 font-mono">
                  Sin costos adicionales. Agrega diseño, embalaje, transporte, etc.
                </p>
              )}
              {form.additionalCosts.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    data-testid={`extra-cost-label-${i}`}
                    placeholder="Concepto"
                    value={c.label}
                    onChange={(e) => updateExtraCost(i, "label", e.target.value)}
                    className="rounded-sm"
                  />
                  <Input
                    data-testid={`extra-cost-amount-${i}`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={c.amount}
                    onChange={(e) => updateExtraCost(i, "amount", e.target.value)}
                    className="rounded-sm font-mono w-32"
                  />
                  <Button
                    data-testid={`btn-remove-extra-${i}`}
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeExtraCost(i)}
                    className="rounded-sm border-zinc-300 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-500" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Profit margin */}
          <section className="surface p-5">
            <SectionTitle index="05" title="Margen de ganancia" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_140px] gap-4 items-center">
              <Slider
                data-testid="slider-profit-margin"
                min={0}
                max={200}
                step={1}
                value={[parseFloat(form.profitMargin) || 0]}
                onValueChange={(v) => updateForm("profitMargin", v[0])}
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <Input
                  data-testid="input-profit-margin"
                  type="number"
                  min="0"
                  value={form.profitMargin}
                  onChange={(e) => updateForm("profitMargin", e.target.value)}
                  className="rounded-sm font-mono"
                />
                <span className="font-mono text-sm">%</span>
              </div>
            </div>
          </section>
        </div>

        {/* SUMMARY (sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="surface bracket-corner relative">
              <div className="border-b border-zinc-200 px-5 py-4 bg-zinc-900 text-white">
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 mb-1">
                  Resumen / Quote
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-mono text-zinc-400">TOTAL</span>
                  <span
                    data-testid="summary-total"
                    className="stat-number text-3xl font-bold"
                  >
                    {fmtMoney(result?.total ?? 0, symbol)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs font-mono text-zinc-400">POR UNIDAD</span>
                  <span
                    data-testid="summary-per-unit"
                    className="stat-number text-sm font-semibold text-[#FF6666]"
                  >
                    {fmtMoney(result?.pricePerUnit ?? 0, symbol)}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2.5 text-sm">
                <Row label="Material" value={fmtMoney(result?.materialCost ?? 0, symbol)} testid="row-material" />
                <Row label="Corte" value={fmtMoney(result?.cuttingCost ?? 0, symbol)} testid="row-cutting" />
                <Row label="Grabado" value={fmtMoney(result?.engravingCost ?? 0, symbol)} testid="row-engraving" />
                <Row label="Electricidad" value={fmtMoney(result?.electricityCost ?? 0, symbol)} testid="row-electricity" />
                <Row label="Mano de obra" value={fmtMoney(result?.laborCost ?? 0, symbol)} testid="row-labor" />
                <Row label="Adicionales" value={fmtMoney(result?.additionalTotal ?? 0, symbol)} testid="row-extras" />
                <div className="border-t border-zinc-200 my-2"></div>
                <Row label="Subtotal" value={fmtMoney(result?.subtotal ?? 0, symbol)} bold testid="row-subtotal" />
                <Row
                  label={`Ganancia (${fmtNum(parseFloat(form.profitMargin) || 0, 0)}%)`}
                  value={fmtMoney(result?.profitAmount ?? 0, symbol)}
                  testid="row-profit"
                  accent
                />
              </div>

              <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex flex-col gap-2">
                <Button
                  data-testid="btn-save-quote"
                  onClick={() => saveQuote({ thenPrint: false })}
                  disabled={saving}
                  className="w-full rounded-sm bg-[#FF3333] hover:bg-[#CC0000] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar cotización"}
                </Button>
                <Button
                  data-testid="btn-save-print"
                  onClick={() => saveQuote({ thenPrint: true })}
                  disabled={saving}
                  variant="outline"
                  className="w-full rounded-sm border-zinc-300"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Guardar e imprimir
                </Button>
              </div>
            </div>

            <div className="mt-4 surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#FF3333]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
                  Tiempo total
                </span>
              </div>
              <div className="font-mono text-2xl font-bold tabular">
                {fmtNum(result?.totalHours ?? 0, 2)}
                <span className="text-sm text-zinc-500 ml-1">h</span>
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-mono">
                = {fmtNum(((result?.totalHours ?? 0) * 60), 1)} min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ index, title }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[11px] text-[#FF3333] tracking-[0.15em]">
        {index}
      </span>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="field-label">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value, bold, accent, testid }) {
  return (
    <div className="flex items-center justify-between" data-testid={testid}>
      <span className={`text-xs ${bold ? "font-semibold" : "text-zinc-600"}`}>
        {label}
      </span>
      <span
        className={`font-mono text-sm tabular ${
          bold ? "font-bold" : ""
        } ${accent ? "text-[#FF3333]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
