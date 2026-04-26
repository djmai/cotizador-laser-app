import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { SettingsAPI } from "@/lib/api";

const currencyOptions = [
  { code: "USD", symbol: "$" },
  { code: "MXN", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "COP", symbol: "$" },
  { code: "ARS", symbol: "$" },
  { code: "CLP", symbol: "$" },
  { code: "GBP", symbol: "£" },
];

export default function Configuracion() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    SettingsAPI.get().then(setForm).catch(() => toast.error("Error al cargar configuración"));
  }, []);

  if (!form) {
    return (
      <div className="p-8 text-sm text-zinc-500 font-mono">Cargando configuración...</div>
    );
  }

  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        machineHourlyRate: parseFloat(form.machineHourlyRate) || 0,
        engravingHourlyRate: parseFloat(form.engravingHourlyRate) || 0,
        electricityCostPerHour: parseFloat(form.electricityCostPerHour) || 0,
        laborCostPerHour: parseFloat(form.laborCostPerHour) || 0,
        defaultProfitMargin: parseFloat(form.defaultProfitMargin) || 0,
        currency: form.currency,
        currencySymbol: form.currencySymbol,
        businessName: form.businessName,
      };
      const updated = await SettingsAPI.update(payload);
      setForm(updated);
      toast.success("Configuración guardada");
    } catch (e) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-2">
          // Configuración / Settings
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-zinc-600 mt-2">
          Tarifas y parámetros aplicados a todas las cotizaciones.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <section className="surface p-5">
          <h2 className="text-base font-semibold mb-4">Negocio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="field-label">Nombre del negocio</Label>
              <Input
                data-testid="cfg-business-name"
                value={form.businessName || ""}
                onChange={(e) => update("businessName", e.target.value)}
                className="rounded-sm"
              />
            </div>
            <div>
              <Label className="field-label">Moneda</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => {
                  const opt = currencyOptions.find((o) => o.code === v);
                  setForm({ ...form, currency: v, currencySymbol: opt?.symbol || "$" });
                }}
              >
                <SelectTrigger data-testid="cfg-currency" className="rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.code} ({o.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="field-label">Símbolo de moneda</Label>
              <Input
                data-testid="cfg-currency-symbol"
                value={form.currencySymbol || "$"}
                onChange={(e) => update("currencySymbol", e.target.value)}
                className="rounded-sm font-mono"
              />
            </div>
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="text-base font-semibold mb-4">Tarifas por hora</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              label="Tarifa máquina · corte ($/h)"
              testid="cfg-machine-rate"
              value={form.machineHourlyRate}
              onChange={(v) => update("machineHourlyRate", v)}
            />
            <NumberField
              label="Tarifa máquina · grabado ($/h)"
              testid="cfg-engraving-rate"
              value={form.engravingHourlyRate}
              onChange={(v) => update("engravingHourlyRate", v)}
            />
            <NumberField
              label="Electricidad ($/h)"
              testid="cfg-electricity"
              value={form.electricityCostPerHour}
              onChange={(v) => update("electricityCostPerHour", v)}
            />
            <NumberField
              label="Mano de obra ($/h)"
              testid="cfg-labor"
              value={form.laborCostPerHour}
              onChange={(v) => update("laborCostPerHour", v)}
            />
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="text-base font-semibold mb-4">Margen por defecto</h2>
          <NumberField
            label="Margen de ganancia (%)"
            testid="cfg-margin"
            value={form.defaultProfitMargin}
            onChange={(v) => update("defaultProfitMargin", v)}
          />
        </section>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            data-testid="cfg-save"
            className="rounded-sm bg-[#FF3333] hover:bg-[#CC0000]"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function NumberField({ label, value, onChange, testid }) {
  return (
    <div>
      <Label className="field-label">{label}</Label>
      <Input
        data-testid={testid}
        type="number"
        step="0.01"
        value={value ?? 0}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm font-mono"
      />
    </div>
  );
}
