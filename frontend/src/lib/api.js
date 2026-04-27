// localStorage-backed persistence layer.
// Replaces the previous backend API. Same shape (Promise-based) so the rest
// of the app keeps working without changes.

const KEYS = {
  materials: "cortex.materials.v1",
  settings: "cortex.settings.v1",
  quotes: "cortex.quotes.v1",
  seeded: "cortex.seeded.v1",
};

const DEFAULT_MATERIALS = [
  { name: "Madera contrachapada 3mm", pricePerSheet: 18.0, sheetWidth: 600, sheetHeight: 400, thickness: 3, wasteFactor: 0.10 },
  { name: "Madera contrachapada 6mm", pricePerSheet: 28.0, sheetWidth: 600, sheetHeight: 400, thickness: 6, wasteFactor: 0.10 },
  { name: "Acrílico 3mm", pricePerSheet: 35.0, sheetWidth: 600, sheetHeight: 400, thickness: 3, wasteFactor: 0.08 },
  { name: "Acrílico 5mm", pricePerSheet: 52.0, sheetWidth: 600, sheetHeight: 400, thickness: 5, wasteFactor: 0.08 },
  { name: "MDF 3mm", pricePerSheet: 12.0, sheetWidth: 600, sheetHeight: 400, thickness: 3, wasteFactor: 0.12 },
  { name: "MDF 6mm", pricePerSheet: 22.0, sheetWidth: 600, sheetHeight: 400, thickness: 6, wasteFactor: 0.12 },
  { name: "Cuero 2mm", pricePerSheet: 40.0, sheetWidth: 500, sheetHeight: 350, thickness: 2, wasteFactor: 0.15 },
  { name: "Cartón 2mm", pricePerSheet: 6.0, sheetWidth: 700, sheetHeight: 500, thickness: 2, wasteFactor: 0.10 },
  { name: "Metal acero 1mm", pricePerSheet: 75.0, sheetWidth: 500, sheetHeight: 300, thickness: 1, wasteFactor: 0.05 },
];

const DEFAULT_SETTINGS = {
  id: "global",
  machineHourlyRate: 25.0,
  engravingHourlyRate: 30.0,
  electricityCostPerHour: 1.5,
  laborCostPerHour: 8.0,
  defaultProfitMargin: 30.0,
  currency: "USD",
  currencySymbol: "$",
  businessName: "Mi Taller Láser",
};

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.seeded) === "1") return;
  if (!localStorage.getItem(KEYS.materials)) {
    const now = new Date().toISOString();
    const materials = DEFAULT_MATERIALS.map((m) => ({
      ...m,
      id: uid(),
      createdAt: now,
    }));
    write(KEYS.materials, materials);
  }
  if (!localStorage.getItem(KEYS.settings)) {
    write(KEYS.settings, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(KEYS.quotes)) {
    write(KEYS.quotes, []);
  }
  localStorage.setItem(KEYS.seeded, "1");
}

ensureSeed();

// Async helpers (kept Promise-based to match the previous API contract)
const delay = (v) => Promise.resolve(v);

export const MaterialsAPI = {
  list: () => {
    ensureSeed();
    return delay(read(KEYS.materials, []));
  },
  create: (data) => {
    const list = read(KEYS.materials, []);
    const now = new Date().toISOString();
    const item = {
      id: uid(),
      createdAt: now,
      wasteFactor: 0.10,
      ...data,
    };
    list.push(item);
    write(KEYS.materials, list);
    return delay(item);
  },
  update: (id, data) => {
    const list = read(KEYS.materials, []);
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return Promise.reject(new Error("Material no encontrado"));
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined && v !== null)
    );
    list[idx] = { ...list[idx], ...cleaned };
    write(KEYS.materials, list);
    return delay(list[idx]);
  },
  remove: (id) => {
    const list = read(KEYS.materials, []);
    const next = list.filter((m) => m.id !== id);
    write(KEYS.materials, next);
    return delay({ ok: true });
  },
};

export const SettingsAPI = {
  get: () => {
    ensureSeed();
    return delay(read(KEYS.settings, DEFAULT_SETTINGS));
  },
  update: (data) => {
    const current = read(KEYS.settings, DEFAULT_SETTINGS);
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined && v !== null)
    );
    const next = { ...current, ...cleaned };
    write(KEYS.settings, next);
    return delay(next);
  },
};

export const QuotesAPI = {
  list: () => {
    const all = read(KEYS.quotes, []);
    // Sort desc by createdAt
    const sorted = [...all].sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "")
    );
    return delay(sorted);
  },
  get: (id) => {
    const all = read(KEYS.quotes, []);
    const item = all.find((q) => q.id === id);
    if (!item) return Promise.reject(new Error("Cotización no encontrada"));
    return delay(item);
  },
  create: (data) => {
    const all = read(KEYS.quotes, []);
    const item = {
      id: uid(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    all.push(item);
    write(KEYS.quotes, all);
    return delay(item);
  },
  remove: (id) => {
    const all = read(KEYS.quotes, []);
    const next = all.filter((q) => q.id !== id);
    write(KEYS.quotes, next);
    return delay({ ok: true });
  },
};

// Utility: clear all local data (useful for debugging / "factory reset")
export function resetLocalData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  ensureSeed();
}
